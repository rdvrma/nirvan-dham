export interface AudioTrack {
  id: string;
  title: string;
  src: string;
}

export interface AudiobookItem {
  slug: string;
  titleHindi: string;
  titleEnglish: string;
  subtitleHindi: string;
  subtitleEnglish: string;
  moodHindi: string;
  moodEnglish: string;
  accent: string;
  tracks: AudioTrack[];
}

function makeTracks(slug: string, titles: string[]): AudioTrack[] {
  return titles.map((title, index) => {
    const chapter = String(index + 1).padStart(2, '0');
    return {
      id: `${slug}-${chapter}`,
      title,
      src: `/library/audiobooks/${slug}/chapter-${chapter}.mp3`,
    };
  });
}

export const HINDI_AUDIOBOOKS: AudiobookItem[] = [
  {
    slug: "main-kaun-hoon",
    titleHindi: "मैं कौन हूँ",
    titleEnglish: "Who Am I",
    subtitleHindi: "साधक ही भ्रम है",
    subtitleEnglish: "The Seeker Is the Illusion",
    moodHindi: "खोज से विश्राम तक",
    moodEnglish: "From seeking to stillness",
    accent: "#d4a843",
    tracks: makeTracks("main-kaun-hoon", ["लेखक-नोट — मैंने यह पुस्तक क्यों लिखी","अध्याय १ — पहली भूल — “मैं अभी वहाँ नहीं पहुँचा”","अध्याय २ — साधक: विचारों से बनी एक पहचान","अध्याय ३ — जागरण उपलब्धि क्यों नहीं हो सकता","अध्याय ४ — आध्यात्मिक अनुभवों का जाल","अध्याय ५ — गुरु, विधि और छिपी हुई निर्भरता","अध्याय ६ — खोज: एक सूक्ष्म पलायन","अध्याय ७ — जब खोज शांत होने लगती है","अध्याय ८ — साधक को कौन जान रहा है?","अध्याय ९ — कोई अंतिम विस्फोट नहीं, केवल सरल पहचान","अध्याय १० — बनने के बोझ के बिना जीना","समापन-संदेश — अंतिम मौन-स्पर्श"]),
  },
  {
    slug: "maya-aur-man",
    titleHindi: "माया और मन",
    titleEnglish: "Maya and Mind",
    subtitleHindi: "विचार, भ्रम और जागृति की पहचान",
    subtitleEnglish: "Thought, illusion and the recognition of awakening",
    moodHindi: "मन को देखने की कला",
    moodEnglish: "Seeing the movement of mind",
    accent: "#b9c76a",
    tracks: makeTracks("maya-aur-man", ["माया क्या है? मन का जन्म","विचारों का जाल और “मैं” का भ्रम","सुख-दुःख का पेंडुलम: मन की चाल","साक्षीभाव: भ्रम से जागने की महा-औषधि","जागृति: जब माया का पर्दा गिरता है"]),
  },
  {
    slug: "ishwar-kaun-hai",
    titleHindi: "ईश्वर कौन है?",
    titleEnglish: "Who Is God?",
    subtitleHindi: "स्वरूप से अरूप तक",
    subtitleEnglish: "From Form to Formless",
    moodHindi: "भक्ति से अद्वैत तक",
    moodEnglish: "From devotion to non-duality",
    accent: "#e29d52",
    tracks: makeTracks("ishwar-kaun-hai", ["प्रश्न का जन्म","स्वरूप: जब ईश्वर को रूप दिया","भक्ति की आग","मन और माया","साक्षी से सत्य तक","अरूप: जहाँ ईश्वर शब्द भी गिर जाता है","तुम ही वो हो"]),
  },
  {
    slug: "advaita-ka-bodh",
    titleHindi: "अद्वैत का बोध",
    titleEnglish: "The Realization of Advaita",
    subtitleHindi: "शास्त्र से सत्य तक",
    subtitleEnglish: "From Scripture to Truth",
    moodHindi: "प्रत्यक्ष दर्शन",
    moodEnglish: "Direct Seeing",
    accent: "#d4af37",
    tracks: makeTracks("advaita-ka-bodh", ["अद्वैत क्या है — और क्या नहीं है","माया: वो जो है भी, और नहीं भी","आत्मा: वो जो कभी बंधा नहीं","गुरु और शास्त्र: दो किनारे, एक नदी","जीवन्मुक्ति: मुक्ति जीते जी","महावाक्य: चार शब्द, एक सत्य","बोध: जब समझ नहीं, जागरण होता है"]),
  },
  {
    slug: "shiv-aur-shakti",
    titleHindi: "शिव और शक्ति",
    titleEnglish: "Shiva and Shakti",
    subtitleHindi: "जब दो नहीं, एक है",
    subtitleEnglish: "When Two Are Not Two, but One",
    moodHindi: "चेतना और ऊर्जा का मिलन",
    moodEnglish: "Union of awareness and energy",
    accent: "#7eb6d9",
    tracks: makeTracks("shiv-aur-shakti", ["तंत्र का असली अर्थ — जो किसी ने नहीं बताया","शिव: वो चेतना जो सब कुछ है","शक्ति: जब चेतना नाचती है","प्रत्यभिज्ञा: पहचानो, तुम पहले से शिव हो","तंत्र और तिब्बत: रिगपा और स्पंद एक ही सत्य","जगत मिथ्या नहीं — जगत शिव है","पूर्णता: जब साधक और साधना दोनों गिर जाते हैं"]),
  },
  {
    slug: "yog-swayam-ki-or",
    titleHindi: "योग: स्वयं की ओर",
    titleEnglish: "Yoga: Toward the Self",
    subtitleHindi: "शास्त्रों के आलोक में",
    subtitleEnglish: "In the Light of Scriptures",
    moodHindi: "अभ्यास से आत्म-विश्राम",
    moodEnglish: "Practice to self-rest",
    accent: "#dca657",
    tracks: makeTracks("yog-swayam-ki-or", ["योग क्या है — और क्या नहीं है","सांख्य: वो नक्शा जिस पर योग चलता है","अष्टांग योग: आठ सीढ़ियाँ, एक छत","चित्त: वो दर्पण जो खुद को भूल गया","ध्यान: जब करने वाला नहीं रहता","कर्म योग और ज्ञान योग: दो राहें, एक मंज़िल","कैवल्य: अकेलापन नहीं, परिपूर्णता"]),
  },
  {
    slug: "tantra-margon-ka-sangam",
    titleHindi: "तंत्र: मार्गों का संगम",
    titleEnglish: "Tantra: Confluence of Paths",
    subtitleHindi: "आगम से अद्वैत तक",
    subtitleEnglish: "From Agama to Advaita",
    moodHindi: "समग्र स्वीकृति",
    moodEnglish: "Total acceptance",
    accent: "#a57cd6",
    tracks: makeTracks("tantra-margon-ka-sangam", ["तंत्र की उत्पत्ति और विस्तार: आगम, निगम और कुल मार्ग","शाक्त तंत्र: देवीमाहात्म्य से दस महाविद्या तक","कौल मार्ग: पंचमकार और वाम-दक्षिण की वास्तविक समझ","हठयोग और तंत्र: कुंडलिनी, चक्र और नाड़ी-विज्ञान","बौद्ध तंत्र: महामुद्रा, करुणा और शून्यता","मंत्र, यंत्र और देवता: प्रतीक से प्रत्यक्ष तक","तंत्र की समकालीन प्रासंगिकता: जीवन में सहज साधना"]),
  },
  {
    slug: "maya-ke-maze",
    titleHindi: "माया के मज़े",
    titleEnglish: "The Joys of Maya",
    subtitleHindi: "संसार को साक्षी भाव से देखना",
    subtitleEnglish: "Witnessing the cosmic play",
    moodHindi: "सहज हास्य और वैराग्य",
    moodEnglish: "Gentle humor and dispassion",
    accent: "#c9a26d",
    tracks: makeTracks("maya-ke-maze", ["माया का मज़ाक: जब भगवान भी हमें हंसी में उड़ा देता है","अहंकार: सबसे बड़ा कॉमेडियन","संसार का सर्कस: रिश्ते, रुतबा और रेस","भक्ति का नाटक और साधना का स्वांग","दुख का मज़ाक: जब रोना भी हंसी में बदल जाता है","ज्ञान का चुटकुला: अष्टावक्र और जनक का संवाद","अद्वैत: जब हंसी भी शांत हो जाती है"]),
  },
  {
    slug: "sukshm-sansar",
    titleHindi: "सूक्ष्म संसार",
    titleEnglish: "The Subtle Worlds",
    subtitleHindi: "दृश्य के पार, द्रष्टा की ओर",
    subtitleEnglish: "Beyond the Seen, Toward the Seer",
    moodHindi: "गहन विवेक और दर्शन",
    moodEnglish: "Deep discernment",
    accent: "#dfb76c",
    tracks: makeTracks("sukshm-sansar", ["प्रस्तावना: अदृश्य के प्रति श्रद्धा, पर विवेक के साथ","भाग 1: सूक्ष्म संसार का द्वार - सत्य, कल्पना और विवेक","भाग 2: मृत्यु का द्वार - सूक्ष्म देह, प्रेत-अवस्था और पितृधारा","भाग 3: लोकों की व्यवस्था - स्वर्ग, नरक और चेतना के अनेक क्षेत्र","भाग 4: कारण शरीर, संस्कार और महा परिवार","भाग 5: भ्रम से विवेक तक - सूक्ष्म संसार का अंतिम रहस्य"]),
  },
];

export const ENGLISH_AUDIOBOOKS: AudiobookItem[] = [
  {
    slug: "the-seeker-is-the-illusion-en",
    titleHindi: "The Seeker Is the Illusion",
    titleEnglish: "The Seeker Is the Illusion",
    subtitleHindi: "A quiet return from seeking to seeing",
    subtitleEnglish: "A quiet return from seeking to seeing",
    moodHindi: "Self-inquiry in listening",
    moodEnglish: "Self-inquiry in listening",
    accent: "#d4a843",
    tracks: makeTracks("the-seeker-is-the-illusion-en", ["Author's Note — Why I Wrote This Book","Chapter 1 — The First Mistake: \"I Am Not There Yet\"","Chapter 2 — The Seeker as a Thought Identity","Chapter 3 — Why Enlightenment Cannot Be Achieved","Chapter 4 — The Trap of Spiritual Experiences","Chapter 5 — The Guru, the Method, and Hidden Dependency","Chapter 6 — The Search as Subtle Escape","Chapter 7 — The Moment Seeking Becomes Quiet","Chapter 8 — Who Is Aware of the Seeker?","Chapter 9 — No Final Explosion, Only Simple Recognition","Chapter 10 — Living Without the Burden of Becoming","Closing Transmission — A Final Quiet Return"]),
  },
  {
    slug: "maya-and-mind-en",
    titleHindi: "Maya and Mind",
    titleEnglish: "Maya and Mind",
    subtitleHindi: "Thought, illusion and the recognition of awakening",
    subtitleEnglish: "Thought, illusion and the recognition of awakening",
    moodHindi: "Seeing the movement of mind",
    moodEnglish: "Seeing the movement of mind",
    accent: "#b9c76a",
    tracks: makeTracks("maya-and-mind-en", ["What Is Maya? The Birth of the Mind","The Web of Thoughts and the Illusion of “I”","The Pendulum of Joy and Sorrow: The Trick of the Mind","Sakshibhav: The Great Medicine for Waking from Illusion","Awakening: When the Veil Falls"]),
  },
  {
    slug: "who-is-god-en",
    titleHindi: "Who Is God?",
    titleEnglish: "Who Is God?",
    subtitleHindi: "From Form to Formless",
    subtitleEnglish: "From Form to Formless",
    moodHindi: "Contemplation on Divinity",
    moodEnglish: "Contemplation on Divinity",
    accent: "#e29d52",
    tracks: makeTracks("who-is-god-en", ["The Birth of the Question","Form: When God Was Given a Shape","The Fire of Devotion","Mind and Maya","From Witness to Truth","The Formless: Where Even the Word God Falls Away","You Are That"]),
  },
  {
    slug: "realization-of-advaita-en",
    titleHindi: "The Realization of Advaita",
    titleEnglish: "The Realization of Advaita",
    subtitleHindi: "From Scripture to Truth",
    subtitleEnglish: "From Scripture to Truth",
    moodHindi: "Direct inquiry",
    moodEnglish: "Direct inquiry",
    accent: "#d4af37",
    tracks: makeTracks("realization-of-advaita-en", ["What Advaita Is, and What It Is Not","Maya: That Which Is, and Is Not","The Self: That Which Was Never Bound","Guru and Scripture: Two Banks, One River","Jivanmukti: Liberation While Living","Mahavakya: Four Words, One Truth","Realization: When Understanding Becomes Awakening"]),
  },
  {
    slug: "shiva-and-shakti-en",
    titleHindi: "Shiva and Shakti",
    titleEnglish: "Shiva and Shakti",
    subtitleHindi: "When Two Are One",
    subtitleEnglish: "When Two Are One",
    moodHindi: "Oneness of consciousness and creation",
    moodEnglish: "Oneness of consciousness and creation",
    accent: "#7eb6d9",
    tracks: makeTracks("shiva-and-shakti-en", ["The True Meaning of Tantra - What No One Told You","Shiva: The Consciousness That Is Everything","Shakti: When Consciousness Dances","Pratyabhijna: Recognize That You Are Already Shiva","Tantra and Tibet: Rigpa and Spanda Are One Truth","The World Is Not False - The World Is Shiva","Wholeness: When the Seeker and the Practice Both Fall Away"]),
  },
  {
    slug: "yoga-toward-the-self-en",
    titleHindi: "Yoga: Toward the Self",
    titleEnglish: "Yoga: Toward the Self",
    subtitleHindi: "In the Light of the Scriptures",
    subtitleEnglish: "In the Light of the Scriptures",
    moodHindi: "From practice to presence",
    moodEnglish: "From practice to presence",
    accent: "#dca657",
    tracks: makeTracks("yoga-toward-the-self-en", ["What Yoga Is - and What It Is Not","Sankhya: The Map on Which Yoga Walks","Ashtanga Yoga: Eight Steps, One Roof","Chitta: The Mirror That Forgot Itself","Meditation: When the Doer Is No Longer There","Karma Yoga and Jnana Yoga: Two Roads, One Destination","Kaivalya: Not Loneliness, but Fullness"]),
  },
  {
    slug: "tantra-confluence-of-paths-en",
    titleHindi: "Tantra: Confluence of Paths",
    titleEnglish: "Tantra: Confluence of Paths",
    subtitleHindi: "From Agama to Advaita",
    subtitleEnglish: "From Agama to Advaita",
    moodHindi: "Integration and surrender",
    moodEnglish: "Integration and surrender",
    accent: "#a57cd6",
    tracks: makeTracks("tantra-confluence-of-paths-en", ["The Origin and Expansion of Tantra: Agama, Nigama, and the Kula Way","Shakta Tantra: From the Devi Mahatmya to the Ten Mahavidyas","The Kula Way: The Five M's and the Real Meaning of Left and Right Paths","Hatha Yoga and Tantra: Kundalini, Chakra, and the Science of Nadi","Buddhist Tantra: Mahamudra, Compassion, and Emptiness","Mantra, Yantra, and Deity: From Symbol to Direct Recognition","The Contemporary Relevance of Tantra: Natural Practice in Life"]),
  },
  {
    slug: "the-joys-of-maya-en",
    titleHindi: "The Joys of Maya",
    titleEnglish: "The Joys of Maya",
    subtitleHindi: "The Play of Appearance",
    subtitleEnglish: "The Play of Appearance",
    moodHindi: "Witnessing with ease",
    moodEnglish: "Witnessing with ease",
    accent: "#c9a26d",
    tracks: makeTracks("the-joys-of-maya-en", ["Maya’s Joke: When Even God Laughs at Us","Ego: The Greatest Comedian","The Circus of the World: Relationships, Status, and the Race","Devotion as Drama and Practice as Performance","The Joke of Sorrow: When Crying Begins to Laugh","The Joke of Knowledge: Ashtavakra and Janaka","Non-duality: When Even Laughter Becomes Still"]),
  },
  {
    slug: "the-subtle-worlds-en",
    titleHindi: "The Subtle Worlds",
    titleEnglish: "The Subtle Worlds",
    subtitleHindi: "Beyond the Seen, Toward the Seer",
    subtitleEnglish: "Beyond the Seen, Toward the Seer",
    moodHindi: "Discernment and clarity",
    moodEnglish: "Discernment and clarity",
    accent: "#dfb76c",
    tracks: makeTracks("the-subtle-worlds-en", ["Preface: Reverence for the Invisible, But With Discernment","Part 1: The Doorway to the Subtle World - Truth, Imagination and Discernment","Part 2: The Door of Death - Subtle Body, Restless State and Ancestral Stream","Part 3: The Order of Realms - Heaven, Hell and Many Fields of Consciousness","Part 4: The Causal Body, Impressions and the Great Family","Part 5: From Confusion to Discernment - The Final Secret of the Subtle World"]),
  },
];
