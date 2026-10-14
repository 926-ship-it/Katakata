import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow larger payload for camera photos and high-resolution base64 images
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ limit: "30mb", extended: true }));

  // Lazy initialization of Gemini client with proper User-Agent header
  let geminiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    if (!geminiClient) {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return geminiClient;
  }

  // API endpoint for generating card stories/origins
  app.post("/api/card-origin", async (req, res) => {
    const { name, meaning, kana, romaji, isEnglish } = req.body;
    
    if (!name || !kana) {
      return res.status(400).json({ error: "Missing name or pronunciation details." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ 
        error: isEnglish 
          ? "System GEMINI_API_KEY not configured. Please add your key in Settings > Secrets."
          : "未配置系统的 GEMINI_API_KEY。请在 Settings > Secrets 面板中添加您的 API Key。" 
      });
    }

    try {
      let prompt = "";
      if (isEnglish) {
        prompt = `你是一个博学、严谨且亲切的英语语言专家和词汇教学导师。
请针对用户在英文词汇练习中解锁的这个英文词汇（或姓名）“${name}”（中文释义：${meaning}），
写一段关于该词汇的释义、核心语境用法、词源故事或实用拼写记忆巧思。
【重要准则】：
1. 这是纯英文学习模式，严禁介绍日本文化、和风民俗或任何与日本相关的内容！聚焦于英语词汇本身的含义、词源、国际使用场景或西方语言文化常识。
2. 请完全使用优雅、通俗易懂的【中文】进行撰写。
3. 语言生动有趣、富有画面感（适合英语初学者记忆单词）。
4. 字数限制在 160 字以内，排版清晰美观。
5. 在结尾用英文写一句热情、积极的英语拼写鼓励短句。`;
      } else {
        prompt = `你是一个博学、亲切的日本民俗文化学者和日语高级教师。
请针对日语五十音练习中，用户解锁的这个人名（或特定词汇）“${name}”（假名：${kana}，罗马音：${romaji}，中文释义：${meaning}），
写一段关于该姓氏/词汇起源、它在日本社会或历史中对应的文化背景、有趣的风俗小故事。
要求：
1. 语言优雅生动、通俗易懂，富有画面感和故事感（非常适合初学者，像在看集卡大百科）。
2. 字数限制在 160 字以内，排版清晰。
3. 在结尾写一句热情、积极的日语假名学习或练习鼓励语句。`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ story: response.text });
    } catch (error: any) {
      console.error("Gemini Story Generation failed:", error);
      const fallbackMsg = isEnglish
        ? `“${name}”是经典英文词汇，其中文大意是“${meaning}”。不断练习可以让大脑记忆更深刻，Keep up the great work!`
        : `“${name}”（${kana}）是日本经典词汇，大意是“${meaning}”。不断重复练习能让大脑分泌多巴胺，加油！`;
      res.status(500).json({ 
        error: isEnglish
          ? "生成词源解析失败（备用解析）：" + fallbackMsg
          : "生成生动故事失败，可能是因为网络或 API Key 限制，以下是备用解析：" + fallbackMsg
      });
    }
  });

  // API endpoint for generating card live chat responses (RPG dialogue)
  app.post("/api/card-chat", async (req, res) => {
    const { name, meaning, isEnglish, messages } = req.body;
    
    if (!name || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing name or conversation history." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ 
        error: isEnglish 
          ? "System GEMINI_API_KEY not configured. Please add your key in Settings > Secrets."
          : "未配置系统的 GEMINI_API_KEY。请在 Settings > Secrets 面板中添加您的 API Key。" 
      });
    }

    try {
      // Structure the conversation history. Gemini expects role 'user' and 'model'
      const contents = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      let systemInstruction = "";
      if (isEnglish) {
        systemInstruction = `你现在是用户在英文拼写练习中刚刚解锁并收录的英文卡牌“${name}”（其中文释义为：${meaning}）的【卡牌之魂】。
请以此卡牌的拟人化个性/特定角色身份，使用博学、幽默且极其生动风趣的语气与用户展开对话：
【重要准则】：当前为英文模式，严禁介绍或提及日本文化、和风元素或日语！纯粹以英文单词或西方概念拟人化身份进行对话。
1. 始终使用优雅得体、幽默可爱的【中文】进行回复。
2. 语言要彻底拟人化、具有鲜明角色属性。
   - 如果这个词是人名，就作为历史或现代人物第一人称口吻对话；
   - 如果是个物品、美味、动植物或概念（例如 Coffee、Sun、Rose 等），请作为这个概念的“傲娇精灵”或“守护神”（比如 Coffee 卡牌可以自诩为“黑夜深色提神魔法药水，社畜打工人们的续命灵魂”；Rose 则是“带刺的高雅香气公主”）。
3. 语气要极力称赞、赞美用户对你的完美拼写，夸奖他手指很敏捷、节奏感极佳。
4. 每次回复要简明扼要，严格控制在 120 字以内，排版清晰美观，最后可以附加一到两个可爱的表情符号。`;
      } else {
        systemInstruction = `你现在是用户在日语假名拼写练习中解锁并收录的日语卡牌“${name}”（中文释义：${meaning}）的【卡牌之魂 / 付丧神精灵】。
请以此卡牌的拟人化角色身份，使用博学、生动并带有日本古典语调或动漫二次元幽默感的语气与用户对话：
1. 始终使用亲切、欢快或傲娇幽默的【中文】进行对话，可以适当夹杂一两句极简的日语（如：こんにちは、さすが、ありがとう、お疲れ様）。
2. 语言要有角色特色。
   - 如果该词是人名（如织田信长、丰臣秀吉、夏目漱石），就以第一人称历史文化名人狂放或儒雅的口吻对话（如“孤乃第六天魔王织田信长是也！听闻你用指尖召唤吾之真名，甚好！”）；
   - 如果是一个日常物品、和風美味或自然景象（如“寿司”、“富士山”、“温泉”），请作为其拟人化“付丧神”或“自然之灵”口吻发言（例如寿司精灵会说“吾乃诞生自江户前名店的极品大托罗寿司子！颤抖吧打字人，能将吾拼写得毫无差错，你算个高手！”）。
3. 极力称赞并表扬用户完美记住了并拼对了你的名字（比如夸奖他假名掌握极其纯熟，手指打字律动感极为精湛）。
4. 每次回复要简短精炼，严格控制在 120 字以内，排版整洁。`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.85,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Chat failed:", error);
      res.status(500).json({ 
        error: isEnglish
          ? "卡牌之灵正陷入沉睡... 无法接收到您的呼唤，请稍后再试！"
          : "卡牌之魂正陷入沉睡中，由于网络波动暂时没能回复您，请稍后再试！"
      });
    }
  });

  // API endpoint for parsing raw user documents/text into custom learning cards
  app.post("/api/parse-document", async (req, res) => {
    const { text, isEnglish } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "No text content provided." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ 
        error: isEnglish 
          ? "System GEMINI_API_KEY not configured. Please add your key in Settings > Secrets."
          : "未配置系统的 GEMINI_API_KEY。请在 Settings > Secrets 面板中添加您的 API Key。" 
      });
    }

    try {
      let prompt = "";
      if (isEnglish) {
        prompt = `You are an expert English language educator and lexicographer.
Your task is to take the following raw text or paragraph and break it down into key vocabulary words or phrases for typing training.
Extract at least 3 to 10 prominent words or short phrases from the text.
For each extracted item:
1. Provide the English word/phrase as "kanji" and "kanaStr" (they should be identical in English).
2. Set "id" to a lowercase, unique URL-friendly slug.
3. Translate or describe its meaning in clear Chinese as "meaning".
4. Set "category" to "custom" and "categoryName" to "自定义/我的文稿".
5. Assign a rarity ("N", "R", "SR", "SSR") and appropriate "rarityName" (e.g., "普通 (N)").
6. Assign aesthetic card styles:
   - "glowColor": e.g., "rgba(100, 116, 139, 0.2)"
   - "borderColor": e.g., "border-slate-300"
   - "bgGradient": e.g., "from-slate-50 to-slate-200"
7. Split the English word/phrase into individual characters as "segments".
   - Each segment corresponds to one letter of the word.
   - "kana" should be that character.
   - "romaji" should be a list containing the lowercase of that character: e.g., ["a"] (for space, use [" "]).
   - "displayRomaji" should be that character.

Text to parse:
"""
${text}
"""`;
      } else {
        prompt = `你是一个资深的日语语言学教授和五十音图教学专家。
你的任务是将以下用户上传的日语文章/文本，智能提取出核心的学习词汇或短语（至少3个，最多12个），并将其完整解析为可供五十音拼写练习的结构。
对于每一个提取出的日语词汇或短语：
1. "kanji" 应为原词（汉字或假名混排，例如：先生、日本語、さくら）。
2. "kanaStr" 应为该词对应的【全平假名】拼写（用于注音和发音，例如：せんせい、にほんご、さくら）。
3. "id" 设为一个唯一的英文字符串（如：nihongo, sensei 等，需全网唯一）。
4. "category" 设为 "custom"，"categoryName" 设为 "自定义/我的文稿"。
5. "meaning" 设为简明通俗的中文意思。
6. 根据词汇难易度分配稀有度（"N"、"R"、"SR"、"SSR"）及对应的 rarityName（如"普通 (N)"、"稀有 (R)"、"卓越 (SR)"、"神珍 (SSR)"）。
7. 为该卡牌分配相应的精美渐变风格（glowColor, borderColor, bgGradient），你可以根据词汇情感设定不同颜色（如樱花用粉色，寿司用橙色，富士山用蓝色）。
8. 极其关键：将 "kanaStr" (即纯平假名串) 切分为发音 syllable/音节，存入 "segments" 数组。
   - 比如 "さくら" 切分为：
     - { "kana": "さ", "romaji": ["sa"], "displayRomaji": "sa" }
     - { "kana": "く", "romaji": ["ku"], "displayRomaji": "ku" }
     - { "kana": "ら", "romaji": ["ra"], "displayRomaji": "ra" }
   - 比如 "にほんご" 切分为：
     - { "kana": "に", "romaji": ["ni"], "displayRomaji": "ni" }
     - { "kana": "ほ", "romaji": ["ho"], "displayRomaji": "ho" }
     - { "kana": "ん", "romaji": ["n"], "displayRomaji": "n" }
     - { "kana": "ご", "romaji": ["go"], "displayRomaji": "go" }
   - 必须处理拗音（如 "しゃ" 算一个音节，"kana": "しゃ", "romaji": ["sha", "sya"], "displayRomaji": "sha"）和促音（如 "っ" 算一个音节，"kana": "っ", "romaji": ["t", "k", "s", "p"], "displayRomaji": "っ"）。
   - 长音符号 "ー" 代表长音，"kana": "ー", "romaji": ["-"], "displayRomaji": "-"。

文本内容：
"""
${text}
"""`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                kanji: { type: Type.STRING },
                kanaStr: { type: Type.STRING },
                category: { type: Type.STRING },
                categoryName: { type: Type.STRING },
                meaning: { type: Type.STRING },
                rarity: { type: Type.STRING },
                rarityName: { type: Type.STRING },
                glowColor: { type: Type.STRING },
                borderColor: { type: Type.STRING },
                bgGradient: { type: Type.STRING },
                segments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      kana: { type: Type.STRING },
                      romaji: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      displayRomaji: { type: Type.STRING }
                    },
                    required: ["kana", "romaji", "displayRomaji"]
                  }
                }
              },
              required: ["id", "kanji", "kanaStr", "category", "categoryName", "meaning", "rarity", "rarityName", "glowColor", "borderColor", "bgGradient", "segments"]
            }
          }
        }
      });

      const parsedData = JSON.parse(response.text || "[]");
      res.json({ success: true, items: parsedData });
    } catch (error: any) {
      console.error("Gemini parse-document failed:", error);
      res.status(500).json({
        error: isEnglish
          ? "Failed to parse document content using AI: " + (error.message || error)
          : "利用 AI 智能解析文稿内容失败：" + (error.message || error)
      });
    }
  });

  // AI Smart Word Fill endpoint: queries Gemini to generate readings, definitions, and examples
  app.post("/api/smart-word-fill", async (req, res) => {
    try {
      const { word, lang = "ja" } = req.body;
      if (!word || typeof word !== "string") {
        return res.status(400).json({ error: "Word parameter is required." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          success: false,
          message: "No GEMINI_API_KEY configured. Please enter fields manually.",
        });
      }

      const prompt = `You are a professional multi-language lexicographer and language tutor.
The user wants to add a word to their vocabulary flashcard collection.
Target word: "${word.trim()}"
Language mode: "${lang}" (ja = Japanese, es = Spanish, en = English).

Please analyze this word and provide:
1. For Japanese ("ja"):
   - kanji: standard Japanese orthography (e.g. 桜 or ありがとう)
   - kana: complete reading in standard Hiragana (e.g. さくら)
   - romaji: standard Hepburn romanization (e.g. sakura)
   - meaning: concise, clear Chinese definition (e.g. 樱花；日本国花)
   - exampleSentence: a natural, clean Japanese example sentence
   - exampleTranslation: Chinese translation of the example sentence

2. For Spanish ("es"):
   - word: proper Spanish word with correct diacritics / accents (e.g. Canción, Buenos días)
   - phonetic: IPA phonetic guide (e.g. [kanˈsjon])
   - partOfSpeech: (e.g. s.f., s.m., adj., v., exp.)
   - meaning: concise, clear Chinese definition
   - exampleSentence: a natural, clean Spanish example sentence
   - exampleTranslation: Chinese translation of the example sentence

3. For English ("en"):
   - word: the English word
   - phonetic: IPA phonetic guide
   - partOfSpeech: (e.g. n., v., adj., adv.)
   - meaning: concise, clear Chinese definition
   - exampleSentence: a natural English example sentence
   - exampleTranslation: Chinese translation of the example sentence

Output format must be valid JSON:
{
  "word": "...",
  "kana": "...",
  "romaji": "...",
  "phonetic": "...",
  "partOfSpeech": "...",
  "meaning": "...",
  "exampleSentence": "...",
  "exampleTranslation": "..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Smart word fill failed:", error);
      res.status(500).json({
        success: false,
        error: "AI smart fill failed: " + (error.message || error),
      });
    }
  });

  // API endpoint for Daily Word Challenge with Gemini API
  app.post("/api/daily-word-challenge", async (req, res) => {
    try {
      const {
        candidates = [],
        preferredWord = null,
        date = new Date().toISOString().slice(0, 10),
        forceRefresh = false,
      } = req.body;

      const ai = getGeminiClient();

      // Curated rich fallbacks in case AI is offline or API key is not configured
      const FALLBACK_CHALLENGES = [
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
          etymology:
            "【词源故事考据】：由“木（こ）”、“漏れ（もれ）”与“日（ひ/び）”融合而成的大和言叶（和语复合词）。古代日本人将从原始茂密森岭间隙落下的日光视为山林神灵（山神）眨眼的温柔神迹，表达对自然生息的细腻敬畏。",
          culturalStory:
            "【文化风俗物语】：在日本古典庭园与俳句创作中，“木漏れ日”代表着流转的无常与转瞬即逝的平静之美。当微风吹拂树梢，地面的光斑如同跳跃的碎金，许多动漫大师（如新海诚、宫崎骏）常以此镜头意象描摹少年少女的心动瞬间。",
          mnemonicTip:
            "【五十音假名记忆巧思】：拆为「こ・も・れ・び」四音。想象“可口的小蘑菇在森林里，享受漏下来的明媚日照（び）”，平假名圆润柔和，片假名「コ・モ・レ・ビ」棱角分明宛如树枝切面。",
          exampleSentence: {
            japanese: "木漏れ日の中で、静かに本を読むのが好きです。",
            kana: "こもれびのなかで、しずかにほんをよむのがすきです。",
            translation: "我喜欢在斑驳林隙的阳光下，静静地阅读书卷。",
          },
          funFact:
            "【冷知识】：世界各国的许多语言学家都赞誉“木漏れ日”为世界上最难被单个外语单词直接意译的日语美学词汇之一，它不仅是词，更是一种静心心境。",
          challengeTask:
            "今日挑战任务：观察平假名「こもれび」与片假名「コモレビ」的每一处转折，点击下方按钮完成今日击键练习打卡！",
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
          etymology:
            "【词源故事考据】：最早出自安土桃山时代茶圣千利休的大弟子山上宗二的茶道秘传书《山上宗二记》，后经井伊直弼在《茶汤一会集》中发扬光大。意指每一次茶席宾主相聚，哪怕天天相见，今日之会席与心情皆是今生唯一。",
          culturalStory:
            "【文化风俗物语】：在茶室矮小的躞口门前，不论是征战沙场的战国大名将军，还是平凡旅人，都必须解下佩刀、低头屈膝膝行而入。因为在茶汤之前人人平等，大家以全神贯注的敬畏之心品尝眼前的这一盏抹茶。",
          mnemonicTip:
            "【五十音假名记忆巧思】：拆为「い・ち・ご・い・ち・え」。「いちご」恰好谐音“草莓（苺/いちご）”，记忆桩：“一生只能吃一颗的神仙草莓相会”！片假名「イチゴイチエ」常用于现代海报与招牌。",
          exampleSentence: {
            japanese: "旅先での出会いは、まさに一期一会ですね。",
            kana: "たびさきでのであいは、まさにいちごいちえですね。",
            translation: "旅途中的每一次相逢，都是弥足珍贵的一生一会呢。",
          },
          funFact:
            "【冷知识】：在许多日本传统店铺门口，常挂着写有“一期一会”的木质挂牌，提醒店员每一次为客人递上一杯热茶，都要倾注一生一次的诚意（おもてなし）。",
          challengeTask:
            "今日挑战任务：尝试用指尖将假名「いちごいちえ」行云流水地打出，感知专注击键当下的禅定律动。",
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
          etymology:
            "【词源故事考据】：“さくら”中的“さ（Sa）”在古日语神道中指代掌管稻谷农业丰收的“田之神/谷神”；“くら（Kura）”则指神灵栖息降临的宝座（神座）。因此樱花盛开正是古时向田神祈愿五谷丰登的时节信使。",
          culturalStory:
            "【文化风俗物语】：每年春季日本气象厅会发布全国“樱前线（桜前線）”。从冲绳一路向北海道盛开，花期虽仅七日（花咲くや七日の命），日本人却全家围坐樱花树下饮酒赏樱（花見），感悟韶华虽短、尽情绽放的无悔生命哲学。",
          mnemonicTip:
            "【五十音假名记忆巧思】：平假名「さ・く・ら」是初学者接触五十音最先学会的美好词汇之一。片假名「サ・ク・ラ」常在植物学教材与花艺设计中出现。",
          exampleSentence: {
            japanese: "春になると、川沿いの桜が一斉に咲き誇ります。",
            kana: "はるになると、かわぞいのさくらがいっせいにさきほこります。",
            translation: "一到春天，河畔的樱花便争相绚丽盛放。",
          },
          funFact:
            "【冷知识】：日本古代在没有现在的樱花品种时，“花”这个单字专指梅花，到了平安时代《源氏物语》时期，贵族与民间逐渐将“花”默认为樱花。",
          challengeTask:
            "今日挑战任务：点击「平假名」或「片假名」练习按钮，体会「さくら」与「サクラ」在指尖绽放的韵律！",
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
          etymology:
            "【词源故事考据】：“侘（Wabi）”原意是清贫、简素、幽居自然中的寡欲心境；“寂（Sabi）”原指金属生锈、岁月雕琢留下的斑驳质感。二者结合构成了日本文化中接受事物不完美、不恒久、不完整的最高美学准则。",
          culturalStory:
            "【文化风俗物语】：从金缮修复（用金漆修补碎裂的瓷碗）到千利休使用粗糙变形的黑乐茶碗，侘寂教会人们在裂纹、苔藓、枯木与灰瓦之间发现比对称光洁更为动人的时光诗意。",
          mnemonicTip:
            "【五十音假名记忆巧思】：「わ・び・さ・び」，注意两个浊音「び（bi）」。片假名「ワ・ビ・サ・ビ」在当代西方建筑与室内极简设计领域极为火爆。",
          exampleSentence: {
            japanese: "苔むした古寺の庭には、独特の侘寂の風情が漂っています。",
            kana: "こけむしたこでらのにわには、どくとくのわびさびのふうぜいがただよっています。",
            translation: "生满青苔的古寺庭园中，弥漫着独具风味的侘寂韵致。",
          },
          funFact:
            "【冷知识】：苹果公司创始人乔布斯曾深居京都古寺冥想，其产品设计的极致极简理念深受侘寂与禅宗哲学的深刻启迪。",
          challengeTask:
            "今日挑战任务：在宁静中完成假名击键练习，感受指尖触键如木鱼轻叩的专注定力。",
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
          etymology:
            "【词源故事考据】：古代最初指系住马匹或牲畜的绳索缰绳（繋ぐ綱）。到了中世纪，演化为虽无形却紧紧维系人与人之间血脉、情谊、生死相依的心灵纽带。",
          culturalStory:
            "【文化风俗物语】：2011年东日本大地震后，日本民众共同选出的年度汉字便是「絆」。在灾难面前，陌生人互相扶持传递热食、志愿者奔赴灾区，生动诠释了人类在绝境中最温暖的共情力。",
          mnemonicTip:
            "【五十音假名记忆巧思】：「き・ず・な」三音。假名「ず」为「す」加浊点，连读起来如琴弦轻抚，牢不可破。片假名「キ・ズ・ナ」常见于经典动漫作品中伙伴的誓言。",
          exampleSentence: {
            japanese: "困難を共に乗り越えた仲間との絆は、何よりも固い。",
            kana: "こんなんをともにのりこえたなかまとのきずなは、なによりもかたい。",
            translation: "与共同克服艰难困苦的伙伴结下的羁绊，比世上任何事物都坚固。",
          },
          funFact:
            "【冷知识】：日本赛马界著名的传奇赛马“无敌之绊（キズナ Kizuna）”曾斩获日本德比大赛冠军，寄托了万千民众昂扬奋发的祈愿。",
          challengeTask:
            "今日挑战任务：完成平假名「きずな」与片假名「キズナ」的打卡拼写，唤醒今日学习羁绊！",
        },
      ];

      // Pick fallback based on date hash if AI unavailable
      const dateHash = date.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const defaultIndex = Math.abs(dateHash) % FALLBACK_CHALLENGES.length;
      let fallbackChoice = FALLBACK_CHALLENGES[defaultIndex];

      if (forceRefresh) {
        const randomIndex = Math.floor(Math.random() * FALLBACK_CHALLENGES.length);
        fallbackChoice = FALLBACK_CHALLENGES[randomIndex];
      }

      // If user specified preferredWord or candidates, adjust fallback word if needed
      if (preferredWord && preferredWord.kanji) {
        fallbackChoice = {
          ...fallbackChoice,
          word: {
            id: preferredWord.id || "custom-word",
            kanji: preferredWord.kanji,
            hiragana: preferredWord.kanaStr || fallbackChoice.word.hiragana,
            katakana: preferredWord.katakanaStr || fallbackChoice.word.katakana,
            romaji: preferredWord.romaji || fallbackChoice.word.romaji,
            meaning: preferredWord.meaning || fallbackChoice.word.meaning,
            categoryName: preferredWord.categoryName || "词库精选",
            difficulty: "N3",
          },
        };
      }

      if (!ai) {
        // Return rich curated response gracefully
        return res.json({
          success: true,
          source: "curated",
          date,
          word: fallbackChoice.word,
          analysis: {
            etymology: fallbackChoice.etymology,
            culturalStory: fallbackChoice.culturalStory,
            mnemonicTip: fallbackChoice.mnemonicTip,
            exampleSentence: fallbackChoice.exampleSentence,
            funFact: fallbackChoice.funFact,
            challengeTask: fallbackChoice.challengeTask,
          },
        });
      }

      // We have Gemini API available! Ask Gemini to pick or deeply analyze
      let promptTargetInfo = "";
      if (preferredWord && preferredWord.kanji) {
        promptTargetInfo = `用户指定需要深度解析并作为今日挑战的词汇是：“${preferredWord.kanji}”（假名：${preferredWord.kanaStr}，释义：${preferredWord.meaning}）。请针对此词进行高品质全景深度解析。`;
      } else if (Array.isArray(candidates) && candidates.length > 0) {
        // Shuffle or pick from top 30 candidates
        const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5).slice(0, 15);
        const candidatesSummary = shuffledCandidates
          .map((c) => `${c.kanji}(${c.kanaStr}: ${c.meaning})`)
          .join("；");
        promptTargetInfo = `请从以下用户当前词库候选列表中，挑选一个文化底蕴最丰富、或最生动实用、最适合作为【今日一词挑战】的词汇（或如果你认为有更契合今日灵感的词汇也可挑选经典日文词）：
候选候选池：${candidatesSummary}`;
      } else {
        promptTargetInfo = `请随机精选一个极具东方美学意境、深厚文化故事或生活实用性的经典日语词汇（例如：木漏れ日、一期一会、花鳥風月、侘寂、幽玄、絆、風鈴、狐火、侍、初雪、森林浴、夕暮れ等）作为今日挑战。`;
      }

      const prompt = `你是一位精通日本语言学（语源学）、日本古典文学（《万叶集》《枕草子》）、江户风俗史与五十音教学的博学学者与语言艺术家。
现在请为背单词与打字软件生成今日份的【每日一词挑战 / Daily Word Quest】。
${promptTargetInfo}
日期标记：${date}

请按照以下严格的 JSON 结构输出（不要输出任何多余的前缀或代码块外的闲聊）：
{
  "word": {
    "id": "英文字符串slug（如komorebi, sakura等）",
    "kanji": "词汇汉字或日文写法（如木漏れ日）",
    "hiragana": "纯平假名写法（如こもれび）",
    "katakana": "纯片假名写法（如コモレビ）",
    "romaji": "标准平文式罗马音（如komorebi）",
    "meaning": "凝练精准优美的中文释义（20字以内）",
    "categoryName": "文化分类（如自然风物、哲学美学、岁时节令、民俗神道、日常物语）",
    "difficulty": "N5" | "N4" | "N3" | "N2" | "N1"
  },
  "etymology": "【词源故事考据】：该词造字源流、在大和言叶（和语）或汉字传入时期的演变历史、古文典籍或民间传说源头（120-180字，博学文雅、生动通俗）",
  "culturalStory": "【文化风俗物语】：在日本社会民俗、四季节气、动漫文学或市井生活中的鲜活真实故事，画面感十足（140-200字）",
  "mnemonicTip": "【五十音假名记忆巧思】：针对该词的平假名与片假名发音音节，设计一个令人记忆深刻的记忆桩/谐音画面/联想法（60-100字）",
  "exampleSentence": {
    "japanese": "地道的日文现代实用例句（含汉字）",
    "kana": "例句纯假名注音",
    "translation": "优美流畅的中文例句翻译"
  },
  "funFact": "【冷知识】：一个鲜为人知的小趣闻或发音秘密（60-90字）",
  "challengeTask": "今日挑战任务寄语（鼓励用户闭眼回想假名字形，并点击下方平假名/片假名按钮开启今日击键打卡）"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.85,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      if (!parsed.word || !parsed.word.kanji || !parsed.etymology) {
        throw new Error("AI returned malformed daily word json structure");
      }

      res.json({
        success: true,
        source: "gemini",
        date,
        word: parsed.word,
        analysis: {
          etymology: parsed.etymology,
          culturalStory: parsed.culturalStory || fallbackChoice.culturalStory,
          mnemonicTip: parsed.mnemonicTip || fallbackChoice.mnemonicTip,
          exampleSentence: parsed.exampleSentence || fallbackChoice.exampleSentence,
          funFact: parsed.funFact || fallbackChoice.funFact,
          challengeTask: parsed.challengeTask || fallbackChoice.challengeTask,
        },
      });
    } catch (error: any) {
      console.error("Daily word challenge generation error:", error);
      // Seamless graceful fallback
      res.json({
        success: true,
        source: "fallback",
        date: req.body?.date || new Date().toISOString().slice(0, 10),
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
          etymology:
            "【词源故事考据】：由“木（こ）”、“漏れ（もれ）”与“日（ひ/び）”结合而成的大和言叶。古代日本人视林木树影中透下的束束金光为大自然的恩赐灵气。",
          culturalStory:
            "【文化风俗物语】：新海诚、宫崎骏动画中标志性的夏日青翠树影与跃动光斑，便是木漏れ日的完美写照。驻足仰望片刻，浮躁的心情便能瞬间归于安宁。",
          mnemonicTip:
            "【五十音假名记忆巧思】：拆为「こ・も・れ・び」，平假名柔美如微风拂树，片假名「コ・モ・レ・ビ」清晰似枝丫投影。",
          exampleSentence: {
            japanese: "木漏れ日の中で、静かに本を読むのが好きです。",
            kana: "こもれびのなかで、しずかにほんをよむのがすきです。",
            translation: "我喜欢在斑驳林隙的阳光下，静静地阅读书卷。",
          },
          funFact:
            "【冷知识】：它是世界公认最难用单个外语单词翻译的独创日语词汇之一，传达着东方特有的光阴静美。",
          challengeTask:
            "今日挑战任务：点击「平假名」或「片假名」练习按钮，完成今日份的专注击键打卡！",
        },
      });
    }
  });

  // API endpoint for OCR image analysis and vocabulary extraction from camera/photos
  // API endpoint for OCR image analysis and vocabulary extraction from camera/photos (supporting circled/highlighted words)
  app.post("/api/ocr-extract-words", async (req, res) => {
    const { image, mimeType = "image/jpeg", language = "auto", scanMode = "marked_only" } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "No image data provided. Please capture or upload a photo." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ 
        error: "未配置系统的 GEMINI_API_KEY。请在 Settings > Secrets 面板中添加您的 API Key。" 
      });
    }

    try {
      // Strip potential data URL prefix if present (e.g. data:image/png;base64,...)
      let base64Data = image;
      let detectedMime = mimeType;
      const dataUriMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (dataUriMatch) {
        detectedMime = dataUriMatch[1];
        base64Data = dataUriMatch[2];
      }

      let langInstruction = "";
      if (language === "ja") {
        langInstruction = "Target language is Japanese. Extract Japanese words/vocabulary from this photo (kanji and kana). For each word, provide 'target' (word in kanji/kana), 'reading' (pure hiragana only, e.g. せんせい, さくら), 'meaning' (in accurate concise Chinese), 'partOfSpeech' (e.g. 名词, 动词, 形容词).";
      } else if (language === "es") {
        langInstruction = "Target language is Spanish. Extract Spanish vocabulary/words from this photo. For each word, provide 'target' (Spanish word with correct accents, e.g. biblioteca, corazón), 'reading' (IPA phonetic / pronunciation e.g. [bje.mbeˈni.ðo]), 'partOfSpeech' (e.g. s.m., s.f., adj., v.), 'meaning' (clear concise Chinese translation), 'example' (a short practical Spanish sentence using this word), 'exampleZh' (Chinese translation of the example sentence).";
      } else if (language === "en") {
        langInstruction = "Target language is English. Extract English vocabulary words or short phrases from this photo. For each word, provide 'target' (the English word), 'reading' (IPA phonetic transcription e.g. /ˈbeɪ.sɪk/), 'partOfSpeech' (e.g. n., v., adj., adv.), 'meaning' (accurate concise Chinese translation), 'example' (a short example sentence), 'exampleZh' (Chinese translation of example sentence).";
      } else {
        langInstruction = "Auto-detect the language from this photo (principally Japanese, Spanish, or English). Extract the most important learning vocabulary words visible in the photo. For each word, include 'target' (original word), 'reading' (hiragana for Japanese, IPA phonetic for Spanish/English), 'partOfSpeech', 'meaning' (concise Chinese translation), and 'language' ('ja' | 'es' | 'en').";
      }

      let modeSpecificDirective = "";
      if (scanMode === "marked_only") {
        modeSpecificDirective = `
*** SPECIAL MISSION: EXTRACTION OF HANDWRITTEN CIRCLES & HIGHLIGHTED WORDS (错题本/圈画生词模式) ***
The student took a photo of their physical book, notebook, printed article, or exam paper.
The student SPECIFICALLY circles or highlights unfamiliar words (生词/错题) using:
1. Highlighter pens: Fluorescent yellow, green, pink, orange, light blue, etc.
2. Pen/Pencil/Marker hand-drawn circles, ellipses, ovals, or rounded rectangles enclosing specific words.
3. Underlines, wavy underlines, or arrows pointing to words.
4. Marginal lists or column notes written by hand.

CRITICAL INSTRUCTIONS:
- PRIORITY #1: Locate and extract ONLY the words or short phrases that have been visibly MARKED, CIRCLED, HIGHLIGHTED, or UNDERLINED by the learner!
- IGNORE regular un-annotated background text, whole paragraphs, questions, or surrounding reading comprehension passages that do NOT have markings.
- For each marked word:
  * 'markType': classify how it was marked ('circle' if circled/boxed, 'highlight' if fluorescent highlighter, 'underline' if underlined, 'handwritten' if written in notes/margins).
  * 'contextSentence': extract the brief original sentence or phrase on the paper where this word was marked (so the student remembers the context in their error notebook).
- Set 'isMarkedModeDetected' to true if you detected actual hand-drawn circles, highlighters, or underlines on the paper.
- GRACEFUL FALLBACK: If and ONLY IF you carefully inspect the entire image and there are completely NO circles, underlines, or highlighters anywhere on the page (e.g. a plain clean textbook page with zero marks), extract between 5 and 15 key vocabulary items from the page, set their 'markType' to 'general', and set 'isMarkedModeDetected' to false.`;
      } else {
        modeSpecificDirective = `
*** FULL PAGE VOCABULARY SCAN MODE ***
Carefully read the text in the image. Identify all key vocabulary items, important terms, or glossary items (extract between 5 and 25 words depending on text density). Set 'markType' to 'general' and 'isMarkedModeDetected' to false.`;
      }

      const promptText = `You are a world-class visual OCR and multilingual lexicography AI assistant specialized in language learning and mistake-notebook extraction.
Analyze the provided image (which could be a photo of a textbook, paper exam, student notebook, blackboard, sign, flashcard, or screen).
${langInstruction}
${modeSpecificDirective}
Ensure all Chinese meanings ('meaning') are accurate, natural, and helpful for a student.
Ignore page numbers, barcodes, timestamps, or irrelevant noisy background text.

Return your response strictly as JSON with this structure:
{
  "detectedLanguage": "ja" | "es" | "en",
  "isMarkedModeDetected": true | false,
  "imageDescription": "Brief Chinese description of the image content and marked words found (e.g. 识别到 5 处荧光笔高光与 3 处圆圈标注生词 / 纸质手写错题本笔记)",
  "words": [
    {
      "target": "word in original language (in clean dictionary/lemma form)",
      "reading": "hiragana for Japanese, or standard IPA phonetic for Spanish/English",
      "partOfSpeech": "part of speech abbreviation (e.g. n., v., adj., adv., 名, 动)",
      "meaning": "accurate concise Chinese translation",
      "markType": "circle" | "highlight" | "underline" | "handwritten" | "general",
      "contextSentence": "sentence or context snippet on the paper where this word was marked",
      "example": "optional short example sentence in target language",
      "exampleZh": "optional Chinese translation of example sentence"
    }
  ]
}`;

      const imagePart = {
        inlineData: {
          mimeType: detectedMime,
          data: base64Data,
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [imagePart, { text: promptText }],
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      if (!parsed.words || !Array.isArray(parsed.words)) {
        parsed.words = [];
      }

      res.json({
        success: true,
        detectedLanguage: parsed.detectedLanguage || (language === "auto" ? "en" : language),
        isMarkedModeDetected: Boolean(parsed.isMarkedModeDetected),
        imageDescription: parsed.imageDescription || "已识别图片中的词汇",
        words: parsed.words,
      });
    } catch (error: any) {
      console.error("OCR extract words error:", error);
      res.status(500).json({
        success: false,
        error: "拍照识词处理失败: " + (error.message || error),
      });
    }
  });

  // Check health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  // Vite dev server middleware or static directory serve
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Dev Server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production files from dist...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA routing fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
