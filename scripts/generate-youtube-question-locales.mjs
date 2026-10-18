// Prepare translated YouTube title/description fields for newly published Q&A films.
// The translated question comes from the existing course locale files; thumbnails stay in Hindi.
import fs from 'node:fs/promises';
import path from 'node:path';

const films = process.argv.slice(2);
if (!films.length || films.some((film) => !/^gm-t\d{2}-q\d{2}$/.test(film))) {
  throw new Error('Usage: node scripts/generate-youtube-question-locales.mjs gm-tNN-qNN [...]');
}

const root = new URL('../src/course/nirvan-sutra/locales/', import.meta.url);
const course = 'https://www.nirvandham.in/course';
const site = 'https://www.nirvandham.in/';
const descriptions = {
  en: ['Explore this question through a guided Nirvan Sutra lesson.', 'Continue the free 17-stage course in your language:', 'Nirvan Dham:', 'Audio is an AI dub. Sanskrit verses remain in their original language.'],
  bn: ['নির্বাণ সূত্রের এই প্রশ্নটি নিয়ে গভীরভাবে অনুসন্ধান করুন।', 'নিজের ভাষায় বিনামূল্যের ১৭ ধাপের পাঠ্যক্রমে এগিয়ে যান:', 'নির্বাণ ধাম:', 'এই অডিও AI দিয়ে ডাব করা হয়েছে। সংস্কৃত শ্লোক মূল ভাষায় আছে।'],
  gu: ['નિર્વાણ સૂત્રના આ પ્રશ્નને ઊંડાણથી તપાસો.', 'તમારી ભાષામાં મફત ૧૭ તબક્કાનો અભ્યાસક્રમ આગળ વધારોઃ', 'નિર્વાણ ધામ:', 'આ ઓડિયો AI દ્વારા ડબ કરાયો છે. સંસ્કૃત શ્લોક મૂળ ભાષામાં છે.'],
  kn: ['ನಿರ್ವಾಣ ಸೂತ್ರದ ಈ ಪ್ರಶ್ನೆಯನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿ.', 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಉಚಿತ ೧೭ ಹಂತಗಳ ಪಠ್ಯಕ್ರಮವನ್ನು ಮುಂದುವರಿಸಿ:', 'ನಿರ್ವಾಣ ಧಾಮ:', 'ಈ ಧ್ವನಿ AI ಮೂಲಕ ಡಬ್ ಮಾಡಲಾಗಿದೆ. ಸಂಸ್ಕೃತ ಶ್ಲೋಕಗಳು ಮೂಲ ಭಾಷೆಯಲ್ಲಿವೆ.'],
  ml: ['നിർവാണ സൂത്രത്തിലെ ഈ ചോദ്യം ആഴത്തിൽ അന്വേഷിക്കുക.', 'നിങ്ങളുടെ ഭാഷയിൽ സൗജന്യ 17 ഘട്ട കോഴ്‌സ് തുടരുക:', 'നിർവാണ ധാം:', 'ഈ ശബ്ദം AI ഉപയോഗിച്ച് ഡബ് ചെയ്തതാണ്. സംസ്കൃത ശ്ലോകങ്ങൾ മൂലഭാഷയിലാണ്.'],
  mr: ['निर्वाण सूत्रातील या प्रश्नाचा सखोल शोध घ्या.', 'आपल्या भाषेत विनामूल्य १७ टप्प्यांचा अभ्यासक्रम पुढे चालू ठेवा:', 'निर्वाण धाम:', 'हा आवाज AI द्वारे डब केला आहे. संस्कृत श्लोक मूळ भाषेत आहेत.'],
  or: ['ନିର୍ବାଣ ସୂତ୍ରର ଏହି ପ୍ରଶ୍ନକୁ ଗଭୀରରୁ ଅନୁସନ୍ଧାନ କରନ୍ତୁ।', 'ନିଜ ଭାଷାରେ ମାଗଣା ୧୭ ପର୍ଯ୍ୟାୟର ପାଠ୍ୟକ୍ରମ ଜାରି ରଖନ୍ତୁ:', 'ନିର୍ବାଣ ଧାମ:', 'ଏହି ଅଡିଓ AI ଦ୍ୱାରା ଡବ୍ ହୋଇଛି। ସଂସ୍କୃତ ଶ୍ଲୋକ ମୂଳ ଭାଷାରେ ଅଛି।'],
  pa: ['ਨਿਰਵਾਣ ਸੂਤਰ ਦੇ ਇਸ ਸਵਾਲ ਨੂੰ ਡੂੰਘਾਈ ਨਾਲ ਸਮਝੋ।', 'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਮੁਫ਼ਤ 17 ਪੜਾਵਾਂ ਦਾ ਕੋਰਸ ਜਾਰੀ ਰੱਖੋ:', 'ਨਿਰਵਾਣ ਧਾਮ:', 'ਇਹ ਆਡੀਓ AI ਨਾਲ ਡੱਬ ਕੀਤੀ ਗਈ ਹੈ। ਸੰਸਕ੍ਰਿਤ ਸ਼ਲੋਕ ਮੂਲ ਭਾਸ਼ਾ ਵਿੱਚ ਹਨ।'],
  ta: ['நிர்வாண சூத்திரத்தின் இந்தக் கேள்வியை ஆழமாக ஆராயுங்கள்.', 'உங்கள் மொழியில் இலவச 17 படிநிலைப் பாடத்திட்டத்தைத் தொடருங்கள்:', 'நிர்வாண தாம்:', 'இந்த ஒலி AI மூலம் மொழிமாற்றம் செய்யப்பட்டது. சமஸ்கிருதச் சுலோகங்கள் மூல மொழியிலேயே உள்ளன.'],
  te: ['నిర్వాణ సూత్రంలోని ఈ ప్రశ్నను లోతుగా పరిశీలించండి.', 'మీ భాషలో ఉచిత 17 దశల కోర్సును కొనసాగించండి:', 'నిర్వాణ ధామ్:', 'ఈ ఆడియో AIతో డబ్ చేయబడింది. సంస్కృత శ్లోకాలు మూల భాషలోనే ఉన్నాయి.'],
};

const questions = Object.fromEntries(await Promise.all(Object.keys(descriptions).map(async (locale) => [
  locale,
  JSON.parse(await fs.readFile(new URL(`${locale}/questions.json`, root), 'utf8')),
])));

const output = {};
for (const film of films) {
  const [, stage, number] = /^gm-t(\d{2})-q(\d{2})$/.exec(film);
  const id = `NS-S${stage}-Q${number}`;
  output[film] = {};
  for (const [locale, labels] of Object.entries(descriptions)) {
    const question = questions[locale].questions[id];
    if (!question) throw new Error(`Missing course question: ${locale} ${id}`);
    const chars = Array.from(question);
    const title = chars.length > 99 ? `${chars.slice(0, 98).join('').trimEnd()}…` : question;
    output[film][locale] = {
      title,
      description: `${question}\n\n${labels[0]}\n\n${labels[1]}\n${course}\n\n${labels[2]}\n${site}\n\n${labels[3]}`,
    };
  }
}
const destination = path.join(process.env.TEMP || '/tmp', 'nirvan-youtube-question-locales.json');
await fs.writeFile(destination, JSON.stringify(output, null, 2), 'utf8');
console.log(`${films.length} films × ${Object.keys(descriptions).length} languages → ${destination}`);
