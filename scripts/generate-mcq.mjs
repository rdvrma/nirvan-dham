/**
 * Nirvan Sutra Course — MCQ Generator
 * Generates 50 MCQs per chapter × 3 languages × 8 chapters = 1,200 questions
 *
 * Usage:
 *   node scripts/generate-mcq.mjs
 *   node scripts/generate-mcq.mjs --lang=hi --chapter=1   (single chapter)
 *   node scripts/generate-mcq.mjs --lang=hi               (one language)
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set.');
  console.error('   Set it before running: $env:GEMINI_API_KEY="your-key"');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const LANG_CONFIG = {
  hi: {
    label: 'Hindi',
    srcDir: 'D:/Nirvana sutra course/Ebooks/Hindi',
    outDir: path.join(__dirname, '../src/content/course-mcq/hi'),
    jsonField: 'khands',      // Hindi JSON uses "khands" key
    promptLang: 'Hindi (Devanagari script)',
    instructionLang: 'हिंदी में',
  },
  en: {
    label: 'English',
    srcDir: 'D:/Nirvana sutra course/Ebooks/English',
    outDir: path.join(__dirname, '../src/content/course-mcq/en'),
    jsonField: 'khands',
    promptLang: 'English',
    instructionLang: 'in English',
  },
  hl: {
    label: 'Hinglish',
    srcDir: 'D:/Nirvana sutra course/Ebooks/Hinglish',
    outDir: path.join(__dirname, '../src/content/course-mcq/hl'),
    jsonField: 'sections',    // Hinglish JSON uses "sections" key
    promptLang: 'Hinglish (Roman script Hindi, casual mix)',
    instructionLang: 'Hinglish mein (Roman lipi mein)',
  },
};

const CHAPTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const QUESTIONS_PER_CHAPTER = 50;
const DELAY_BETWEEN_CALLS_MS = 4000; // avoid rate limiting

// ─── Extract readable text from JSON ─────────────────────────────────────────
function extractTextFromJson(rawJson, lang) {
  const chunks = [];

  if (lang === 'hi' || lang === 'en') {
    // Hindi/English: { khands: [ { sections: [ { heading, markdown } ] } ] }
    const khands = rawJson.khands || rawJson.sections || [];
    for (const khand of khands) {
      if (khand.title) chunks.push(`## ${khand.title}`);
      for (const section of (khand.sections || [])) {
        if (section.heading) chunks.push(`### ${section.heading}`);
        if (section.markdown) chunks.push(section.markdown);
      }
    }
  } else if (lang === 'hl') {
    // Hinglish: { sections: [ { section_title, elements: [ { type, text } ] } ] }
    const sections = rawJson.sections || [];
    for (const section of sections) {
      if (section.section_title) chunks.push(`## ${section.section_title}`);
      for (const el of (section.elements || [])) {
        if (el.text) chunks.push(el.text);
      }
    }
  }

  return chunks.join('\n\n');
}

// ─── Build the prompt ─────────────────────────────────────────────────────────
function buildPrompt(chapterText, langConfig, chapterNum, chapterTitle) {
  return `You are creating practice questions for a spiritual self-inquiry course called "Nirvan Sutra" by Aadisatv.

Chapter ${chapterNum}: "${chapterTitle}"

CHAPTER CONTENT:
---
${chapterText.slice(0, 28000)}
---

TASK:
Generate exactly 50 MCQ (multiple choice questions) ${langConfig.instructionLang} based ONLY on the chapter content above.

RULES:
1. Every question must be directly answerable from the chapter text
2. Write all questions and options ${langConfig.instructionLang}
3. Each question must have exactly 4 options (A, B, C, D)
4. Only one option is correct
5. The explanation (2-4 sentences) must reference the specific teaching from the chapter
6. Questions should vary: some conceptual, some applied, some reflective
7. Avoid trivial questions — focus on core teachings and insights
8. Do NOT include question numbers in the "question" field
9. Explanation should be warm, teaching-oriented, not mechanical

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown, no explanation:
{
  "chapter": ${chapterNum},
  "language": "${langConfig.label}",
  "questions": [
    {
      "id": "ch${chapterNum}_q1",
      "question": "question text here",
      "options": {
        "A": "option text",
        "B": "option text",
        "C": "option text",
        "D": "option text"
      },
      "correct": "A",
      "explanation": "Explanation of why this is correct, with reference to the teaching."
    }
  ]
}

Generate all 50 questions now.`;
}

// ─── Call Gemini API ──────────────────────────────────────────────────────────
async function generateMCQ(chapterText, langConfig, chapterNum, chapterTitle) {
  const prompt = buildPrompt(chapterText, langConfig, chapterNum, chapterTitle);

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  });

  const text = response.text?.trim() || '';

  // Strip any markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

// ─── Get chapter title from JSON ─────────────────────────────────────────────
function getChapterTitle(rawJson, lang) {
  if (lang === 'hi' || lang === 'en') {
    return rawJson.title || rawJson.chapter_title || `Chapter ${rawJson.chapter_number}`;
  } else {
    return rawJson.metadata?.chapter_title || `Chapter ${rawJson.metadata?.chapter_number}`;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const langArg = args.find(a => a.startsWith('--lang='))?.split('=')[1];
  const chapterArg = args.find(a => a.startsWith('--chapter='))?.split('=')[1];

  const langsToProcess = langArg ? [langArg] : Object.keys(LANG_CONFIG);
  const chaptersToProcess = chapterArg ? [parseInt(chapterArg)] : CHAPTERS;

  console.log(`\n🕉  Nirvan Sutra MCQ Generator`);
  console.log(`   Languages: ${langsToProcess.join(', ')}`);
  console.log(`   Chapters: ${chaptersToProcess.join(', ')}`);
  console.log(`   Questions per chapter: ${QUESTIONS_PER_CHAPTER}\n`);

  let total = 0;
  let errors = 0;

  for (const lang of langsToProcess) {
    const config = LANG_CONFIG[lang];
    if (!config) { console.error(`Unknown language: ${lang}`); continue; }

    fs.mkdirSync(config.outDir, { recursive: true });
    console.log(`\n📚 Processing ${config.label}...`);

    for (const chapterNum of chaptersToProcess) {
      const outFile = path.join(config.outDir, `chapter-${chapterNum}.json`);

      // Skip if already generated
      if (fs.existsSync(outFile)) {
        console.log(`   ⏭  Chapter ${chapterNum} already exists — skipping`);
        continue;
      }

      const srcFile = path.join(config.srcDir.replace(/\//g, path.sep), `${chapterNum}.json`);
      if (!fs.existsSync(srcFile)) {
        console.warn(`   ⚠  ${srcFile} not found — skipping`);
        continue;
      }

      console.log(`   📖 Chapter ${chapterNum}: generating ${QUESTIONS_PER_CHAPTER} questions...`);

      try {
        const rawJson = JSON.parse(fs.readFileSync(srcFile, 'utf-8'));
        const chapterText = extractTextFromJson(rawJson, lang);
        const chapterTitle = getChapterTitle(rawJson, lang);

        const mcqData = await generateMCQ(chapterText, config, chapterNum, chapterTitle);

        // Ensure IDs are correct and count is right
        if (!mcqData.questions || mcqData.questions.length < 10) {
          throw new Error(`Too few questions generated: ${mcqData.questions?.length}`);
        }

        // Re-assign IDs to be consistent
        mcqData.questions = mcqData.questions.map((q, i) => ({
          ...q,
          id: `ch${chapterNum}_q${i + 1}`,
        }));

        fs.writeFileSync(outFile, JSON.stringify(mcqData, null, 2), 'utf-8');
        console.log(`   ✅ Chapter ${chapterNum}: ${mcqData.questions.length} questions saved → ${outFile}`);
        total += mcqData.questions.length;

      } catch (err) {
        console.error(`   ❌ Chapter ${chapterNum} FAILED: ${err.message}`);
        errors++;
      }

      // Delay between API calls
      if (chapterNum !== chaptersToProcess.at(-1)) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
      }
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ Done! Total questions generated: ${total}`);
  if (errors > 0) console.log(`⚠  Errors: ${errors} (re-run to retry failed chapters)`);
  console.log('─'.repeat(50) + '\n');
}

main().catch(console.error);
