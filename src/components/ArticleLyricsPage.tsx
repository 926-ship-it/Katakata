import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Music, Play, RotateCcw, Volume2, Sparkles, Plus, 
  Trash2, ChevronLeft, ArrowRight, CheckCircle, Trophy, Feather, 
  FileText, Clock, Compass, Layers, Check, Search
} from "lucide-react";
import { audioSynth } from "../utils/audio";
import { addDailyProgress } from "../utils/dailyGoal";
import { DailyZineModal } from "./DailyZineModal";
import { PearlString, ScallopLaceTrim, GirlhoodUmbrella, DessertPlateDoodle, HandDrawnPencil, PencilSquiggleUnderline } from "./AestheticDoodles";


export interface PassageItem {
  id: string;
  title: string;
  titleZh: string;
  artistOrAuthor: string;
  lang: "es" | "ja" | "en";
  category: "lyrics" | "poem" | "prose" | "fairy_tale" | "custom";
  description: string;
  excerptOriginal: string;
  excerptZh: string;
  bgPastel: string;
  contentLines: { original: string; translation?: string; phonetic?: string }[];
}

const PRESET_PASSAGES: PassageItem[] = [
  // --- 🧚 童话物语 (Fairy Tales) ---
  {
    id: "preset_fairy_little_prince",
    title: "Le Petit Prince · Le secret du renard",
    titleZh: "小王子 · 狐狸驯养的秘密",
    artistOrAuthor: "Antoine de Saint-Exupéry (圣·埃克苏佩里)",
    lang: "en",
    category: "fairy_tale",
    description: "世界传世童话经典，关于爱、玫瑰、驯服与用心灵看见一切",
    excerptOriginal: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.",
    excerptZh: "只有用心灵才能看清本质，真正重要的东西用眼睛是看不见的。",
    bgPastel: "from-amber-50 via-rose-50 to-pink-50",
    contentLines: [
      { original: "Here is my secret, a very simple secret", translation: "这就是我的秘密，一个非常简单的秘密" },
      { original: "It is only with the heart that one can see rightly", translation: "只有用心灵才能看清一切的本质" },
      { original: "What is essential is invisible to the eye", translation: "真正重要的东西，用眼睛是看不见的" },
      { original: "It is the time you have wasted for your rose", translation: "正是你为你的玫瑰所倾注付出的时间" },
      { original: "That makes your rose so important", translation: "才让你的玫瑰变得如此珍贵重要" },
      { original: "You become responsible forever for what you have tamed", translation: "你对自己驯养过的一切，永远负有责任" },
    ],
  },
  {
    id: "preset_fairy_snow_white",
    title: "白雪姫と魔法の鏡",
    titleZh: "白雪公主与魔镜",
    artistOrAuthor: "グリム童話 (格林童话经典)",
    lang: "ja",
    category: "fairy_tale",
    description: "经典梦幻童话，森林深处七个小矮人与雪白纯真的公主物语",
    excerptOriginal: "鏡よ、鏡、世界で一番美しいのはだれ？",
    excerptZh: "魔镜啊魔镜，世界上最美丽的人是谁？",
    bgPastel: "from-pink-50 via-sky-50 to-purple-50",
    contentLines: [
      { original: "鏡よ鏡、世界で一番美しいのはだれ？", phonetic: "かがみよかがみ、せかいでいちばんうつくしいのはだれ？", translation: "魔镜啊魔镜，世界上最美丽的人是谁？" },
      { original: "それは白雪姫、雪のように白く", phonetic: "それはしらゆきひめ、ゆきのようにしろく", translation: "那是白雪公主，肌肤如冬雪般纯白" },
      { original: "血のように赤く、黒檀の髪を持っています", phonetic: "ちのようにあかく、こくたんのかみをもっています", translation: "双唇如鲜血般殷红，秀发如黑檀木般乌黑" },
      { original: "森の奥の小さな家で、幸せに暮らしています", phonetic: "もりのおくのちいさないえで、しあわせにくらしています", translation: "她在森林深处的小屋里，正幸福地生活着" },
      { original: "やさしい小人たちと、歌いながら", phonetic: "やさしいこびとたちと、うたいながら", translation: "与善良亲切的小矮人们一起，轻声欢唱" },
    ],
  },
  {
    id: "preset_fairy_caperucita",
    title: "Caperucita Roja y el Bosque Mágico",
    titleZh: "小红帽与奇幻森林",
    artistOrAuthor: "Cuento Clásico Infantil (经典西语童话)",
    lang: "es",
    category: "fairy_tale",
    description: "穿过开满野花的大森林，给外婆送去刚出炉的蜂蜜小蛋糕",
    excerptOriginal: "Había una vez una niña dulce a quien todos llamaban Caperucita Roja.",
    excerptZh: "从前有一个温柔可爱的小女孩，大家都叫她小红帽。",
    bgPastel: "from-rose-50 via-amber-50 to-red-50",
    contentLines: [
      { original: "Había una vez una niña dulce", translation: "从前有一个纯真温柔的小女孩" },
      { original: "A quien todos llamaban Caperucita Roja", translation: "大家都亲切地叫她小红帽" },
      { original: "Ella caminaba feliz por el bosque florido", translation: "她在大森林的花径间快乐地漫步" },
      { original: "Llevaba pasteles dulces y miel dorada", translation: "篮子里装着香甜的蛋糕与金黄的蜂蜜" },
      { original: "Los pájaros cantaban canciones alegres en los árboles", translation: "小鸟在茂密的枝头欢快地歌唱" },
      { original: "Y el sol brillaba con una luz hermosa", translation: "阳光洒下温柔而明媚的金光" },
    ],
  },

  // --- 🎵 流行名曲 (Pop Songs & Iconic Hits) ---
  {
    id: "preset_pop_lemon",
    title: "Lemon",
    titleZh: "柠檬 · 传世抒情金曲",
    artistOrAuthor: "米津玄師 (Kenshi Yonezu)",
    lang: "ja",
    category: "lyrics",
    description: "现象级日系治愈流行神作，纵使离别，你依然是我心底最明亮的光芒",
    excerptOriginal: "夢ならばどれほどよかったでしょう / 今でもあなたはわたしの光",
    excerptZh: "如果这一切只是一场梦该有多好，时至今日你依然是我的光芒",
    bgPastel: "from-yellow-50 via-amber-50 to-pink-50",
    contentLines: [
      { original: "夢ならばどれほどよかったでしょう", phonetic: "ゆめならばどれほどよかったでしょう", translation: "如果这一切只是一场梦，该有多好" },
      { original: "未だにあなたのことを夢にみる", phonetic: "いまだにあなたのことをゆめにみる", translation: "时至今日，我依然常常在梦中与你相遇" },
      { original: "忘れた物を取りに帰るように", phonetic: "わすれたものをとにかえるように", translation: "宛如为了取回遗忘的事物而折返一般" },
      { original: "古びた思い出の埃を払う", phonetic: "ふるびたおもいでのほこりをはらう", translation: "轻轻拂去那旧日回忆上的点点尘埃" },
      { original: "今でもあなたはわたしの光", phonetic: "いまでもあなたはわたしのひかり", translation: "无论何时，你依然是我心底最澄澈的光芒" },
    ],
  },
  {
    id: "preset_pop_spirited_away",
    title: "いつも何度でも",
    titleZh: "永远同在 · 《千与千寻》主题曲",
    artistOrAuthor: "木村弓 / 覚和歌子 (宫崎骏吉卜力经典)",
    lang: "ja",
    category: "lyrics",
    description: "吉卜力最温柔悠远的经典民谣手碟与竖琴之声，治愈心灵的归宿",
    excerptOriginal: "呼んでいる 胸のどこか奥で / いつも心踊る 夢を見たい",
    excerptZh: "内心深处的某个角落正在呼唤，总想去追寻那怦然心动的梦境",
    bgPastel: "from-teal-50 via-sky-50 to-pink-50",
    contentLines: [
      { original: "呼んでいる胸のどこか奥で", phonetic: "よんでいるむねのどこかおくで", translation: "内心深处的某个角落，正在轻轻呼唤" },
      { original: "いつも心踊る夢を見たい", phonetic: "いつもこころおどるゆめをみたい", translation: "总想去追寻那令人怦然心动的纯真梦境" },
      { original: "悲しみは数えきれないけれど", phonetic: "かなしみはかぞえきれないけれど", translation: "虽然世间的悲伤与曲折道也道不尽" },
      { original: "その向こうできっとあなたに会える", phonetic: "そのむこうできっとあなたにあえる", translation: "但在那彼岸之境，一定能与你紧紧相逢" },
      { original: "ゼロになるからだが耳をすませる", phonetic: "ぜろになるからだがみみをすませる", translation: "卸下一切纷扰沉重，静静倾听大自然的心声" },
    ],
  },
  {
    id: "preset_pop_fly_me",
    title: "Fly Me to the Moon",
    titleZh: "带我飞向月球",
    artistOrAuthor: "Bart Howard / Frank Sinatra",
    lang: "en",
    category: "lyrics",
    description: "传唱全球的浪漫爵士流行名曲，星芒与月夜下的永恒表白",
    excerptOriginal: "Fly me to the moon and let me play among the stars",
    excerptZh: "带我飞向月球，让我在璀璨星宿间徜徉起舞",
    bgPastel: "from-indigo-50 via-purple-50 to-pink-50",
    contentLines: [
      { original: "Fly me to the moon and let me play among the stars", translation: "带我飞向月球，让我在璀璨星宿间徜徉起舞" },
      { original: "Let me see what spring is like on Jupiter and Mars", translation: "让我看看木星与火星上的春天究竟有多美妙" },
      { original: "In other words, hold my hand", translation: "换句话说，请轻轻牵起我的双手" },
      { original: "In other words, darling, kiss me", translation: "换句话说，亲爱的，请深深吻我" },
      { original: "You are all I long for, all I worship and adore", translation: "你是我毕生所有的期盼，我深爱与向往的一切" },
    ],
  },
  {
    id: "preset_ja_ue_o_muite",
    title: "上を向いて歩こう",
    titleZh: "昂首阔步向前走 (Sukiyaki)",
    artistOrAuthor: "坂本九 / 永六輔",
    lang: "ja",
    category: "lyrics",
    description: "世界级昭和暖心抒情名曲，旋律悠扬治愈，泪水不至滑落",
    excerptOriginal: "上を向いて歩こう / 涙がこぼれないように",
    excerptZh: "昂首阔步向前走，好让泪水不至于滑落",
    bgPastel: "from-sky-50 via-pink-50 to-purple-50",
    contentLines: [
      { original: "上を向いて歩こう", phonetic: "うえをむいてあるこう", translation: "昂首阔步向前走" },
      { original: "涙がこぼれないように", phonetic: "なみだがこぼれないように", translation: "好让泪水不至于滑落" },
      { original: "思い出す春の日", phonetic: "おもいだすはるのひ", translation: "回想起那个温暖的春天" },
      { original: "一人ぼっちの夜", phonetic: "ひとりぼっちのよる", translation: "孤独一人的漫漫长夜" },
      { original: "幸せは雲の上に", phonetic: "しあわせはくものうえに", translation: "幸福就在云端之上" },
      { original: "幸せは空の上に", phonetic: "しあわせはそらのうえに", translation: "幸福就在苍穹之上" },
    ],
  },
  {
    id: "preset_es_besame",
    title: "Bésame Mucho",
    titleZh: "深深地吻我吧",
    artistOrAuthor: "Consuelo Velázquez",
    lang: "es",
    category: "lyrics",
    description: "世界传世经典拉丁浪漫名曲，炽热深情，字字动人心弦",
    excerptOriginal: "Bésame, bésame mucho, como si fuera esta noche la última vez",
    excerptZh: "深深地吻我吧，如同今夜便是最后的相聚",
    bgPastel: "from-rose-50 via-pink-50 to-amber-50",
    contentLines: [
      { original: "Bésame, bésame mucho", translation: "吻我吧，深深地吻我" },
      { original: "Como si fuera esta noche la última vez", translation: "如同今夜便是最后的相聚" },
      { original: "Bésame, bésame mucho", translation: "吻我吧，深深地吻我" },
      { original: "Que tengo miedo a perderte, perderte después", translation: "因为我如此害怕此后会失去你" },
      { original: "Quiero tenerte muy cerca, mirarme en tus ojos", translation: "我想与你紧紧依偎，在你的眼眸中看见自己" },
      { original: "Verte junto a mí", translation: "看着你长伴我的身旁" },
    ],
  },

  // --- 📜 经典诗歌 (Classic Poetry) ---
  {
    id: "preset_poem_ame_ni_mo_makezu",
    title: "雨ニモマケズ",
    titleZh: "不畏风雨 · 传世哲理诗篇",
    artistOrAuthor: "宮沢賢治 (宫泽贤治)",
    lang: "ja",
    category: "poem",
    description: "日本国民级抒情哲理诗，淡泊坚毅、温柔澄澈的质朴人生哲理",
    excerptOriginal: "雨ニモマケズ 風ニモマケズ / イツモシヅカニワラッテヰル",
    excerptZh: "不畏风雨，无惧疾风，无论何时都保持安然宁静的微笑",
    bgPastel: "from-emerald-50 via-teal-50 to-sky-50",
    contentLines: [
      { original: "雨ニモマケズ", phonetic: "あめにもまけず", translation: "不畏风雨" },
      { original: "風ニモマケズ", phonetic: "かぜにもまけず", translation: "无惧疾风" },
      { original: "雪ニモ夏ノ暑サニモマケヌ", phonetic: "ゆきにもなつのあつさにもまけぬ", translation: "经得住冬雪，耐得住盛夏酷暑" },
      { original: "丈夫ナカラダヲモチ", phonetic: "じょうぶなからだをもち", translation: "拥有一副坚韧健康的体魄" },
      { original: "イツモシヅカニワラッテヰル", phonetic: "いつもしずかにわらっている", translation: "无论何时，总是保持着安然宁静的微笑" },
      { original: "ソウイフモノニ ワタシハナリタイ", phonetic: "そういうものに わたしはなりたい", translation: "我也想成为那样一个充满温暖的人" },
    ],
  },
  {
    id: "preset_poem_kaneko",
    title: "わたしと小鳥とすずと",
    titleZh: "我和小鸟与铃铛",
    artistOrAuthor: "金子みすゞ (金子美铃)",
    lang: "ja",
    category: "poem",
    description: "治愈纯真的童谣名篇，每个人都独一无二，大家都一样美好出彩",
    excerptOriginal: "みんなちがって、みんないい。",
    excerptZh: "大家各不相同，但大家都一样美妙出彩。",
    bgPastel: "from-pink-50 via-rose-50 to-yellow-50",
    contentLines: [
      { original: "わたしが両手をひろげても", phonetic: "わたしがりょうてをひろげても", translation: "即使我张开双臂" },
      { original: "お空はちっともとべないが", phonetic: "おそらはちっともとべないが", translation: "也绝不能飞上蔚蓝的天空" },
      { original: "とべる小鳥はわたしのように", phonetic: "とべることりはわたしのように", translation: "可是能飞翔的小鸟，却不能像我一样" },
      { original: "地べたをはやくは走れない", phonetic: "じべたをはやくははしれない", translation: "在大地上飞快地奔跑跳跃" },
      { original: "みんなちがって、みんないい", phonetic: "みんなちがって、みんないい", translation: "大家各不相同，但大家都一样美妙出色" },
    ],
  },
  {
    id: "preset_ja_haiku",
    title: "芭蕉与一茶 · 四季俳句集",
    titleZh: "日本古典俳句名篇",
    artistOrAuthor: "松尾芭蕉 / 小林一茶",
    lang: "ja",
    category: "poem",
    description: "日本古典俳句之幽玄美学，古池蛙声与微风草木",
    excerptOriginal: "古池や 蛙飛びこむ 水の音",
    excerptZh: "悠悠古池畔，青蛙跃入水声脆",
    bgPastel: "from-emerald-50 via-teal-50 to-sky-50",
    contentLines: [
      { original: "古池や蛙飛びこむ水の音", phonetic: "ふるいけやかわずとびこむみずのおと", translation: "古池塘，青蛙跳入水声响" },
      { original: "閑さや岩にしみ入る蝉の声", phonetic: "しずけさやいわにしみいるせみのこえ", translation: "万籁俱寂，蝉鸣渗入岩石中" },
      { original: "我と来て遊べや親のない雀", phonetic: "われときてあそべやおやのないすずめ", translation: "来和我玩耍吧，无父无母的小麻雀" },
      { original: "春の夜は桜に明けてしまひけり", phonetic: "はるのよはさくらにあけてしまいけり", translation: "春宵短，不知不觉漫天樱花迎晓光" },
    ],
  },
  {
    id: "preset_es_neruda",
    title: "Puedo escribir los versos más tristes",
    titleZh: "今夜我可以写下最哀伤的诗行",
    artistOrAuthor: "Pablo Neruda (聂鲁达)",
    lang: "es",
    category: "poem",
    description: "诺贝尔文学奖得主聂鲁达传世抒情诗《二十首情诗》精粹",
    excerptOriginal: "Puedo escribir los versos más tristes esta noche",
    excerptZh: "今夜我可以写下最哀伤的诗行，夜空繁星点点",
    bgPastel: "from-purple-50 via-indigo-50 to-pink-50",
    contentLines: [
      { original: "Puedo escribir los versos más tristes esta noche", translation: "今夜我可以写下最哀伤的诗行" },
      { original: "Escribir, por ejemplo: La noche está estrellada", translation: "比如写下：夜空繁星点点" },
      { original: "Y tiritan, azules, los astros, a lo lejos", translation: "蓝色的星子在远方微颤" },
      { original: "El viento de la noche gira en el cielo y canta", translation: "夜空的风在天际回旋歌唱" },
      { original: "Puedo escribir los versos más tristes esta noche", translation: "今夜我可以写下最哀伤的诗行" },
      { original: "Yo la quise, y a veces ella también me quiso", translation: "我曾爱过她，有时她也爱我" },
    ],
  },
  {
    id: "preset_en_frost",
    title: "Stopping by Woods on a Snowy Evening",
    titleZh: "雪夜林畔小立",
    artistOrAuthor: "Robert Frost (罗伯特·弗罗斯特)",
    lang: "en",
    category: "poem",
    description: "英语文学经典名篇，雪落深林的静谧沉思与对承诺的奔赴",
    excerptOriginal: "The woods are lovely, dark and deep, but I have promises to keep",
    excerptZh: "树林美丽、幽暗而深邃，但我还有承诺必须守候",
    bgPastel: "from-blue-50 via-cyan-50 to-teal-50",
    contentLines: [
      { original: "Whose woods these are I think I know", translation: "我想我知道这是谁的树林" },
      { original: "His house is in the village though", translation: "虽然他的房屋坐落在那村庄" },
      { original: "The woods are lovely, dark and deep", translation: "树林美丽、幽暗而深邃" },
      { original: "But I have promises to keep", translation: "但我还有承诺必须守候" },
      { original: "And miles to go before I sleep", translation: "在入睡前还有长路要奔赴" },
      { original: "And miles to go before I sleep", translation: "在入睡前还有长路要奔赴" },
    ],
  },
];

const STORAGE_CUSTOM_KEY = "katakata_custom_passages";

// Japanese Kana to Romaji mapping table
const KANA_TO_ROMAJI: Record<string, string[]> = {
  "あ": ["a"], "い": ["i"], "う": ["u"], "え": ["e"], "お": ["o"],
  "か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
  "さ": ["sa"], "し": ["shi", "si"], "す": ["su"], "せ": ["se"], "そ": ["so"],
  "た": ["ta"], "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": ["te"], "と": ["to"],
  "な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
  "は": ["ha"], "ひ": ["hi"], "ふ": ["fu", "hu"], "へ": ["he"], "ほ": ["ho"],
  "ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
  "や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
  "ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
  "わ": ["wa"], "を": ["wo", "o"], "ん": ["n", "nn"],
  "が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
  "ざ": ["za"], "じ": ["ji", "zi"], "ず": ["zu"], "ぜ": ["ze"], "ぞ": ["zo"],
  "だ": ["da"], "ぢ": ["ji", "di"], "づ": ["zu", "du"], "de": ["de"], "ど": ["do"],
  "ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
  "ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],
  "きゃ": ["kya"], "きゅ": ["kyu"], "きょ": ["kyo"],
  "しゃ": ["sha", "sya"], "しゅ": ["shu", "syu"], "しょ": ["sho", "syo"],
  "ちゃ": ["cha", "tya"], "ちゅ": ["chu", "tyu"], "ちょ": ["cho", "tyo"],
  "にゃ": ["nya"], "にゅ": ["nyu"], "にょ": ["nyo"],
  "ひゃ": ["hya"], "ひゅ": ["hyu"], "ひょ": ["hyo"],
  "みゃ": ["mya"], "みゅ": ["myu"], "みょ": ["myo"],
  "りゃ": ["rya"], "りゅ": ["ryu"], "りょ": ["ryo"],
  "ぎゃ": ["gya"], "ぎゅ": ["gyu"], "ぎょ": ["gyo"],
  "じゃ": ["ja", "zya"], "じゅ": ["ju", "zyu"], "じょ": ["jo", "zyo"],
  "びゃ": ["bya"], "びゅ": ["byu"], "びょ": ["byo"],
  "ぴゃ": ["pya"], "ぴゅ": ["pyu"], "ぴょ": ["pyo"],
};

// Break Japanese text into syllables with romaji targets
interface JapaneseSyllable {
  kana: string;
  romajiOptions: string[];
  primaryRomaji: string;
}

function parseJapaneseSyllables(text: string): JapaneseSyllable[] {
  const result: JapaneseSyllable[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    const nextCh = i + 1 < text.length ? text[i + 1] : "";

    // Check digraph (e.g. きゃ)
    if (nextCh && ["ゃ", "ゅ", "ょ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ"].includes(nextCh)) {
      const pair = ch + nextCh;
      if (KANA_TO_ROMAJI[pair]) {
        result.push({
          kana: pair,
          romajiOptions: KANA_TO_ROMAJI[pair],
          primaryRomaji: KANA_TO_ROMAJI[pair][0],
        });
        i += 2;
        continue;
      }
    }

    // Check single kana
    if (KANA_TO_ROMAJI[ch]) {
      result.push({
        kana: ch,
        romajiOptions: KANA_TO_ROMAJI[ch],
        primaryRomaji: KANA_TO_ROMAJI[ch][0],
      });
      i++;
      continue;
    }

    // Check small っ (sokuon)
    if (ch === "っ" && i + 1 < text.length) {
      const nextKana = text[i + 1];
      const nextRomajiList = KANA_TO_ROMAJI[nextKana] || ["t"];
      const doubleConsonant = nextRomajiList[0][0];
      result.push({
        kana: "っ",
        romajiOptions: [doubleConsonant, "xtsu", "ltu"],
        primaryRomaji: doubleConsonant,
      });
      i++;
      continue;
    }

    // Space or punctuation
    result.push({
      kana: ch,
      romajiOptions: [ch, " "],
      primaryRomaji: ch === " " ? " " : ch,
    });
    i++;
  }
  return result;
}

interface ArticleLyricsPageProps {
  onBack: () => void;
  isEnglishMode?: boolean;
}

export const ArticleLyricsPage: React.FC<ArticleLyricsPageProps> = ({
  onBack,
  isEnglishMode = false,
}) => {
  // View mode: "gallery" (Big Cards Shelf) or "practice" (Typing & Reciting Stage)
  const [viewMode, setViewMode] = useState<"gallery" | "practice">("gallery");

  // Load custom passages from localStorage
  const [passages, setPassages] = useState<PassageItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (raw) {
        const customItems: PassageItem[] = JSON.parse(raw);
        return [...customItems, ...PRESET_PASSAGES];
      }
    } catch (_) {}
    return PRESET_PASSAGES;
  });

  const [activeTab, setActiveTab] = useState<"all" | "fairy_tale" | "poem" | "lyrics" | "es" | "ja" | "en" | "custom">("all");
  const [selectedPassageId, setSelectedPassageId] = useState<string>(PRESET_PASSAGES[0].id);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isZineOpen, setIsZineOpen] = useState<boolean>(false);


  // Typing state for English / Spanish
  const [typedBuffer, setTypedBuffer] = useState<string>("");

  // Typing state for Japanese: syllable index & current syllable romaji buffer
  const [jaSyllableIdx, setJaSyllableIdx] = useState<number>(0);
  const [jaRomajiBuf, setJaRomajiBuf] = useState<string>("");

  // Stats
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState<number>(0);

  // Custom import form state
  const [importTitle, setImportTitle] = useState("");
  const [importAuthor, setImportAuthor] = useState("");
  const [importLang, setImportLang] = useState<"es" | "ja" | "en">("es");
  const [importText, setImportText] = useState("");

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const activePassage = passages.find((p) => p.id === selectedPassageId) || passages[0];
  const activeLine = activePassage.contentLines[currentLineIndex] || activePassage.contentLines[0];

  // Prepared Japanese syllables for the current line
  const jaSyllables: JapaneseSyllable[] = React.useMemo(() => {
    if (activePassage.lang !== "ja") return [];
    const sourceText = activeLine.phonetic || activeLine.original;
    return parseJapaneseSyllables(sourceText);
  }, [activePassage.lang, activeLine]);

  // Target text for Spanish / English
  const targetLineText = activeLine.original;

  // Auto focus input when in practice mode
  useEffect(() => {
    if (viewMode === "practice") {
      hiddenInputRef.current?.focus();
    }
  }, [viewMode, selectedPassageId, currentLineIndex]);

  // Read sentence audio
  const speakCurrentSentence = useCallback(() => {
    try {
      const text = activeLine.original;
      if (activePassage.lang === "es") {
        audioSynth.speakSpanish(text);
      } else if (activePassage.lang === "ja") {
        audioSynth.speakJapanese(text);
      } else {
        audioSynth.speakEnglish(text);
      }
    } catch (_) {}
  }, [activeLine, activePassage.lang]);

  // Launch practice from a card
  const handleLaunchPractice = (passage: PassageItem) => {
    setSelectedPassageId(passage.id);
    setCurrentLineIndex(0);
    setTypedBuffer("");
    setJaSyllableIdx(0);
    setJaRomajiBuf("");
    setIsCompleted(false);
    setStartTime(null);
    setTotalKeystrokes(0);
    setErrorKeystrokes(0);
    setViewMode("practice");
    try {
      audioSynth.playCardSlide();
    } catch (_) {}
  };

  // Advance to next line or complete passage
  const advanceLine = useCallback(() => {
    if (currentLineIndex + 1 < activePassage.contentLines.length) {
      setCurrentLineIndex((prev) => prev + 1);
      setTypedBuffer("");
      setJaSyllableIdx(0);
      setJaRomajiBuf("");
    } else {
      // Completed entire passage!
      setIsCompleted(true);
      try {
        audioSynth.playCelebrationTriumph();
      } catch (_) {}

      // Add to daily goal
      const wordsCount = activePassage.contentLines.reduce((acc, l) => acc + l.original.split(/\s+/).length, 0);
      const elapsedMins = startTime ? Math.max(1, Math.round((Date.now() - startTime) / 60000)) : 2;
      addDailyProgress(elapsedMins, wordsCount);
    }
  }, [currentLineIndex, activePassage.contentLines.length, startTime]);

  // Robust Unified Key Handler (Handles English, Spanish, and Japanese Romaji flawlessly!)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCompleted) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    // 1. Backspace
    if (e.key === "Backspace") {
      if (activePassage.lang === "ja") {
        if (jaRomajiBuf.length > 0) {
          setJaRomajiBuf((prev) => prev.slice(0, -1));
        } else if (jaSyllableIdx > 0) {
          setJaSyllableIdx((prev) => prev - 1);
          setJaRomajiBuf("");
        }
      } else {
        setTypedBuffer((prev) => prev.slice(0, -1));
      }
      try {
        audioSynth.playTyping({ volume: 0.5 });
      } catch (_) {}
      return;
    }

    // 2. Enter
    if (e.key === "Enter") {
      const isLineDone = activePassage.lang === "ja"
        ? jaSyllableIdx >= jaSyllables.length
        : typedBuffer.length >= targetLineText.length;
      if (isLineDone) {
        advanceLine();
      }
      return;
    }

    // 3. Single character keystrokes
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const pressedKey = e.key.toLowerCase();
      setTotalKeystrokes((prev) => prev + 1);

      // --- JAPANESE ROMAJI TYPING LOGIC ---
      if (activePassage.lang === "ja") {
        if (jaSyllableIdx >= jaSyllables.length) return;

        const currentSyl = jaSyllables[jaSyllableIdx];
        const nextBuf = jaRomajiBuf + pressedKey;

        // Check if nextBuf is a prefix of any valid romaji option for this syllable
        const hasMatchingPrefix = currentSyl.romajiOptions.some((opt) => opt.startsWith(nextBuf));
        const hasExactMatch = currentSyl.romajiOptions.some((opt) => opt === nextBuf);

        // Also check if user typed a direct kana character matching the syllable (Japanese IME mode)
        const isDirectKana = e.key === currentSyl.kana;

        if (hasExactMatch || isDirectKana) {
          // Completed this syllable!
          const nextIdx = jaSyllableIdx + 1;
          setJaSyllableIdx(nextIdx);
          setJaRomajiBuf("");

          try {
            audioSynth.playTyping({ isCompletion: nextIdx === jaSyllables.length });
          } catch (_) {}

          if (nextIdx >= jaSyllables.length) {
            try {
              audioSynth.playFanfare();
            } catch (_) {}
            speakCurrentSentence();
            setTimeout(advanceLine, 400);
          }
        } else if (hasMatchingPrefix) {
          // Keystroke is part of syllable (e.g. 's' in 'sa' or 'k' in 'ka')
          setJaRomajiBuf(nextBuf);
          try {
            audioSynth.playTyping({ volume: 0.6 });
          } catch (_) {}
        } else {
          // Check if user is typing space or punctuation matching current
          if (currentSyl.kana === " " && (pressedKey === " " || e.key === " ")) {
            const nextIdx = jaSyllableIdx + 1;
            setJaSyllableIdx(nextIdx);
            setJaRomajiBuf("");
            try {
              audioSynth.playTyping({ volume: 0.6 });
            } catch (_) {}
            if (nextIdx >= jaSyllables.length) {
              setTimeout(advanceLine, 400);
            }
          } else {
            // Mismatch
            setErrorKeystrokes((prev) => prev + 1);
            try {
              audioSynth.playError();
            } catch (_) {}
          }
        }
        return;
      }

      // --- SPANISH & ENGLISH TYPING LOGIC ---
      const expectedChar = targetLineText[typedBuffer.length];
      let isMatch = false;

      if (expectedChar) {
        if (expectedChar.toLowerCase() === pressedKey) {
          isMatch = true;
        } else if (
          (pressedKey === "a" && expectedChar === "á") ||
          (pressedKey === "e" && expectedChar === "é") ||
          (pressedKey === "i" && expectedChar === "í") ||
          (pressedKey === "o" && expectedChar === "ó") ||
          (pressedKey === "u" && (expectedChar === "ú" || expectedChar === "ü")) ||
          (pressedKey === "n" && expectedChar === "ñ")
        ) {
          isMatch = true;
        } else if (expectedChar === " " && pressedKey === " ") {
          isMatch = true;
        } else if (["¿", "¡", "“", "”", "’", "'", ",", ".", "!", "?", "—", "-"].includes(expectedChar)) {
          if (pressedKey === expectedChar.toLowerCase() || pressedKey === " ") {
            isMatch = true;
          }
        }
      }

      if (isMatch) {
        const charToAppend = expectedChar;
        const newBuf = typedBuffer + charToAppend;
        setTypedBuffer(newBuf);

        try {
          audioSynth.playTyping({ isCompletion: newBuf.length === targetLineText.length });
        } catch (_) {}

        if (newBuf.length >= targetLineText.length) {
          try {
            audioSynth.playFanfare();
          } catch (_) {}
          speakCurrentSentence();
          setTimeout(advanceLine, 400);
        }
      } else {
        setErrorKeystrokes((prev) => prev + 1);
        try {
          audioSynth.playError();
        } catch (_) {}
      }
    }
  };

  // Save new custom passage
  const handleSaveImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTitle.trim() || !importText.trim()) return;

    const rawLines = importText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (rawLines.length === 0) return;

    const newPassage: PassageItem = {
      id: "custom_" + Date.now(),
      title: importTitle.trim(),
      titleZh: importTitle.trim(),
      artistOrAuthor: importAuthor.trim() || "学员自定导入",
      lang: importLang,
      category: "custom",
      description: "您自主导入的专属文本，支持随时击键跟打与双语朗读",
      excerptOriginal: rawLines[0].split("//")[0].trim(),
      excerptZh: rawLines[0].includes("//") ? rawLines[0].split("//")[1].trim() : "自定义练习内容",
      bgPastel: "from-pink-50 via-purple-50 to-blue-50",
      contentLines: rawLines.map((line) => {
        if (line.includes("//")) {
          const parts = line.split("//");
          return { original: parts[0].trim(), translation: parts[1].trim() };
        }
        return { original: line };
      }),
    };

    const updated = [newPassage, ...passages];
    setPassages(updated);
    try {
      const customsOnly = updated.filter((p) => p.category === "custom");
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customsOnly));
      audioSynth.playCoin();
    } catch (_) {}

    setShowImportModal(false);
    setImportTitle("");
    setImportAuthor("");
    setImportText("");
    handleLaunchPractice(newPassage);
  };

  const handleDeletePassage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("确认从书架中删除该自定短文吗？")) {
      const updated = passages.filter((p) => p.id !== id);
      setPassages(updated);
      try {
        const customsOnly = updated.filter((p) => p.category === "custom");
        localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customsOnly));
        audioSynth.playCardSlide();
      } catch (_) {}
    }
  };

  // Filtered list of passages by category or language tab
  const filteredPassages = passages.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "fairy_tale") return p.category === "fairy_tale";
    if (activeTab === "poem") return p.category === "poem";
    if (activeTab === "lyrics") return p.category === "lyrics";
    if (activeTab === "custom") return p.category === "custom";
    return p.lang === activeTab;
  });

  // Accuracy calculation
  const accuracy = totalKeystrokes > 0 
    ? Math.max(0, Math.round(((totalKeystrokes - errorKeystrokes) / totalKeystrokes) * 100))
    : 100;

  return (
    <div className="min-h-screen w-full bg-macaron-canvas py-6 px-4 md:px-8 text-stone-800">
      {/* ============================================================== */}
      {/* VIEW A: LARGE CARDS GALLERY / SHELF (用户点选卡牌展厅) */}
      {/* ============================================================== */}
      {viewMode === "gallery" && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top Bar Navigation */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-pink-200/80">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-stone-600 hover:text-rose-600 shadow-2xs flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>返回主页</span>
              </button>

              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-bold tracking-wider">
                  <span>✦ 诗歌 · 童话 · 流行名曲工坊 ✦</span>
                </div>
                <h1 className="font-serif-vintage text-2xl md:text-3xl font-extrabold text-stone-900 leading-tight">
                  短文与名曲练习卡牌选集
                </h1>
              </div>
            </div>

            {/* Import Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 hover:from-rose-500 hover:to-purple-600 text-white font-bold text-xs shadow-md shadow-pink-300/40 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all self-end md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>导入我的文章 / 歌词</span>
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap pb-1">
            {[
              { id: "all", label: "全部经典与短文", icon: "📚", count: passages.length },
              { id: "fairy_tale", label: "童话故事", icon: "🧚", count: passages.filter((p) => p.category === "fairy_tale").length },
              { id: "poem", label: "经典诗歌", icon: "📜", count: passages.filter((p) => p.category === "poem").length },
              { id: "lyrics", label: "流行名曲", icon: "🎵", count: passages.filter((p) => p.category === "lyrics").length },
              { id: "ja", label: "日语", icon: "🇯🇵", count: passages.filter((p) => p.lang === "ja").length },
              { id: "es", label: "西班牙语", icon: "🇪🇸", count: passages.filter((p) => p.lang === "es").length },
              { id: "en", label: "英语名篇", icon: "🇬🇧", count: passages.filter((p) => p.lang === "en").length },
              { id: "custom", label: "自定导入", icon: "✍️", count: passages.filter((p) => p.category === "custom").length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    audioSynth.playCardSlide();
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : "bg-white hover:bg-pink-50 text-stone-600 border-pink-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid of Large Cards (大卡牌展示) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {/* Quick Add Custom Card */}
            <div
              onClick={() => setShowImportModal(true)}
              className="p-6 rounded-3xl border-2 border-dashed border-stone-800 hover:border-rose-600 bg-white hover:bg-pink-50/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[260px] group shadow-[3px_3px_0px_#2E2530] hover:shadow-[5px_5px_0px_#2E2530]"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-100 group-hover:bg-rose-500 group-hover:text-white text-rose-600 flex items-center justify-center transition-colors border-2 border-stone-850 shadow-xs">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif-vintage font-bold text-base text-stone-900 group-hover:text-rose-600">
                  + 导入新文章或歌词
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-[200px] leading-relaxed">
                  粘贴您喜欢的任意文章、西语/日语/英语歌词，即刻开启逐句盲打与跟读
                </p>
              </div>
            </div>

            {/* Passage Large Cards */}
            {filteredPassages.map((item) => {
              const langBadge = item.lang === "es" ? "🇪🇸 西班牙语" : (item.lang === "ja" ? "🇯🇵 日语" : "🇬🇧 英语");
              const categoryBadge = item.category === "lyrics" ? "🎵 经典歌词" : (item.category === "poem" ? "📜 抒情诗选" : "✍️ 学员自定");

              return (
                <div
                  key={item.id}
                  onClick={() => handleLaunchPractice(item)}
                  className="rounded-3xl border-2 border-stone-850 shadow-[4px_4px_0px_#2E2530] hover:shadow-[6px_6px_0px_#2E2530] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between p-5 min-h-[260px] relative group bg-white"
                >
                  <div className="washi-tape" />


                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-mono">
                          {langBadge}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {categoryBadge}
                        </span>
                      </div>

                      {item.category === "custom" && (
                        <button
                          onClick={(e) => handleDeletePassage(item.id, e)}
                          className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="删除此自定文章"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Titles */}
                    <h3 className="font-serif-vintage font-extrabold text-lg text-stone-900 group-hover:text-rose-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-xs text-stone-500 font-medium mt-0.5">
                      作者 / 歌手：{item.artistOrAuthor}
                    </div>

                    <p className="text-xs text-stone-600 font-sans mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Excerpt preview box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-pink-100 text-xs space-y-1">
                      <div className="font-serif-vintage italic text-stone-800 line-clamp-1">
                        "{item.excerptOriginal}"
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        译：{item.excerptZh}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Meta & Launch Button */}
                  <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-pink-400" />
                      <span>{item.contentLines.length} 句 / 练习段落</span>
                    </span>

                    <button
                      type="button"
                      className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs group-hover:shadow-sm"
                    >
                      <span>进入练习</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW B: PRACTICE STAGE (沉浸打字练习台) */}
      {/* ============================================================== */}
      {viewMode === "practice" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with obvious "返回卡牌列表" button */}
          <div className="flex items-center justify-between pb-4 border-b border-pink-200">
            <button
              onClick={() => {
                setViewMode("gallery");
                audioSynth.playCardSlide();
              }}
              className="py-2 px-3.5 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-stone-700 hover:text-rose-600 shadow-2xs flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>← 返回文章卡牌列表</span>
            </button>

            <div className="text-center">
              <span className="text-xs text-stone-400 font-mono">正在练习</span>
              <h2 className="font-serif-vintage font-bold text-lg md:text-xl text-stone-900">
                《{activePassage.title}》
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={speakCurrentSentence}
                className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="原声朗读整句"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">朗读当前句</span>
              </button>

              <button
                onClick={() => {
                  setCurrentLineIndex(0);
                  setTypedBuffer("");
                  setJaSyllableIdx(0);
                  setJaRomajiBuf("");
                  setIsCompleted(false);
                  audioSynth.playCardSlide();
                }}
                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer text-xs"
                title="重头开始"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Practice Stage Card */}
          <div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-pink-200 bg-riso-noise">
            <div className="washi-tape" />

            {/* Passage Meta info */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 mb-5 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-pink-100 text-pink-700 font-mono">
                  {activePassage.lang === "es" ? "🇪🇸 西班牙语" : (activePassage.lang === "ja" ? "🇯🇵 日语假名与罗马音" : "🇬🇧 英语")}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  第 {currentLineIndex + 1} / {activePassage.contentLines.length} 句
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                <span>敲击准确率: <strong className="text-stone-800">{accuracy}%</strong></span>
              </div>
            </div>

            {/* Finished Celebration Stage */}
            {isCompleted ? (
              <div className="py-10 px-4 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-pink-300 to-purple-300 p-1 shadow-lg border-2 border-dashed border-pink-400 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-500 animate-bounce-slow" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-mono font-bold">
                  PASSAGE COMPLETED
                </div>
                <h3 className="font-serif-vintage text-2xl md:text-3xl text-rose-600 font-extrabold">
                  太棒了！全篇练习圆满达成
                </h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto">
                  您已完成全篇《{activePassage.title}》的键盘录入，击键准确率达到 {accuracy}%！已同步记录至今日学习成果。
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => {
                      setCurrentLineIndex(0);
                      setTypedBuffer("");
                      setJaSyllableIdx(0);
                      setJaRomajiBuf("");
                      setIsCompleted(false);
                      setStartTime(null);
                    }}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm shadow-md hover:from-rose-500 hover:to-pink-600 active:scale-95 transition-all cursor-pointer"
                  >
                    再练一次本篇
                  </button>

                  <button
                    onClick={() => setIsZineOpen(true)}
                    className="py-3 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-mono font-bold text-sm shadow-[3px_3px_0px_#2E2530] border-2 border-stone-850 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>💌 生成今日少女日签</span>
                  </button>

                  <button
                    onClick={() => setViewMode("gallery")}
                    className="py-3 px-6 rounded-2xl bg-white border-2 border-stone-850 text-stone-800 font-bold text-sm shadow-[3px_3px_0px_#2E2530] hover:bg-pink-50 transition-all cursor-pointer"
                  >
                    挑选其他卡牌 →
                  </button>
                </div>
              </div>

            ) : (
              /* Active Typing Screen */
              <div
                onClick={() => hiddenInputRef.current?.focus()}
                className="space-y-6 cursor-text"
              >
                {/* Hidden input element capturing keystrokes */}
                <input
                  ref={hiddenInputRef}
                  type="text"
                  value=""
                  onChange={() => {}}
                  onKeyDown={handleKeyDown}
                  className="opacity-0 absolute pointer-events-none w-0 h-0"
                  autoFocus
                />

                {/* Keyboard typing helper notice */}
                <div className="flex items-center justify-between text-xs text-stone-500 bg-pink-50/60 p-2.5 rounded-xl border border-pink-100">
                  <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                    <Feather className="w-4 h-4" />
                    <span>
                      {activePassage.lang === "ja"
                        ? "直接敲击键盘上的英文字母（罗马音如 a, i, u, ka, sa）即可敲出对应假名！"
                        : "敲击键盘打出对应单词，西语重音字母敲击普通字母即可智能兼容！"}
                    </span>
                  </span>
                  <span className="font-mono text-stone-400 text-[11px]">[Backspace 撤销]</span>
                </div>

                {/* TARGET DISPLAY BOX */}
                <div className="bg-stone-50/90 rounded-2xl p-6 border border-pink-100 shadow-inner space-y-4">
                  {/* --- A. JAPANESE TYPING DISPLAY WITH ROMAJI GUIDE --- */}
                  {activePassage.lang === "ja" ? (
                    <div>
                      {/* Kanji original */}
                      <div className="text-xl md:text-2xl font-serif-vintage font-bold text-stone-900 mb-3 select-none">
                        {activeLine.original}
                      </div>

                      {/* Syllable-by-syllable interactive Kana + Romaji cards */}
                      <div className="flex items-center flex-wrap gap-2 select-none">
                        {jaSyllables.map((syl, sIdx) => {
                          const isDone = sIdx < jaSyllableIdx;
                          const isCurrent = sIdx === jaSyllableIdx;

                          return (
                            <div
                              key={sIdx}
                              className={`flex flex-col items-center justify-center min-w-[38px] px-2 py-1.5 rounded-xl border transition-all ${
                                isDone
                                  ? "bg-rose-100/90 border-rose-300 text-rose-700 shadow-2xs font-bold"
                                  : isCurrent
                                  ? "bg-white border-pink-400 ring-2 ring-pink-200 text-stone-900 shadow-sm"
                                  : "bg-white/60 border-stone-200 text-stone-400"
                              }`}
                            >
                              <span className="text-lg md:text-xl font-bold leading-tight">
                                {syl.kana}
                              </span>
                              <span className="text-[10px] font-mono tracking-wider font-semibold">
                                {isCurrent && jaRomajiBuf ? (
                                  <span>
                                    <strong className="text-rose-600">{jaRomajiBuf}</strong>
                                    <span className="text-stone-400">{syl.primaryRomaji.slice(jaRomajiBuf.length)}</span>
                                  </span>
                                ) : (
                                  syl.primaryRomaji
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* --- B. SPANISH & ENGLISH CHARACTER-BY-CHARACTER DISPLAY --- */
                    <div className="text-2xl md:text-3xl font-serif-vintage tracking-wide leading-relaxed select-none">
                      {targetLineText.split("").map((char, index) => {
                        const isTyped = index < typedBuffer.length;
                        const isCurrent = index === typedBuffer.length;

                        return (
                          <span
                            key={index}
                            className={`relative transition-colors duration-100 ${
                              isTyped
                                ? "text-rose-600 font-bold"
                                : isCurrent
                                ? "text-stone-900 border-b-2 border-rose-500 bg-pink-100/70 rounded-xs"
                                : "text-stone-400"
                            }`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Translation Line */}
                  {activeLine.translation && (
                    <div className="pt-3 border-t border-stone-200/80 text-sm text-stone-600 font-sans flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-bold font-mono">
                        中文释义
                      </span>
                      <span>{activeLine.translation}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar across current passage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-stone-500 font-mono">
                    <span>句进度: 第 {currentLineIndex + 1} 句 / 共 {activePassage.contentLines.length} 句</span>
                    <span>{Math.round(((currentLineIndex) / activePassage.contentLines.length) * 100)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-pink-100">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 transition-all duration-300"
                      style={{
                        width: `${Math.round(((currentLineIndex) / activePassage.contentLines.length) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* IMPORT CUSTOM PASSAGE MODAL (导入自定短文/歌词弹窗) */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-pink-200 bg-riso-noise space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif-vintage font-bold text-lg text-stone-900">
                  导入自定义短文或歌词
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveImport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  短文 / 歌曲标题 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：《Despacito》或《川の流れのように》"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    作者 / 歌手
                  </label>
                  <input
                    type="text"
                    placeholder="选填"
                    value={importAuthor}
                    onChange={(e) => setImportAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    所属语种
                  </label>
                  <select
                    value={importLang}
                    onChange={(e) => setImportLang(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-stone-50"
                  >
                    <option value="es">🇪🇸 西班牙语 (Español)</option>
                    <option value="ja">🇯🇵 日语 (日本語)</option>
                    <option value="en">🇬🇧 英语 (English)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  内容文本 * (每行一句，可用 // 附带中文翻译)
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={`例如：\nQuiero respirar tu cuello despacio // 想在你的颈边轻柔呼吸\nDeja que te diga cosas al oído // 让我伏在你耳畔轻声细语`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-stone-50 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-xs shadow-md shadow-pink-300/40 hover:from-rose-500 hover:to-pink-600 cursor-pointer"
                >
                  保存卡牌并立即练习
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Daily Aesthetic Zine Postcard Modal */}
      <DailyZineModal
        isOpen={isZineOpen}
        onClose={() => setIsZineOpen(false)}
      />
    </div>
  );
};

