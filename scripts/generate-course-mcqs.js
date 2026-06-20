/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const { GoogleGenAI } = require('@google/genai');

const COURSE_SOURCE_ROOT = 'D:/Nirvana sutra course/Ebooks';
const OUTPUT_ROOT = path.join(process.cwd(), 'src', 'content', 'course-mcq');
const MODEL_CANDIDATES = (process.env.MCQ_GENERATOR_MODELS
  ? process.env.MCQ_GENERATOR_MODELS.split(',')
  : [
      process.env.MCQ_GEMINI_MODEL,
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
    ]
).map((model) => model.trim()).filter(Boolean);

const LANGUAGES = {
  hi: { folder: 'Hindi', name: 'Hindi written in Devanagari', label: 'Hindi' },
  en: { folder: 'English', name: 'English', label: 'English' },
  hl: { folder: 'Hinglish', name: 'Hinglish in Roman Hindi', label: 'Hinglish' },
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [rawKey, ...rawValue] = trimmed.split('=');
    const key = rawKey.trim();
    let value = rawValue.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function parseArguments() {
  const args = process.argv.slice(2);
  const valueAfter = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  const lang = valueAfter('--lang');
  const chapter = valueAfter('--chapter');
  const overwrite = args.includes('--overwrite');
  const dryRun = args.includes('--dry-run');

  if (lang && !Object.hasOwn(LANGUAGES, lang)) {
    throw new Error(`Invalid --lang '${lang}'. Use hi, en, or hl.`);
  }

  const chapters = chapter
    ? [Number(chapter)]
    : Array.from({ length: 8 }, (_, index) => index + 1);
  if (chapters.some((item) => !Number.isInteger(item) || item < 1 || item > 8)) {
    throw new Error('Use --chapter with a number from 1 to 8.');
  }

  return { languages: lang ? [lang] : Object.keys(LANGUAGES), chapters, overwrite, dryRun };
}

function promptFor({ language, chapter, sourceJson, batchNumber }) {
  const source = JSON.stringify(sourceJson);
  const focus = batchNumber === 1
    ? 'the chapter foundations, distinctions, definitions, and illustrative examples'
    : 'daily-life application, practices, implications, and common misunderstandings';
  return `You are authoring batch ${batchNumber} of 2 for a rigorous Nirvan Sutra practice bank, chapter ${chapter}.

Write exactly 25 unique multiple-choice questions in ${language.name}. Focus on ${focus}. Work only from the supplied chapter manuscript. Do not invent doctrines, scripture references, claims, terminology, examples, or practices that are absent from it. This is a contemplative course: questions must test careful understanding, not rote word matching alone.

Coverage requirements:
- spread questions across the chapter's central distinctions, examples, practices, and common misunderstandings;
- include conceptual and applied-reading questions;
- make every wrong option plausible, but clearly less faithful to the manuscript than the correct option;
- avoid trick questions, double negatives, 'all of the above', 'none of the above', and judgemental language;
- use accessible ${language.name}; for Hinglish, use natural Roman Hindi rather than Devanagari.

Return only a valid JSON array. Each item must use exactly this schema:
{
  "id": ${chapter}01,
  "question": "...",
  "options": [
    { "key": "A", "text": "..." },
    { "key": "B", "text": "..." },
    { "key": "C", "text": "..." },
    { "key": "D", "text": "..." }
  ],
  "correct": "A",
  "explanation": "2-5 sentences explaining why the correct choice follows from the chapter, and gently clarifying the key misconception."
}

Use any unique numeric ids. Do not add markdown, commentary, source text, or fields outside this schema. The array must contain 25 items, not more and not fewer.

Chapter manuscript:
${source}`;
}

function validateQuestions(value, chapter) {
  if (!Array.isArray(value) || value.length !== 50) {
    throw new Error(`Expected exactly 50 questions, received ${Array.isArray(value) ? value.length : 'non-array'}.`);
  }

  const expectedKeys = ['A', 'B', 'C', 'D'];
  const correctCount = Object.fromEntries(expectedKeys.map((key) => [key, 0]));
  const ids = new Set();

  value.forEach((question, index) => {
    const expectedId = chapter * 100 + index + 1;
    if (question.id !== expectedId) throw new Error(`Question ${index + 1} must have id ${expectedId}.`);
    if (ids.has(question.id)) throw new Error(`Duplicate id ${question.id}.`);
    ids.add(question.id);
    if (typeof question.question !== 'string' || question.question.trim().length < 15) {
      throw new Error(`Question ${question.id} has an invalid prompt.`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`Question ${question.id} needs four options.`);
    }
    const keys = question.options.map((option) => option?.key);
    if (keys.join(',') !== expectedKeys.join(',')) {
      throw new Error(`Question ${question.id} options must use ordered A-D keys.`);
    }
    if (question.options.some((option) => typeof option.text !== 'string' || option.text.trim().length < 2)) {
      throw new Error(`Question ${question.id} has an invalid option.`);
    }
    if (!expectedKeys.includes(question.correct)) throw new Error(`Question ${question.id} has invalid correct key.`);
    correctCount[question.correct] += 1;
    if (typeof question.explanation !== 'string' || question.explanation.trim().length < 40) {
      throw new Error(`Question ${question.id} needs a detailed explanation.`);
    }
  });

  const expectedCounts = { A: 13, B: 13, C: 12, D: 12 };
  for (const key of expectedKeys) {
    if (correctCount[key] !== expectedCounts[key]) {
      throw new Error(`Correct-answer balance for ${key} is ${correctCount[key]}, expected ${expectedCounts[key]}.`);
    }
  }
}

function parseQuestionJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    fs.mkdirSync(path.join(process.cwd(), '.tmp'), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), '.tmp', 'last-invalid-mcq-response.txt'), text, 'utf8');
    const first = text.indexOf('[');
    const last = text.lastIndexOf(']');
    if (first >= 0 && last > first) return JSON.parse(text.slice(first, last + 1));
    throw new SyntaxError('The model response did not contain a JSON array.');
  }
}

function normalizeQuestionSet(value, chapter) {
  if (!Array.isArray(value) || value.length < 50) {
    throw new Error(`Expected at least 50 generated questions, received ${Array.isArray(value) ? value.length : 'non-array'}.`);
  }

  const selected = value.slice(0, 50);
  const desiredCorrectKeys = [
    ...Array(13).fill('A'),
    ...Array(13).fill('B'),
    ...Array(12).fill('C'),
    ...Array(12).fill('D'),
  ];
  const optionKeys = ['A', 'B', 'C', 'D'];

  return selected.map((question, index) => {
    const correctOption = question.options?.find((option) => option?.key === question.correct);
    const wrongOptions = question.options?.filter((option) => option?.key !== question.correct) ?? [];
    const correct = desiredCorrectKeys[index];
    const remainingKeys = optionKeys.filter((key) => key !== correct);
    const options = [
      { key: correct, text: correctOption?.text },
      ...wrongOptions.map((option, wrongIndex) => ({ key: remainingKeys[wrongIndex], text: option?.text })),
    ].sort((a, b) => optionKeys.indexOf(a.key) - optionKeys.indexOf(b.key));

    return {
      ...question,
      id: chapter * 100 + index + 1,
      correct,
      options,
    };
  });
}

async function generateQuestions(ai, input) {
  let lastError;

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        console.log(`  Using ${model} (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model,
          contents: promptFor(input),
        config: {
          responseMimeType: 'application/json',
          temperature: 0.35,
        },
        });

        const text = response.text?.trim();
        if (!text) throw new Error('The model returned an empty response.');
        return parseQuestionJson(text);
      } catch (error) {
        lastError = error;
        const status = error?.status ?? error?.error?.code;
        const retryable = status === 429 || status === 503 || error instanceof SyntaxError;
        if (!retryable) throw error;
        console.log(`  ${model} did not return valid JSON; retrying.`);
      }
    }
  }

  throw lastError ?? new Error('No Gemini model was available.');
}

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env.local'));
  loadEnvFile(path.join(process.cwd(), '.env'));
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing.');

  const { languages, chapters, overwrite, dryRun } = parseArguments();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (const lang of languages) {
    const language = LANGUAGES[lang];
    for (const chapter of chapters) {
      const outputPath = path.join(OUTPUT_ROOT, lang, `chapter-${chapter}.json`);
      if (fs.existsSync(outputPath) && !overwrite) {
        console.log(`Skip ${lang} chapter ${chapter}: output already exists.`);
        continue;
      }

      const sourcePath = path.join(COURSE_SOURCE_ROOT, language.folder, `${chapter}.json`);
      const sourceJson = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      console.log(`Generate ${language.label} chapter ${chapter}...`);
      const generated = [];
      for (const batchNumber of [1, 2]) {
        const batch = await generateQuestions(ai, { language, chapter, sourceJson, batchNumber });
        if (!Array.isArray(batch) || batch.length < 25) {
          throw new Error(`Batch ${batchNumber} returned fewer than 25 questions.`);
        }
        generated.push(...batch.slice(0, 25));
      }
      const questions = normalizeQuestionSet(generated, chapter);
      validateQuestions(questions, chapter);

      if (!dryRun) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
      }
      console.log(`${dryRun ? 'Validated' : 'Saved'} ${outputPath}`);
    }
  }
}

main().catch((error) => {
  console.error(`MCQ generation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
