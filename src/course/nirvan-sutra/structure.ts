// The shape of the program (language-free): movements, stages, lessons, checkpoints, the final assessment, the Nididhyasana period and the certificate rules.
// Editable configuration lives here; the words live in locales/<code>/.
import type { MovementId } from './types';

export const PROGRAM = {
  id: 'nirvan-sutra-v2',
  version: 2,
  stageCount: 17,
  questionsPerStage: 10,
  checkItemsPerStage: 3,
  finalThreshold: 0.8,
  nididhyasana: {
    weeks: 12,
    // participation needed to complete the period (configurable; the teacher's attendance replaces self-report when a backend exists)
    minWeeksAttended: 9,
    minWeeklyReflections: 8,
  },
  finalReflectionMinChars: 20,
  /** own-words answers (stage check, checkpoints, final): anything honest is enough, so only a small floor */
  writtenMinChars: 10,
  writtenMaxChars: 4000,
} as const;

export const MOVEMENTS: { id: MovementId; stages: number[] }[] = [
  { id: 'M1', stages: [1, 2, 3, 4] },
  { id: 'M2', stages: [5, 6, 7, 8, 9] },
  { id: 'M3', stages: [10, 11, 12, 13, 14] },
  { id: 'M4', stages: [15, 16, 17] },
];

export const CHECKPOINTS = [
  { id: 'CP1', movement: 'M1' as MovementId, afterStage: 4 },
  { id: 'CP2', movement: 'M2' as MovementId, afterStage: 9 },
  { id: 'CP3', movement: 'M3' as MovementId, afterStage: 14 },
  { id: 'CP4', movement: 'M4' as MovementId, afterStage: 17 },
];

const pad = (n: number) => String(n).padStart(2, '0');
export const stageId = (n: number) => `S${pad(n)}`;
export const stageNumber = (id: string) => Number(id.replace(/^S/, ''));
export const STAGE_IDS = Array.from({ length: PROGRAM.stageCount }, (_, i) => stageId(i + 1));
export const mainLessonId = (stage: string) => `NS-${stage}-MAIN`;
export const questionLessonId = (stage: string, q: number) => `NS-${stage}-Q${pad(q)}`;
export const questionIdsOf = (stage: string) => Array.from({ length: PROGRAM.questionsPerStage }, (_, i) => questionLessonId(stage, i + 1));
export const movementOf = (stage: string) => MOVEMENTS.find((m) => m.stages.includes(stageNumber(stage)))!.id;
export const isStageId = (v: string) => /^S(0[1-9]|1[0-7])$/.test(v);
export const isQuestionId = (v: string) => /^NS-S(0[1-9]|1[0-7])-Q(0[1-9]|10)$/.test(v);
/** The key of a set of own-words answers in Progress.written. */
export const writtenKey = (kind: 'stage' | 'checkpoint' | 'final', id?: string) => (kind === 'final' ? 'final' : `${kind}:${id}`);
export const isCheckpointId = (v: string) => CHECKPOINTS.some((c) => c.id === v);
