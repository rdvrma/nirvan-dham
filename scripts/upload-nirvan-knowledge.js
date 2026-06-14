/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { GoogleGenAI } = require('@google/genai');

const STORE_DISPLAY_NAME = 'nirvan-dham-knowledge';
const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');
const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt']);
const ENV_FILES = ['.env.local', '.env'];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [rawKey, ...rawValueParts] = trimmed.split('=');
    const key = rawKey.trim();
    let value = rawValueParts.join('=').trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnv() {
  for (const envFile of ENV_FILES) {
    loadEnvFile(path.join(process.cwd(), envFile));
  }
}

function collectKnowledgeFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectKnowledgeFiles(fullPath));
      continue;
    }

    if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForOperation(ai, operation) {
  let current = operation;

  while (!current.done) {
    process.stdout.write('.');
    await sleep(5000);
    current = await ai.operations.get({ operation: current });
  }

  if (current.error) {
    throw new Error(JSON.stringify(current.error));
  }

  return current;
}

async function main() {
  loadLocalEnv();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing. Add it to .env.local or your shell environment first.');
    process.exit(1);
  }

  const knowledgeFiles = collectKnowledgeFiles(KNOWLEDGE_DIR);
  if (knowledgeFiles.length === 0) {
    console.error(`No supported knowledge files found in ${KNOWLEDGE_DIR}`);
    console.error('Add Hindi/English blog PDFs, DOCX/TXT files, Nirvan Sutra outline, FAQ, session, donation, and contact content.');
    console.error('Supported file types: .pdf, .docx, .txt');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log(`Creating Gemini File Search Store: ${STORE_DISPLAY_NAME}`);
  const fileSearchStore = await ai.fileSearchStores.create({
    config: { displayName: STORE_DISPLAY_NAME },
  });

  if (!fileSearchStore.name) {
    throw new Error('Gemini did not return a file search store name.');
  }

  console.log(`Store created: ${fileSearchStore.name}`);
  console.log(`Uploading ${knowledgeFiles.length} knowledge file(s)...`);

  for (const filePath of knowledgeFiles) {
    const displayName = path.relative(KNOWLEDGE_DIR, filePath).replace(/\\/g, '/');
    process.stdout.write(`\n- ${displayName} `);

    const operation = await ai.fileSearchStores.uploadToFileSearchStore({
      fileSearchStoreName: fileSearchStore.name,
      file: filePath,
      config: { displayName },
    });

    const completed = await waitForOperation(ai, operation);
    console.log(` done (${completed.response?.documentName ?? 'document indexed'})`);
  }

  console.log('\nGemini File Search Store ready.');
  console.log(fileSearchStore.name);
  console.log('\nSave this value in your environment as:');
  console.log(`GEMINI_FILE_SEARCH_STORE=${fileSearchStore.name}`);
}

main().catch((error) => {
  console.error('\nGemini knowledge upload failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
