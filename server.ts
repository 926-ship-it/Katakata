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
        prompt = `You are an erudite, friendly scholar of Japanese folklore and cultures, and an advanced Japanese language instructor.
Please write a short cultural backstory or interesting wind-tale of the name/word "${name}" (Kana: ${kana}, Romaji: ${romaji}, Meaning: ${meaning}) which the user just unlocked.
Requirements:
1. Elegant, vivid, easy to understand, and highly engaging for beginners (ideal for card-collecting encyclopedias).
2. Word limit: 160 words, clean formatting.
3. End the description with a warm, encouraging sentence (with Japanese kana/romaji) to keep the user motivated in learning.`;
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
        ? `"${name}" (${kana}) is a classic Japanese name/word representing "${meaning}". Practicing continuously helps lock it in memory. Keep going!`
        : `“${name}”（${kana}）是日本经典词汇，大意是“${meaning}”。不断重复练习能让大脑分泌多巴胺，加油！`;
      res.status(500).json({ 
        error: isEnglish
          ? "Story generation failed. Backup interpretation: " + fallbackMsg
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
