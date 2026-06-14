// ═══════════════════════════════════════════
//  Panch Tatv — Five Elements of Nirvan Dham
// ═══════════════════════════════════════════

export interface TatvMember {
  slug: string;
  name: string;
  hindiName: string;
  tatv: string;
  tatvHindi: string;
  tatvSanskrit: string;
  tatvMeaning: string;
  tatvMeaningHindi: string;
  symbol: string;         // Unicode / Sanskrit symbol
  image: string;
  videos?: string[];       // Optional MP4 video files
  role: string;
  roleHindi: string;
  quote: string;
  quoteHindi: string;
  bio: string[];          // English paragraphs
  bioHindi: string[];     // Hindi paragraphs
  phone: string;
  email: string;
  colors: {
    bg: string;           // Dark bg color
    accent: string;       // Element accent color
    glow: string;         // rgba for glow effects
    gradient: string;     // CSS gradient string
    cardGrad: string;     // Card overlay gradient
  };
}

export const TATV_MEMBERS: TatvMember[] = [
  {
    slug: 'aadisatv',
    name: 'Aadisatv',
    hindiName: 'आदिसत्व',
    tatv: 'Aakash',
    tatvHindi: 'आकाश',
    tatvSanskrit: 'आकाश',
    tatvMeaning: 'Space & Infinite Consciousness',
    tatvMeaningHindi: 'आकाश एवं अनंत चेतना',
    symbol: '∞',
    image: '/tatv/aadisatv.jpg',
    videos: ['/tatv/aadisatv_1.mp4', '/tatv/aadisatv_2.mp4'],
    role: 'Founder & Spiritual Guide',
    roleHindi: 'संस्थापक एवं आध्यात्मिक मार्गदर्शक',
    quote: 'Consciousness is the only reality. Everything else is its luminous play.',
    quoteHindi: 'चेतना ही एकमात्र सत्य है। बाकी सब उसकी लीला है।',
    bio: [
      'Aadisatv is the founder and principal guide of Nirvan Dham — a living ashram dedicated to the direct realization of non-dual truth. Rooted in Advaita Vedanta and the ancient lineage of self-inquiry, his teachings cut through the noise of seeking and point directly to what is already here.',
      'Born with a rare sensitivity to the nature of silence, Aadisatv spent years in deep inquiry before discovering that what he was searching for was never absent. Since then, he has guided thousands of seekers across India through retreats, satsangs, and the Nirvan Sutra app.',
      'As the Aakash Tatv — the element of Space — Aadisatv embodies the infinite, the unbounded. Like space, his presence holds everything without grasping anything. He is the sky in which all experiences arise and dissolve.',
    ],
    bioHindi: [
      'आदिसत्व निर्वाण धाम के संस्थापक और प्रमुख मार्गदर्शक हैं — एक जीवंत आश्रम जो अद्वैत सत्य की प्रत्यक्ष अनुभूति को समर्पित है। अद्वैत वेदांत और आत्म-विचार की प्राचीन परंपरा में स्थित, उनकी शिक्षाएं खोज के शोर को काटती हैं और सीधे उस ओर संकेत करती हैं जो पहले से ही यहाँ है।',
      'मौन की प्रकृति के प्रति एक दुर्लभ संवेदनशीलता के साथ जन्मे, आदिसत्व ने गहरी आत्म-खोज में वर्षों बिताए, फिर यह जाना कि जो वे खोज रहे थे वह कभी अनुपस्थित नहीं था। तब से, उन्होंने रिट्रीट, सत्संग और निर्वाण सूत्र ऐप के माध्यम से भारत भर में हज़ारों साधकों का मार्गदर्शन किया है।',
      'आकाश तत्व के रूप में — अंतरिक्ष का तत्व — आदिसत्व अनंत, असीम को मूर्त रूप देते हैं। आकाश की तरह, उनकी उपस्थिति सब कुछ धारण करती है बिना किसी को पकड़े। वे वह आकाश हैं जिसमें सभी अनुभव उठते और विलीन होते हैं।',
    ],
    phone: '+91 93343 25558',
    email: 'aadisatv@nirvandham.in',
    colors: {
      bg: '#080815',
      accent: '#a78bfa',
      glow: 'rgba(167,139,250,0.15)',
      gradient: 'linear-gradient(135deg, #0d0821 0%, #1a0d3d 50%, #0d0821 100%)',
      cardGrad: 'linear-gradient(to top, rgba(13,8,33,0.97) 0%, rgba(26,13,61,0.7) 50%, transparent 100%)',
    },
  },
  {
    slug: 'krishnpriya',
    name: 'Krishnpriya',
    hindiName: 'कृष्णप्रिया',
    tatv: 'Jal',
    tatvHindi: 'जल',
    tatvSanskrit: 'जल',
    tatvMeaning: 'Water & Sacred Flow',
    tatvMeaningHindi: 'जल एवं पवित्र प्रवाह',
    symbol: '〰',
    image: '/tatv/krishnpriya.jpg',
    videos: ['/tatv/krishnpriya_1.mp4'],
    role: 'Devotion & Women\'s Wisdom Facilitator',
    roleHindi: 'भक्ति एवं स्त्री-ज्ञान संचालक',
    quote: 'Surrender is not weakness. It is the most profound strength of the heart.',
    quoteHindi: 'समर्पण कमज़ोरी नहीं, यह हृदय की सबसे गहरी शक्ति है।',
    bio: [
      'Krishnpriya embodies the Jal Tatv — the element of Water. Like water, she flows into every space with grace, nurturing what is dry, cleansing what is heavy, and finding the path of least resistance back to the ocean of being.',
      'A devoted practitioner and facilitator at Nirvan Dham, Krishnpriya leads women\'s wisdom circles, bhakti sessions, and guided meditations that touch the depth of the feminine spiritual path. Her journey has been one of profound surrender — discovering that the deepest love is not personal, but the very nature of awareness itself.',
      'Krishnpriya\'s presence at the ashram is that of a gentle river — consistent, nourishing, and always moving toward depth. Her sessions are known for creating a sacred safety where seekers can finally let go.',
    ],
    bioHindi: [
      'कृष्णप्रिया जल तत्व को मूर्त रूप देती हैं। जल की तरह, वे हर स्थान में अनुग्रह के साथ प्रवाहित होती हैं — जो शुष्क है उसे पोषित करती हैं, जो भारी है उसे शुद्ध करती हैं, और अस्तित्व के सागर में वापस लौटने का मार्ग खोजती हैं।',
      'निर्वाण धाम में एक समर्पित साधक और सूत्रधार के रूप में, कृष्णप्रिया महिला ज्ञान मंडलियों, भक्ति सत्रों और निर्देशित ध्यान का नेतृत्व करती हैं। उनकी साधना यात्रा गहरे समर्पण की रही है — यह जानने की कि सबसे गहरा प्रेम व्यक्तिगत नहीं, बल्कि चेतना का स्वभाव ही है।',
      'आश्रम में कृष्णप्रिया की उपस्थिति एक सौम्य नदी की तरह है — सुसंगत, पोषण करने वाली और हमेशा गहराई की ओर बढ़ती हुई। उनके सत्र एक पवित्र सुरक्षा का वातावरण बनाते हैं जहाँ साधक अंततः अपना बोझ छोड़ सकते हैं।',
    ],
    phone: '+91 93343 25559',
    email: 'krishnpriya@nirvandham.in',
    colors: {
      bg: '#060d1a',
      accent: '#38bdf8',
      glow: 'rgba(56,189,248,0.12)',
      gradient: 'linear-gradient(135deg, #060d1a 0%, #0c2340 50%, #060d1a 100%)',
      cardGrad: 'linear-gradient(to top, rgba(6,13,26,0.97) 0%, rgba(12,35,64,0.7) 50%, transparent 100%)',
    },
  },
  {
    slug: 'ashok',
    name: 'Ashok',
    hindiName: 'अशोक',
    tatv: 'Agni',
    tatvHindi: 'अग्नि',
    tatvSanskrit: 'अग्नि',
    tatvMeaning: 'Fire & Transformation',
    tatvMeaningHindi: 'अग्नि एवं रूपांतरण',
    symbol: '△',
    image: '/tatv/ashok.jpg',
    videos: ['/tatv/ashok_1.mp4'],
    role: 'Sadhana & Ritual Practice Guide',
    roleHindi: 'साधना एवं क्रिया-अनुष्ठान मार्गदर्शक',
    quote: 'The fire does not ask permission to transform. Neither should you.',
    quoteHindi: 'अग्नि रूपांतरण के लिए अनुमति नहीं मांगती। तुम भी मत मांगो।',
    bio: [
      'Ashok carries the Agni Tatv — the fire of transformation. Rooted in decades of rigorous sadhana, yoga, and scriptural study, he brings the fierce grace of a burning clarity to all his teachings. Nothing false can survive in the presence of true fire.',
      'A practitioner since youth, Ashok has walked the path of traditional Vedic sadhana alongside the direct teachings of non-duality. At Nirvan Dham, he guides intensive practice retreats, morning sadhana sessions, and the deeper science of pranayama and mantra that prepare the body-mind for the recognition of truth.',
      'Like the sacred fire in a yajna, Ashok\'s presence burns away the unnecessary and illuminates what remains. His students often describe his sessions as both demanding and deeply liberating.',
    ],
    bioHindi: [
      'अशोक अग्नि तत्व को धारण करते हैं — परिवर्तन की अग्नि। दशकों की कठोर साधना, योग और शास्त्र अध्ययन में निहित, वे अपनी सभी शिक्षाओं में एक ज्वलंत स्पष्टता की उग्र कृपा लाते हैं। सच्ची अग्नि की उपस्थिति में कुछ भी असत्य टिक नहीं सकता।',
      'युवावस्था से साधक, अशोक ने अद्वैत की प्रत्यक्ष शिक्षाओं के साथ-साथ पारंपरिक वैदिक साधना के पथ पर चले हैं। निर्वाण धाम में, वे गहन अभ्यास रिट्रीट, प्रातःकाल साधना सत्र और प्राणायाम तथा मंत्र के गहरे विज्ञान का मार्गदर्शन करते हैं।',
      'यज्ञ में पावन अग्नि की तरह, अशोक की उपस्थिति अनावश्यक को जला देती है और जो शेष बचता है उसे प्रकाशित करती है। उनके शिष्य अक्सर उनके सत्रों को मांगलिक और गहराई से मुक्तिदायक दोनों बताते हैं।',
    ],
    phone: '+91 93343 25560',
    email: 'ashok@nirvandham.in',
    colors: {
      bg: '#130800',
      accent: '#fb923c',
      glow: 'rgba(251,146,60,0.15)',
      gradient: 'linear-gradient(135deg, #130800 0%, #3d1a00 50%, #130800 100%)',
      cardGrad: 'linear-gradient(to top, rgba(19,8,0,0.97) 0%, rgba(61,26,0,0.7) 50%, transparent 100%)',
    },
  },
  {
    slug: 'aatm-prakash',
    name: 'Aatm Prakash',
    hindiName: 'आत्म प्रकाश',
    tatv: 'Vayu',
    tatvHindi: 'वायु',
    tatvSanskrit: 'वायु',
    tatvMeaning: 'Air & Inner Freedom',
    tatvMeaningHindi: 'वायु एवं आंतरिक स्वतंत्रता',
    symbol: '◎',
    image: '/tatv/aatm-prakash.jpg',
    videos: ['/tatv/aatm-prakash_1.mp4'],
    role: 'Philosophy & Self-Inquiry Teacher',
    roleHindi: 'दर्शन एवं आत्म-विचार शिक्षक',
    quote: 'Freedom is not something to be achieved. It is what you are when you stop pretending.',
    quoteHindi: 'स्वतंत्रता कोई उपलब्धि नहीं है। यह वही है जो तुम हो, जब नाटक बंद होता है।',
    bio: [
      'Aatm Prakash embodies the Vayu Tatv — the element of Air. Invisible yet essential, air is the bridge between the seen and unseen. Aatm Prakash brings this quality to the intellectual and philosophical dimension of the path, making the most subtle truths accessible and breathable.',
      'With a background in both traditional Vedantic philosophy and modern psychology, Aatm Prakash holds satsangs, dialogue sessions, and study circles that bridge ancient wisdom with contemporary understanding. His approach is both rigorous and warm — never losing sight of the living truth beneath every concept.',
      'At Nirvan Dham, he is the breath of fresh air that meets seekers where they are — in their questions, their doubts, their longing — and gently points them toward the spaciousness that requires no achievement.',
    ],
    bioHindi: [
      'आत्म प्रकाश वायु तत्व को मूर्त रूप देते हैं। अदृश्य फिर भी अनिवार्य, वायु दृश्य और अदृश्य के बीच का सेतु है। आत्म प्रकाश पथ के बौद्धिक और दार्शनिक आयाम में यह गुण लाते हैं — सूक्ष्मतम सत्यों को सुलभ और सांस लेने योग्य बनाते हैं।',
      'पारंपरिक वेदांतिक दर्शन और आधुनिक मनोविज्ञान दोनों की पृष्ठभूमि के साथ, आत्म प्रकाश सत्संग, संवाद सत्र और अध्ययन मंडल आयोजित करते हैं जो प्राचीन ज्ञान को समसामयिक समझ से जोड़ते हैं। उनका दृष्टिकोण कठोर और उष्ण दोनों है।',
      'निर्वाण धाम में, वे ताज़ी हवा की सांस हैं जो साधकों से वहीं मिलती है जहाँ वे हैं — अपने प्रश्नों में, अपने संशयों में, अपनी लालसा में — और धीरे से उन्हें उस विशालता की ओर संकेत करती है जिसके लिए किसी उपलब्धि की आवश्यकता नहीं।',
    ],
    phone: '+91 93343 25561',
    email: 'aatmprakash@nirvandham.in',
    colors: {
      bg: '#050f1a',
      accent: '#67e8f9',
      glow: 'rgba(103,232,249,0.12)',
      gradient: 'linear-gradient(135deg, #050f1a 0%, #0a2030 50%, #050f1a 100%)',
      cardGrad: 'linear-gradient(to top, rgba(5,15,26,0.97) 0%, rgba(10,32,48,0.7) 50%, transparent 100%)',
    },
  },
  {
    slug: 'ajay',
    name: 'Ajay',
    hindiName: 'अजय',
    tatv: 'Prithvi',
    tatvHindi: 'पृथ्वी',
    tatvSanskrit: 'पृथ्वी',
    tatvMeaning: 'Earth & Grounded Service',
    tatvMeaningHindi: 'पृथ्वी एवं सेवामयी जीवन',
    symbol: '◇',
    image: '/tatv/ajay.jpg',
    videos: ['/tatv/ajay_1.mp4'],
    role: 'Community Outreach & Karma Yoga',
    roleHindi: 'सामुदायिक सेवा एवं कर्म योग',
    quote: 'Every seed of truth planted in a human heart will bloom in its own season.',
    quoteHindi: 'मानव हृदय में बोया गया सत्य का हर बीज अपने समय पर खिलता है।',
    bio: [
      'Ajay carries the Prithvi Tatv — the earth element. Grounded, stable, and endlessly giving, the earth asks for nothing in return. This is the spirit with which Ajay moves through the world — in service, in community, in the quiet dignity of karma yoga.',
      'The bridge between Nirvan Dham and the wider world, Ajay coordinates community outreach programs, mindfulness workshops, and the dissemination of Aadisatv\'s teachings in rural and urban communities across Bihar and beyond. His work is not separate from his practice — it is his practice.',
      'For Ajay, every human encounter is a sacred field. Every village visit, every workshop circle, every conversation is an opportunity to water the seeds of awakening. In him, the teaching walks, breathes, and serves.',
    ],
    bioHindi: [
      'अजय पृथ्वी तत्व को धारण करते हैं। स्थिर, दृढ़ और अंतहीन रूप से देने वाले, पृथ्वी बदले में कुछ नहीं मांगती। यही वह भावना है जिसके साथ अजय दुनिया में विचरते हैं — सेवा में, समुदाय में, कर्म योग की शांत गरिमा में।',
      'निर्वाण धाम और व्यापक विश्व के बीच सेतु, अजय सामुदायिक आउटरीच कार्यक्रम, माइंडफुलनेस कार्यशालाएं और बिहार व उससे परे ग्रामीण व शहरी समुदायों में आदिसत्व की शिक्षाओं के प्रसार का समन्वय करते हैं। उनका कार्य उनकी साधना से अलग नहीं — वही उनकी साधना है।',
      'अजय के लिए, हर मानवीय मुलाकात एक पवित्र क्षेत्र है। हर गाँव का दौरा, हर कार्यशाला मंडल, हर संवाद — जागृति के बीज बोने का अवसर है। उनमें शिक्षा चलती है, साँस लेती है और सेवा करती है।',
    ],
    phone: '+91 93343 25562',
    email: 'ajay@nirvandham.in',
    colors: {
      bg: '#070f05',
      accent: '#86efac',
      glow: 'rgba(134,239,172,0.12)',
      gradient: 'linear-gradient(135deg, #070f05 0%, #142909 50%, #070f05 100%)',
      cardGrad: 'linear-gradient(to top, rgba(7,15,5,0.97) 0%, rgba(20,41,9,0.7) 50%, transparent 100%)',
    },
  },
];

export function getTatvBySlug(slug: string): TatvMember | undefined {
  return TATV_MEMBERS.find((m) => m.slug === slug);
}
