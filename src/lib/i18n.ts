export type Language = 'hi' | 'en';

export const DEFAULT_LANGUAGE: Language = 'hi';
export const LANGUAGE_STORAGE_KEY = 'nirvan-dham-language';
export const LANGUAGE_COOKIE_KEY = 'nirvan-dham-language';

export function isLanguage(value: unknown): value is Language {
  return value === 'hi' || value === 'en';
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const urlValue = new URLSearchParams(window.location.search).get('lang');
  if (isLanguage(urlValue)) return urlValue;

  const localValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isLanguage(localValue)) return localValue;

  const cookieValue = readCookie(LANGUAGE_COOKIE_KEY);
  if (isLanguage(cookieValue)) return cookieValue;

  return DEFAULT_LANGUAGE;
}

export function saveLanguage(lang: Language) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${encodeURIComponent(lang)}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = lang;
}

export const content = {
  hi: {
    // Nav
    nav: {
      darshan: 'दर्शन',
      sadhana: 'साधना',
      samvad: 'संवाद',
      aiGuide: 'AI गाइड',
      guidance: 'मार्गदर्शन',
    },
    // Splash
    splash: {
      heading: 'अपना मार्ग चुनें',
      subheading: 'Choose Your Path',
      hi: 'हिंदी',
      en: 'English',
      tagline: 'निर्वाण धाम में आपका स्वागत है',
    },
    // Hero
    hero: {
      eyebrow: 'निर्वाण सूत्र',
      heading: 'आप कौन हैं?',
      subtext:
        'निर्वाण सूत्र साधक को जागरूकता, आत्म-जांच, अद्वैत और सत्य के प्रत्यक्ष दर्शन की ओर ले जाता है।',
      cta1: 'निर्वाण सूत्र प्रारंभ करें',
      cta2: 'AI Guide से पूछें',
      cta3: 'मार्गदर्शन लें',
      scroll: 'नीचे स्क्रॉल करें',
    },
    // Pillars
    pillars: {
      heading: 'तीन स्तंभ',
      subheading: 'Three Pillars of the Inner Journey',
      items: [
        {
          sanskrit: 'दर्शन',
          title: 'Darshan',
          desc: 'शिक्षाएं, ब्लॉग, YouTube ज्ञान, अद्वैत, जागरूकता — सत्य का प्रत्यक्ष दर्शन।',
          icon: '☽',
        },
        {
          sanskrit: 'साधना',
          title: 'Sadhana',
          desc: 'निर्वाण सूत्र ऑडियो पथ: प्रारंभिक, मध्यवर्ती, विशेषज्ञ — अंदर की यात्रा।',
          icon: '◎',
        },
        {
          sanskrit: 'संवाद',
          title: 'Samvad',
          desc: 'AI गाइड और व्यक्तिगत मार्गदर्शन — Aadisatv के साथ सीधा संवाद।',
          icon: '∞',
        },
      ],
    },
    // Path Cards
    path: {
      heading: 'निर्वाण सूत्र — आपका मार्ग',
      subheading: 'आंतरिक यात्रा के तीन चरण',
      cards: [
        {
          level: 'प्रारंभिक',
          label: 'Beginner',
          title: 'जागृति का बीज',
          desc: 'ध्यान का परिचय, श्वास की जागरूकता, मन की शांति। पहला कदम — भीतर देखना।',
          tag: 'उपलब्ध है',
          available: true,
        },
        {
          level: 'मध्यवर्ती',
          label: 'Intermediate',
          title: 'साक्षी का जागरण',
          desc: 'माया, अहंकार, साक्षी भाव, अद्वैत की झलक। जानना कि "मैं" कौन नहीं हूँ।',
          tag: 'शीघ्र आ रहा है',
          available: false,
        },
        {
          level: 'विशेषज्ञ',
          label: 'Expert',
          title: 'निर्वाण का द्वार',
          desc: 'प्रत्यक्ष दर्शन, शुद्ध जागरूकता, अस्तित्व का सत्य, अहं का विसर्जन।',
          tag: 'तैयारी में',
          available: false,
        },
      ],
    },
    // Tatv
    tatv: {
      eyebrow: 'पञ्च तत्त्व',
      heading: 'पाँच तत्त्व — पाँच ज्योतियाँ',
      subheading:
        'ये पाँच साधक, अपने-अपने तत्त्व के रूप में, निर्वाण धाम की चेतना को जीवित रखते हैं।',
      detailBack: 'निर्वाण धाम',
      element: 'तत्त्व',
      about: 'परिचय',
      qualitiesSuffix: 'के गुण',
      teachings: 'दर्शन',
      firstTeaching: 'प्रथम दर्शन',
      secondTeaching: 'द्वितीय दर्शन',
      connect: 'संपर्क',
      connectWith: 'से',
      connectAction: 'जुड़ें',
      contactDesc:
        'रिट्रीट, सत्संग, कार्यशाला या व्यक्तिगत मार्गदर्शन के लिए संपर्क करें।',
      phoneLabel: 'फोन / WhatsApp',
      emailLabel: 'ईमेल',
      sendMessage: 'संदेश भेजें',
      nameLabel: 'आपका नाम',
      messageLabel: 'संदेश',
      submit: 'भेजें',
      submittedTitle: 'संदेश प्राप्त हुआ',
      submittedDesc: 'आपसे उचित समय पर संपर्क किया जाएगा।',
      otherElements: 'अन्य तत्त्व',
      scroll: 'नीचे देखें',
      footer: 'निर्वाण धाम · nirvandham.in',
      qualities: {
        Aakash: ['अनंत', 'असीम', 'मौन', 'सर्वव्यापी', 'आकाशीय', 'निर्मल'],
        Jal: ['प्रवाहमान', 'पोषक', 'अनुकूल', 'शुद्धकारी', 'सरल', 'शीतल'],
        Agni: ['रूपांतरणकारी', 'प्रकाशमान', 'शुद्धकारी', 'तेजस्वी', 'ऊर्जावान'],
        Vayu: ['स्वतंत्र', 'सूक्ष्म', 'विस्तृत', 'प्राणदायी', 'मुक्त'],
        Prithvi: ['स्थिर', 'धरातलीय', 'पोषक', 'धैर्यवान', 'सेवामय'],
      },
    },
    // AI Guide
    aiGuide: {
      heading: 'AI गाइड',
      subheading: 'Aadisatv की शिक्षाओं से प्रेरित संवाद',
      disclaimer:
        'यह AI Guide Aadisatv की शिक्षाओं के आधार पर उत्तर देता है। यह Aadisatv नहीं है।',
      placeholder: 'अपना प्रश्न यहाँ लिखें...',
      send: 'पूछें',
      suggestions: [
        'मैं कौन हूँ?',
        'माया क्या है?',
        'ध्यान कैसे शुरू करें?',
        'निर्वाण क्या है?',
        'साक्षी भाव क्या है?',
      ],
      welcomeMsg:
        'नमस्ते साधक। मैं Aadisatv की शिक्षाओं से आता हूँ। आपका प्रश्न क्या है?',
    },
    // YouTube
    youtube: {
      heading: 'शिक्षा का स्रोत',
      subheading: 'Aadisatv के YouTube चैनल',
      desc: 'AI गाइड भविष्य में Aadisatv के YouTube शिक्षाओं, ट्रांसक्रिप्ट, ब्लॉग और निर्वाण सूत्र सत्रों से सीखेगा।',
      channels: [
        {
          handle: '@theonenessproject',
          name: 'The Oneness Project',
          desc: 'अद्वैत, एकता, सत्य का प्रत्यक्ष दर्शन',
        },
        {
          handle: '@dhamnirvan',
          name: 'Dham Nirvan',
          desc: 'निर्वाण धाम की शिक्षाएं और ध्यान मार्ग',
        },
      ],
    },
    // Guidance
    guidance: {
      heading: 'व्यक्तिगत मार्गदर्शन',
      subheading: 'Aadisatv के साथ',
      desc: 'बोधगया और ऑनलाइन — जो साधक प्रत्यक्ष संवाद चाहते हैं, उनके लिए सीधा मार्गदर्शन।',
      note: 'दान स्वैच्छिक है। यह सेवा है, व्यापार नहीं।',
      cta: 'मार्गदर्शन के लिए संपर्क करें',
      emailCta: 'ईमेल से संपर्क करें',
      locationTags: ['📍 बोधगया', '🌐 ऑनलाइन'],
    },
    // App
    app: {
      heading: 'निर्वाण सूत्र ऐप',
      subheading: 'Android ऐप — शीघ्र आ रहा है',
      desc: 'प्रारंभिक ऑडियो सत्र पहले। मध्यवर्ती और विशेषज्ञ सत्र तैयारी में हैं।',
      cta: 'अपडेट के लिए सूचित करें',
      pill: 'मोबाइल ऐप',
      splashLabel: 'स्प्लैश',
      homeLabel: 'होम स्क्रीन',
      status: 'जल्द लॉन्च होगा',
      detail:
        'Aadisatv की शिक्षाएँ, निर्देशित ध्यान और दैनिक ज्ञान — आपके हाथ में। हर दिन आपकी आंतरिक यात्रा का एक नया कदम।',
      features: [
        'निर्देशित ध्यान ऑडियो',
        'दैनिक शिक्षाएँ और ज्ञान',
        'AI गाइड — कुछ भी पूछें',
        'अपनी आंतरिक यात्रा देखें',
      ],
    },
    // Contact
    contact: {
      heading: 'संपर्क करें',
      phone: '+91 93343 25558',
      email: 'aadisatv@gmail.com',
      whatsapp: 'WhatsApp पर बात करें',
    },
    // Footer
    footer: {
      tagline: 'सत्य की ओर एक कदम',
      rights: '© 2025 निर्वाण धाम। सर्वाधिकार सुरक्षित।',
      website: 'nirvandham.in',
      navigation: 'मार्ग',
      mantra: 'ॐ नमः शिवाय',
    },
  },

  en: {
    nav: {
      darshan: 'Darshan',
      sadhana: 'Sadhana',
      samvad: 'Samvad',
      aiGuide: 'AI Guide',
      guidance: 'Guidance',
    },
    splash: {
      heading: 'Choose Your Path',
      subheading: 'अपनी भाषा चुनें',
      hi: 'हिंदी',
      en: 'English',
      tagline: 'Welcome to Nirvan Dham',
    },
    hero: {
      eyebrow: 'Nirvan Sutra',
      heading: 'Who are you?',
      subtext:
        'Nirvan Sutra guides the seeker into awareness, self-inquiry, non-duality, and the direct seeing of truth.',
      cta1: 'Begin Nirvan Sutra',
      cta2: 'Ask AI Guide',
      cta3: 'Receive Guidance',
      scroll: 'Scroll to explore',
    },
    pillars: {
      heading: 'Three Pillars',
      subheading: 'तीन स्तंभ — The Inner Journey',
      items: [
        {
          sanskrit: 'दर्शन',
          title: 'Darshan',
          desc: 'Teachings, blogs, YouTube wisdom, Advaita, awareness — the direct seeing of truth.',
          icon: '☽',
        },
        {
          sanskrit: 'साधना',
          title: 'Sadhana',
          desc: 'Nirvan Sutra audio path: Beginner, Intermediate, Expert — the journey inward.',
          icon: '◎',
        },
        {
          sanskrit: 'संवाद',
          title: 'Samvad',
          desc: 'AI Guide and one-on-one guidance — direct dialogue with Aadisatv.',
          icon: '∞',
        },
      ],
    },
    path: {
      heading: 'Nirvan Sutra — Your Path',
      subheading: 'Three Stages of the Inner Journey',
      cards: [
        {
          level: 'Beginner',
          label: 'प्रारंभिक',
          title: 'The Seed of Awakening',
          desc: 'Introduction to meditation, breath awareness, stillness of mind. The first step — looking within.',
          tag: 'Available Now',
          available: true,
        },
        {
          level: 'Intermediate',
          label: 'मध्यवर्ती',
          title: 'The Awakening of the Witness',
          desc: 'Maya, ego, witness awareness, a glimpse of non-duality. Knowing what "I" am not.',
          tag: 'Coming Soon',
          available: false,
        },
        {
          level: 'Expert',
          label: 'विशेषज्ञ',
          title: 'The Gate of Nirvana',
          desc: 'Direct seeing, pure awareness, the truth of existence, dissolution of the ego-self.',
          tag: 'In Preparation',
          available: false,
        },
      ],
    },
    tatv: {
      eyebrow: 'Panch Tatv',
      heading: 'Five Elements — Five Living Flames',
      subheading: 'These five seekers embody the living elements of Nirvan Dham.',
      detailBack: 'Home',
      element: 'Element',
      about: 'About',
      qualitiesSuffix: 'Qualities',
      teachings: 'Teachings',
      firstTeaching: 'First Teaching',
      secondTeaching: 'Second Teaching',
      connect: 'Connect',
      connectWith: '—',
      connectAction: 'Connect',
      contactDesc: 'Reach out for retreats, satsangs, workshops, or personal guidance.',
      phoneLabel: 'Phone / WhatsApp',
      emailLabel: 'Email',
      sendMessage: 'Send a Message',
      nameLabel: 'Your Name',
      messageLabel: 'Message',
      submit: 'Send Message',
      submittedTitle: 'Message Received',
      submittedDesc: 'We will connect with you in due course.',
      otherElements: 'Other Elements',
      scroll: 'scroll',
      footer: 'Nirvan Dham · nirvandham.in',
      qualities: {
        Aakash: ['Infinite', 'Unbounded', 'Silent', 'All-pervasive', 'Spacious', 'Clear'],
        Jal: ['Flowing', 'Nurturing', 'Adaptive', 'Purifying', 'Gentle', 'Cool'],
        Agni: ['Transformative', 'Luminous', 'Purifying', 'Fierce', 'Radiant'],
        Vayu: ['Free', 'Subtle', 'Expansive', 'Life-giving', 'Open'],
        Prithvi: ['Grounded', 'Stable', 'Nourishing', 'Patient', 'Serviceful'],
      },
    },
    aiGuide: {
      heading: 'AI Guide',
      subheading: 'Sacred Dialogue from Aadisatv\'s Teachings',
      disclaimer:
        'This AI Guide answers from Aadisatv\'s teachings. It is not Aadisatv.',
      placeholder: 'Ask your question here...',
      send: 'Ask',
      suggestions: [
        'Who am I?',
        'What is Maya?',
        'How to begin meditation?',
        'What is Nirvana?',
        'What is the witness state?',
      ],
      welcomeMsg:
        'Namaste, seeker. I arise from Aadisatv\'s teachings. What is your question?',
    },
    youtube: {
      heading: 'Source of Teachings',
      subheading: 'Aadisatv\'s YouTube Channels',
      desc: 'The AI Guide will learn from Aadisatv\'s YouTube teachings, transcripts, blogs, and Nirvan Sutra sessions.',
      channels: [
        {
          handle: '@theonenessproject',
          name: 'The Oneness Project',
          desc: 'Advaita, oneness, the direct seeing of truth',
        },
        {
          handle: '@dhamnirvan',
          name: 'Dham Nirvan',
          desc: 'Teachings and meditation path of Nirvan Dham',
        },
      ],
    },
    guidance: {
      heading: 'Personal Guidance',
      subheading: 'With Aadisatv',
      desc: 'In Bodhgaya and online — direct guidance for seekers who seek personal dialogue.',
      note: 'Donation is optional. This is service, not commerce.',
      cta: 'Connect for Guidance',
      emailCta: 'Contact via Email',
      locationTags: ['📍 Bodhgaya', '🌐 Online'],
    },
    app: {
      heading: 'Nirvan Sutra App',
      subheading: 'Android App — Coming Soon',
      desc: 'Beginner audio sessions first. Intermediate and expert sessions are in preparation.',
      cta: 'Notify Me on Launch',
      pill: 'Mobile App',
      splashLabel: 'Splash',
      homeLabel: 'Home Screen',
      status: 'Launching Soon',
      detail:
        "Aadisatv's teachings, guided meditation, and daily wisdom — in your hands. A new step every day on your soul's journey.",
      features: [
        'Guided Meditation Audio',
        'Daily Teachings & Wisdom',
        'AI Guide — Ask Anything',
        'Track Your Inner Journey',
      ],
    },
    contact: {
      heading: 'Contact',
      phone: '+91 93343 25558',
      email: 'aadisatv@gmail.com',
      whatsapp: 'Connect on WhatsApp',
    },
    footer: {
      tagline: 'One step toward truth',
      rights: '© 2025 Nirvan Dham. All rights reserved.',
      website: 'nirvandham.in',
      navigation: 'Navigation',
      mantra: 'Om Namah Shivaya',
    },
  },
} as const;

export type ContentType = typeof content['en'];
