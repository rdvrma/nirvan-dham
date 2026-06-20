/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(process.cwd(), 'src', 'content', 'course-mcq');
const keys = ['A', 'B', 'C', 'D'];
const expectedCounts = { A: 13, B: 13, C: 12, D: 12 };
let total = 0;
const errors = [];

for (const language of ['hi', 'en', 'hl']) {
  for (let chapter = 1; chapter <= 8; chapter += 1) {
    const filePath = path.join(ROOT, language, `chapter-${chapter}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`MISSING ${language}/chapter-${chapter}.json`);
      continue;
    }

    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    total += questions.length;
    const answerCounts = { A: 0, B: 0, C: 0, D: 0 };

    if (!Array.isArray(questions) || questions.length !== 50) {
      errors.push(`${language}/chapter-${chapter}: expected 50 questions.`);
      continue;
    }

    questions.forEach((question, index) => {
      const label = `${language}/chapter-${chapter}/question-${index + 1}`;
      if (question.id !== chapter * 100 + index + 1) errors.push(`${label}: invalid id.`);
      if (!Array.isArray(question.options) || question.options.map((option) => option.key).join('') !== 'ABCD') {
        errors.push(`${label}: invalid option keys.`);
      }
      if (!keys.includes(question.correct)) errors.push(`${label}: invalid correct key.`);
      else answerCounts[question.correct] += 1;
      if (typeof question.explanation !== 'string' || question.explanation.trim().length < 40) {
        errors.push(`${label}: explanation is too short.`);
      }
    });

    if (JSON.stringify(answerCounts) !== JSON.stringify(expectedCounts)) {
      errors.push(`${language}/chapter-${chapter}: answer balance is invalid.`);
    }
    console.log(`OK ${language}/chapter-${chapter}.json (50 questions)`);
  }
}

console.log(`Validated questions: ${total}`);
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
