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
