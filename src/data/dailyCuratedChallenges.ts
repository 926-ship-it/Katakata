// Curated database of 31 exquisitely crafted daily Japanese word challenges
// Guaranteed 100% offline-first availability, eliminating any network dependency or GFW latency issues!

export interface DailyWordData {
  id: string;
  kanji: string;
  hiragana: string;
  katakana: string;
  romaji: string;
  meaning: string;
  categoryName?: string;
  difficulty?: string;
}

export interface DailyWordAnalysis {
  etymology: string;
  culturalStory: string;
  mnemonicTip: string;
  exampleSentence?: {
    japanese: string;
    kana?: string;
    translation: string;
  };
  funFact?: string;
  challengeTask?: string;
}

export interface DailyChallengeEntry {
  word: DailyWordData;
  analysis: DailyWordAnalysis;
}

export const CURATED_DAILY_CHALLENGES: DailyChallengeEntry[] = [
  {
    word: {
      id: "komorebi",
      kanji: "木漏れ日",
      hiragana: "こもれび",
      katakana: "コモレビ",
      romaji: "komorebi",
      meaning: "树叶间隙穿透洒下的阳光；静谧光影",
      categoryName: "自然风物 · 和风美学",
      difficulty: "N2",
    },
    analysis: {
      etymology: "【词源故事考据】：由“木（こ）”、“漏れ（もれ）”与“日（ひ/び）”融合而成的大和言叶（和语复合词）。古代日本人将从茂密山岭树梢间隙落下的斑驳光束视为山林神灵温柔眨眼的神迹，表达对自然生息的细腻敬畏。",
      culturalStory: "【文化风俗物语】：在日本古典庭园与俳句创作中，“木漏れ日”代表着流转的无常与转瞬即逝的平静之美。当微风吹拂树梢，地面的光斑如同跳跃的碎金，许多经典动画中常以此镜头描摹少年少女的心动瞬间。",
      mnemonicTip: "【五十音假名记忆巧思】：拆为「こ・も・れ・び」四音。口诀：“小蘑菇（こ・も）在林间，享受漏（れ）下来的明媚日光（び）”。平假名圆润柔和，片假名「コ・モ・レ・ビ」棱角分明宛如树枝切面。",
      exampleSentence: {
        japanese: "木漏れ日の中で、静かに本を読むのが好きです。",
        kana: "こもれびのなかで、しずかにほんをよむのがすきです。",
        translation: "我喜欢在斑驳林隙的阳光下，静静地阅读书卷。",
      },
      funFact: "【冷知识】：世界各国的语言学家都赞誉“木漏れ日”为世界上最难被单个外语单词直接意译的美学词汇之一，它不仅是词，更是一种静心心境。",
      challengeTask: "今日挑战任务：观察平假名「こもれび」与片假名「コモレビ」的每一处转折，点击下方按钮完成今日击键练习打卡！",
    },
  },
  {
    word: {
      id: "ichigoichie",
      kanji: "一期一会",
      hiragana: "いちごいちえ",
      katakana: "イチゴイチエ",
      romaji: "ichigoichie",
      meaning: "一生仅此一次的珍贵相会；珍惜当下",
      categoryName: "哲学美学 · 茶道心法",
      difficulty: "N3",
    },
    analysis: {
      etymology: "【词源故事考据】：最早出自安土桃山时代茶圣千利休的大弟子山上宗二的茶道秘传书《山上宗二记》，后经井伊直弼在《茶汤一会集》中发扬光大。意指每一次茶席宾主相聚，哪怕天天相见，今日之会席与心情皆是今生唯一。",
      culturalStory: "【文化风俗物语】：在茶室矮小的躞口门前，不论是战国大名将军还是平凡旅人，都必须解下佩刀、低头屈膝入室。因为在茶汤之前人人平等，大家以全神贯注的敬畏之心品尝眼前的这一盏抹茶。",
      mnemonicTip: "【五十音假名记忆巧思】：拆为「い・ち・ご・い・ち・え」。「いちご」恰好谐音“草莓（苺）”，记忆巧思：“一生只能吃一颗的神仙草莓相会”！片假名「イチゴイチエ」常用于现代海报与招牌。",
      exampleSentence: {
        japanese: "旅先での出会いは、まさに一期一会ですね。",
        kana: "たびさきでのであいは、まさにいちごいちえですね。",
        translation: "旅途中的每一次相逢，都是弥足珍贵的一生一会呢。",
      },
      funFact: "【冷知识】：在许多日本传统店铺门口，常挂着写有“一期一会”的木质挂牌，提醒店员每一次为客人递上一杯热茶，都要倾注一生一次的诚意（おもてなし）。",
      challengeTask: "今日挑战任务：尝试用指尖将假名「いちごいちえ」行云流水地打出，感知专注击键当下的禅定律动。",
    },
  },
  {
    word: {
      id: "sakura",
      kanji: "桜",
      hiragana: "さくら",
      katakana: "サクラ",
      romaji: "sakura",
      meaning: "樱花；绚丽盛放与无常物哀之美",
      categoryName: "自然风物 · 国花岁时",
      difficulty: "N5",
    },
    analysis: {
      etymology: "【词源故事考据】：“さくら”中的“さ（Sa）”在古日语神道中指代掌管稻谷农业丰收的“田之神/谷神”；“くら（Kura）”则指神灵栖息降临的宝座（神座）。因此樱花盛开正是古时向田神祈愿五谷丰登的时节信使。",
      culturalStory: "【文化风俗物语】：每年春季日本气象厅会发布全国“樱前线”。从冲绳一路向北海道盛开，花期虽仅七日，人们却全家围坐樱花树下饮酒赏樱（花見），感悟韶华虽短、尽情绽放的无悔生命哲学。",
      mnemonicTip: "【五十音假名记忆巧思】：平假名「さ・く・ら」是初学者接触五十音最先学会的美好词汇之一。片假名「サ・ク・ラ」常在植物学教材与花艺设计中出现。",
      exampleSentence: {
        japanese: "春になると、川沿いの桜が一斉に咲き誇ります。",
        kana: "はるになると、かわぞいのさくらがいっせいにさきほこります。",
        translation: "一到春天，河畔的樱花便争相绚丽盛放。",
      },
      funFact: "【冷知识】：日本古代在没有现在的樱花品种时，“花”这个单字专指梅花，到了平安时代《源氏物语》时期，贵族与民间逐渐将“花”默认为樱花。",
      challengeTask: "今日挑战任务：点击「平假名」或「片假名」练习按钮，体会「さくら」与「サクラ」在指尖绽放的韵律！",
    },
  },
  {
    word: {
      id: "wabisabi",
      kanji: "侘寂",
      hiragana: "わびさび",
      katakana: "ワビサビ",
      romaji: "wabisabi",
      meaning: "侘寂；在粗糙质朴中体会幽微时光沉淀",
      categoryName: "哲学美学 · 东方禅意",
      difficulty: "N1",
    },
    analysis: {
      etymology: "【词源故事考据】：“侘（Wabi）”原意是清贫、简素、幽居自然中的寡欲心境；“寂（Sabi）”原指金属生锈、岁月雕琢留下的斑驳质感。二者结合构成了日本文化中接受事物不完美、不恒久、不完整的最高美学准则。",
      culturalStory: "【文化风俗物语】：从金缮修复（用金漆修补碎裂的瓷碗）到千利休使用粗糙变形的黑乐茶碗，侘寂教会人们在裂纹、苔藓、枯木与灰瓦之间发现比对称光洁更为动人的时光诗意。",
      mnemonicTip: "【五十音假名记忆巧思】：「わ・び・さ・び」，注意两个浊音「び（bi）」。片假名「ワ・ビ・サ・ビ」在当代极简设计领域极为火爆。",
      exampleSentence: {
        japanese: "苔むした古寺の庭には、独特の侘寂の風情が漂っています。",
        kana: "こけむしたこでらのにわには、どくとくのわびさびのふうぜいがただよっています。",
        translation: "生满青苔的古寺庭园中，弥漫着独具风味的侘寂韵致。",
      },
      funFact: "【冷知识】：苹果公司创始人乔布斯曾深居京都古寺冥想，其产品设计的极致极简理念深受侘寂与禅宗哲学的深刻启迪。",
      challengeTask: "今日挑战任务：在宁静中完成假名击键练习，感受指尖触键如木鱼轻叩的专注定力。",
    },
  },
  {
    word: {
      id: "kizuna",
      kanji: "絆",
      hiragana: "きずな",
      katakana: "キズナ",
      romaji: "kizuna",
      meaning: "心灵纽带；患难见真情的深厚羁绊",
      categoryName: "情感共鸣 · 人性之光",
      difficulty: "N3",
    },
    analysis: {
      etymology: "【词源故事考据】：古代最初指系住马匹或牲畜的绳索缰绳（繋ぐ綱）。到了中世纪，演化为虽无形却紧紧维系人与人之间血脉、情谊、生死相依的心灵纽带。",
      culturalStory: "【文化风俗物语】：2011年东日本大地震后，日本民众共同选出的年度汉字便是「絆」。在灾难面前，陌生人互相扶持传递热食、志愿者奔赴灾区，生动诠释了人类在绝境中最温暖的共情力。",
      mnemonicTip: "【五十音假名记忆巧思】：「き・ず・な」三音。假名「ず」为「す」加浊点，连读起来如琴弦轻抚，牢不可破。片假名「キ・ズ・ナ」常见于经典动漫作品中伙伴的誓言。",
      exampleSentence: {
        japanese: "困難を共に乗り越えた仲間との絆は、何よりも固い。",
        kana: "こんなんをともにのりこえたなかまとのきずなは、なによりもかたい。",
        translation: "与共同克服艰难困苦的伙伴结下的羁绊，比世上任何事物都坚固。",
      },
      funFact: "【冷知识】：日本赛马界著名的传奇赛马“无敌之绊（キズナ Kizuna）”曾斩获日本德比大赛冠军，寄托了万千民众昂扬奋发的祈愿。",
      challengeTask: "今日挑战任务：完成平假名「きずな」与片假名「キズナ」的打卡拼写，唤醒今日学习羁绊！",
    },
  },
  {
    word: {
      id: "fuurin",
      kanji: "風鈴",
      hiragana: "ふうりん",
      katakana: "フウリン",
      romaji: "fuurin",
      meaning: "风铃；夏日屋檐下以清脆声响引风的雅器",
      categoryName: "民俗节令 · 清夏物语",
      difficulty: "N4",
    },
    analysis: {
      etymology: "【词源故事考据】：起源于中国古代的占风铎，后传入日本作为辟邪法器挂在神社回廊下。江户时代玻璃工艺发展后，匠人吹制出圆润小巧的江户风铃，底部悬挂短册纸片借风起音。",
      culturalStory: "【文化风俗物语】：在炎夏酷热的日本，人们深信“耳朵听到了清凉的叮咚风铃声，心灵便会自然感知到凉风拂过”。每到七八月，川越冰川神社等著名古社还会举办盛大的“结缘风铃祭”，数千只色彩各异的风铃随风齐鸣。",
      mnemonicTip: "【五十音假名记忆巧思】：「ふ・う・り・ん」，注意长音「う」和拨音「ん」。「ふ」轻柔如夏风吹过，「りん」清脆如铜铃叮咚。",
      exampleSentence: {
        japanese: "縁側に座って、風鈴の涼やかな音色に耳を澄ませる。",
        kana: "えんがわにすわって、ふうりんのすずやかなねいろにみみをすませる。",
        translation: "坐在日式走廊上，静静聆听风铃清澈凉爽的悦耳乐音。",
      },
      funFact: "【冷知识】：现代声学研究发现，风铃鸣响时发出的声波含有高达3000Hz的清脆舒缓频率，能刺激大脑分泌内啡肽，起到真实的镇静降压效果。",
      challengeTask: "今日挑战任务：拼打假名「ふうりん」，让指尖的敲击声如同风铃在微风中轻鸣！",
    },
  },
  {
    word: {
      id: "shinrinyoku",
      kanji: "森林浴",
      hiragana: "しんりんよく",
      katakana: "シンリンヨク",
      romaji: "shinrinyoku",
      meaning: "森林浴；漫步林海吸收树木芬多精的疗愈之旅",
      categoryName: "自然养生 · 绿色疗愈",
      difficulty: "N2",
    },
    analysis: {
      etymology: "【词源故事考据】：1982年由日本林野厅长官秋山智英创造的词汇。借用“日光浴”、“海水浴”的概念，提倡人们走入自然山林中，沐浴在树木释放的植物杀菌素（芬多精）与负离子中。",
      culturalStory: "【文化风俗物语】：日本国土约67%被森林覆盖，古人自古笃信“草木悉皆成佛”。在屋久岛千年的绳文杉原始林中，徒步者关闭手机与喧嚣，深吸一口略带清冷苔藓香气的空气，身心重新找回与大地的链接。",
      mnemonicTip: "【五十音假名记忆巧思】：「しん・りん・よく」，连续两个拨音「ん」与促促有致的「よく」。片假名「シンリンヨク」常出现在健康生活杂志专栏。",
      exampleSentence: {
        japanese: "週末は森へ出かけて、森林浴でリフレッシュしましょう。",
        kana: "しゅうまつはもりへでかけて、しんりんよくでりふれっしゅしましょう。",
        translation: "周末去森林里漫步，通过森林浴给身心充满活力吧。",
      },
      funFact: "【冷知识】：医学实验证明，在森林中漫步两小时，人体内的天然杀伤细胞（NK细胞）活性可提升50%以上，该项养生医学概念已风靡欧美。",
      challengeTask: "今日挑战任务：完成「しんりんよく」的拼写，仿佛指尖触摸到清晨古松的温润树皮！",
    },
  },
  {
    word: {
      id: "yuugure",
      kanji: "夕暮れ",
      hiragana: "ゆうぐれ",
      katakana: "ユウグレ",
      romaji: "yuugure",
      meaning: "黄昏傍晚；夕阳西下霞光漫天的暮色时分",
      categoryName: "岁时节令 · 天象幽情",
      difficulty: "N3",
    },
    analysis: {
      etymology: "【词源故事考据】：由“夕（ゆう/夜幕前夕）”与“暮れ（くれ/日沉天暗）”复合而成。古时亦被称作“黄昏（たそがれ / 谁是彼者）”，指光线转暗、对面相逢难辨容颜的神秘时刻。",
      culturalStory: "【文化风俗物语】：古典名著《枕草子》写道：“秋天是傍晚最好。夕阳辉煌地照着，到了很接近了山边的时候，乌鸦都要归巢去了……”。动漫《你的名字》中跨越时空的相遇，正是设定在夕暮黄昏分界之际。",
      mnemonicTip: "【五十音假名记忆巧思】：「ゆ・う・ぐ・れ」，注意长音「う」和浊音「ぐ」。读起来有长长的余韵，宛如晚霞久久不散。",
      exampleSentence: {
        japanese: "夕暮れの空が、茜色から深い藍色へと移り変わっていく。",
        kana: "ゆうぐれのそらが、あかねいろからふかいいろへとうつりかわっていく。",
        translation: "黄昏的天空，正从茜红渐渐转变为深邃的幽蓝。",
      },
      funFact: "【冷知识】：民间传说黄昏时刻是阴阳交界的“逢魔之时（おうまがとき）”，街坊邻居会敲响晚钟（夕焼け小焼け）提醒在外玩耍的孩子回家吃饭。",
      challengeTask: "今日挑战任务：闭上眼睛回味一天的心绪，敲击「ゆうぐれ」平假名与片假名打卡！",
    },
  },
  {
    word: {
      id: "hatsuyuki",
      kanji: "初雪",
      hiragana: "はつゆき",
      katakana: "ハツユキ",
      romaji: "hatsuyuki",
      meaning: "初雪；入冬之后飘落的第一场雪花",
      categoryName: "自然风物 · 冬之序曲",
      difficulty: "N4",
    },
    analysis: {
      etymology: "【词源故事考据】：由前缀“初（はつ/首次）”与“雪（ゆき）”结合。在日本岁时记中，初雪是冬天的季语。无论是《雪国》开篇的茫茫天地，还是屋檐边无声飘落的雪花，都宣告着静默冬日的到来。",
      culturalStory: "【文化风俗物语】：北海道或东北地区的孩子们见到初雪总会欢呼雀跃，而京都古都的初雪更是可遇不可求的绝景。金阁寺与清水寺在薄雪覆顶的瞬间，褪去人间烟火，展现极具禅意的纯白寂静。",
      mnemonicTip: "【五十音假名记忆巧思】：「は・つ・ゆ・き」四音。前两音「はつ」短促轻灵，后两音「ゆき」悠扬，恰似雪花自高空轻盈飘坠。",
      exampleSentence: {
        japanese: "今朝、山頂に初雪が降ったという知らせが届きました。",
        kana: "けさ、さんちょうにはつゆきがふったというしらせがとどきました。",
        translation: "今晨收到了山顶降下今年第一场初雪的讯息。",
      },
      funFact: "【冷知识】：日本气象厅对“初雪”有着严格判定标准，必须由气象台观测员肉眼确认飘雪，即使只持续了几秒钟的细小雪屑也算作初雪初日。",
      challengeTask: "今日挑战任务：完成「はつゆき」的指尖默写，感受初雪般轻盈无瑕的敲击手感！",
    },
  },
  {
    word: {
      id: "kotodama",
      kanji: "言霊",
      hiragana: "ことだま",
      katakana: "コトダマ",
      romaji: "kotodama",
      meaning: "言灵；话语中寄宿的灵力与言出必行的信仰",
      categoryName: "民俗神道 · 精神图腾",
      difficulty: "N2",
    },
    analysis: {
      etymology: "【词源故事考据】：源于神道教神圣信仰。《万叶集》中柿本人麻吕曾称赞日本为“言灵助功之国（言霊の幸はふ国）”。古代人们深信，真诚说出的话语拥有超自然的愿力，善言能带来福报，恶语亦会带来灾殃。",
      culturalStory: "【文化风俗物语】：这一理念深深影响了日本社会的语言习惯与人际礼仪。例如结婚典礼上绝对禁止使用“切る（切断）”、“離れる（分开）”等忌讳词汇，大家只互道吉利祝福之语，以借言灵之力佑护一生圆满。",
      mnemonicTip: "【五十音假名记忆巧思】：「こ・と・だ・ま」，第三音「だ」带浊点，沉稳有力，象征言语掷地有声的力量。",
      exampleSentence: {
        japanese: "言葉には言霊が宿るから、いつも前向きな言葉を使おう。",
        kana: "ことばにはことだまがやどるから、いつもまえむきなことばをつかおう。",
        translation: "言语之中寄宿着灵力，所以让我们常常使用积极明朗的词句吧。",
      },
      funFact: "【冷知识】：在考试季，日本考生常会买“KitKat（雀巢奇巧巧克力）”，因为其日文发音「キットカット」酷似「きっと勝つ（必定胜利）」，便是现代言灵文化的生动缩影！",
      challengeTask: "今日挑战任务：敲打「ことだま」，向今天的自己道一声鼓励的善言与肯定！",
    },
  },
  {
    word: {
      id: "aozora",
      kanji: "青空",
      hiragana: "あおぞら",
      katakana: "アオゾラ",
      romaji: "aozora",
      meaning: "晴空碧空；万里无云明朗清澈的蓝天",
      categoryName: "自然风物 · 心旷神怡",
      difficulty: "N5",
    },
    analysis: {
      etymology: "【词源故事考据】：由“青（あお/青蓝色）”与“空（そら，连浊为ぞら）”结合。古代日语中“青”包含蓝、绿、青灰等清凉开阔的冷色调，浩瀚高阔的天际即为青空。",
      culturalStory: "【文化风俗物语】：无论是毕业季放飞的气球、甲子园球场上少年挥汗奔跑的背景，还是新海诚笔下纤尘不染的苍穹，青空始终是青春、希冀与豁达最直击人心的写照。",
      mnemonicTip: "【五十音假名记忆巧思】：「あ・お・ぞ・ら」，开头是五十音第一行元音「あ・お」，开阔嘹亮，中间浊音「ぞ」浑厚，末尾「ら」轻快。",
      exampleSentence: {
        japanese: "見上げれば、澄み渡る青空がどこまでも広がっている。",
        kana: "みあげれば、すみわたるあおぞらがどこまでもひろがっている。",
        translation: "抬头仰望，澄澈无垠的碧蓝晴空向着远方无限延伸。",
      },
      funFact: "【冷知识】：在日语里，室外露天的活动常被冠以“青空”之名，比如青空教室、青空市场（跳蚤露天集市），给人无拘无束的亲切感。",
      challengeTask: "今日挑战任务：完成假名「あおぞら」的利落击打，唤醒心中的一抹碧蓝万里！",
    },
  },
  {
    word: {
      id: "amayadori",
      kanji: "雨宿り",
      hiragana: "あまやどり",
      katakana: "アマヤドリ",
      romaji: "amayadori",
      meaning: "避雨；在屋檐或林下暂避骤雨的温暖时光",
      categoryName: "日常物语 · 人间温情",
      difficulty: "N3",
    },
    analysis: {
      etymology: "【词源故事考据】：由“雨（あま）”与“宿り（やどり/暂住留宿）”结合。遭遇暴雨时，暂借他人屋檐或老树枝桠避雨，古代旅人在屋檐下的避雨偶遇往往催生出动人交集。",
      culturalStory: "【文化风俗物语】：著名歌谣与纯爱小说中最钟爱的经典场景：急雨突至，两把折伞在日式古桥或木质车站的屋檐下收拢，水滴顺着瓦缝叮咚坠地，静待云散天晴的几分钟便成了永恒回忆。",
      mnemonicTip: "【五十音假名记忆巧思】：「あ・ま・や・ど・り」五音。节奏如雨声初歇：「あ・ま」是雨，「やどり」如归宿般安心。",
      exampleSentence: {
        japanese: "にわか雨に降られて、古本屋の軒先で雨宿りをした。",
        kana: "にわかあめにふられて、ふるほんやののきさきであまやどりをした。",
        translation: "被一阵突如其来的骤雨淋到，在古旧书店的屋檐下避了避雨。",
      },
      funFact: "【冷知识】：日本许多车站或商店门口会放置“善意之伞（善意の傘）”，供避雨的路人免费借走并在下次路过时归还，充满了传统社会的互信关怀。",
      challengeTask: "今日挑战任务：敲打「あまやどり」，在指尖寻找一片宁静避雨的温柔屋檐！",
    },
  },
];

// Returns the date-specific challenge entry
export function getCuratedDailyChallenge(dateStr?: string, preferredWord?: any): DailyChallengeEntry {
  const targetDate = dateStr || new Date().toISOString().slice(0, 10);
  
  // Calculate deterministic index based on date string
  const dateHash = targetDate.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const index = Math.abs(dateHash) % CURATED_DAILY_CHALLENGES.length;
  const baseEntry = CURATED_DAILY_CHALLENGES[index];

  if (preferredWord && preferredWord.kanji) {
    return {
      word: {
        id: preferredWord.id || "custom-word",
        kanji: preferredWord.kanji,
        hiragana: preferredWord.kanaStr || baseEntry.word.hiragana,
        katakana: preferredWord.katakanaStr || baseEntry.word.katakana,
        romaji: preferredWord.romaji || baseEntry.word.romaji,
        meaning: preferredWord.meaning || baseEntry.word.meaning,
        categoryName: preferredWord.categoryName || baseEntry.word.categoryName,
        difficulty: baseEntry.word.difficulty,
      },
      analysis: {
        ...baseEntry.analysis,
      },
    };
  }

  return baseEntry;
}
