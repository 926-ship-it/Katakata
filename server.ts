import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client with proper User-Agent header and environment API key
  const apiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for generating card stories/origins
  app.post("/api/card-origin", async (req, res) => {
    const { name, meaning, kana, romaji, isEnglish } = req.body;
    
    if (!name || !kana) {
      return res.status(400).json({ error: "Missing name or pronunciation details." });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: isEnglish 
          ? "System GEMINI_API_KEY not configured. Please add your key in Settings > Secrets."
          : "未配置系统的 GEMINI_API_KEY。请在 Settings > Secrets 面板中添加您的 API Key。" 
      });
    }

    try {
      let prompt = "";
      if (isEnglish) {
        prompt = `你是一个博学、亲切的西式与民俗文化学者和高级语言教师。
请针对用户在西式词汇/西方姓名练习中解锁的这个人名（或特定词汇）“${name}”（中文释义：${meaning}），
写一段关于该姓名/词汇的语源由来、它在西方社会或历史中对应的有趣文化背景或精彩故事。
要求：
1. 请完全使用优雅、通俗易懂的【中文】进行撰写。
2. 语言生动、富有画面感（非常适合初学者，像在看集卡大百科）。
3. 字数限制在 160 字以内，排版清晰。
4. 在结尾用英文写一句热情、积极的英文拼写或学习鼓励语句。`;
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
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ story: response.text });
    } catch (error: any) {
      console.error("Gemini Story Generation failed:", error);
      const fallbackMsg = isEnglish
        ? `“${name}”是西方经典词汇/姓名，其中文大意是“${meaning}”。不断练习可以让大脑更熟悉噢，加油！`
        : `“${name}”（${kana}）是日本经典词汇，大意是“${meaning}”。不断重复练习能让大脑分泌多巴胺，加油！`;
      res.status(500).json({ 
        error: isEnglish
          ? "生成生动故事失败（西文备用解析）：" + fallbackMsg
          : "生成生动故事失败，可能是因为网络或 API Key 限制，以下是备用解析：" + fallbackMsg
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
