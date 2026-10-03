// UI strings of the video lesson (Hindi and English). The Hinglish course language uses the Hindi track, so its UI strings are the Hindi ones in Roman script where it matters little:
// the player is a calm, mostly wordless interface; only the strings below are text.
import type { TrackLanguage } from '@/lib/video-course/config';

export interface PlayerCopy {
  back: string;
  readText: string;
  audio: string;
  captions: string;
  captionsOff: string;
  languageName: Record<TrackLanguage, string>;
  segments: string;
  locked: string;
  done: string;
  current: string;
  reflectTitle: string;
  reflectHint: string;
  answerLabel: (n: number, total: number) => string;
  continueLabel: string;
  continueIn: (sec: number) => string;
  saving: string;
  askGuide: string;
  guideSoon: string;
  loading: string;
  buffering: string;
  loadError: string;
  retry: string;
  finishedTitle: string;
  finishedBody: string;
  backToCourse: string;
  resumeAt: (clock: string) => string;
  playerRegion: string;
}

export const COPY: Record<TrackLanguage, PlayerCopy> = {
  hi: {
    back: 'पाठ्यक्रम',
    readText: 'इसके बजाय पाठ पढ़ें',
    audio: 'आवाज़',
    captions: 'उपशीर्षक',
    captionsOff: 'बंद',
    languageName: { hi: 'हिंदी', en: 'English' },
    segments: 'पाठ के खंड',
    locked: 'बंद',
    done: 'पूरा',
    current: 'अभी',
    reflectTitle: 'एक क्षण ठहरिए',
    reflectHint: 'अपने मन में देखिए। चाहें तो यहाँ लिख सकते हैं; यह केवल आपको दिखेगा।',
    answerLabel: (n, total) => (total > 1 ? `आपका उत्तर (${n}/${total})` : 'आपका उत्तर'),
    continueLabel: 'आगे बढ़ें',
    continueIn: (s) => `आगे बढ़ें (${s} सेकंड बाद)`,
    saving: 'सहेज रहे हैं…',
    askGuide: 'गाइड से पूछें',
    guideSoon: 'गाइड अभी जुड़ा नहीं है। जल्द ही यहाँ उपलब्ध होगा।',
    loading: 'पाठ खुल रहा है…',
    buffering: 'लोड हो रहा है…',
    loadError: 'यह पाठ अभी खुल नहीं सका।',
    retry: 'फिर कोशिश करें',
    finishedTitle: 'पाठ पूरा हुआ',
    finishedBody: 'कुछ देर इसी के साथ बैठिए। जब मन करे, अध्याय का पाठ पढ़ें।',
    backToCourse: 'पाठ्यक्रम पर लौटें',
    resumeAt: (c) => `${c} से जारी`,
    playerRegion: 'पाठ का वीडियो',
  },
  en: {
    back: 'Course',
    readText: 'Read the text instead',
    audio: 'Voice',
    captions: 'Captions',
    captionsOff: 'Off',
    languageName: { hi: 'हिंदी', en: 'English' },
    segments: 'Parts of the lesson',
    locked: 'Locked',
    done: 'Done',
    current: 'Now',
    reflectTitle: 'Pause for a moment',
    reflectHint: 'Look within first. If you like, write here; only you can see it.',
    answerLabel: (n, total) => (total > 1 ? `Your answer (${n} of ${total})` : 'Your answer'),
    continueLabel: 'Continue',
    continueIn: (s) => `Continue (in ${s} s)`,
    saving: 'Saving…',
    askGuide: 'Ask the Guide',
    guideSoon: 'The Guide is not connected yet. It will be available here soon.',
    loading: 'Opening the lesson…',
    buffering: 'Loading…',
    loadError: 'This lesson could not be opened right now.',
    retry: 'Try again',
    finishedTitle: 'Lesson complete',
    finishedBody: 'Stay with it for a while. When you are ready, read the chapter text.',
    backToCourse: 'Back to the course',
    resumeAt: (c) => `Resumes at ${c}`,
    playerRegion: 'Lesson video',
  },
};
