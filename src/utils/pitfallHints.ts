/**
 * Learner Pitfall & Micro-Comparison Hints
 * Provides instant, empathetic, pedagogically sound micro-tips when language learners
 * confuse similar-sounding or visually similar letters in Spanish and Japanese.
 */

export interface PitfallHintResult {
  title: string;
  tip: string;
  icon?: string;
}

export function getPitfallHint(
  expected: string,
  typedChar: string,
  lang: "ja" | "es" | "en" = "es",
  wordContext?: string
): PitfallHintResult | null {
  const normExpected = expected.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normTyped = typedChar.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. SPANISH PITFALL RULES
  if (lang === "es") {
    // A) Single 'r' vs double 'rr' (e.g. pero vs perro, caro vs carro)
    if ((expected === "r" && typedChar === "r") || (normExpected === "r" && normTyped === "r")) {
      return null;
    }
    if (expected.toLowerCase() === "r" && wordContext?.toLowerCase().includes("rr")) {
      return {
        title: "单颤音 vs 双颤音 (r / rr)",
        tip: "此处为双辅音 'rr'（大舌颤音），如 perro 是小狗，pero 是‘但是’，试着轻打两次 'r'！",
        icon: "🐶",
      };
    }
    if (expected.toLowerCase() === "r") {
      return {
        title: "西语 'r' 发音技巧",
        tip: "词中单个 'r' 发轻快单弹舌音（舌尖轻抵上齿龈弹击一次），词首或 'rr' 则需强力多重颤音。",
        icon: "👅",
      };
    }

    // B) 'b' vs 'v'
    if (
      (normExpected === "b" && normTyped === "v") ||
      (normExpected === "v" && normTyped === "b")
    ) {
      return {
        title: "同音字避坑 (b vs v)",
        tip: `西语中 'b' 与 'v' 现代发音完全相同（在元音间均为双唇近音 /β/），此处词源标准拼写为【${expected}】！`,
        icon: "👂",
      };
    }

    // C) 'c' vs 'z' vs 's'
    if (
      (normExpected === "c" && (normTyped === "z" || normTyped === "s")) ||
      (normExpected === "z" && (normTyped === "c" || normTyped === "s"))
    ) {
      return {
        title: "拼写规则 (c / z / s)",
        tip: `在 e/i 前用 'c'（如 cine, cero），在 a/o/u 前用 'z'（如 zapato, corazón），发标准咬舌音 /θ/。此处需输入【${expected}】。`,
        icon: "🎯",
      };
    }

    // D) 'g' vs 'j'
    if (
      (normExpected === "g" && normTyped === "j") ||
      (normExpected === "j" && normTyped === "g")
    ) {
      return {
        title: "小舌喉擦音 (g vs j)",
        tip: `在 e/i 前 'g' 与 'j' 发相同的咽喉擦音 /x/（类似中文'喝'气流摩擦）。此处词根写法为【${expected}】。`,
        icon: "🔥",
      };
    }

    // E) 'll' vs 'y'
    if (
      (normExpected === "l" && normTyped === "y") ||
      (normExpected === "y" && normTyped === "l")
    ) {
      return {
        title: "双字母 (ll vs y)",
        tip: `此处为西语特有双字母 'll'（发硬腭音 /ʎ/ 或 /ʝ/，如 llave, calle），非单字母 'y'。`,
        icon: "🔑",
      };
    }

    // F) Silent 'h'
    if (expected.toLowerCase() === "h") {
      return {
        title: "无声字母 (Silent h)",
        tip: "西语中的 'h' 永远不发音（哑音，如 hola, hermano），但拼写必不可少，极易漏打哦！",
        icon: "🤫",
      };
    }

    // G) Accents: á, é, í, ó, ú, ñ
    if (["á", "é", "í", "ó", "ú", "ñ"].includes(expected.toLowerCase())) {
      return {
        title: "变音与重音符号",
        tip: `目标字母【${expected}】带有特殊符号。本软件支持直接按原字母【${normExpected}】自动容错，或点击下方变音快捷键！`,
        icon: "✨",
      };
    }
  }

  // 2. JAPANESE PITFALL RULES
  if (lang === "ja") {
    // A) ね vs れ vs わ
    if (["ね", "れ", "わ"].includes(expected)) {
      return {
        title: "形近假名辨析 (ね · れ · わ)",
        tip: "右侧带蜷曲小尾巴的是「ね」(ne/猫咪尾巴)，向外撇开的是「れ」(re)，圆弧向内收拢的是「わ」(wa)。",
        icon: "🐈",
      };
    }

    // B) シ vs ツ
    if (["シ", "ツ"].includes(expected)) {
      return {
        title: "片假名辨析 (シ vs ツ)",
        tip: "「シ」(shi) 两点在左、从下往上轻拂；「ツ」(tsu) 两点在上、从上往下右落。",
        icon: "👁️",
      };
    }

    // C) ソ vs ン
    if (["ソ", "ン"].includes(expected)) {
      return {
        title: "片假名辨析 (ソ vs ン)",
        tip: "「ン」(n) 侧笔偏平从左下往右上；「ソ」(so) 上笔竖落从上往右下。",
        icon: "📐",
      };
    }

    // D) さ vs き
    if (["さ", "き"].includes(expected)) {
      return {
        title: "平假名笔画 (さ vs き)",
        tip: "「さ」(sa) 是单横加斜折；「き」(ki) 是双横加斜折。",
        icon: "✏️",
      };
    }

    // E) ろ vs る
    if (["ろ", "る"].includes(expected)) {
      return {
        title: "假名留圈 (ろ vs る)",
        tip: "「る」(ru) 底部带小圆圈（如打包留存），「ろ」(ro) 底部大开敞。",
        icon: "⭕",
      };
    }

    // F) 促音 っ / ッ
    if (expected === "っ" || expected === "ッ") {
      return {
        title: "促音打法提示",
        tip: "小假名促音「っ」在罗马音打字中只需双击下一个音节的声母辅音（例如 kitte 输入 k-i-t-t-e）！",
        icon: "⚡",
      };
    }

    // G) 长音 ー
    if (expected === "ー") {
      return {
        title: "片假名长音 (ー)",
        tip: "横线长音「ー」代表元音延长一拍，按键盘顶部的减号键 [-] 即可输入！",
        icon: "➖",
      };
    }
  }

  return null;
}
