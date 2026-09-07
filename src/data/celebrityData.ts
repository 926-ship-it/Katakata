import type { DictionaryItem, EnglishOverlay } from "./dictionary";

export const CELEBRITY_DICTIONARY: DictionaryItem[] = [
  {
    id: "aragaki_yui",
    kanji: "新垣結衣",
    kanaStr: "あらがきゆい",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本国民女神级演员与歌手。以治愈系笑容与自然灵动的演技闻名，主演《逃避虽可耻但有用》《恋空》《Legal High》等现象级影视作品。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" }
    ]
  },
  {
    id: "yonezu_kenshi",
    kanji: "米津玄師",
    kanaStr: "よねづけんし",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本现象级音乐巨匠、创作歌手兼插画家。早年以‘八王子P/Hachi’活跃于Vocaloid界，代表作《Lemon》《KICK BACK》《感电》席卷全球音乐榜单。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "よ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "ね", romaji: ["ne"], displayRomaji: "ne" },
      { kana: "づ", romaji: ["zu", "du"], displayRomaji: "zu" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" }
    ]
  },
  {
    id: "hoshino_gen",
    kanji: "星野源",
    kanaStr: "ほしのげん",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本全才创作歌手、演员兼作家。兼具深厚复古放克乐素养与亲和力，代表作《恋》（恋舞风靡全日本）及动画《间谍过家家》片尾曲《喜剧》。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "ほ", romaji: ["ho"], displayRomaji: "ho" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "の", romaji: ["no"], displayRomaji: "no" },
      { kana: "げ", romaji: ["ge"], displayRomaji: "ge" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "hashimoto_kanna",
    kanji: "橋本環奈",
    kanaStr: "はしもとかんな",
    category: "name",
    categoryName: "热门名人",
    meaning: "被誉为‘千年一遇美少女’的超人气演员。凭借漫改电影《银魂》神乐、《辉夜大小姐想让我告白》中放飞自我的敬业演技与超凡可爱风靡全网。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "も", romaji: ["mo"], displayRomaji: "mo" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" }
    ]
  },
  {
    id: "kimura_takuya",
    kanji: "木村拓哉",
    kanaStr: "きむらたくや",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本平成时代的日剧收视天王、传奇国民偶像组合SMAP核心成员。主演《悠长假期》《恋爱世纪》《HERO》等无数影史经典，是全亚洲时尚潮流风向标。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "む", romaji: ["mu"], displayRomaji: "mu" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" }
    ]
  },
  {
    id: "satoh_takeru",
    kanji: "佐藤健",
    kanaStr: "さとうたける",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本实力派顶流男演员。凭借《假面骑士电王》崭露头角，在电影《浪客剑心》系列中贡献了惊艳的无替身冷兵器动作戏，更以《将恋爱进行到底》圈粉无数。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" }
    ]
  },
  {
    id: "ishihara_satomi",
    kanji: "石原さとみ",
    kanaStr: "いしはらさとみ",
    category: "name",
    categoryName: "热门名人",
    meaning: "超高人气国民女演员、当代亚洲女性时尚风向标。主演《非自然死亡》（Unnatural）斩获极高赞誉，代表作还包括《失恋巧克力职人》《校阅女孩河野悦子》。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "suda_masaki",
    kanji: "菅田将暉",
    kanaStr: "すだまさき",
    category: "name",
    categoryName: "热门名人",
    meaning: "影帝级鬼才演员兼实力派歌手。日本电影学院奖最年轻最佳男主角得主之一，演技亦正亦邪，代表作《花束般的恋爱》《溺水小刀》《勿言推理》及金曲《红花火》。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "ootani_shouhei",
    kanji: "大谷翔平",
    kanaStr: "おおたにしょうへい",
    category: "name",
    categoryName: "热门名人",
    meaning: "世界级棒球超级巨星、MLB现代‘投打二刀流’奇迹创造者。以全票MVP、世界大赛冠军与超越常人的自律品质风靡全球体育界与跨界大众。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "に", romaji: ["ni"], displayRomaji: "ni" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "へ", romaji: ["he"], displayRomaji: "he" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" }
    ]
  },
  {
    id: "hanyuu_yuzuru",
    kanji: "羽生結弦",
    kanaStr: "はにゅうゆづる",
    category: "name",
    categoryName: "热门名人",
    meaning: "冬奥会男子单人滑两连冠传奇、花样滑冰GOAT历史王者。兼具强悍跳跃技术与空灵优雅的冰上艺术美感，全球粉丝无数的‘冰上王子’。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "に", romaji: ["ni"], displayRomaji: "ni" },
      { kana: "ゅ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "づ", romaji: ["zu", "du"], displayRomaji: "zu" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" }
    ]
  },
  {
    id: "hamabe_minami",
    kanji: "浜辺美波",
    kanaStr: "はまべみなみ",
    category: "name",
    categoryName: "热门名人",
    meaning: "新生代实力清纯花旦。因主演感人电影《念念手纪》一举成名，在《哥斯拉-1.0》《狂赌之渊》等影片中展现出跨度极广的精彩演技。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "べ", romaji: ["be"], displayRomaji: "be" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "komatsu_nana",
    kanji: "小松菜奈",
    kanaStr: "こまつなな",
    category: "name",
    categoryName: "热门名人",
    meaning: "以标志性‘高级厌世脸’风靡国际时尚圈的顶级超模兼实力派女演员。代表作《渴望》《溺水小刀》《余命10年》，气质独树一帜。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "つ", romaji: ["tsu", "tu"], displayRomaji: "tsu" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" }
    ]
  },
  {
    id: "yamazaki_kento",
    kanji: "山崎賢人",
    kanaStr: "やまざきけんと",
    category: "name",
    categoryName: "热门名人",
    meaning: "被称为‘漫改小王子’的日本顶流男演员。主演Netflix现象级日剧《今际之国的闯关者》、大热漫改电影《王者天下》系列，在海外亦享有极高声誉。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "ざ", romaji: ["za"], displayRomaji: "za" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" }
    ]
  },
  {
    id: "aimyon",
    kanji: "あいみょん",
    kanaStr: "あいみょん",
    category: "name",
    categoryName: "热门名人",
    meaning: "平成出生的日本民谣摇滚创作新天后。以平实动人的歌词与极富感染力的吉他弹唱深入人心，代表作《金盏花》《春日》《将你解剖成五瓣》。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "fujii_kaze",
    kanji: "藤井風",
    kanaStr: "ふじいかぜ",
    category: "name",
    categoryName: "热门名人",
    meaning: "国际爆红的日本天才新星音乐人兼钢琴家。融合R&B、爵士与日本传统音律，代表作《死ぬのがいいわ》（宁愿去死）在TikTok席卷全球几十国排行榜首。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "ふ", romaji: ["fu", "hu"], displayRomaji: "fu" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "ぜ", romaji: ["ze"], displayRomaji: "ze" }
    ]
  },
  {
    id: "ikuta_rira",
    kanji: "幾田りら",
    kanaStr: "いくたりら",
    category: "name",
    categoryName: "热门名人",
    meaning: "超人气音乐双人组YOASOBI的主唱（艺名ikura），亦是优秀的个人创作歌手。拥有穿透力极强、宛若被天使亲吻过的透明感清亮嗓音。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "ayase",
    kanji: "Ayase",
    kanaStr: "あやせ",
    category: "name",
    categoryName: "热门名人",
    meaning: "现象级组合YOASOBI的音乐制作人核心、知名Vocaloid P主。以《夜に駆ける》（向夜晚奔去）和全球播放冠军神曲《アイドル》（IDOL）震撼全球乐坛。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "せ", romaji: ["se"], displayRomaji: "se" }
    ]
  },
  {
    id: "hikakin",
    kanji: "HIKAKIN",
    kanaStr: "ひかきん",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本YouTube界第一人、传奇顶流网红创作者。从Beatbox玩家起步，以健康风趣的视频风格、巨额慈善捐助与超级亲民形象成为全国家喻户晓的网络偶像。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "hajimeshachou",
    kanji: "はじめしゃちょー",
    kanaStr: "はじめしゃちょう",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本YouTube顶流超人气创作者（初社长）。以天马行空的大型实验、幽默挑战与超强行动力著称，频道订阅数突破千万，引领了日本年轻人的流行文化。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "め", romaji: ["me"], displayRomaji: "me" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ゃ", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "ち", romaji: ["chi", "ti"], displayRomaji: "chi" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "houshou_marin",
    kanji: "宝鐘マリン",
    kanaStr: "ほうしょうまりん",
    category: "name",
    categoryName: "热门名人",
    meaning: "超高人气顶流VTuber（宝钟玛琳/船长）。以风趣幽默的脱口秀杂谈、高水准绘画才能及全网播放量破亿的原创单曲《美少女无罪♡パイレーツ》风靡海内外。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "ほ", romaji: ["ho"], displayRomaji: "ho" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "usada_pekora",
    kanji: "兎田ぺこら",
    kanaStr: "うさだぺこら",
    category: "name",
    categoryName: "热门名人",
    meaning: "全球女性主播观看时长排名前列的顶流VTuber（兔田佩克拉）。以标志性的‘Peko’口癖、魔性笑声与高超的游戏直播综艺感吸引了数百万观众。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "ぺ", romaji: ["pe"], displayRomaji: "pe" },
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" }
    ]
  },
  {
    id: "yoshizawa_ryou",
    kanji: "吉沢亮",
    kanaStr: "よしざわりょう",
    category: "name",
    categoryName: "热门名人",
    meaning: "被评为‘国宝级帅哥第一名’的实力派男演员。主演NHK大河剧《青天征途》获极高好评，在漫改电影《东京复仇者》饰演无敌的Mikey深入人心。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "よ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ざ", romaji: ["za"], displayRomaji: "za" },
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "meguro_ren",
    kanji: "目黒蓮",
    kanaStr: "めぐろれん",
    category: "name",
    categoryName: "热门名人",
    meaning: "超人气男团Snow Man核心成员、当代现象级男演员。主演大热纯爱剧《Silent》引发全社会手语讨论热潮，主演电影《我的幸福婚约》票房大爆。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "め", romaji: ["me"], displayRomaji: "me" },
      { kana: "ぐ", romaji: ["gu"], displayRomaji: "gu" },
      { kana: "ろ", romaji: ["ro"], displayRomaji: "ro" },
      { kana: "れ", romaji: ["re"], displayRomaji: "re" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "michieda_shunsuke",
    kanji: "道枝駿佑",
    kanaStr: "みちえだしゅんすけ",
    category: "name",
    categoryName: "热门名人",
    meaning: "男团‘浪花男子’门面担当、被誉为‘千年一遇美少年’的顶流偶像与演员。主演校园热剧《消失的初恋》与纯爱催泪电影《即使在这份恋情从世界上消失》。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "ち", romaji: ["chi", "ti"], displayRomaji: "chi" },
      { kana: "え", romaji: ["e"], displayRomaji: "e" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ゅ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" }
    ]
  },
  {
    id: "utada_hikaru",
    kanji: "宇多田ヒカル",
    kanaStr: "うただひかる",
    category: "name",
    categoryName: "热门名人",
    meaning: "亚洲流行音乐史上里程碑级的传奇歌姬。首张专辑《First Love》创下日本影音史上最高销量纪录（超765万张），代表作《One Last Kiss》等无数传世经典。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" }
    ]
  },
  {
    id: "amuro_namie",
    kanji: "安室奈美恵",
    kanaStr: "あむろなみえ",
    category: "name",
    categoryName: "热门名人",
    meaning: "平成时代无可撼动的流行乐天后与时尚女王，掀起‘安室现象’。以非凡的唱跳实力与优雅自律的传奇生涯影响了跨越代际的亿万歌迷。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "む", romaji: ["mu"], displayRomaji: "mu" },
      { kana: "ろ", romaji: ["ro"], displayRomaji: "ro" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "え", romaji: ["e"], displayRomaji: "e" }
    ]
  },
  {
    id: "sakamoto_ryuuichi",
    kanji: "坂本龍一",
    kanaStr: "さかもとりゅういち",
    category: "name",
    categoryName: "热门名人",
    meaning: "世界殿堂级音乐教父、先锋乐团YMO核心成员兼奥斯卡最佳原创配乐得主（教授）。代表作《圣诞快乐，劳伦斯先生》《末代皇帝》响彻人类音乐殿堂。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "も", romaji: ["mo"], displayRomaji: "mo" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ゅ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "ち", romaji: ["chi", "ti"], displayRomaji: "chi" }
    ]
  },
  {
    id: "hisaishi_jou",
    kanji: "久石譲",
    kanaStr: "ひさいしじょう",
    category: "name",
    categoryName: "热门名人",
    meaning: "享誉全球的传奇电影配乐大师、吉卜力工作室宫崎骏电影的灵魂伴侣。创作了《千与千寻》《龙猫》《哈尔的移动城堡》《菊次郎的夏天》等不朽旋律。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "じ", romaji: ["ji", "zi"], displayRomaji: "ji" },
      { kana: "ょ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "nakamori_akina",
    kanji: "中森明菜",
    kanaStr: "なかもりあきな",
    category: "name",
    categoryName: "热门名人",
    meaning: "昭和时代巅峰传奇歌姬、元祖元气与叛逆并存的百变偶像。以低沉极具穿透力的磁性嗓音与绝美舞台台风震撼乐坛，代表作《难破船》《少女A》《DESIRE》。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "も", romaji: ["mo"], displayRomaji: "mo" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" }
    ]
  },
  {
    id: "shiina_ringo",
    kanji: "椎名林檎",
    kanaStr: "しいなりんご",
    category: "name",
    categoryName: "热门名人",
    meaning: "被称为‘苹果女王’的日本先锋音乐教母、摇滚乐队‘东京事变’核心。以独特复古唱腔、浓郁的和风美学与天马行空的编曲享誉国际。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "ご", romaji: ["go"], displayRomaji: "go" }
    ]
  },
  {
    id: "ayase_haruka",
    kanji: "綾瀬はるか",
    kanaStr: "あやせはるか",
    category: "name",
    categoryName: "热门名人",
    meaning: "常年位居日本国民好感度榜首的实力派一线女演员。在《白夜行》《萤之光》《仁医》《继母与女儿的蓝调》等剧中塑造了深入人心的丰富形象。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" }
    ]
  },
  {
    id: "nagasawa_masami",
    kanji: "長澤まさみ",
    kanaStr: "ながさわまさみ",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本东宝甜心出身的顶级实力派影后。从《在世界中心呼唤爱》《求婚大作战》的纯美初恋，到《信用诈欺师JP》《母亲》中极具爆发力的演技，魅力无限。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "な", romaji: ["na"], displayRomaji: "na" },
      { kana: "が", romaji: ["ga"], displayRomaji: "ga" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "sakaguchi_kentarou",
    kanji: "坂口健太郎",
    kanaStr: "さかぐちけんたろう",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本‘盐系男神’代表人物、MEN'S NON-NO专属模特出身的一线男演员。代表作《与你的第100次恋爱》《信号》《余命10年》，气质温润清朗。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "ぐ", romaji: ["gu"], displayRomaji: "gu" },
      { kana: "ち", romaji: ["chi", "ti"], displayRomaji: "chi" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "ろ", romaji: ["ro"], displayRomaji: "ro" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "yokohama_ryuusei",
    kanji: "横浜流星",
    kanaStr: "よこはまりゅうせい",
    category: "name",
    categoryName: "热门名人",
    meaning: "极真空手道世界青少年冠军出身的顶流实力派青年男演员。凭借《初恋那一天所读的故事》粉发由利一炮而红，身手凌厉，主演大河剧备受瞩目。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "よ", romaji: ["yo"], displayRomaji: "yo" },
      { kana: "こ", romaji: ["ko"], displayRomaji: "ko" },
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ゅ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" }
    ]
  },
  {
    id: "kitamura_takumi",
    kanji: "北村匠海",
    kanaStr: "きたむらたくみ",
    category: "name",
    categoryName: "热门名人",
    meaning: "摇滚乐队DISH//主唱兼实力派青年男演员。以代表作《我想吃掉你的胰脏》斩获新人大奖，其演唱的单曲《猫》突破数亿播放量，主演《东京复仇者》《幽游白书》。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "む", romaji: ["mu"], displayRomaji: "mu" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "kamiki_ryuunosuke",
    kanji: "神木隆之介",
    kanaStr: "かみきりゅうのすけ",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本国民级童星出身的天才男演员与声优。为吉卜力《千与千寻》《哈尔的移动城堡》配音，主演新海诚百亿动画《你的名字。》男主泷，及《哥斯拉-1.0》主角。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "ゅ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "の", romaji: ["no"], displayRomaji: "no" },
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" }
    ]
  },
  {
    id: "fukuyama_masaharu",
    kanji: "福山雅治",
    kanaStr: "ふくやままさはる",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本‘不老男神’殿堂级唱作歌手、演员兼摄影师。主演经典破案剧《神探伽利略》汤川学教授，其创作金曲《成为一家人吧》《樱坂》传唱数十载。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "ふ", romaji: ["fu", "hu"], displayRomaji: "fu" },
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "は", romaji: ["ha"], displayRomaji: "ha" },
      { kana: "る", romaji: ["ru"], displayRomaji: "ru" }
    ]
  },
  {
    id: "sakai_masato",
    kanji: "堺雅人",
    kanaStr: "さかいまさと",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本神级演技派巨星。以标志性的面部表情与超强长台词功底著称，主演的《半泽直树》创下平成日剧单集收视率最高神话，主演《Legal High》古美门研介深入人心。",
    rarity: "SSR",
    rarityName: "神珍 (SSR)",
    glowColor: "rgba(217, 119, 6, 0.6)",
    borderColor: "border-amber-500 border-2 shadow-amber-500/80 animate-pulse",
    bgGradient: "from-amber-50 to-yellow-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    segments: [
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" }
    ]
  },
  {
    id: "oguri_shun",
    kanji: "小栗旬",
    kanaStr: "おぐりしゅん",
    category: "name",
    categoryName: "热门名人",
    meaning: "跨时代的漫改男神、极具领袖气质的知名实力演员。代表作《热血高校》泷谷源治、《花样男子》花泽类、《银魂》坂田银时，气场强大深受爱戴。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "ぐ", romaji: ["gu"], displayRomaji: "gu" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ゅ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "ん", romaji: ["n"], displayRomaji: "n" }
    ]
  },
  {
    id: "abe_hiroshi",
    kanji: "阿部寛",
    kanaStr: "あべひろし",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本影坛兼具深沉气魄与冷面喜感的高大影帝。主演《不能结婚的男人》《龙樱》《新参者》《罗马浴场》等经典，个人官方主页以‘加载速度极快’成为网络名梗。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "べ", romaji: ["be"], displayRomaji: "be" },
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "ろ", romaji: ["ro"], displayRomaji: "ro" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" }
    ]
  },
  {
    id: "amami_yuuki",
    kanji: "天海祐希",
    kanaStr: "あまみゆうき",
    category: "name",
    categoryName: "热门名人",
    meaning: "宝冢歌剧团史上最年轻TOP男役退团巨星、日本‘职场女王’专业户演员。代表作《女王的教室》《紧急审讯室》《离婚女律师》，英气飒爽、自信独立。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "aoi_yuu",
    kanji: "蒼井優",
    kanaStr: "あおいゆう",
    category: "name",
    categoryName: "热门名人",
    meaning: "亚洲‘森女风’开山鼻祖、国际影坛备受赞誉的实力派女演员。主演岩井俊二《花与爱丽丝》《关于莉莉周的一切》及大奖电影《扶桑花女孩》，气质清新自然。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "お", romaji: ["o"], displayRomaji: "o" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "ゆ", romaji: ["yu"], displayRomaji: "yu" },
      { kana: "う", romaji: ["u"], displayRomaji: "u" }
    ]
  },
  {
    id: "mitsushima_hikari",
    kanji: "満島ひかり",
    kanaStr: "みつしまひかり",
    category: "name",
    categoryName: "热门名人",
    meaning: "具有超凡艺术感染力与灵气的实力派影后。主演坂元裕二名剧《四重奏》《尽管如此 也要活下去》及Netflix现象级催泪爱情剧《First Love 初恋》。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "つ", romaji: ["tsu", "tu"], displayRomaji: "tsu" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" }
    ]
  },
  {
    id: "arimura_kasumi",
    kanji: "有村架純",
    kanaStr: "ありむらかすみ",
    category: "name",
    categoryName: "热门名人",
    meaning: "治愈系国民女演员、日本电影学院奖影后。凭借励志电影《垫底辣妹》与纯爱神作《花束般的恋爱》赢得极高国民支持度，温柔明亮的笑容深入人心。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "り", romaji: ["ri"], displayRomaji: "ri" },
      { kana: "む", romaji: ["mu"], displayRomaji: "mu" },
      { kana: "ら", romaji: ["ra"], displayRomaji: "ra" },
      { kana: "か", romaji: ["ka"], displayRomaji: "ka" },
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" }
    ]
  },
  {
    id: "hirose_suzu",
    kanji: "広瀬すず",
    kanaStr: "ひろせすず",
    category: "name",
    categoryName: "热门名人",
    meaning: "新生代领军女演员。16岁被名导是枝裕和发掘出演《海街日记》一鸣惊人，主演漫改电影《花牌情缘》系列与《流浪之月》，灵动透明的眼眸极具感染力。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "ろ", romaji: ["ro"], displayRomaji: "ro" },
      { kana: "せ", romaji: ["se"], displayRomaji: "se" },
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "ず", romaji: ["zu", "du"], displayRomaji: "zu" }
    ]
  },
  {
    id: "imada_mio",
    kanji: "今田美桜",
    kanaStr: "いまだみお",
    category: "name",
    categoryName: "热门名人",
    meaning: "被誉为‘福冈第一可爱美少女’的当代顶流年轻女演员兼模特。主演大女主职场剧《恶女～谁说工作不酷的？～》与奇幻纯爱剧《我的幸福婚约》。",
    rarity: "R",
    rarityName: "稀有 (R)",
    glowColor: "rgba(14, 165, 233, 0.25)",
    borderColor: "border-sky-300",
    bgGradient: "from-sky-50 to-indigo-100",
    segments: [
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "み", romaji: ["mi"], displayRomaji: "mi" },
      { kana: "お", romaji: ["o"], displayRomaji: "o" }
    ]
  },
  {
    id: "ado",
    kanji: "Ado",
    kanaStr: "あど",
    category: "name",
    categoryName: "热门名人",
    meaning: "未公开真容的现象级天才歌姬。以17岁首发单曲《うっせぇわ》（吵死啦）引爆全球网络，更作为《ONE PIECE FILM RED》乌塔角色歌姬展开万人世界巡演。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "あ", romaji: ["a"], displayRomaji: "a" },
      { kana: "ど", romaji: ["do"], displayRomaji: "do" }
    ]
  },
  {
    id: "tsuneta_daiki",
    kanji: "常田大希",
    kanaStr: "つねただいき",
    category: "name",
    categoryName: "热门名人",
    meaning: "先锋摇滚乐队King Gnu领袖兼大提琴手、前卫音乐厂牌millennium parade创始人。以《白日》《一途》《SPECIALZ》等重塑了现代J-Pop与摇滚格局。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "つ", romaji: ["tsu", "tu"], displayRomaji: "tsu" },
      { kana: "ね", romaji: ["ne"], displayRomaji: "ne" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "だ", romaji: ["da"], displayRomaji: "da" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "き", romaji: ["ki"], displayRomaji: "ki" }
    ]
  },
  {
    id: "kuwata_keisuke",
    kanji: "桑田佳祐",
    kanaStr: "くわたけいすけ",
    category: "name",
    categoryName: "热门名人",
    meaning: "日本国民殿堂级摇滚乐队‘南方之星’灵魂主唱兼词曲作者。以其沙哑深情的嗓音和海滨夏日风情谱写了《TSUNAMI》《白色恋人们》等无数传世经典。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "く", romaji: ["ku"], displayRomaji: "ku" },
      { kana: "わ", romaji: ["wa"], displayRomaji: "wa" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" },
      { kana: "い", romaji: ["i"], displayRomaji: "i" },
      { kana: "す", romaji: ["su"], displayRomaji: "su" },
      { kana: "け", romaji: ["ke"], displayRomaji: "ke" }
    ]
  },
  {
    id: "yamashita_tomohisa",
    kanji: "山下智久",
    kanaStr: "やましたともひさ",
    category: "name",
    categoryName: "热门名人",
    meaning: "粉丝昵称‘山P’的跨时代巨星偶像与国际演员。主演《野猪大改造》《求婚大作战》《Code Blue紧急救命》等经典日剧，并参演《神之水滴》《今际之国的闯关者2》走向国际。",
    rarity: "SR",
    rarityName: "卓越 (SR)",
    glowColor: "rgba(168, 85, 247, 0.4)",
    borderColor: "border-purple-400 border-2 shadow-purple-300",
    bgGradient: "from-purple-50 to-violet-100",
    segments: [
      { kana: "や", romaji: ["ya"], displayRomaji: "ya" },
      { kana: "ま", romaji: ["ma"], displayRomaji: "ma" },
      { kana: "し", romaji: ["shi", "si"], displayRomaji: "shi" },
      { kana: "た", romaji: ["ta"], displayRomaji: "ta" },
      { kana: "と", romaji: ["to"], displayRomaji: "to" },
      { kana: "も", romaji: ["mo"], displayRomaji: "mo" },
      { kana: "ひ", romaji: ["hi"], displayRomaji: "hi" },
      { kana: "さ", romaji: ["sa"], displayRomaji: "sa" }
    ]
  }
];

export const CELEBRITY_ENGLISH_OVERLAYS: Record<string, EnglishOverlay> = {
  aragaki_yui: {
    word: "Taylor Swift",
    categoryName: "流行巨星",
    meaning: "泰勒·斯威夫特。全球流行音乐天后，时代巡回演唱会（The Eras Tour）打破影史与演出纪录，四度斩获格莱美最高荣誉年度专辑奖。"
  },
  yonezu_kenshi: {
    word: "Billie Eilish",
    categoryName: "流行巨星",
    meaning: "碧梨·艾利什。千禧一代天才先锋创作巨星，以空灵独特的暗黑唱腔与电影配乐横扫多届格莱美与奥斯卡最佳原创歌曲大奖。"
  },
  hoshino_gen: {
    word: "Bruno Mars",
    categoryName: "流行巨星",
    meaning: "布鲁诺·马尔斯（火星哥）。多项格莱美奖得主，当代放克、复古流行与R&B天王，拥有《Uptown Funk》《That's What I Like》等传世金曲。"
  },
  hashimoto_kanna: {
    word: "Ariana Grande",
    categoryName: "流行巨星",
    meaning: "爱莉安娜·格兰德（A妹）。拥有宽广海豚音音域的全球超人气歌后与演员，代表作《7 rings》《thank u, next》《positions》。"
  },
  kimura_takuya: {
    word: "Leonardo DiCaprio",
    categoryName: "影视巨星",
    meaning: "莱昂纳多·迪卡普里奥。奥斯卡影帝、好莱坞殿堂级男星，代表作《泰坦尼克号》《盗梦空间》《荒野猎人》《华尔街之狼》。"
  },
  satoh_takeru: {
    word: "Timothee Chalamet",
    categoryName: "影视巨星",
    meaning: "提莫西·查拉梅（甜茶）。好莱坞新生代男星领军人物，代表作《沙丘》系列、《旺卡》《请以你的名字呼唤我》，魅力席卷全球。"
  },
  ishihara_satomi: {
    word: "Zendaya",
    categoryName: "影视巨星",
    meaning: "赞达亚。艾美奖史上最年轻视后、全球时尚与红毯领潮Icon，代表作《亢奋》《蜘蛛侠》《沙丘》《挑战者》。"
  },
  suda_masaki: {
    word: "Harry Styles",
    categoryName: "流行巨星",
    meaning: "哈里·斯泰尔斯。流行摇滚唱作巨星兼时尚先锋，以现象级单曲《As It Was》与专辑《Harry's House》打破全球多项流媒体榜单纪录。"
  },
  ootani_shouhei: {
    word: "Lionel Messi",
    categoryName: "体坛巨星",
    meaning: "利昂内尔·梅西。当代足坛球王、八届金球奖得主与世界杯冠军得主，全球体坛最受尊敬与爱戴的传奇超级偶像。"
  },
  hanyuu_yuzuru: {
    word: "Cristiano Ronaldo",
    categoryName: "体坛巨星",
    meaning: "克里斯蒂亚诺·罗纳尔多（C罗）。世界足球史上进球最多的传奇巨星、五届金球奖得主，全球社交网络粉丝第一人。"
  },
  hamabe_minami: {
    word: "Olivia Rodrigo",
    categoryName: "流行巨星",
    meaning: "奥利维亚·罗德里戈。格莱美最佳新人流行朋克天才唱作人，以《drivers license》《vampire》引爆全球青年共鸣。"
  },
  komatsu_nana: {
    word: "Dua Lipa",
    categoryName: "流行巨星",
    meaning: "杜阿·利帕（啪姐）。当代英伦复古迪斯科流行天后，三届格莱美奖得主，代表作《Levitating》《Don't Start Now》《Dance The Night》。"
  },
  yamazaki_kento: {
    word: "Tom Holland",
    categoryName: "影视巨星",
    meaning: "汤姆·赫兰德（荷兰弟）。漫威电影宇宙超级英雄‘蜘蛛侠’扮演者，好莱坞极具活力与人气的青年巨星。"
  },
  aimyon: {
    word: "Sabrina Carpenter",
    categoryName: "流行巨星",
    meaning: "萨布丽娜·卡彭特。当下炙手可热的现象级甜心歌后，以夏日爆款神曲《Espresso》《Please Please Please》领跑全球热榜。"
  },
  fujii_kaze: {
    word: "The Weeknd",
    categoryName: "流行巨星",
    meaning: "盆栽哥（威肯）。全球超级碗中场秀主秀巨星，当代流行R&B天王，拥有史诗级热单《Blinding Lights》《Starboy》。"
  },
  ikuta_rira: {
    word: "Selena Gomez",
    categoryName: "流行巨星",
    meaning: "赛琳娜·戈麦斯。全球顶流流行女歌手、演员、制片人兼Rare Beauty品牌创始人，社交媒体极具影响力的治愈偶像。"
  },
  ayase: {
    word: "Post Malone",
    categoryName: "流行巨星",
    meaning: "波斯特·马龙。多张钻石单曲认证的流行嘻哈与摇滚唱作巨星，代表作《Circles》《Sunflower》《Rockstar》。"
  },
  hikakin: {
    word: "MrBeast",
    categoryName: "网络红人",
    meaning: "野兽先生（吉米·唐纳森）。全球订阅量第一的超级网络视频创作者，以巨额慈善公益、天马行空的极限创意挑战风靡全网。"
  },
  hajimeshachou: {
    word: "PewDiePie",
    categoryName: "网络红人",
    meaning: "皮尤迪派（菲利克斯·谢尔贝里）。全球YouTube元老级顶流网络博主，开创了现代游戏实况与幽默互动视频的黄金时代。"
  },
  houshou_marin: {
    word: "Charli DAmelio",
    categoryName: "网络红人",
    meaning: "查莉·达梅里奥。全球TikTok第一代现象级短视频超级网红与舞者，引领了Z世代社交网络短视频潮流。"
  },
  usada_pekora: {
    word: "Khaby Lame",
    categoryName: "网络红人",
    meaning: "卡比·莱姆。全球TikTok粉丝量第一的超级网络红人，以标志性‘摊手’无声幽默解构繁琐生活难题而闻名世界。"
  },
  yoshizawa_ryou: {
    word: "Pedro Pascal",
    categoryName: "影视巨星",
    meaning: "佩德罗·帕斯卡。好莱坞顶流硬汉演员，代表作《曼达洛人》《最后生还者》《权力的游戏》，被誉为全球互联网最具魅力的男神之一。"
  },
  meguro_ren: {
    word: "Austin Butler",
    categoryName: "影视巨星",
    meaning: "奥斯汀·巴特勒。金球奖最佳男主角得主、好莱坞极具魅力的实力派男演员，代表作《猫王》《沙丘2》。"
  },
  michieda_shunsuke: {
    word: "Jacob Elordi",
    categoryName: "影视巨星",
    meaning: "雅各布·艾洛蒂。好莱坞超人气新生代型男演员，凭借在《亢奋》《普瑞希拉》《萨特本》中的精湛表现风靡全球。"
  },
  utada_hikaru: {
    word: "Beyonce",
    categoryName: "流行巨星",
    meaning: "碧昂丝（Queen Bey）。格莱美历史上斩获最多奖杯的音乐女皇，全球流行文化与女性力量的绝对象征。"
  },
  amuro_namie: {
    word: "Rihanna",
    categoryName: "流行巨星",
    meaning: "蕾哈娜。超级碗中场秀传奇歌后与Fenty商业帝国创始人，坐拥无数冠单的全球流行与时尚女王。"
  },
  sakamoto_ryuuichi: {
    word: "Hans Zimmer",
    categoryName: "音乐巨匠",
    meaning: "汉斯·季默。奥斯卡最佳原创配乐大师，好莱坞史诗级配乐教父，代表作《星际穿越》《沙丘》《狮子王》《盗梦空间》。"
  },
  hisaishi_jou: {
    word: "John Williams",
    categoryName: "音乐巨匠",
    meaning: "约翰·威廉姆斯。影史最伟大的配乐巨匠，五座奥斯卡得主，为《星球大战》《哈利·波特》《侏罗纪公园》谱写出永恒旋律。"
  },
  nakamori_akina: {
    word: "Lady Gaga",
    categoryName: "流行巨星",
    meaning: "嘎嘎小姐。坐拥格莱美与奥斯卡的百变流行天后与实力派演员，以极具爆发力的声线和先锋艺术闻名于世。"
  },
  shiina_ringo: {
    word: "Lana Del Rey",
    categoryName: "流行巨星",
    meaning: "打雷姐（拉娜·德雷）。当代诗意巴洛克流行与暗黑慢核美学天后，代表作《Summertime Sadness》《Video Games》。"
  },
  ayase_haruka: {
    word: "Margot Robbie",
    categoryName: "影视巨星",
    meaning: "玛格特·罗比。好莱坞一线女星兼金牌制片人，代表作《芭比》《小丑女：猛禽小队》《华尔街之狼》《好莱坞往事》。"
  },
  nagasawa_masami: {
    word: "Emma Stone",
    categoryName: "影视巨星",
    meaning: "艾玛·斯通（石头姐）。两度荣膺奥斯卡最佳女主角的演技天才女星，代表作《爱乐之城》《可怜的东西》《超凡蜘蛛侠》。"
  },
  sakaguchi_kentarou: {
    word: "Paul Mescal",
    categoryName: "影视巨星",
    meaning: "保罗·麦斯卡。备受全球文艺片与好莱坞主流青睐的新生代演技派男星，代表作《普通人》《晒后假日》《角斗士2》。"
  },
  yokohama_ryuusei: {
    word: "Michael B Jordan",
    categoryName: "影视巨星",
    meaning: "迈克尔·B·乔丹。好莱坞实力派硬朗男星兼导演，代表作《黑豹》《奎迪》系列，兼具精湛动作戏与角色魅力。"
  },
  kitamura_takumi: {
    word: "Shawn Mendes",
    categoryName: "流行巨星",
    meaning: "肖恩·蒙德兹（萌德）。加拿大超人气创作型流行偶像，代表作《Señorita》《Treat You Better》《Stitches》风靡全球。"
  },
  kamiki_ryuunosuke: {
    word: "Daniel Radcliffe",
    categoryName: "影视巨星",
    meaning: "丹尼尔·雷德克里夫。《哈利·波特》男主角扮演者，后转型百老汇舞台剧荣膺托尼奖的实力派传奇演员。"
  },
  fukuyama_masaharu: {
    word: "Keanu Reeves",
    categoryName: "影视巨星",
    meaning: "基努·里维斯。好莱坞传奇动作巨星，代表作《黑客帝国》《疾速追杀》，以真诚温和的人格魅力深受全球爱戴。"
  },
  sakai_masato: {
    word: "Cillian Murphy",
    categoryName: "影视巨星",
    meaning: "基里安·墨菲。凭借《奥本海默》斩获奥斯卡最佳男主角，代表作《浴血黑帮》《盗梦空间》，以深邃眼神与灵魂演技著称。"
  },
  oguri_shun: {
    word: "Ryan Gosling",
    categoryName: "影视巨星",
    meaning: "瑞恩·高斯林（高司令）。好莱坞兼具迷人魅力与扎实演技的标志性男星，代表作《芭比》《爱乐之城》《银翼杀手2049》。"
  },
  abe_hiroshi: {
    word: "Robert Downey Jr",
    categoryName: "影视巨星",
    meaning: "小罗伯特·唐尼。漫威电影宇宙‘钢铁侠’灵魂扮演者、奥斯卡最佳男配角得主，好莱坞极具感染力的传奇巨星。"
  },
  amami_yuuki: {
    word: "Cate Blanchett",
    categoryName: "影视巨星",
    meaning: "凯特·布兰切特（大魔王）。两座奥斯卡金像奖得主，影坛与戏剧舞台上极具女王威严与气场的殿堂级演员。"
  },
  aoi_yuu: {
    word: "Florence Pugh",
    categoryName: "影视巨星",
    meaning: "弗洛伦丝·皮尤。好莱坞新生代最具爆发力的实力派女星，代表作《小妇人》《奥本海默》《沙丘2》《仲夏夜惊魂》。"
  },
  mitsushima_hikari: {
    word: "Anya Taylor Joy",
    categoryName: "影视巨星",
    meaning: "安雅·泰勒-乔伊。以独特灵气和深邃大眼惊艳影坛的女星，代表作《后翼弃兵》《女巫》《疯狂的麦克斯：狂暴女神》。"
  },
  arimura_kasumi: {
    word: "Sydney Sweeney",
    categoryName: "影视巨星",
    meaning: "悉尼·妹（西德妮·斯威尼）。当代好莱坞极具话题度与人气的顶流女星，代表作《亢奋》《白莲花度假村》《只想爱你》。"
  },
  hirose_suzu: {
    word: "Jenna Ortega",
    categoryName: "影视巨星",
    meaning: "珍娜·奥尔特加。Netflix爆款热剧《星期三》主角，新一代暗黑哥特酷感潮流女演员与年轻一代偶像。"
  },
  imada_mio: {
    word: "Millie Bobby Brown",
    categoryName: "影视巨星",
    meaning: "米莉·波比·布朗。《怪奇物语》超能少女‘小十一’扮演者，青年文化潮流引领者与实力派制片人。"
  },
  ado: {
    word: "Kendrick Lamar",
    categoryName: "流行巨星",
    meaning: "肯德里克·拉马尔。普利策音乐奖首位流行乐获得者、多座格莱美奖得主，当代嘻哈界最伟大的音乐诗人与哲学家。"
  },
  tsuneta_daiki: {
    word: "Coldplay",
    categoryName: "音乐巨匠",
    meaning: "酷玩乐队。全球最成功的英国流行摇滚天团，以《Yellow》《Viva La Vida》《Fix You》等神曲唱响全球体育场。"
  },
  kuwata_keisuke: {
    word: "Ed Sheeran",
    categoryName: "流行巨星",
    meaning: "艾德·希兰（黄老板）。全球流媒体播放纪录保持者、单人吉他体育场弹唱天王，代表作《Shape of You》《Perfect》。"
  },
  yamashita_tomohisa: {
    word: "Doja Cat",
    categoryName: "流行巨星",
    meaning: "豆荚猫（多佳·猫）。当代流行饶舌与前卫视觉顶流天后，以《Say So》《Paint The Town Red》横扫全球流行热榜。"
  }
};
