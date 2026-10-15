// Sends ONE clearly marked test submission to the Nirvan Sutra Formspree form, to check that answers reach the inbox.
//   NIRVAN_SUTRA_FORMSPREE_URL=https://formspree.io/f/<id> npx tsx scripts/nirvan-sutra/formspree-test.ts
import { sendWritten, formspreeUrl } from '../../src/course/nirvan-sutra/server/notify';

(async () => {
  if (!formspreeUrl()) { console.log('no Formspree URL (set NIRVAN_SUTRA_FORMSPREE_URL)'); process.exitCode = 1; return; }
  const ok = await sendWritten({
    part: 'TEST — Stage S01 — अज्ञान (setup check, not a seeker)',
    learner: { id: 'test-setup', name: 'TEST (Claude setup check)', email: null },
    locale: 'hi',
    prompts: ['यह एक परीक्षण प्रश्न है — क्या उत्तर ईमेल तक पहुँचते हैं?'],
    answers: ['हाँ, यह केवल सेटअप जाँच है। कृपया अनदेखा करें।'],
  });
  console.log(ok ? 'Formspree accepted the test submission' : 'Formspree did not accept it');
  process.exitCode = ok ? 0 : 1;
})();
