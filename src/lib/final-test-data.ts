import englishBank from '@/content/course-final-test/en.json';
import hindiBank from '@/content/course-final-test/hi.json';
import hinglishBank from '@/content/course-final-test/hl.json';

export type FinalTestLanguage = 'hi' | 'en' | 'hl';

export interface FinalTestQuestion {
  id: string;
  prompt: string;
}

interface QuestionBankFile {
  questions: FinalTestQuestion[];
}

const QUESTION_COUNT = 15;

function validateBank(bank: QuestionBankFile, language: FinalTestLanguage): FinalTestQuestion[] {
  if (bank.questions.length !== 60) {
    throw new Error(`The ${language} final-test bank must contain exactly 60 questions.`);
  }

  const ids = new Set<string>();
  for (const question of bank.questions) {
    if (!question.id || !question.prompt || ids.has(question.id)) {
      throw new Error(`The ${language} final-test bank contains an invalid question.`);
    }
    ids.add(question.id);
  }

  return bank.questions;
}

export const FINAL_TEST_BANKS: Record<FinalTestLanguage, FinalTestQuestion[]> = {
  en: validateBank(englishBank as QuestionBankFile, 'en'),
  hi: validateBank(hindiBank as QuestionBankFile, 'hi'),
  hl: validateBank(hinglishBank as QuestionBankFile, 'hl'),
};

export function isFinalTestLanguage(value: string): value is FinalTestLanguage {
  return value === 'hi' || value === 'en' || value === 'hl';
}

export function selectFinalTestQuestions(language: FinalTestLanguage): FinalTestQuestion[] {
  const shuffled = [...FINAL_TEST_BANKS[language]];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, QUESTION_COUNT);
}

export const FINAL_TEST_QUESTION_COUNT = QUESTION_COUNT;
