export interface SpanishWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaning: string;
  category: "greetings" | "daily" | "travel" | "dining" | "verbs_adj" | "custom";
  categoryName: string;
  exampleEs?: string;
  exampleZh?: string;
  level: "A1" | "A2" | "B1";
  isCustom?: boolean;
}

export const SPANISH_CATEGORIES: { id: SpanishWord["category"]; label: string; icon: string }[] = [
  { id: "greetings", label: "基础问候", icon: "👋" },
  { id: "daily", label: "日常生活", icon: "🏠" },
  { id: "travel", label: "旅行自然", icon: "✈️" },
  { id: "dining", label: "西餐美食", icon: "☕" },
  { id: "verbs_adj", label: "动词与形容词", icon: "⚡" },
  { id: "custom", label: "自定义生词", icon: "✍️" },
];

export const BASE_SPANISH_WORDS: SpanishWord[] = [
  // 基础问候
  {
    id: "es-hola",
    word: "Hola",
    phonetic: "[ˈo.la]",
    partOfSpeech: "interj.",
    meaning: "你好（最常用的问候语）",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "¡Hola! ¿Cómo estás?",
    exampleZh: "你好！你最近怎么样？",
    level: "A1",
  },
  {
    id: "es-buenos-dias",
    word: "Buenos días",
    phonetic: "[ˈbwe.noz ˈði.as]",
    partOfSpeech: "exp.",
    meaning: "早上好，上午好",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "¡Buenos días a todos los presentes!",
    exampleZh: "大家早上好！",
    level: "A1",
  },
  {
    id: "es-buenas-tardes",
    word: "Buenas tardes",
    phonetic: "[ˈbwe.nas ˈtar.ðes]",
    partOfSpeech: "exp.",
    meaning: "下午好",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "Buenas tardes, señorita García.",
    exampleZh: "下午好，加西亚小姐。",
    level: "A1",
  },
  {
    id: "es-buenas-noches",
    word: "Buenas noches",
    phonetic: "[ˈbwe.naz ˈno.tʃes]",
    partOfSpeech: "exp.",
    meaning: "晚上好，晚安",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "Que descanses, buenas noches.",
    exampleZh: "好好休息，晚安。",
    level: "A1",
  },
  {
    id: "es-gracias",
    word: "Gracias",
    phonetic: "[ˈɡɾa.sjas]",
    partOfSpeech: "interj.",
    meaning: "谢谢，感谢",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "Muchas gracias por tu ayuda.",
    exampleZh: "非常感谢你的帮助。",
    level: "A1",
  },
  {
    id: "es-de-nada",
    word: "De nada",
    phonetic: "[de ˈna.ða]",
    partOfSpeech: "exp.",
    meaning: "不客气，不用谢",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "—Muchas gracias. —De nada.",
    exampleZh: "—非常感谢。—不用谢。",
    level: "A1",
  },
  {
    id: "es-por-favor",
    word: "Por favor",
    phonetic: "[por faˈβor]",
    partOfSpeech: "exp.",
    meaning: "请，劳驾",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "Un café, por favor.",
    exampleZh: "请给我来一杯咖啡。",
    level: "A1",
  },
  {
    id: "es-adios",
    word: "Adiós",
    phonetic: "[aˈðjos]",
    partOfSpeech: "interj.",
    meaning: "再见，告别",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "¡Adiós, nos vemos mañana!",
    exampleZh: "再见，我们明天见！",
    level: "A1",
  },
  {
    id: "es-hasta-luego",
    word: "Hasta luego",
    phonetic: "[ˈas.ta ˈlwe.ɣo]",
    partOfSpeech: "exp.",
    meaning: "回见，回头见",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "Hasta luego, amigo.",
    exampleZh: "回头见，朋友。",
    level: "A1",
  },
  {
    id: "es-mucho-gusto",
    word: "Mucho gusto",
    phonetic: "[ˈmu.tʃo ˈɣus.to]",
    partOfSpeech: "exp.",
    meaning: "很高兴认识你",
    category: "greetings",
    categoryName: "基础问候",
    exampleEs: "Soy Carlos. ¡Mucho gusto!",
    exampleZh: "我是卡洛斯。很高兴认识你！",
    level: "A1",
  },

  // 日常生活
  {
    id: "es-amigo",
    word: "Amigo",
    phonetic: "[aˈmi.ɣo]",
    partOfSpeech: "s.m.",
    meaning: "朋友，友人",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "Él es mi mejor amigo.",
    exampleZh: "他是我最好的朋友。",
    level: "A1",
  },
  {
    id: "es-familia",
    word: "Familia",
    phonetic: "[faˈmi.lja]",
    partOfSpeech: "s.f.",
    meaning: "家庭，家人",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "Mi familia vive en Madrid.",
    exampleZh: "我的家人住在马德里。",
    level: "A1",
  },
  {
    id: "es-amor",
    word: "Amor",
    phonetic: "[aˈmor]",
    partOfSpeech: "s.m.",
    meaning: "爱，爱情",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "El amor todo lo puede.",
    exampleZh: "爱能包容一切。",
    level: "A1",
  },
  {
    id: "es-vida",
    word: "Vida",
    phonetic: "[ˈbi.ða]",
    partOfSpeech: "s.f.",
    meaning: "生活，生命",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "La vida es bella y emocionante.",
    exampleZh: "生活美丽且令人激动。",
    level: "A1",
  },
  {
    id: "es-tiempo",
    word: "Tiempo",
    phonetic: "[ˈtjem.po]",
    partOfSpeech: "s.m.",
    meaning: "时间；天气",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "No tengo mucho tiempo hoy.",
    exampleZh: "我今天时间不多。",
    level: "A1",
  },
  {
    id: "es-casa",
    word: "Casa",
    phonetic: "[ˈka.sa]",
    partOfSpeech: "s.f.",
    meaning: "家，房屋",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "Bienvenido a mi casa.",
    exampleZh: "欢迎来到我家。",
    level: "A1",
  },
  {
    id: "es-felicidad",
    word: "Felicidad",
    phonetic: "[fe.li.siˈðað]",
    partOfSpeech: "s.f.",
    meaning: "幸福，快乐",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "Te deseo mucha felicidad.",
    exampleZh: "祝你幸福快乐。",
    level: "A2",
  },
  {
    id: "es-esperanza",
    word: "Esperanza",
    phonetic: "[es.peˈɾan.sa]",
    partOfSpeech: "s.f.",
    meaning: "希望，期待",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "La esperanza es lo último que se pierde.",
    exampleZh: "希望是最后放弃的东西。",
    level: "A2",
  },
  {
    id: "es-sueno",
    word: "Sueño",
    phonetic: "[ˈswe.ɲo]",
    partOfSpeech: "s.m.",
    meaning: "梦想；困意",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "Tengo el sueño de viajar por España.",
    exampleZh: "我有一个游历西班牙的梦想。",
    level: "A1",
  },
  {
    id: "es-corazon",
    word: "Corazón",
    phonetic: "[ko.ɾaˈson]",
    partOfSpeech: "s.m.",
    meaning: "心，心脏；爱心",
    category: "daily",
    categoryName: "日常生活",
    exampleEs: "Habla desde el corazón.",
    exampleZh: "由心而发地诉说。",
    level: "A1",
  },

  // 旅行与自然
  {
    id: "es-viaje",
    word: "Viaje",
    phonetic: "[ˈbja.xe]",
    partOfSpeech: "s.m.",
    meaning: "旅行，旅途",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "¡Buen viaje a Barcelona!",
    exampleZh: "祝你去巴塞罗那旅途愉快！",
    level: "A1",
  },
  {
    id: "es-sol",
    word: "Sol",
    phonetic: "[sol]",
    partOfSpeech: "s.m.",
    meaning: "太阳，阳光",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "El sol brilla en el cielo.",
    exampleZh: "阳光在天空闪耀。",
    level: "A1",
  },
  {
    id: "es-luna",
    word: "Luna",
    phonetic: "[ˈlu.na]",
    partOfSpeech: "s.f.",
    meaning: "月亮，月光",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "La luna llena ilumina la noche.",
    exampleZh: "满月照亮了夜晚。",
    level: "A1",
  },
  {
    id: "es-estrella",
    word: "Estrella",
    phonetic: "[esˈtɾe.ʎa]",
    partOfSpeech: "s.f.",
    meaning: "星星，星辰",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "Mira cuántas estrellas hay.",
    exampleZh: "看，有那么多星星。",
    level: "A1",
  },
  {
    id: "es-playa",
    word: "Playa",
    phonetic: "[ˈpla.ʝa]",
    partOfSpeech: "s.f.",
    meaning: "海滩，沙滩",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "Vamos a descansar a la playa.",
    exampleZh: "我们去海滩休息吧。",
    level: "A1",
  },
  {
    id: "es-montana",
    word: "Montaña",
    phonetic: "[monˈta.ɲa]",
    partOfSpeech: "s.f.",
    meaning: "山，高山",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "Me encanta subir a la montaña.",
    exampleZh: "我喜欢登山。",
    level: "A1",
  },
  {
    id: "es-mar",
    word: "Mar",
    phonetic: "[mar]",
    partOfSpeech: "s.m.",
    meaning: "海，海洋",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "El mar Mediterráneo es azul profundo.",
    exampleZh: "地中海湛蓝深邃。",
    level: "A1",
  },
  {
    id: "es-ciudad",
    word: "Ciudad",
    phonetic: "[sjuˈðað]",
    partOfSpeech: "s.f.",
    meaning: "城市，都会",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "Toledo es una ciudad histórica.",
    exampleZh: "托莱多是一座历史名城。",
    level: "A1",
  },
  {
    id: "es-mundo",
    word: "Mundo",
    phonetic: "[ˈmun.do]",
    partOfSpeech: "s.m.",
    meaning: "世界，世间",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "Quiero explorar todo el mundo.",
    exampleZh: "我想探索整个世界。",
    level: "A1",
  },
  {
    id: "es-camino",
    word: "Camino",
    phonetic: "[kaˈmi.no]",
    partOfSpeech: "s.m.",
    meaning: "道路，路径；朝圣之路",
    category: "travel",
    categoryName: "旅行自然",
    exampleEs: "El Camino de Santiago es famoso.",
    exampleZh: "圣地亚哥朝圣之路非常著名。",
    level: "A1",
  },

  // 西餐美食
  {
    id: "es-comida",
    word: "Comida",
    phonetic: "[koˈmi.ða]",
    partOfSpeech: "s.f.",
    meaning: "食物；正餐，午餐",
    category: "dining",
    categoryName: "西餐美食",
    exampleEs: "La comida española es deliciosa.",
    exampleZh: "西班牙美食非常美味。",
    level: "A1",
  },
  {
    id: "es-agua",
    word: "Agua",
    phonetic: "[ˈa.ɣwa]",
    partOfSpeech: "s.f.",
    meaning: "水，饮用水",
    category: "dining",
    categoryName: "西餐美食",
    exampleEs: "Un vaso de agua sin gas, por favor.",
    exampleZh: "请给我一杯不含气的水。",
    level: "A1",
  },
  {
    id: "es-cafe",
    word: "Café",
    phonetic: "[kaˈfe]",
    partOfSpeech: "s.m.",
    meaning: "咖啡；咖啡馆",
    category: "dining",
    categoryName: "西餐美食",
    exampleEs: "Tomamos un café con leche.",
    exampleZh: "我们喝了一杯拿铁咖啡。",
    level: "A1",
  },
  {
    id: "es-pan",
    word: "Pan",
    phonetic: "[pan]",
    partOfSpeech: "s.m.",
    meaning: "面包",
    category: "dining",
    categoryName: "西餐美食",
    exampleEs: "Pan con tomate y aceite de oliva.",
    exampleZh: "番茄橄榄油烤面包。",
    level: "A1",
  },
  {
    id: "es-queso",
    word: "Queso",
    phonetic: "[ˈke.so]",
    partOfSpeech: "s.m.",
    meaning: "奶酪，芝士",
    category: "dining",
    categoryName: "西餐美食",
    exampleEs: "El queso manchego es tradicional.",
    exampleZh: "曼彻格奶酪是传统特色。",
    level: "A1",
  },
  {
    id: "es-vino",
    word: "Vino",
    phonetic: "[ˈbi.no]",
    partOfSpeech: "s.m.",
    meaning: "葡萄酒，红酒",
    category: "dining",
    categoryName: "西餐美食",
    exampleEs: "Una copa de vino tinto de Rioja.",
    exampleZh: "一杯里奥哈干红葡萄酒。",
    level: "A1",
  },
  {
    id: "es-delicioso",
    word: "Delicioso",
    phonetic: "[de.liˈsjo.so]",
    partOfSpeech: "adj.",
    meaning: "美味的，可口的",
    category: "dining",
    categoryName: "西餐美食",
    exampleEs: "¡Esta paella está deliciosa!",
    exampleZh: "这道海鲜饭真好吃！",
    level: "A1",
  },

  // 核心动词与形容词
  {
    id: "es-ser",
    word: "Ser",
    phonetic: "[ser]",
    partOfSpeech: "v.",
    meaning: "是（表本质、国籍、永久属性）",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "Yo soy estudiante de español.",
    exampleZh: "我是西语学生。",
    level: "A1",
  },
  {
    id: "es-estar",
    word: "Estar",
    phonetic: "[esˈtar]",
    partOfSpeech: "v.",
    meaning: "在；处于（表位置、临时状态）",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "¿Dónde estás ahora?",
    exampleZh: "你现在在哪里？",
    level: "A1",
  },
  {
    id: "es-tener",
    word: "Tener",
    phonetic: "[teˈner]",
    partOfSpeech: "v.",
    meaning: "有，拥有；感觉",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "Tengo muchas ganas de aprender.",
    exampleZh: "我非常有学习的渴望。",
    level: "A1",
  },
  {
    id: "es-hacer",
    word: "Hacer",
    phonetic: "[aˈser]",
    partOfSpeech: "v.",
    meaning: "做，制作；天气如何",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "Hoy hace muy buen tiempo.",
    exampleZh: "今天天气非常好。",
    level: "A1",
  },
  {
    id: "es-querer",
    word: "Querer",
    phonetic: "[keˈɾer]",
    partOfSpeech: "v.",
    meaning: "想要；爱，喜爱",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "Te quiero mucho.",
    exampleZh: "我很喜欢你 / 我很爱你。",
    level: "A1",
  },
  {
    id: "es-vivir",
    word: "Vivir",
    phonetic: "[biˈβir]",
    partOfSpeech: "v.",
    meaning: "居住，生活",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "Vivo felizmente con mi familia.",
    exampleZh: "我和家人幸福地生活在一起。",
    level: "A1",
  },
  {
    id: "es-hablar",
    word: "Hablar",
    phonetic: "[aˈβlar]",
    partOfSpeech: "v.",
    meaning: "说，讲（语言）",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "¿Hablas español o inglés?",
    exampleZh: "你会说西班牙语还是英语？",
    level: "A1",
  },
  {
    id: "es-hermoso",
    word: "Hermoso",
    phonetic: "[eɾˈmo.so]",
    partOfSpeech: "adj.",
    meaning: "美丽的，动人的",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "Es un cuadro muy hermoso.",
    exampleZh: "这是一幅非常优美的画作。",
    level: "A1",
  },
  {
    id: "es-feliz",
    word: "Feliz",
    phonetic: "[feˈlis]",
    partOfSpeech: "adj.",
    meaning: "快乐的，幸福的",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "¡Feliz cumpleaños y año nuevo!",
    exampleZh: "生日快乐，新年快乐！",
    level: "A1",
  },
  {
    id: "es-facil",
    word: "Fácil",
    phonetic: "[ˈfa.sil]",
    partOfSpeech: "adj.",
    meaning: "容易的，简单的",
    category: "verbs_adj",
    categoryName: "动词与形容词",
    exampleEs: "Aprender con Katakata es fácil y divertido.",
    exampleZh: "用 Katakata 学习既简单又充满乐趣。",
    level: "A1",
  },
];

const STORAGE_CUSTOM_KEY = "spanish_custom_words";
const STORAGE_MASTERY_KEY = "spanish_word_mastery";

export function getCustomSpanishWords(): SpanishWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

export function saveCustomSpanishWord(word: SpanishWord): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomSpanishWords();
    const filtered = current.filter((w) => w.id !== word.id);
    const cat = word.category || "custom";
    filtered.unshift({
      ...word,
      isCustom: true,
      category: cat,
      categoryName: word.categoryName || (cat === "travel" ? "旅行实用" : "自定义词库"),
    });
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(filtered));
  } catch (_) {}
}

export function saveBatchCustomSpanishWords(words: SpanishWord[]): void {
  if (typeof window === "undefined" || words.length === 0) return;
  try {
    const current = getCustomSpanishWords();
    const newIds = new Set(words.map((w) => w.id));
    const filtered = current.filter((w) => !newIds.has(w.id));
    const processedWords = words.map((w) => {
      const cat = w.category || "custom";
      return {
        ...w,
        isCustom: true,
        category: cat,
        categoryName: w.categoryName || (cat === "travel" ? "旅行实用" : "自定义词库"),
      };
    });
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify([...processedWords, ...filtered]));
  } catch (_) {}
}

export function deleteCustomSpanishWord(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomSpanishWords();
    const filtered = current.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(filtered));
  } catch (_) {}
}

export function getAllSpanishWords(): SpanishWord[] {
  const customs = getCustomSpanishWords();
  return [...customs, ...BASE_SPANISH_WORDS];
}

export type MasteryStatus = "learning" | "familiar" | "mastered";

export interface WordMasteryMap {
  [wordId: string]: {
    status: MasteryStatus;
    reviewCount: number;
    lastReviewed: number;
  };
}

export function getSpanishMasteryMap(): WordMasteryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_MASTERY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

export function updateSpanishWordMastery(wordId: string, status: MasteryStatus): void {
  if (typeof window === "undefined") return;
  try {
    const map = getSpanishMasteryMap();
    const existing = map[wordId] || { status: "learning", reviewCount: 0, lastReviewed: Date.now() };
    map[wordId] = {
      status,
      reviewCount: existing.reviewCount + 1,
      lastReviewed: Date.now(),
    };
    localStorage.setItem(STORAGE_MASTERY_KEY, JSON.stringify(map));
  } catch (_) {}
}

// Convert SpanishWord to DictionaryItem for seamless TrainingPage and arcade integration
export function spanishWordToDictionaryItem(w: SpanishWord): any {
  const cleanWord = w.word.trim();
  const segments = cleanWord.split("").map((char) => {
    const isSpace = char === " ";
    const lower = char.toLowerCase();
    const normalized = lower
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Accept exact character, lowercase, and normalized (e.g. typing 'a' matches 'á')
    const romajiList = Array.from(
      new Set([char, lower, normalized, isSpace ? " " : ""].filter(Boolean))
    );

    return {
      kana: char,
      romaji: romajiList,
      displayRomaji: char,
    };
  });

  return {
    id: w.id,
    kanji: w.word,
    kanaStr: w.word,
    category: "custom",
    categoryName: w.categoryName || "西语沉浸",
    meaning: `${w.phonetic ? `${w.phonetic} ` : ""}${w.meaning}`,
    rarity: w.level === "B1" ? "SR" : w.level === "A2" ? "R" : "N",
    rarityName: w.level,
    glowColor: "rgba(245, 158, 11, 0.25)",
    borderColor: "border-amber-400",
    bgGradient: "from-amber-50 to-orange-100",
    segments,
    lang: "es",
  };
}

export function getAllSpanishAsDictionaryItems(): any[] {
  return getAllSpanishWords().map(spanishWordToDictionaryItem);
}
