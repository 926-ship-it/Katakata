import { CELEBRITY_DICTIONARY, CELEBRITY_ENGLISH_OVERLAYS } from "./celebrityData";
import { KPOP_RIVALRY_DICTIONARY, KPOP_RIVALRY_ENGLISH_OVERLAYS } from "./kpopAndRivalryData";

export interface KanaSegment {
  kana: string;
  romaji: string[]; // List of acceptable romajis, e.g., ["shi", "si"]
  displayRomaji: string; // The primary romaji displayed to the user
}

export interface DictionaryItem {
  id: string;
  kanji: string;
  kanaStr: string;
  category: "name" | "nature" | "culture" | "food" | "custom";
  categoryName: string;
  meaning: string;
  rarity: "N" | "R" | "SR" | "SSR";
  rarityName: string;
  glowColor: string; // styling colors for glows
  borderColor: string;
  bgGradient: string;
  segments: KanaSegment[];
}

const BASE_DICTIONARY: DictionaryItem[] = [
  {
    id: "sato",
    kanji: "佐藤",
    kanaStr: "さとう",
    category: "name",
    categoryName: "日本人名",
    meaning: "日本第一大姓氏。起源于平安时代贵族藤原氏的分支，‘佐’字一般源于其官职‘左卫门督’或佐渡国地域之意。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-300",
    bgGradient: "from-slate-50 to-slate-200",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "suzuki",
    kanji: "鈴木",
    kanaStr: "すずき",
    category: "name",
    categoryName: "日本人名",
    meaning: "日本第二大姓，古意代表“神圣之树”或稻谷打晒后堆放处的挂铃，有祈求神灵赐福、稻谷丰收的美好寓意。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-300",
    bgGradient: "from-slate-50 to-slate-200",
    segments: [
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "ず", romaji: ["zu"], displayRomaji: "zu" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "kimura",
    kanji: "木村",
    kanaStr: "きむら",
    category: "name",
    categoryName: "日本人名",
    meaning: "意为‘树木环绕的村落’，极其常见的传统日本姓氏，让人联想到自然质朴、绿木葱郁的古风乡野景象。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-300",
    bgGradient: "from-slate-50 to-slate-200",
    segments: [
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "む", romaji: ["mu"], displayRomaji: "mu" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "tanaka",
    kanji: "田中",
    kanaStr: "たなか",
    category: "name",
    categoryName: "日本人名",
    meaning: "意为‘稻田之中’。该姓氏源于古代日本农业社会的农耕氏族，象征丰饶繁衍，是经典的日本庶民大姓。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-300",
    bgGradient: "from-slate-50 to-slate-200",
    segments: [
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" }
    ]
  },
  {
    id: "yamada",
    kanji: "山田",
    kanaStr: "やまだ",
    category: "name",
    categoryName: "日本人名",
    meaning: "意为‘山脚下的稻田’，典型的大自然聚落姓氏。在日本教科书中常作为老百姓和示例名称，非常亲切接地气。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-300",
    bgGradient: "from-slate-50 to-slate-200",
    segments: [
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" }
    ]
  },
  {
    id: "oda",
    kanji: "織田",
    kanaStr: "おだ",
    category: "name",
    categoryName: "日本人名",
    meaning: "大名鼎鼎的战国群雄织田信长之姓。发源于越前国织田庄的神职家族，拥有深厚的日本武家历史底蕴。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-100",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" }
    ]
  },
  {
    id: "sakura",
    kanji: "桜",
    kanaStr: "さくら",
    category: "nature",
    categoryName: "自然风物",
    meaning: "日本春天的绝美象征。樱花绽放之时绚烂炽烈，飘落之时形成‘樱花雨’，代表了浮生若梦的物哀美学精神。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(236, 72, 153, 0.3)",
    borderColor: "border-pink-300",
    bgGradient: "from-pink-50 to-pink-100",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "fuji",
    kanji: "富士",
    kanaStr: "ふじ",
    category: "nature",
    categoryName: "自然风物",
    meaning: "富岳之称，象征长寿、不死与吉祥。富士山终年积雪的美景是日本精神高度和自然之美的图腾象征。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "ふ", romaji: ["fu", "hu"], displayRomaji: "fu" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" }
    ]
  },
  {
    id: "aozora",
    kanji: "青空",
    kanaStr: "あおぞら",
    category: "nature",
    categoryName: "自然风物",
    meaning: "意为‘碧绿清朗的晴空’。日本常将蓝色和绿色统一用“青”字表达，青空代表着澄澈晴朗、充满活力的蓝天。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(56, 189, 248, 0.3)",
    borderColor: "border-cyan-300",
    bgGradient: "from-cyan-50 to-blue-50",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "ぞ", romaji: ["zo"], displayRomaji: "zo" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "asagao",
    kanji: "朝顔",
    kanaStr: "あさがお",
    category: "nature",
    categoryName: "自然风物",
    meaning: "牵牛花，字面意为‘清晨的容颜’。此花清晨绽放、午后凋谢，是日本夏季最具朝气与哀婉美感的花卉之一。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(139, 92, 246, 0.25)",
    borderColor: "border-violet-300",
    bgGradient: "from-violet-50 to-purple-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" },
      { kana: "お", romaji: ["o"], displayRomaji: "o" }
    ]
  },
  {
    id: "kotone",
    kanji: "琴音",
    kanaStr: "ことね",
    category: "name",
    categoryName: "日本人名",
    meaning: "意为‘日本筝的和雅音律’。代表古典女子优雅、和煦清幽的涵养，是日本令和少男少女最渴望拥有的优雅名讳之一。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(245, 158, 11, 0.4)",
    borderColor: "border-amber-400 border-2 shadow-amber-200/50",
    bgGradient: "from-amber-50 to-orange-100",
    segments: [
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "ね", romaji: ["ne"], displayRomaji: "ne" }
    ]
  },
  {
    id: "shiki",
    kanji: "四季",
    kanaStr: "しき",
    category: "nature",
    categoryName: "自然风物",
    meaning: "指的是四季轮回。日本列岛四季分明，春樱、夏祭、秋枫、冬雪，这种分明的季候文化极其深植于文学与日常中。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(34, 197, 94, 0.4)",
    borderColor: "border-emerald-400 border-2 shadow-emerald-200/50",
    bgGradient: "from-emerald-50 to-teal-100",
    segments: [
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "dango",
    kanji: "団子",
    kanaStr: "だんご",
    category: "food",
    categoryName: "日本美味",
    meaning: "日本传统和果子，通常串成串。俗语说“花より団子（舍华求实、比起赏樱更爱吃团子）”，极具生活乐趣和复古感。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(244, 63, 94, 0.4)",
    borderColor: "border-rose-400 border-2 shadow-rose-200/50",
    bgGradient: "from-rose-50 to-pink-200",
    segments: [
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "ご", romaji: ["go"], displayRomaji: "go" }
    ]
  },
  {
    id: "momiji",
    kanji: "紅葉",
    kanaStr: "もみじ",
    category: "nature",
    categoryName: "自然风物",
    meaning: "深秋火红斑斓的枫叶。日本“枫叶狩”极富诗意，满山尽染的红色承载着秋日雅致的情思。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(249, 115, 22, 0.4)",
    borderColor: "border-orange-400 border-2 shadow-orange-200/50",
    bgGradient: "from-orange-50 to-amber-100",
    segments: [
      { kana: "も", romaji: ["mo"], displayRomaji: "mo" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" }
    ]
  },
  {
    id: "daruma",
    kanji: "達磨",
    kanaStr: "だるま",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "不倒翁达摩法相，许愿吉祥物。画上左眼许愿，愿望达成后画上右眼，代表着坚毅不屈、永不言弃的匠人拼搏精神。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(239, 68, 68, 0.6)",
    borderColor: "border-red-500 border-2 shadow-red-500 animate-pulse",
    bgGradient: "from-red-50 to-red-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" }
    ]
  },
  {
    id: "heiwa",
    kanji: "平和",
    kanaStr: "へいわ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "意为‘平静宽和的世界’。在禅宗和民风里，平和是日本社会极其笃信的最高处世智慧与终极追求。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(168, 85, 247, 0.6)",
    borderColor: "border-purple-500 border-2 shadow-purple-500 animate-pulse",
    bgGradient: "from-purple-50 to-indigo-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "へ", romaji: ["he"], displayRomaji: "he" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" }
    ]
  },
  {
    id: "kabuki",
    kanji: "歌舞伎",
    kanaStr: "かぶき",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "日本三大古典剧场艺术之一。夸张斑斓的妆容、繁复神秘的服饰与跌宕起伏的动作，散发出摄人心魂的巴洛克式韵味。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(234, 179, 8, 0.6)",
    borderColor: "border-yellow-500 border-2 shadow-yellow-500 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "ぶ", romaji: ["bu"], displayRomaji: "bu" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  // --- NEW EXPANSION ENTRIES ---
  {
    id: "toyotomi",
    kanji: "豊臣",
    kanaStr: "とよとみ",
    category: "name",
    categoryName: "日本人名",
    meaning: "丰臣秀吉之姓，安土桃山时代的天下霸王。本姓木下，后改羽柴，终蒙朝廷赐姓“丰臣”，终结战国割据功勋卓著。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "よ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "tokugawa",
    kanji: "徳川",
    kanaStr: "とくがわ",
    category: "name",
    categoryName: "日本人名",
    meaning: "德川家康之姓，开启两百余年江户幕府盛世的传奇大儒与霸主，其家纹“三叶葵”名扬四海，奠定了现代东京的城市雏形。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(30, 41, 59, 0.6)",
    borderColor: "border-slate-800 border-2 shadow-slate-700/80 animate-pulse",
    bgGradient: "from-slate-100 to-indigo-250 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" },
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" }
    ]
  },
  {
    id: "kawabata",
    kanji: "川端",
    kanaStr: "かわばた",
    category: "name",
    categoryName: "日本人名",
    meaning: "川端康成之姓。日本首位诺贝尔文学奖得主，笔触哀婉而空灵，将传统日本“死亡与虚无”的极致物哀美学刻画得震撼世界。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(100, 116, 139, 0.4)",
    borderColor: "border-stone-400 border-2 shadow-stone-300",
    bgGradient: "from-stone-100 to-stone-200",
    segments: [
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" },
      { kana: "ば", romaji: ["ba"], displayRomaji: "ba" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" }
    ]
  },
  {
    id: "miyazaki",
    kanji: "宮崎",
    kanaStr: "みやざき",
    category: "name",
    categoryName: "日本人名",
    meaning: "宫崎骏之姓。享誉世界的日本殿堂级动画巨匠，用细腻宏大的环保、反战、纯真梦想故事温暖治愈了全人类的内心深处。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-indigo-200",
    bgGradient: "from-sky-50 to-indigo-150",
    segments: [
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "ざ", romaji: ["za"], displayRomaji: "za" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "sushi",
    kanji: "寿司",
    kanaStr: "すし",
    category: "food",
    categoryName: "日本美味",
    meaning: "日本代表性美食。经独门比例调配的微温醋饭上盖盖新鲜刺身首，讲究食材时令的新鲜度和指尖捏合间气泡微释的松软奇迹。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-200",
    bgGradient: "from-slate-50 to-neutral-200",
    segments: [
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" }
    ]
  },
  {
    id: "matcha",
    kanji: "抹茶",
    kanaStr: "まっちゃ",
    category: "food",
    categoryName: "日本美味",
    meaning: "绿茶春梢嫩叶蒸青、石磨研细形成的饱满微润粉末，茶香幽长微苦带甜，是日本古老禅茶一味仪轨的精神灵魂寄托。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(16, 185, 129, 0.3)",
    borderColor: "border-emerald-250",
    bgGradient: "from-emerald-50 to-green-150",
    segments: [
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "っ", romaji: ["t"], displayRomaji: "t" }, // small tsu represents geminate consonant
      { kana: "ち", romaji: ["chi"], displayRomaji: "chi" },
      { kana: "ゃ", romaji: ["ya"], displayRomaji: "ya" }
    ]
  },
  {
    id: "ramen",
    kanji: "拉麺",
    kanaStr: "らーめん",
    category: "food",
    categoryName: "日本美味",
    meaning: "高度本土化改良的代表性国民级美味，浓烈骨汤与劲道面条经数小时慢火煨制，承载了一万点深夜小街里的袅袅温情烟火气。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-zinc-200",
    bgGradient: "from-zinc-50 to-stone-150",
    segments: [
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" },
      { kana: "ー", romaji: ["-"], displayRomaji: "-" },
      { kana: "め", romaji: ["me"], displayRomaji: "me" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "wagashi",
    kanji: "和菓子",
    kanaStr: "わがし",
    category: "food",
    categoryName: "日本美味",
    meaning: "日式传统手工糕点。高度对应二十四节气气候与风物变化，以自然美学塑形，兼具视觉、触觉、味觉，被称为“可吃的短歌诗词”。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(225, 29, 72, 0.4)",
    borderColor: "border-rose-400 border-2 shadow-rose-250",
    bgGradient: "from-rose-50 to-pink-100",
    segments: [
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" }
    ]
  },
  {
    id: "sake",
    kanji: "清酒",
    kanaStr: "さけ",
    category: "food",
    categoryName: "日本美味",
    meaning: "精选秋季大米与澄澈矿泉发酵酿出的国酒，澄明淡雅。在温盏和冰饮中变换万般醇香，是日本民俗节会和御神道教的核心奉礼。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-amber-100",
    bgGradient: "from-stone-50 to-slate-200",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" }
    ]
  },
  {
    id: "jinja",
    kanji: "神社",
    kanaStr: "じんじゃ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "祭祀本土八百万神明的空灵之地。朱红色的高耸鸟居、手水舍、沙沙作响的参天古柏构成隔绝红尘侵扰的神仙净土。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(239, 68, 68, 0.3)",
    borderColor: "border-red-300",
    bgGradient: "from-red-50 to-amber-100",
    segments: [
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "ゃ", romaji: ["ya"], displayRomaji: "ya" }
    ]
  },
  {
    id: "ninja",
    kanji: "忍者",
    kanaStr: "にんじゃ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "活跃于乱世幕府的幽魂谍客，掌握飞檐走壁的‘九字真言’遁术与飞镖，将生命奉献给潜行、克制与绝对隐秘的武勇传说。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(15, 23, 42, 0.4)",
    borderColor: "border-slate-800",
    bgGradient: "from-slate-700 to-stone-900 border-zinc-800 text-stone-100",
    segments: [
      { kana: "に", romaji: ["ni"], displayRomaji: "ni" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "ゃ", romaji: ["ya"], displayRomaji: "ya" }
    ]
  },
  {
    id: "bushi",
    kanji: "武士",
    kanaStr: "ぶし",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "誓死护卫大名与主信的刀客阶层。严格遵守克己自律、仗义死节、无畏不挠的武事宿命，其风骨历来是日本刚健精神的化身。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(148, 163, 184, 0.2)",
    borderColor: "border-zinc-300",
    bgGradient: "from-slate-50 to-neutral-200",
    segments: [
      { kana: "ぶ", romaji: ["bu"], displayRomaji: "bu" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" }
    ]
  },
  {
    id: "bento",
    kanji: "弁当",
    kanaStr: "べんとう",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "日式盒装餐食。装载了母亲或恋人的玉子烧、章鱼香肠与亲切捏合的紫菜饭团，代表了普通人在温馨午后最踏实的幸福依托。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-200",
    bgGradient: "from-neutral-50 to-amber-50",
    segments: [
      { kana: "べ", romaji: ["be"], displayRomaji: "be" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "onsen",
    kanji: "温泉",
    kanaStr: "おんせん",
    category: "nature",
    categoryName: "自然风物",
    meaning: "地热滋养的有疗效的泉水，散发淡淡硫磺。在袅袅升腾的白雾和落雪红豆间，听林鸟空鸣洗净一身积尘，是日式洗心静气的极致体悟。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(56, 189, 248, 0.25)",
    borderColor: "border-sky-200",
    bgGradient: "from-sky-50 to-blue-100",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "hotaru",
    kanji: "蛍火",
    kanaStr: "ほたる",
    category: "nature",
    categoryName: "自然风物",
    meaning: "仲夏幽暗林溪旁飞舞的萤火虫。那转瞬即逝、忽明忽暗的纯净微光，既描画了夏曲物候至美，也饱含了日本哲里关于生命无常的凄凉怜爱。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(163, 230, 53, 0.45)",
    borderColor: "border-lime-400 border-2 shadow-lime-200",
    bgGradient: "from-lime-50 to-emerald-100",
    segments: [
      { kana: "ほ", romaji: ["ho"], displayRomaji: "ho" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" }
    ]
  },
  {
    id: "semi",
    kanji: "蝉鳴",
    kanaStr: "せみしぐれ",
    category: "nature",
    categoryName: "自然风物",
    meaning: "阵阵雷动的蝉叫，被称为“蝉时雨”，是日本仲夏最鲜明雄壮的声景记忆。让人想起走廊风铃、大片积云和悠悠不绝的炎夏微凉。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-yellow-250",
    bgGradient: "from-stone-50 to-orange-100",
    segments: [
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ぐ", romaji: ["gu"], displayRomaji: "gu" },
      { kana: "れ", romaji: ["re"], displayRomaji: "re" }
    ]
  },
  {
    id: "haiku",
    kanji: "俳句",
    kanaStr: "はいく",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "日本古典格律短诗。以惊人简练的十七音节（五七五）勾勒转瞬即逝的自然画面或禅机妙悟，空灵悠远，令人百般咀嚼余香无穷。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(99, 102, 241, 0.45)",
    borderColor: "border-indigo-400 border-2 shadow-indigo-250",
    bgGradient: "from-indigo-50 to-violet-100",
    segments: [
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" }
    ]
  },
  {
    id: "torii",
    kanji: "鳥居",
    kanaStr: "とりい",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "神社神庙的朱红色入口大门。象征从俗世欲望凡尘踏入通神清净大境的结界通道，是日本灵系美学永垂不朽的原型符号视觉。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(220, 38, 38, 0.35)",
    borderColor: "border-red-400",
    bgGradient: "from-red-50 to-orange-100",
    segments: [
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" }
    ]
  },
  {
    id: "hanabi",
    kanji: "花火",
    kanaStr: "はなび",
    category: "nature",
    categoryName: "自然风物",
    meaning: "夏祭祭典夜空中极致绽放、震耳飘零的漫天璀璨烟花。那一瞬间的万重光彩与随后无边无际的漆黑寂静，将生命之辉赫与物哀体现得淋漓尽致。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(236, 72, 153, 0.65)",
    borderColor: "border-pink-500 border-2 shadow-pink-550 animate-pulse",
    bgGradient: "from-pink-50 to-indigo-150 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "び", romaji: ["bi"], displayRomaji: "bi" }
    ]
  },
  {
    id: "soba",
    kanji: "蕎麦",
    kanaStr: "そば",
    category: "food",
    categoryName: "日本美味",
    meaning: "传统日式荞麦面。色泽微灰，充满谷物的质朴清香，或冷浇蘸汁，或热汤卧蛋，代表了江户时代传颂至今的庶民美味。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.2)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-neutral-100",
    segments: [
      { kana: "そ", romaji: ["so"], displayRomaji: "so" },
      { kana: "ば", romaji: ["ba"], displayRomaji: "ba" }
    ]
  },
  {
    id: "tempura",
    kanji: "天婦羅",
    kanaStr: "てんぷら",
    category: "food",
    categoryName: "日本美味",
    meaning: "以面糊裹挟时令海鲜与鲜蔬炸至金黄松脆的经典料理。讲究“三分油炸七分熟蒸”的微妙火候，是日本食雕美学的巅峰之一。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(245, 158, 11, 0.25)",
    borderColor: "border-amber-250",
    bgGradient: "from-amber-50 to-yellow-100",
    segments: [
      { kana: "て", romaji: ["te"], displayRomaji: "te" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "ぷ", romaji: ["pu"], displayRomaji: "pu" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "takoyaki",
    kanji: "章魚焼",
    kanaStr: "たこやき",
    category: "food",
    categoryName: "日本美味",
    meaning: "风靡关西街头的章鱼小丸子。金黄微焦的小球里包裹着Q弹章鱼块，浇上香浓酱汁与木鱼花，是夏季祭典不可或缺的灵魂美味。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-stone-250",
    bgGradient: "from-amber-50 to-orange-50",
    segments: [
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "mochi",
    kanji: "餅",
    kanaStr: "もち",
    category: "food",
    categoryName: "日本美味",
    meaning: "日式传统年糕，由熟糯米经反复捶打捶捏而成，口感粘糯香甜。常配以红豆泥、黄豆粉，亦或烤焦后浸入暖和的热汤中食用。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-slate-200",
    bgGradient: "from-slate-50 to-stone-100",
    segments: [
      { kana: "も", romaji: ["mo"], displayRomaji: "mo" },
      { kana: "ち", romaji: ["chi", "ti"], displayRomaji: "chi" }
    ]
  },
  {
    id: "gohan",
    kanji: "御飯",
    kanaStr: "ごはん",
    category: "food",
    categoryName: "日本美味",
    meaning: "热气腾腾的白米饭，日本饮食生活的核心基石。对水质、米种和炊煮工艺有着近乎偏执的追求，象征着大地赐予的最本真富足的味道。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-zinc-200",
    bgGradient: "from-zinc-50 to-stone-50",
    segments: [
      { kana: "ご", romaji: ["go"], displayRomaji: "go" },
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "yukata",
    kanji: "浴衣",
    kanaStr: "ゆかた",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "原本是贵族沐浴后的便服，后演变为日本夏日祭、烟花大开时穿着的棉质轻便和服。蓝染花纹随风摇曳，充满仲夏夜清凉闲适的诗意美。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" }
    ]
  },
  {
    id: "matsuri",
    kanji: "祭",
    kanaStr: "まつり",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "日本传统祭典。神舆巡游、太鼓雷动、摊位林立，全民身着浴衣载歌载舞，在敬天谢神的同时，尽情燃放民间社会澎湃热烈的生命力。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(220, 38, 38, 0.45)",
    borderColor: "border-red-400 border-2 shadow-red-200",
    bgGradient: "from-red-50 to-orange-100",
    segments: [
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "つ", romaji: ["tsu", "tu"], displayRomaji: "tsu" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" }
    ]
  },
  {
    id: "geisha",
    kanji: "芸者",
    kanaStr: "げいしゃ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "在宴席中表演日本古典舞蹈、乐器和传统社交艺术的女性艺人。妆容洁白端妆，举手投足优雅深厚，如同一幅行走的日本活化石古典风画。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(139, 92, 246, 0.45)",
    borderColor: "border-purple-400 border-2 shadow-purple-250",
    bgGradient: "from-purple-50 to-pink-100",
    segments: [
      { kana: "げ", romaji: ["ge"], displayRomaji: "ge" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ゃ", romaji: ["ya"], displayRomaji: "ya" }
    ]
  },
  {
    id: "origami",
    kanji: "折り紙",
    kanaStr: "おりがみ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "日本指尖上的手工纸艺。不借助任何剪刀胶水，单凭一双巧手将一张正方形纸折成千羽鹤、兜兜等。蕴含着极致的几何秩序与祝福寓意。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-stone-250",
    bgGradient: "from-stone-50 to-blue-50",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "kimono",
    kanji: "着物",
    kanaStr: "きもの",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "日本传统民族服饰。工艺极其高级讲究，面料印染精美，腰带繁复，将人体裹成长方形，走起路来小碎步，极其呈现大和庄重和内敛的仪式感。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(224, 242, 254, 0.45)",
    borderColor: "border-sky-400 border-2 shadow-sky-200",
    bgGradient: "from-sky-50 to-blue-100",
    segments: [
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "も", romaji: ["mo"], displayRomaji: "mo" },
      { kana: "の", romaji: ["no"], displayRomaji: "no" }
    ]
  },
  {
    id: "tsuki",
    kanji: "月夜",
    kanaStr: "つき",
    category: "nature",
    categoryName: "自然风物",
    meaning: "高悬于夜空中的皎洁明月。夏目漱石曾将“I love you”优雅含蓄地翻译为“今晚月色真美”，使得明月成为日本浪漫主义的终极代名词。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(234, 179, 8, 0.3)",
    borderColor: "border-yellow-300",
    bgGradient: "from-amber-50 to-yellow-100",
    segments: [
      { kana: "つ", romaji: ["tsu", "tu"], displayRomaji: "tsu" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "yuki",
    kanji: "白雪",
    kanaStr: "ゆき",
    category: "nature",
    categoryName: "自然风物",
    meaning: "轻盈飘落的冬雪。将万物银装素裹，寂静宁谧。在川端康成笔下的《雪国》里，皑皑白雪映射着生命的纯洁、徒劳与凄美极其深刻境界。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(186, 230, 253, 0.3)",
    borderColor: "border-sky-200",
    bgGradient: "from-sky-50 to-stone-50",
    segments: [
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "kaze",
    kanji: "微風",
    kanaStr: "かぜ",
    category: "nature",
    categoryName: "自然风物",
    meaning: "吹拂过草平、稻野或竹林的和风。轻抚风铃发出叮咚微响，不仅带来四季的温度变化，也承载着人们对远方亲人的悠远思念。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(100, 116, 139, 0.2)",
    borderColor: "border-stone-200",
    bgGradient: "from-teal-50 to-emerald-50",
    segments: [
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "ぜ", romaji: ["ze"], displayRomaji: "ze" }
    ]
  },
  {
    id: "shiba",
    kanji: "柴犬",
    kanaStr: "しば",
    category: "nature",
    categoryName: "自然风物",
    meaning: "日本古老的本土犬种。性格聪明独立而憨厚忠诚，双耳直立且尾巴卷曲，拥有极其治愈的面部微笑表情，是超人气的世界名片级萌宠。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(245, 158, 11, 0.3)",
    borderColor: "border-amber-300",
    bgGradient: "from-amber-50 to-stone-100",
    segments: [
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ば", romaji: ["ba"], displayRomaji: "ba" }
    ]
  },
  {
    id: "katana",
    kanji: "刀",
    kanaStr: "かたな",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "日本武士刀。凭借其标志性的单刃弯曲造型与登峰造极的折叠锻打淬火技艺享誉全球。不仅是古代战场上的致命利刃，更是武士道精神中象征荣誉、正义与坚定灵魂的国宝级艺术传世珍品。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(129, 140, 248, 0.6)",
    borderColor: "border-indigo-500 border-2 shadow-indigo-500 animate-pulse",
    bgGradient: "from-indigo-50 to-purple-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" }
    ]
  },
  {
    id: "manga",
    kanji: "漫画",
    kanaStr: "まんが",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "现代日式漫画。融合了精妙的黑白线条绘画、极具影视感的分镜叙事与极其丰富的人物情感刻画，是风靡世界数十载、代表跨越国界创意想象力的殿堂级文化奇迹。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.3)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-100",
    segments: [
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" }
    ]
  },
  {
    id: "yakitori",
    kanji: "焼き鳥",
    kanaStr: "やきとり",
    category: "food",
    categoryName: "日本美味",
    meaning: "炭烤鸡肉串。日本极其大众化且饱含人间烟火气的居酒屋招牌美食。将切块的鲜嫩鸡肉与大葱用竹签穿好，在优质备长炭慢火烤制下刷上香甜的秘制酱汁或上海盐，外酥里嫩，香气缭绕。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(249, 115, 22, 0.3)",
    borderColor: "border-orange-300",
    bgGradient: "from-orange-50 to-amber-100",
    segments: [
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" }
    ]
  },
  {
    id: "kinkakuji",
    kanji: "金閣寺",
    kanaStr: "きんかくじ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "金阁寺（鹿苑寺），京都最享誉世界的璀璨名胜。其临水而建的楼阁外贴满纯金金箔，在阳光照耀下，金碧辉煌的倒影在镜湖池中荡漾，流光溢彩，宛若人间净土与仙界琼楼。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(234, 179, 8, 0.4)",
    borderColor: "border-yellow-400",
    bgGradient: "from-yellow-50 to-amber-100",
    segments: [
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" }
    ]
  },
  {
    id: "wasabi",
    kanji: "山葵",
    kanaStr: "わさび",
    category: "food",
    categoryName: "日本美味",
    meaning: "山葵，日本料理顶级清爽佐料之王。生长于极净冷冽的山间清流溪水旁。现磨成翠绿色的山葵泥带有一种清新植物香气，能瞬间唤醒嗅觉和味蕾，起到杀菌、去腥与烘托食材本鲜的绝妙功效。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(16, 185, 129, 0.3)",
    borderColor: "border-emerald-300",
    bgGradient: "from-emerald-50 to-green-150",
    segments: [
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "び", romaji: ["bi"], displayRomaji: "bi" }
    ]
  },
  {
    id: "hinata",
    kanji: "日向",
    kanaStr: "ひなた",
    category: "name",
    categoryName: "日本人名",
    meaning: "日向，温润恬静的和风名字。字面意为‘面向阳光、温暖明亮的地方’。自古寄托着家庭对孩子一生开朗温柔、如春日暖阳般照亮他人的美好而又治愈人心的人生祝福。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(234, 179, 8, 0.3)",
    borderColor: "border-yellow-300",
    bgGradient: "from-yellow-50 to-orange-100",
    segments: [
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" }
    ]
  },
  {
    id: "sakurajima",
    kanji: "桜島",
    kanaStr: "さくらじま",
    category: "nature",
    categoryName: "自然风物",
    meaning: "樱岛，鹿儿岛湾最著名的神圣活火山象征。终年袅袅不绝喷薄而出的巍峨白色烟雾与平静蔚蓝的海湾构成绝妙动静对比，象征着火山大地的宏大炽热生命律动与永恒不变的自然风范。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(239, 68, 68, 0.6)",
    borderColor: "border-red-500 border-2 shadow-red-500 animate-pulse",
    bgGradient: "from-red-50 to-orange-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" }
    ]
  },
  {
    id: "shogun",
    kanji: "将軍",
    kanaStr: "しょうぐん",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "征夷大将军，中世纪日本的最高军事统帅和幕府事实统治者。自源赖朝开创镰仓幕府始，历经数百载武家执政时代。将军集军、政、财大权于一身，高悬其三叶葵或五七桐家纹，气派非凡。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "ぐ", romaji: ["gu"], displayRomaji: "gu" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "tatami",
    kanji: "畳",
    kanaStr: "たたみ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "榻榻米。日本传统民居中用稻草和蔺草编织成的厚实铺地草席。散发着天然蔺草的淡淡清香，光脚走在上面温润舒适，是和室空间不可或缺的核心灵魂。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(120, 113, 108, 0.3)",
    borderColor: "border-stone-300",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "tsubaki",
    kanji: "山茶花",
    kanaStr: "つばき",
    category: "nature",
    categoryName: "自然风物",
    meaning: "山茶花。一种在隆冬腊月至初春白雪皑皑里，依然傲雪吐红的典雅木本花卉。墨绿亮润的叶片与艳红娇嫩的花瓣交织。其整朵花骤然凋落的奇丽特征，在日本文学里常被视作高尚生命的尊严句点。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(244, 63, 94, 0.3)",
    borderColor: "border-rose-300",
    bgGradient: "from-rose-50 to-pink-100",
    segments: [
      { kana: "つ", romaji: ["tsu", "tu"], displayRomaji: "tsu" },
      { kana: "ば", romaji: ["ba"], displayRomaji: "ba" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "teriyaki",
    kanji: "照り焼き",
    kanaStr: "てりやき",
    category: "food",
    categoryName: "日本美味",
    meaning: "照烧，极具代表性的日式烤制烹饪神技。用浓缩日本酱油、味醂与白糖、清酒调配熬制成琥珀色微润粘稠的酱汁。将其均匀刷涂在香嫩肉品表面，经炙烤后呈现出如反光镜面般的诱人高光泽与微甜醇香。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(217, 119, 6, 0.3)",
    borderColor: "border-amber-300",
    bgGradient: "from-amber-50 to-stone-100",
    segments: [
      { kana: "て", romaji: ["te"], displayRomaji: "te" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "zen",
    kanji: "禅",
    kanaStr: "ぜん",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "禅宗，日本古典美学、庭园和茶道仪轨底蕴所不可动摇的终极精神大厦。通过凝神静坐冥想、对枯山水砂砾的静穆观照，去感知天地间稍纵即逝的虚无清澈、在浮躁尘世里获得万缘放下的本心澄明觉醒。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(139, 92, 246, 0.4)",
    borderColor: "border-purple-300",
    bgGradient: "from-purple-50 to-stone-100",
    segments: [
      { kana: "ぜ", romaji: ["ze"], displayRomaji: "ze" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "haruto",
    kanji: "陽翔",
    kanaStr: "はると",
    category: "name",
    categoryName: "日本人名",
    meaning: "阳翔，和风经典男子名。意为‘在晴空阳光中展翅高飞’，寄托着家庭对孩子一生前途坦荡、胸怀大志与朝气蓬勃的美好愿景。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" }
    ]
  },
  {
    id: "yuto",
    kanji: "悠人",
    kanaStr: "ゆうと",
    category: "name",
    categoryName: "日本人名",
    meaning: "悠人，富有沉静美感的男子名。意为‘悠然自得、胸襟开阔之人’，祝愿孩子一生生活从容不迫、志存高远且内心充实饱满。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" }
    ]
  },
  {
    id: "sota",
    kanji: "奏太",
    kanaStr: "そうた",
    category: "name",
    categoryName: "日本人名",
    meaning: "奏太，富有艺术气息的俊雅男子名。意为‘演奏出宏大、和谐的人生乐章’。代表着多才多艺、性格豁达与备受瞩目的不凡才华。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "そ", romaji: ["so"], displayRomaji: "so" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" }
    ]
  },
  {
    id: "yua",
    kanji: "結愛",
    kanaStr: "ゆあ",
    category: "name",
    categoryName: "日本人名",
    meaning: "结爱，极具治愈感的温柔女子名。寓意为‘连接人与人之间的纯真爱意与善意’，象征着性格温婉善良、善解人意且备受世人喜爱。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(244, 63, 94, 0.2)",
    borderColor: "border-rose-200",
    bgGradient: "from-rose-50 to-pink-50",
    segments: [
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "あ", romaji: ["a"], displayRomaji: "a" }
    ]
  },
  {
    id: "mei",
    kanji: "芽依",
    kanaStr: "めい",
    category: "name",
    categoryName: "日本人名",
    meaning: "芽依，洋溢着春日生机的淑雅女子名。意为‘如同春天破土而出的嫩芽，温柔而有依怙’，寄托着生命力顽强、纯真可爱与欣欣向荣的美好生命律动。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(244, 63, 94, 0.2)",
    borderColor: "border-rose-200",
    bgGradient: "from-rose-50 to-pink-50",
    segments: [
      { kana: "め", romaji: ["me"], displayRomaji: "me" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" }
    ]
  },
  {
    id: "tsumugi",
    kanji: "紬",
    kanaStr: "つむぎ",
    category: "name",
    categoryName: "日本人名",
    meaning: "紬，典雅怀古的女子名。本义为‘抽丝剥茧、织就华美绸缎’。寓意持之以恒、踏实细致，能凭借智慧将生活中的点滴幸福长久延续。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "つ", romaji: ["tsu", "tu"], displayRomaji: "tsu" },
      { kana: "む", romaji: ["mu"], displayRomaji: "mu" },
      { kana: "ぎ", romaji: ["gi"], displayRomaji: "gi" }
    ]
  },
  {
    id: "akira",
    kanji: "輝",
    kanaStr: "あきら",
    category: "name",
    categoryName: "日本人名",
    meaning: "辉，英俊干练的经典人名。意为‘明亮、光辉夺目’，象征前途一片璀璨光明，胸怀坦荡且富有杰出的智慧与敏锐洞察力。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "kenji",
    kanji: "健二",
    kanaStr: "けんじ",
    category: "name",
    categoryName: "日本人名",
    meaning: "健二，脚踏实地的经典男子名。寓意为‘身体健康强壮、行事沉稳可靠’，富有不折不挠、敢于担当的男子汉汉气魄。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" }
    ]
  },
  {
    id: "ren",
    kanji: "蓮",
    kanaStr: "れん",
    category: "name",
    categoryName: "日本人名",
    meaning: "莲，极具古典禅意的男女通用名。取‘出淤泥而不染’之意，代表着高洁无瑕的高尚人格、沉静内敛的作风与清雅出尘的气质。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "れ", romaji: ["re"], displayRomaji: "re" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "aoi",
    kanji: "葵",
    kanaStr: "あおい",
    category: "name",
    categoryName: "日本人名",
    meaning: "葵，极具自然气息、生命力旺盛的优雅名字。取意‘向日葵永远追逐暖阳’，代表着性格阳光开朗、积极向上且备受众人信赖拥护。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" }
    ]
  },
  {
    id: "rin",
    kanji: "凛",
    kanaStr: "りん",
    category: "name",
    categoryName: "日本人名",
    meaning: "凛，极具英气的男女通用名。取‘凛然不可侵犯、傲骨风霜’之意，代表着独立坚强、绝不随波逐流的尊贵精神和出众才华。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "takumi",
    kanji: "拓海",
    kanaStr: "たくみ",
    category: "name",
    categoryName: "日本人名",
    meaning: "拓海，极具探索气概的杰出男子名。字面意为‘开拓无垠辽阔的大海’，代表着心胸似海、勇于突破传统、敢作敢当的男子气魄。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "shamisen",
    kanji: "三味線",
    kanaStr: "しゃみせん",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "三味线，日本传统弹拨弦乐器。琴身由猫皮或狗皮绷紧，通过硕大的拨子拨动三根琴弦，发出清脆紧凑、富有颗粒感的哀婉而又欢快的古朴音色。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ゃ", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "shodou",
    kanji: "書道",
    kanaStr: "しょどう",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "书道，即日式传统书法艺术。使用毛笔、墨汁在精致的和纸上挥洒，讲究运笔的顿挫转折、气韵的连贯以及书写者精神专注天人合一的心灵境界。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "ど", romaji: ["do"], displayRomaji: "do" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "sensu",
    kanji: "折扇",
    kanaStr: "せんす",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "折扇。工艺极其精湛的竹骨折叠扇，伞面精绘日月风物。既可在炎炎夏日招风纳凉，又是传统舞蹈、能剧和茶道仪式中彰显高雅品格的重要道具。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "す", romaji: ["su"], displayRomaji: "su" }
    ]
  },
  {
    id: "koto",
    kanji: "古筝",
    kanaStr: "こと",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "琴，即日本传统十三弦古筝。起源于古代东方，琴声空灵清澈、高古幽远，如山泉流淌，自古是贵族和高雅文人修身养性的乐器。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" }
    ]
  },
  {
    id: "wagasa",
    kanji: "和傘",
    kanaStr: "わがさ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "和伞。用坚韧的毛竹作伞骨、附贴刷涂上优质天然桐油的和纸制成的传统雨伞。伞面常绘有经典花鸟。在细雨和风中撑开，散发古朴悠远韵味。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" }
    ]
  },
  {
    id: "sudachi",
    kanji: "醋橘",
    kanaStr: "すだち",
    category: "food",
    categoryName: "日本美味",
    meaning: "醋橘。德岛特产的小型绿色酸柑橘，拥有极其清新强烈的独特果酸。常在享用高档烤鱼、松茸汤以及刺身时滴上数滴，具有提鲜解腻的画龙点睛之妙。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "ち", romaji: ["chi", "ti"], displayRomaji: "chi" }
    ]
  },
  {
    id: "furoshiki",
    kanji: "風呂敷",
    kanaStr: "ふろしき",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "风吕敷，即日式传统多用途包装布。通过代代相传、精妙的折叠和打结手法，能将一块方布瞬间化作便携手拎袋、酒瓶套，兼具环保、实用与生活之美。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "ふ", romaji: ["fu", "hu"], displayRomaji: "fu" },
      { kana: "ろ", romaji: ["ro"], displayRomaji: "ro" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "daikon",
    kanji: "白萝卜",
    kanaStr: "だいこん",
    category: "food",
    categoryName: "日本美味",
    meaning: "大根，即日本长白萝卜。肉质清甜无纤维。常在大众化的关东煮、味噌汤以及炖肉中扮演主角，经过慢火久炖后入口即化，饱含温热的鲜甜汁水，治愈身心。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "soji",
    kanji: "掃除",
    kanaStr: "そうじ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "扫除，在日本日常生活中被视作一种修行。从小培养亲自动手擦拭课室地板、整理书架的习惯。不仅是为了环境的极致整洁，更是扫除内心杂念、培养感恩态度的过程。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "そ", romaji: ["so"], displayRomaji: "so" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" }
    ]
  },
  {
    id: "sudoku",
    kanji: "数独",
    kanaStr: "すうどく",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "数独。风靡全世界的经典纸笔逻辑解谜游戏。在9x9网格中仅通过纯粹的逻辑推理填入1至9的数字，不含任何计算。是极佳的健脑、冥想与益智娱乐。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "ど", romaji: ["do"], displayRomaji: "do" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" }
    ]
  },
  {
    id: "ikebana",
    kanji: "生花",
    kanaStr: "いけばな",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "生花，即传统插花艺术（华道）。讲究线条感、空间留白以及天人合一。利用极少数的花木枝条，巧妙构筑出一个生动的微缩自然，展现出生命与凋零的哲思。",
    rarity: "SR",
    rarityName: "极品 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "ば", romaji: ["ba"], displayRomaji: "ba" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" }
    ]
  },
  {
    id: "kendama",
    kanji: "剑玉",
    kanaStr: "けんだま",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "剑玉。起源于古老的十字木质抛接球玩具。通过手眼协调和微妙的膝盖缓冲力量，把红球抛起并稳稳接在剑尖或三个侧杯中，玩法千变万化，极具挑战性。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" }
    ]
  },
  {
    id: "soroban",
    kanji: "算盘",
    kanaStr: "そろばん",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "算盘。日式传统算盘（五珠制），曾是商业和家庭理财的核心速算工具。至今仍在学校中被广泛用于启发儿童心算、速算以及数理推演潜能。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "そ", romaji: ["so"], displayRomaji: "so" },
      { kana: "ろ", romaji: ["ro"], displayRomaji: "ro" },
      { kana: "ば", romaji: ["ba"], displayRomaji: "ba" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "manekineko",
    kanji: "招财猫",
    kanaStr: "まねきねこ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "招财猫。一只举起爪子、呈招手姿态的可爱陶瓷福猫公仔。通常摆放在店铺或客厅，举右手寓意招财进宝，举左手寓意高朋满座，象征好运连连。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "ね", romaji: ["ne"], displayRomaji: "ne" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "ね", romaji: ["ne"], displayRomaji: "ne" },
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" }
    ]
  },
  {
    id: "kokeshi",
    kanji: "木芥子",
    kanaStr: "こけし",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "木芥子娃娃。日本东北部温泉乡流传的手工雕刻木偶。拥有圆圆的头部 and 无手足的圆柱形身子，表面用彩漆绘制出清雅的菊花风物，神态质朴无邪。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" }
    ]
  },
  {
    id: "tengu",
    kanji: "天狗",
    kanaStr: "てんぐ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "天狗，经典神话传说中的深山神怪。面赤鼻长，生有双翼，身穿修验道僧服且法力无边，常手持能扇起神风的羽扇，威严神圣而又带有些许狂妄孤傲色彩。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "て", romaji: ["te"], displayRomaji: "te" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "ぐ", romaji: ["gu"], displayRomaji: "gu" }
    ]
  },
  {
    id: "tanzaku",
    kanji: "短册",
    kanaStr: "たんざく",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "短册。七夕或各大祭典时，人们用来写下虔诚祈愿的美丽彩色长纸条，随后将其系在郁郁葱葱的修竹上，让山风将其带给星空，祈求梦想成真。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "ざ", romaji: ["za"], displayRomaji: "za" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" }
    ]
  },
  {
    id: "obento",
    kanji: "便当",
    kanaStr: "おべんとう",
    category: "food",
    categoryName: "日本美味",
    meaning: "便当，倾注了无限家庭关爱的手作外带餐食。通常由晶莹的大米饭配上色彩错落的厚蛋烧、章鱼香肠、西兰花等，既提供丰富营养，也是一种日常视觉享受。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "べ", romaji: ["be"], displayRomaji: "be" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "kamakura",
    kanji: "雪屋",
    kanaStr: "かまくら",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "雪洞（横手雪屋）。日本雪国冬祭时的独特冰雪奇观。在厚厚的积雪中挖凿出中空圆顶雪堡，内部点亮温暖的烛光，大家在草席上烤年糕喝甜酒，温暖祥和。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "teruterubozu",
    kanji: "晴天娃娃",
    kanaStr: "てるてるぼうず",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "晴天娃娃（扫晴娘）。用干净的白布或白纸包裹成球状、用细绳悬挂在屋檐下祈求天晴的神奇手作人偶。光秃秃的小脑袋在风中轻快摇晃，质朴讨喜。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "て", romaji: ["te"], displayRomaji: "te" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" },
      { kana: "て", romaji: ["te"], displayRomaji: "te" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" },
      { kana: "ぼ", romaji: ["bo"], displayRomaji: "bo" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "ず", romaji: ["zu"], displayRomaji: "zu" }
    ]
  },
  {
    id: "senkouhanabi",
    kanji: "线香烟花",
    kanaStr: "せんこうはなび",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "线香花火，经典的微型纸卷手持烟花。点燃后呈现出微妙的红热火球，随之在空中如金黄色蒲公英般绽放出极其细腻、转瞬即逝的火花，极具禅意与物哀美感。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(129, 140, 248, 0.6)",
    borderColor: "border-indigo-500 border-2 shadow-indigo-500 animate-pulse",
    bgGradient: "from-indigo-50 to-purple-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "び", romaji: ["bi"], displayRomaji: "bi" }
    ]
  },
  {
    id: "origami_tsuru",
    kanji: "纸鹤",
    kanaStr: "おりづる",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "折纸千羽鹤。传统折纸中最为经典的神圣仙鹤造型。千百年来，人们习惯折叠并用线串起千只纸鹤，寄托着对远方亲人健康长寿、疾病痊愈与世界和平的美好祈愿。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-blue-50",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "づ", romaji: ["du", "zu"], displayRomaji: "zu" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" }
    ]
  },
  {
    id: "fujisan",
    kanji: "富士山",
    kanaStr: "ふじさん",
    category: "nature",
    categoryName: "自然风物",
    meaning: "富士山。横跨静冈与山梨的巍峨休眠火山，山顶常年覆盖着一顶圣洁高雅的白色雪帽。其近乎绝对对称的圆锥体山廓，是东方清雅、纯净与自然大美无可动摇的象征。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(129, 140, 248, 0.6)",
    borderColor: "border-indigo-500 border-2 shadow-indigo-500 animate-pulse",
    bgGradient: "from-indigo-50 to-purple-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "ふ", romaji: ["fu", "hu"], displayRomaji: "fu" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "onsen_tamago",
    kanji: "温泉蛋",
    kanaStr: "おんせんたまご",
    category: "food",
    categoryName: "日本美味",
    meaning: "温泉半熟蛋。利用天然矿质温泉水特定低温慢火浸煮而成的极品水煮蛋。蛋白呈如布丁般细滑软嫩的半凝固态，蛋黄则稠密醇香，淋上木鱼花酱油，鲜嫩无比。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(120, 113, 108, 0.1)",
    borderColor: "border-stone-200",
    bgGradient: "from-stone-50 to-stone-100",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "ご", romaji: ["go"], displayRomaji: "go" }
    ]
  },
  {
    id: "edamame",
    kanji: "枝豆",
    kanaStr: "えだまめ",
    category: "food",
    categoryName: "日本美味",
    meaning: "毛豆。在盐水中煮熟的鲜嫩大豆荚，在居酒屋中常作为佐酒冷盘。它含有丰富的营养与豆香，是日本仲夏最具元气的风味小吃。",
    rarity: "N",
    rarityName: "普通 (N)",
    glowColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "border-emerald-200",
    bgGradient: "from-emerald-50 to-green-100",
    segments: [
      { kana: "え", romaji: ["e"], displayRomaji: "e" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "め", romaji: ["me"], displayRomaji: "me" }
    ]
  },
  {
    id: "tanuki",
    kanji: "狸",
    kanaStr: "たぬき",
    category: "nature",
    categoryName: "自然风物",
    meaning: "信乐烧狸猫。日本传说中具有变身神力的生灵，在日本商店和住宅门前常摆放其标志性陶像，头戴斗笠、手持酒瓶，象征着招财进宝与开运吉祥。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(120, 113, 108, 0.25)",
    borderColor: "border-stone-300",
    bgGradient: "from-stone-50 to-amber-100",
    segments: [
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "ぬ", romaji: ["nu"], displayRomaji: "nu" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "wotome",
    kanji: "少女",
    kanaStr: "をとめ",
    category: "culture",
    categoryName: "民俗文化",
    meaning: "歌谣中的纯真少女。在《万叶集》等日本古籍 and 神乐歌谣中，“をとめ”是代表纯洁、娇羞、灵动与美好青春的雅致称呼，充满了古典和歌的质朴韵味。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(236, 72, 153, 0.45)",
    borderColor: "border-pink-300",
    bgGradient: "from-pink-50 to-purple-100",
    segments: [
      { kana: "を", romaji: ["wo", "o"], displayRomaji: "wo" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "め", romaji: ["me"], displayRomaji: "me" }
    ]
  }
];

export const DICTIONARY: DictionaryItem[] = [
  ...BASE_DICTIONARY,
  ...CELEBRITY_DICTIONARY,
  ...KPOP_RIVALRY_DICTIONARY
];

export interface EnglishOverlay {
  word: string;
  categoryName: string;
  meaning: string;
}

const BASE_ENGLISH_OVERLAYS: Record<string, EnglishOverlay> = {
  sato: {
    word: "Richard",
    categoryName: "西式人名",
    meaning: "经典的日耳曼语源人名，意为‘勇敢的统治者’或‘强有力的领袖’，数百年来一直深受喜爱。"
  },
  suzuki: {
    word: "William",
    categoryName: "西式人名",
    meaning: "经典的德语语源名字，意为‘强意志的战士’或‘坚定的守护者’，深具历史厚重感。"
  },
  kimura: {
    word: "Chloe",
    categoryName: "西式人名",
    meaning: "源自希腊语，意为‘正在绽放的’或‘年轻的绿芽’。象征着丰饶生命力、青春与生机蓬勃。"
  },
  tanaka: {
    word: "Jones",
    categoryName: "西式人名",
    meaning: "非常常见且受人尊敬的英文父名姓氏，意为‘大卫之子’或‘上帝的恩赐’。"
  },
  yamada: {
    word: "Olivia",
    categoryName: "西式人名",
    meaning: "优雅的拉丁语源女名，意为‘橄榄树’，代表和平、丰收与古典尊贵的情怀。"
  },
  oda: {
    word: "Elizabeth",
    categoryName: "西式人名",
    meaning: "高贵的希伯来语名字，意为‘我的上帝是誓约’。历史上有多位传奇女王和杰出女性使用此名。"
  },
  sakura: {
    word: "Strawberry",
    categoryName: "自然与动物",
    meaning: "草莓。一种甜美、鲜红的心形夏季水果，常作为鲜食或制作美味甜点，饱含元气色彩。"
  },
  fuji: {
    word: "Mountain Peak",
    categoryName: "自然与动物",
    meaning: "山峰。山脉的雄伟峰顶，象征着力量、坚韧、勇敢探险与俯瞰万物的广阔视野。"
  },
  aozora: {
    word: "Blue Sky",
    categoryName: "自然与动物",
    meaning: "蓝天。晴朗碧蓝的天空，传递出无限自由、喜悦与阳光般的乐观主义情怀。"
  },
  asagao: {
    word: "Morning Glory",
    categoryName: "自然与动物",
    meaning: "牵牛花。清晨盛开的蔓生花朵，拥有美丽的喇叭状花冠，象征着生命的朝气与季节的韵律。"
  },
  kotone: {
    word: "Melody",
    categoryName: "西式人名",
    meaning: "旋律。一串悦耳动听、协调而富有感情的音乐序列，承载着艺术创作与美妙共处的灵性。"
  },
  shiki: {
    word: "Seasons",
    categoryName: "自然与动物",
    meaning: "四季。春、夏、秋、冬的自然轮回更替，生动展现了生命大自然的生生不息与时令律动。"
  },
  dango: {
    word: "Sweet Cake",
    categoryName: "西餐美味",
    meaning: "甜蛋糕。用糖、面粉和奶油精心制作的糕点，常常在温馨的生日派对与好友欢聚中分食。"
  },
  momiji: {
    word: "Maple Leaf",
    categoryName: "自然与动物",
    meaning: "枫叶。秋天里变成璀璨深红色的星形叶片，是秋日自然山野间充满诗情画意的绝美象征。"
  },
  daruma: {
    word: "Tumbling Toy",
    categoryName: "物品与概念",
    meaning: "不倒翁。底部加重且重心在下的传统玩具，无论怎么摇晃都不会倒下，代表着不屈不挠的复原力。"
  },
  heiwa: {
    word: "Harmony",
    categoryName: "物品与概念",
    meaning: "和谐。一种宁静祥和的状态，指社区之间或内心深处的平衡、团结与友好合作。"
  },
  kabuki: {
    word: "Broadway",
    categoryName: "物品与概念",
    meaning: "百老汇。戏剧艺术的核心殿堂，以上演经典音乐剧和顶尖现场表演而闻名全球，洋溢着狂欢的魅力。"
  },
  toyotomi: {
    word: "James",
    categoryName: "西式人名",
    meaning: "非常受欢迎的英语男名，意为‘代位者’或‘跟随者’。深受许多国王、探险家及现代名人的喜爱。"
  },
  tokugawa: {
    word: "Robert",
    categoryName: "西式人名",
    meaning: "经典的日耳曼语源名字，意为‘辉煌的名声’或‘闪耀的荣耀’，饱含着伟人般的历史威望。"
  },
  kawabata: {
    word: "Arthur",
    categoryName: "西式人名",
    meaning: "古老凯尔特语源名字，意为‘熊之英雄’或‘高贵的磐石’。常使人联想到传奇的亚瑟王。"
  },
  miyazaki: {
    word: "Director",
    categoryName: "物品与概念",
    meaning: "导演。电影背后的创意总监，统筹视觉镜头、角色成长和故事叙事的灵魂人物。"
  },
  sushi: {
    word: "Sushi Rice",
    categoryName: "西餐美味",
    meaning: "寿司饭。经过温和调味、酸甜适口的短粒饱满大米，通常搭配海洋鲜美食材作轻盈一口食。"
  },
  matcha: {
    word: "Green Tea",
    categoryName: "西餐美味",
    meaning: "绿茶。富含抗氧化成分的清晨幼嫩茶叶微粉，因苦尽甘来的清幽香气、提神且平静的口感而深受喜爱。"
  },
  ramen: {
    word: "Spicy Noodles",
    categoryName: "西餐美味",
    meaning: "香辣拉面。热气腾腾、香气四溢的拉面，浸在精心熬制的浓郁高汤中，辅以香辛红油，暖腹安心。"
  },
  wagashi: {
    word: "Cheesecake",
    categoryName: "西餐美味",
    meaning: "芝士蛋糕。口感浓郁、丝滑香软的西方流行甜点，通常搭配威化饼干酥底，是下午茶当红不让的主角。"
  },
  sake: {
    word: "bottled water",
    categoryName: "物品与概念",
    meaning: "瓶装水。在便携瓶中密封的纯净过滤淡水，帮助您在工作与高强度运动中补充水分、保持健康。"
  },
  jinja: {
    word: "Cathedral",
    categoryName: "物品与概念",
    meaning: "大堂（大教堂）。宏伟壮丽、充满信仰气息的神圣建筑杰作，以高耸的尖顶拱门和斑斓彩色玻璃天窗著称。"
  },
  ninja: {
    word: "Shadow Agent",
    categoryName: "物品与概念",
    meaning: "影子情报员。精通隐匿、打探等影子谍战术，行动绝对隐秘快速、忠诚而敏锐的顶尖战术高手。"
  },
  bushi: {
    word: "Knight",
    categoryName: "物品与概念",
    meaning: "骑士。中世纪历史上的重装贵族战士，恪守严格的谦逊、仗义、英勇和忠诚的八大德行誓言。"
  },
  bento: {
    word: "Lunch Box",
    categoryName: "物品与概念",
    meaning: "便当盒（午餐盒）。分隔清晰、设计周到的便携容器，用于盛装丰盛、富有家常关怀的手作膳食。"
  },
  onsen: {
    word: "Hot Spring",
    categoryName: "自然与动物",
    meaning: "温泉。地下天然涌出的富含矿物质的地热温水，对舒缓肌肉、静心理疗有极佳的放松和治愈疗效。"
  },
  hotaru: {
    word: "Firefly",
    categoryName: "自然与动物",
    meaning: "萤火虫。一种微小的软体甲虫，在仲夏夜的草丛池塘边散发迷人的黄绿色冷光信号，充满浪漫气息。"
  },
  semi: {
    word: "Cicada",
    categoryName: "自然与动物",
    meaning: "蝉。在盛夏至酷热季节的绿树上，不断发出高亢声浪和悠扬鸣叫声、象征生命灿烂宣泄的昆虫。"
  },
  haiku: {
    word: "Poetry",
    categoryName: "物品与概念",
    meaning: "诗歌。用优美跳跃的词藻、高雅的格律和深邃隐喻创作的语言艺术，用于传情达意、吟咏心境。"
  },
  torii: {
    word: "Gateway",
    categoryName: "物品与概念",
    meaning: "大门。用于分隔不同区域或作为入口框架，欢迎游客到来或宣告一段庄严路途的转换。"
  },
  hanabi: {
    word: "Fireworks",
    categoryName: "自然与动物",
    meaning: "烟花。利用绚烂火药在夜空中燃放的缤纷视觉和听觉盛宴，为节日庆典与重要活动增添欢庆气氛。"
  },
  soba: {
    word: "Buckwheat",
    categoryName: "西餐美味",
    meaning: "荞麦。一种高度营养的耐旱谷类作物，主要用于碾作面粉，从而烹制成经典的传统麦香荞麦面条。"
  },
  tempura: {
    word: "Fried Shrimp",
    categoryName: "西餐美味",
    meaning: "天妇罗大虾（炸虾）。裹着酥金黄金面衣的肥美大虾，经精微妙火油炸，口感酥脆蓬松、虾肉鲜甜Q弹。"
  },
  takoyaki: {
    word: "Octopus Ball",
    categoryName: "西餐美味",
    meaning: "章鱼小丸子。一种源于街头的美味，在特制烤盘上翻转烤成金黄色外皮，包裹大块Q弹章鱼，香气四溢。"
  },
  mochi: {
    word: "Rice Cake",
    categoryName: "西餐美味",
    meaning: "糯米糕。通过熟糯米碾打塑造而成的美味，质地极其柔韧软糯，可包甜馅或加入汤中慢熬。"
  },
  gohan: {
    word: "Steamed Rice",
    categoryName: "西餐美味",
    meaning: "米饭。经过高温热蒸汽焖制而成的白大米饭，松软清甜、水润饱满，是佐餐膳食的基础支柱。"
  },
  yukata: {
    word: "Summer Dress",
    categoryName: "物品与概念",
    meaning: "夏季轻服。质地极其透气、轻薄，在盛夏季节常作为乘凉、泡温泉和参加户外夏日野餐的休闲美装。"
  },
  matsuri: {
    word: "Carnival",
    categoryName: "物品与概念",
    meaning: "狂欢庆典。具有宏大规模的民间欢聚活动，往往伴随游行花车、游戏摊、美食及载歌载舞的欢快交融。"
  },
  geisha: {
    word: "Dancer",
    categoryName: "物品与概念",
    meaning: "舞者（传统演艺人）。受过顶尖训练的古典表演家，通过精湛优雅的中世纪舞姿向观众叙述历史传说。"
  },
  origami: {
    word: "Paper Craft",
    categoryName: "物品与概念",
    meaning: "折纸艺术。通过灵巧的折线创意手工，仅凭双手将平整的彩色纸张演化出造型生动的动植物和几何载体。"
  },
  kimono: {
    word: "Silk Gown",
    categoryName: "物品与概念",
    meaning: "绸缎华服。用极为名贵珍稀的织锦、真丝缎料手工裁制的正规华美大装礼袍，象征极高的尊贵礼仪。"
  },
  tsuki: {
    word: "Silver Moon",
    categoryName: "自然与动物",
    meaning: "银月。高悬于漆黑苍穹中的神秘莹白色天体，撒下温柔静谧的光影，自古激荡着文人雅客的遐思。"
  },
  yuki: {
    word: "Snowflake",
    categoryName: "自然与动物",
    meaning: "雪花。在隆冬严寒高空水气凝结飘落的对称微晶冰体，千姿百态，将天地笼罩装扮成清雅雪原。"
  },
  kaze: {
    word: "Gentle Breeze",
    categoryName: "自然与动物",
    meaning: "和风微风。一种轻柔拂面、温暖宜人的空气流动，悄然摇动枝叶和小风铃，令人心旷神怡。"
  },
  shiba: {
    word: "Puppy Dog",
    categoryName: "自然与动物",
    meaning: "柴犬。忠诚机警、性格极其逗趣亲人的日本本土名品古犬种，常常展现出阳光治愈系的微风微笑。"
  },
  katana: {
    word: "Samurai Sword",
    categoryName: "物品与概念",
    meaning: "日本武士刀。凭借其标志性的单刃弯曲造型与登峰造极的折叠锻打淬火技艺享誉全球，代表不可侵犯的荣誉、正义与坚定灵魂。"
  },
  manga: {
    word: "Comic Book",
    categoryName: "物品与概念",
    meaning: "日式漫画书。拥有极其丰富的影视分镜画风和深切的情感共鸣，是广受全球读者喜爱、象征无限创意想象的殿堂级画册。"
  },
  yakitori: {
    word: "Chicken Skewer",
    categoryName: "西餐美味",
    meaning: "炭烤鸡串。居酒屋经典风味小吃，在红红炭火上把鲜美多汁的肉块烤制得外酥里香，让人赞不绝口。"
  },
  kinkakuji: {
    word: "Golden Pavilion",
    categoryName: "物品与概念",
    meaning: "金阁寺。京都最负盛名的金箔禅宗楼阁建筑，其在明镜般的池塘中映照出流光溢彩的金色倒影，充满震撼的极致之美。"
  },
  wasabi: {
    word: "Spicy Horse Radish",
    categoryName: "西餐美味",
    meaning: "辛辣山葵。一种带有个性张扬、辛辣呛鼻快感的青绿根茎植物泥，解腻提鲜，是衬托顶奢刺身食材不可或缺的灵魂配料。"
  },
  hinata: {
    word: "Sunny Meadow",
    categoryName: "西式人名",
    meaning: "桑尼（Sunny/日向）。意为‘阳光普照、明媚温暖的宝地’，寄托着像阳光一样纯真善良、温暖身边所有人的美好品行。"
  },
  sakurajima: {
    word: "Smoking Volcano",
    categoryName: "自然与动物",
    meaning: "冒烟活火山（樱岛）。耸立在清澈深蓝海面之上的地质活化石奇观，终年不息涌出的白雾昭示着大地深处蓬勃跃动的原动力。"
  },
  shogun: {
    word: "Supreme General",
    categoryName: "物品与概念",
    meaning: "幕府大将军。中世纪幕府武家政权事实上的最高独裁掌权者，代表征夷统帅武家至高无上的霸权、威严与历史尊耀。"
  },
  tatami: {
    word: "Straw Mat",
    categoryName: "物品与概念",
    meaning: "榻榻米草垫。用天然蔺草编织的和室传统地板铺垫，散发着草本清香，提供舒适自然、古朴清雅的席地起居体验。"
  },
  tsubaki: {
    word: "Camellia Flower",
    categoryName: "自然与动物",
    meaning: "山茶花。不惧隆冬雪压、兀自盛开出饱满红艳花冠的常绿名花，在雪野中极其艳丽，代表清雅傲骨与不凡品质。"
  },
  teriyaki: {
    word: "Glazed Sauce Grill",
    categoryName: "西餐美味",
    meaning: "照烧烤。用甜熟酱油、清酒、糖汁熬煮的琥珀色调料烤肉。表皮色泽金亮如镜，焦香扑鼻，风味咸甜美妙。"
  },
  zen: {
    word: "Zen Meditation",
    categoryName: "物品与概念",
    meaning: "禅。源自深邃东方、讲究静虑和心灵悟道的修行法门。提倡在绝对寂静观照中觉察内在真实的澄明状态。"
  },
  haruto: {
    word: "Harry",
    categoryName: "西式人名",
    meaning: "哈里（Harry/阳翔）。源自日耳曼语，意为‘家庭的统治者’，象征着温馨守护、忠诚与坚实如初的高尚品质。"
  },
  yuto: {
    word: "Ethan",
    categoryName: "西式人名",
    meaning: "伊桑（Ethan/悠人）。意为‘坚固的’、‘力量无穷的’，给人以沉稳厚重、内心世界极度丰富且长寿平安的美好期望。"
  },
  sota: {
    word: "Leo",
    categoryName: "西式人名",
    meaning: "里奥（Leo/奏太）。意为‘勇敢的狮子’，象征着生命中无所畏惧的冒险精神、非凡魅力与宽广豁达的王者胸怀。"
  },
  yua: {
    word: "Grace",
    categoryName: "西式人名",
    meaning: "格蕾丝（Grace/结爱）。意为‘优雅、神圣的恩泽’。祝愿孩子一生温婉贤淑、仪态大方且处处深受他人善意与关爱。"
  },
  mei: {
    word: "May",
    categoryName: "西式人名",
    meaning: "梅（May/芽依）。象征着春暖花开、绿意盎然的明媚五月，代表着青春、生机与纯真自然的温润美丽。"
  },
  tsumugi: {
    word: "Emma",
    categoryName: "西式人名",
    meaning: "艾玛（Emma/紬）。意为‘无所不能的’、‘宇宙般宏大的’。历史上极其流行，象征杰出的家庭智慧与高尚的品行。"
  },
  akira: {
    word: "Albert",
    categoryName: "西式人名",
    meaning: "艾伯特（Albert/辉）。意为‘高贵、杰出和聪明的’。代表着学术上的傲人造诣、明察秋毫的智慧与浩瀚的前程。"
  },
  kenji: {
    word: "Kevin",
    categoryName: "西式人名",
    meaning: "凯文（Kevin/健二）。源自凯尔特语，意为‘温和、俊美的出生’。具有开朗幽默、乐于助人且脚踏实地的人格魅力。"
  },
  ren: {
    word: "Ryan",
    categoryName: "西式人名",
    meaning: "瑞恩（Ryan/莲）。意为‘英勇的小国王’。代表着独立思考、追求卓越的执着信念以及出类拔萃的杰出领导力。"
  },
  aoi: {
    word: "Alice",
    categoryName: "西式人名",
    meaning: "爱丽丝（Alice/葵）。意为‘高贵而真诚的’。令人联想到童话梦境，代表纯真、善良与不懈探索真相的勇气。"
  },
  rin: {
    word: "Lily",
    categoryName: "西式人名",
    meaning: "莉莉（Lily/凛）。代表圣洁的百合花，象征纯洁无瑕、高雅不俗以及傲立于霜雪之中的高贵生命姿态。"
  },
  takumi: {
    word: "Tyler",
    categoryName: "西式人名",
    meaning: "泰勒（Tyler/拓海）。本义指‘勤勉敬业的砖瓦工匠’。引申为凭借勤劳双手、无限创意开拓崭新天地的卓越实干家。"
  },
  shamisen: {
    word: "Banjo Music",
    categoryName: "物品与概念",
    meaning: "班卓琴（三味线）。极具乡村风情和清脆金属弹拨质感的传统琴弦乐器，手指弹奏间发出活泼、跳跃的元气声响。"
  },
  shodou: {
    word: "Calligraphy",
    categoryName: "物品与概念",
    meaning: "书法艺术。在纸张上用毛笔挥洒墨汁的书写技艺，通过富有节奏张力的线条线条勾勒，呈现出超脱凡俗的汉字灵魂之美。"
  },
  sensu: {
    word: "Folding Fan",
    categoryName: "物品与概念",
    meaning: "折扇。采用轻盈竹骨手工编织而成的精致可折叠小扇，既能在热浪中扇拂来徐徐凉风，也是众多古典歌剧中彰显温雅高贵的饰物。"
  },
  koto: {
    word: "Harp Melody",
    categoryName: "物品与概念",
    meaning: "竖琴仙乐。西方最古老典雅的弦乐器之一，在如流水潺潺的手指抚弦拨动中发出如水晶般空灵圣洁的天籁回响。"
  },
  wagasa: {
    word: "Paper Umbrella",
    categoryName: "物品与概念",
    meaning: "油纸竹伞（和伞）。采用毛竹伞架和防水油纸手工扎制而成的古朴雨伞，散发着天然茶油芬芳，在细雨中平添一分古意画卷。"
  },
  sudachi: {
    word: "Lime Fruit",
    categoryName: "西餐美味",
    meaning: "青柠檬果（醋橘）。色泽饱满翠绿、果汁酸冽清新且略带芬芳香气，是调配精致鸡尾酒与衬托各种炙烤海鲜必不可少的点睛佐料。"
  },
  furoshiki: {
    word: "Wrapping Cloth",
    categoryName: "物品与概念",
    meaning: "便携包裹布（风吕敷）。一张质地优良、四角整齐的多功能包袱布，通过几下轻松折叠和神奇打结，便能包装好各样随身行囊。"
  },
  daikon: {
    word: "White Radish",
    categoryName: "西餐美味",
    meaning: "白萝卜（大根）。质地多汁水润、味道清甜略带微辛的健康根茎类蔬菜，最适合慢火煮透食用，给肠胃最温润的抚慰。"
  },
  soji: {
    word: "Cleaning Up",
    categoryName: "物品与概念",
    meaning: "日常大扫除。通过拂尘除垢、扫净地面与整理归纳，让杂乱的环境重归明亮光洁，有助于在井然秩序中重获精神松弛与专注。"
  },
  sudoku: {
    word: "Number Puzzle",
    categoryName: "物品与概念",
    meaning: "九宫格数独。由数字组成的、极为考验脑力的严密逻辑推理游戏，玩家在纸笔填数之间锻炼无与伦比的专注度与条理性。"
  },
  ikebana: {
    word: "Flower Art",
    categoryName: "物品与概念",
    meaning: "插花艺术（生花）。利用盛开的鲜花与古雅的绿意枝干在器皿中精巧排布，展现出充满自然生命活力和高低错落层次的美学盛宴。"
  },
  kendama: {
    word: "Cup and Ball",
    categoryName: "物品与概念",
    meaning: "剑玉玩具。深受各国孩子们喜爱的、富有挑战性的木制抛接球玩具，需要在屏息凝神间调动全身协调感完成花样接球动作。"
  },
  soroban: {
    word: "Abacus Calculator",
    categoryName: "物品与概念",
    meaning: "复古算盘。拥有精巧滑动算珠的古老木制快速计算框架，算珠拨动间发出清脆碰撞声，体现先辈无穷的数学和理财智慧。"
  },
  manekineko: {
    word: "Lucky Cat",
    categoryName: "物品与概念",
    meaning: "招财福猫。店铺大堂里总能见到的招手吉祥猫公仔，不断挥舞的小爪子寓意广迎八方宾客、驱散霉运，带来源源不断的好运。"
  },
  kokeshi: {
    word: "Wooden Doll",
    categoryName: "物品与概念",
    meaning: "手工木偶娃娃（木芥子）。用整块优质原木经工匠手工旋削、彩绘而成的质朴圆头小娃娃，散发着田园木质芬芳与温馨童趣。"
  },
  tengu: {
    word: "Mountain Goblin",
    categoryName: "物品与概念",
    meaning: "深山天狗。神话传说中居住在深山老林、生有黑翼、红脸长鼻、行踪诡秘而法力滔天的飞天妖神，手执羽扇，威震四方。"
  },
  tanzaku: {
    word: "Wish Paper",
    categoryName: "物品与概念",
    meaning: "彩色许愿长纸笺。用各种亮丽彩色纸裁剪成的小长条，承载着人们亲笔书写的真挚心愿，系挂在翠竹梢头，期盼星光点亮梦想。"
  },
  obento: {
    word: "Lunch Box meal",
    categoryName: "西餐美味",
    meaning: "手作盒饭便当。用精美隔板在饭盒中摆盘精美的美味，充满五彩斑斓的营养搭配与制作人的亲切叮咛，是正午充电的绝佳拍档。"
  },
  kamakura: {
    word: "Snow Igloo",
    categoryName: "物品与概念",
    meaning: "冬日小雪屋。在白雪皑皑原野中用夯实雪块垒砌而成的圆顶冰雪保暖小房子，炉火摇曳间暖融融，是体验冬日宁静的仙境。"
  },
  teruterubozu: {
    word: "Sunny Doll",
    categoryName: "物品与概念",
    meaning: "晴天娃娃。悬挂在窗棂边上的白色可爱小晴天玩偶，旨在乞求乌云退散、迎来灿烂明媚的温暖太阳，蕴含纯真期盼。"
  },
  senkouhanabi: {
    word: "Sparkler Toy",
    categoryName: "物品与概念",
    meaning: "线香冷烟花。在微风夏夜中点燃的火药纸棒，炸裂出极其细碎、犹如一簇簇金色繁星般温柔闪烁的漫天火花，绝美非凡。"
  },
  origami_tsuru: {
    word: "Paper Crane",
    categoryName: "物品与概念",
    meaning: "折纸千纸鹤。代表着纯洁祈祷、早日康复以及深切祝福的经典手工折纸仙鹤，象征将心意飞越千山万水传递给心中的那个人。"
  },
  fujisan: {
    word: "Mount Fuji",
    categoryName: "自然与动物",
    meaning: "富士雪山。举世闻名的完美对称休眠火山，其常年不化的皑皑白雪山头与粉嫩樱花交相辉映，是清雅绝俗与永恒大美的神圣化身。"
  },
  onsen_tamago: {
    word: "Poached Egg",
    categoryName: "西餐美味",
    meaning: "温泉流沙蛋。在温暖天然温泉中经过温和火候久煨而出的软嫩半熟蛋，宛如白玉布丁，裹着流沙般的浓郁蛋黄，入口软滑清香。"
  },
  edamame: {
    word: "Green Soybean",
    categoryName: "西餐美味",
    meaning: "盐水毛豆。在滚热咸水中快火煮熟的翠绿毛豆荚，是和风夏日里最清爽解腻的健康下酒开胃冷盘小食。"
  },
  tanuki: {
    word: "Raccoon Dog",
    categoryName: "自然与动物",
    meaning: "和风福运狸猫。日本古老传说里善于变身的可爱狸猫陶制像，常作为招财化煞、开运亨通的玄关迎客吉祥挂件摆设。"
  },
  wotome: {
    word: "Young Maiden",
    categoryName: "文学与民风",
    meaning: "和歌雅致少女。在日本《万叶集》等古乐民风中，对清丽、纯真而富有生机之大和少女的诗意称誉，代表最古朴天然的青春之美。"
  }
};

export const ENGLISH_OVERLAYS: Record<string, EnglishOverlay> = {
  ...BASE_ENGLISH_OVERLAYS,
  ...CELEBRITY_ENGLISH_OVERLAYS,
  ...KPOP_RIVALRY_ENGLISH_OVERLAYS
};

export function hiraganaToKatakana(str: string): string {
  if (!str) return "";
  return str.replace(/[\u3041-\u3096]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0x60);
  });
}

export function getStoredCustomWords(): DictionaryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("fifty_sound_custom_words");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

export function getDictionary(isEnglishMode: boolean, isKatakanaMode?: boolean): DictionaryItem[] {
  const customItems = getStoredCustomWords();

  if (isEnglishMode) {
    const mappedBase = DICTIONARY.filter(item => !!ENGLISH_OVERLAYS[item.id]).map(item => {
      const overlay = ENGLISH_OVERLAYS[item.id]!;
      
      // Split the English word into segments of individual characters
      const segments = overlay.word.split("").map((char) => {
        const isSpace = char === " ";
        return {
          kana: char,
          romaji: isSpace ? [" "] : [char.toLowerCase()],
          displayRomaji: char,
        };
      });
      
      return {
        ...item,
        kanji: overlay.word,
        kanaStr: overlay.word,
        categoryName: overlay.categoryName,
        meaning: overlay.meaning,
        segments: segments,
      };
    });

    const englishCustoms = customItems.filter(c => (c as any).lang === "en" || /^[a-zA-Z0-9\s\.\,\!\?]+$/.test(c.kanji));
    return [...englishCustoms, ...mappedBase];
  }
  
  if (isKatakanaMode) {
    const convertedBase = DICTIONARY.map(item => {
      const convertedKanaStr = hiraganaToKatakana(item.kanaStr);
      const convertedSegments = item.segments.map(seg => ({
        ...seg,
        kana: hiraganaToKatakana(seg.kana),
      }));
      return {
        ...item,
        kanaStr: convertedKanaStr,
        segments: convertedSegments,
      };
    });

    const convertedCustom = customItems.map(item => ({
      ...item,
      kanaStr: hiraganaToKatakana(item.kanaStr),
      segments: item.segments.map(seg => ({
        ...seg,
        kana: hiraganaToKatakana(seg.kana),
      })),
    }));

    return [...convertedCustom, ...convertedBase];
  }
  
  return [...customItems, ...DICTIONARY];
}

