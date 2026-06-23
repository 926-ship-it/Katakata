export interface KanaSegment {
  kana: string;
  romaji: string[]; // List of acceptable romajis, e.g., ["shi", "si"]
  displayRomaji: string; // The primary romaji displayed to the user
}

export interface DictionaryItem {
  id: string;
  kanji: string;
  kanaStr: string;
  category: "name" | "nature" | "culture" | "food";
  categoryName: string;
  meaning: string;
  rarity: "N" | "R" | "SR" | "SSR";
  rarityName: string;
  glowColor: string; // styling colors for glows
  borderColor: string;
  bgGradient: string;
  segments: KanaSegment[];
}

export const DICTIONARY: DictionaryItem[] = [
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
    kanaStr: "あさ加お", // Fix to exact original さがお for standard spelling
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
  }
];

export interface EnglishOverlay {
  word: string;
  categoryName: string;
  meaning: string;
}

export const ENGLISH_OVERLAYS: Record<string, EnglishOverlay> = {
  sato: {
    word: "Richard",
    categoryName: "English Names",
    meaning: "A classic Germanic name meaning 'brave ruler' or 'powerful leader'. It has been popular for centuries."
  },
  suzuki: {
    word: "William",
    categoryName: "English Names",
    meaning: "A timeless English name of Germanic origin, meaning 'strong-willed warrior' or 'resolute protector'."
  },
  kimura: {
    word: "Chloe",
    categoryName: "English Names",
    meaning: "Of Greek origin meaning 'blooming' or 'young green shoot'. It represents fertility, youth, and freshness."
  },
  tanaka: {
    word: "Jones",
    categoryName: "English Names",
    meaning: "A common and highly respected patronymic surname meaning 'son of John' or 'God is gracious'."
  },
  yamada: {
    word: "Olivia",
    categoryName: "English Names",
    meaning: "A beautiful Latin name meaning 'olive tree', representing peace, fruitfulness, and classic dignity."
  },
  oda: {
    word: "Elizabeth",
    categoryName: "English Names",
    meaning: "A noble Hebrew name meaning 'My God is an oath', held by legendary queens and historic rule makers."
  },
  sakura: {
    word: "Strawberry",
    categoryName: "Nature & Animals",
    meaning: "A sweet, bright-red heart-shaped summer fruit, widely enjoyed fresh and in delicious desserts."
  },
  fuji: {
    word: "Mountain Peak",
    categoryName: "Nature & Animals",
    meaning: "The majestic peak of high ranges, symbolizing strength, endurance, adventure, and panoramic heights."
  },
  aozora: {
    word: "Blue Sky",
    categoryName: "Nature & Animals",
    meaning: "The clear azure sky above, conveying a sense of limitless freedom, joy, and sunny optimism."
  },
  asagao: {
    word: "Morning Glory",
    categoryName: "Nature & Animals",
    meaning: "A gorgeous twining flower that blooms beautifully at dawn, symbol of seasonal rhythms."
  },
  kotone: {
    word: "Melody",
    categoryName: "English Names",
    meaning: "A sweet and pleasing sequence of musical notes that carries deep emotion and creative harmony."
  },
  shiki: {
    word: "Seasons",
    categoryName: "Nature & Animals",
    meaning: "The wonderful annual sequence of spring, summer, autumn, and winter showing nature's life cycle."
  },
  dango: {
    word: "Sweet Cake",
    categoryName: "English Delicacies",
    meaning: "A delicious confection crafted with sugar, flour, and icing, shared at warm birthday gatherings."
  },
  momiji: {
    word: "Maple Leaf",
    categoryName: "Nature & Animals",
    meaning: "The elegant star-shaped autumn leaf colored of brilliant crimson, symbol of fall nature trails."
  },
  daruma: {
    word: "Tumbling Toy",
    categoryName: "Objects & Concepts",
    meaning: "A classic weighted nesting toy that wobbles but never falls down, representing resilience."
  },
  heiwa: {
    word: "Harmony",
    categoryName: "Objects & Concepts",
    meaning: "A serene state of balance, unity, and peaceful cooperation within communities and inner self."
  },
  kabuki: {
    word: "Broadway",
    categoryName: "Objects & Concepts",
    meaning: "A major hub of theatrical excellence, showcasing iconic musical dramas and stellar live acting."
  },
  toyotomi: {
    word: "James",
    categoryName: "English Names",
    meaning: "A popular English name meaning 'supplanter', worn by kings, explorers, and modern achievers."
  },
  tokugawa: {
    word: "Robert",
    categoryName: "English Names",
    meaning: "A classic name of Germanic origin, meaning 'bright fame' or 'shining with glorious reputation'."
  },
  kawabata: {
    word: "Arthur",
    categoryName: "English Names",
    meaning: "An ancient Celtic name meaning 'bear hero' or 'noble stone', associated with the legendary King Arthur."
  },
  miyazaki: {
    word: "Director",
    categoryName: "Objects & Concepts",
    meaning: "The creative mastermind behind films, orchestrating visual flows, character growth, and deep plots."
  },
  sushi: {
    word: "Sushi Rice",
    categoryName: "English Delicacies",
    meaning: "Lightly seasoned gourmet short-grain rice paired with ocean delicacies for a fresh, healthy bite."
  },
  matcha: {
    word: "Green Tea",
    categoryName: "English Delicacies",
    meaning: "A refreshing antioxidant-rich green herbal brew, loved for its calming focus and earthy notes."
  },
  ramen: {
    word: "Spicy Noodles",
    categoryName: "English Delicacies",
    meaning: "Delectable wheat noodles served in steaming aromatic savory broth, topped with tasty seasonings."
  },
  wagashi: {
    word: "Cheesecake",
    categoryName: "English Delicacies",
    meaning: "A rich, creamy, and velvety dessert built over a sweet graham cracker crust, a true favorite."
  },
  sake: {
    word: "bottled water",
    categoryName: "Objects & Concepts",
    meaning: "Pure, filtered fresh drinking water sealed in convenient portable bottles to keep you active and healthy."
  },
  jinja: {
    word: "Cathedral",
    categoryName: "Objects & Concepts",
    meaning: "An architectural masterpiece of sacred gatherings, distinguished by tall arches and stained glass."
  },
  ninja: {
    word: "Shadow Agent",
    categoryName: "Objects & Concepts",
    meaning: "A stealthy special operations agent, known for unparalleled agility, intelligence, and secrecy."
  },
  bushi: {
    word: "Knight",
    categoryName: "Objects & Concepts",
    meaning: "A high-ranking armored warrior of medieval history, bound by strict vows of chivalry and courage."
  },
  bento: {
    word: "Lunch Box",
    categoryName: "Objects & Concepts",
    meaning: "A neatly organized portable container housing multiple partitions of delicious home-cooked meals."
  },
  onsen: {
    word: "Hot Spring",
    categoryName: "Nature & Animals",
    meaning: "A warm, geothermal spring rich in soothing minerals, perfect for outdoor muscular relaxation."
  },
  hotaru: {
    word: "Firefly",
    categoryName: "Nature & Animals",
    meaning: "A tiny soft-bodied beetle that flashes beautiful yellow-green bioluminescent signals in summer nights."
  },
  semi: {
    word: "Cicada",
    categoryName: "Nature & Animals",
    meaning: "A high-pitched summer insect that sings vibrant songs from tall outdoor trees during peak seasons."
  },
  haiku: {
    word: "Poetry",
    categoryName: "Objects & Concepts",
    meaning: "An expressive artistic arrange of words, rhythm, and rich metaphors to evoke emotions."
  },
  torii: {
    word: "Gateway",
    categoryName: "Objects & Concepts",
    meaning: "An entrance frame separating different areas, welcoming tourists and visitors to beautiful parks."
  },
  hanabi: {
    word: "Fireworks",
    categoryName: "Nature & Animals",
    meaning: "Visual aerial displays of colors and thunders launched to celebrate holidays and summer festivals."
  },
  soba: {
    word: "Buckwheat",
    categoryName: "English Delicacies",
    meaning: "A highly nutritious grain used to make delicious breakfast foods and traditional noodles."
  },
  tempura: {
    word: "Fried Shrimp",
    categoryName: "English Delicacies",
    meaning: "Crispy, golden-panko coated jumbo shrimp, fried to perfect tender crunchiness."
  },
  takoyaki: {
    word: "Octopus Ball",
    categoryName: "English Delicacies",
    meaning: "A savory sphere of wheat batter featuring a tender piece of saltwater octopus, baked on hot pans."
  },
  mochi: {
    word: "Rice Cake",
    categoryName: "English Delicacies",
    meaning: "A delightfully chewy, sweet, and soft steamed flour treat, usually filled with sweet paste."
  },
  gohan: {
    word: "Steamed Rice",
    categoryName: "English Delicacies",
    meaning: "The fundamental standard grain cooked with hot steam, soft, fluffy, and perfect with any dish."
  },
  yukata: {
    word: "Summer Dress",
    categoryName: "Objects & Concepts",
    meaning: "A light, breezy cotton garment worn during sunny outdoor leisure activities and warm picnics."
  },
  matsuri: {
    word: "Carnival",
    categoryName: "Objects & Concepts",
    meaning: "A lively, energetic outdoor fair featuring musical bands, giant rides, games, and candy floss."
  },
  geisha: {
    word: "Dancer",
    categoryName: "Objects & Concepts",
    meaning: "A performing artist who tells powerful historical stories through stylized, expressive bodily motions."
  },
  origami: {
    word: "Paper Craft",
    categoryName: "Objects & Concepts",
    meaning: "The creative, calming craft of folding colored square papers into birds, stars, and shapes."
  },
  kimono: {
    word: "Silk Gown",
    categoryName: "Objects & Concepts",
    meaning: "A luxurious ceremonial robe crafted from premium silk fabrics, worn on highly formal stages."
  },
  tsuki: {
    word: "Silver Moon",
    categoryName: "Nature & Animals",
    meaning: "The glowing celestial sphere that brightens the dark night sky, inspiring bedtime dreamers."
  },
  yuki: {
    word: "Snowflake",
    categoryName: "Nature & Animals",
    meaning: "A single, exquisitely symmetric ice crystal falling silently from grey clouds in beautiful winters."
  },
  kaze: {
    word: "Gentle Breeze",
    categoryName: "Nature & Animals",
    meaning: "A cool, light movement of air that softly rustles the green forest leaves on warm afternoons."
  },
  shiba: {
    word: "Puppy Dog",
    categoryName: "Nature & Animals",
    meaning: "A loyal, energetic, and highly playful companion with furry ears and a wagging tail."
  }
};

export function getDictionary(isEnglishMode: boolean): DictionaryItem[] {
  if (!isEnglishMode) {
    return DICTIONARY;
  }
  
  return DICTIONARY.map(item => {
    const overlay = ENGLISH_OVERLAYS[item.id];
    if (!overlay) return item;
    
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
}

