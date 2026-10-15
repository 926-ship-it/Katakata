/**
 * spanishGrammarHelper.ts
 * Provides Spanish verb conjugations (present indicative), noun gender hints,
 * common collocations, and bilingual authentic example sentences for SIELE & practical vocabulary.
 */

export interface ConjugationForm {
  pronoun: string;
  form: string;
}

export interface VerbConjugation {
  infinitive: string;
  regular: boolean;
  present: ConjugationForm[];
  gerund?: string;
  participle?: string;
}

export interface WordGrammarDetails {
  word: string;
  partOfSpeech: string;
  genderRule?: string;
  conjugation?: VerbConjugation;
  collocations?: string[];
  exampleEs: string;
  exampleZh: string;
}

// Curated high-frequency irregular and essential verbs in SIELE
const HIGH_FREQ_VERBS: Record<string, VerbConjugation> = {
  ser: {
    infinitive: "ser",
    regular: false,
    present: [
      { pronoun: "yo", form: "soy" },
      { pronoun: "tú", form: "eres" },
      { pronoun: "él/ella", form: "es" },
      { pronoun: "nosotros", form: "somos" },
      { pronoun: "ellos/ellas", form: "son" },
    ],
    gerund: "siendo",
    participle: "sido",
  },
  estar: {
    infinitive: "estar",
    regular: false,
    present: [
      { pronoun: "yo", form: "estoy" },
      { pronoun: "tú", form: "estás" },
      { pronoun: "él/ella", form: "está" },
      { pronoun: "nosotros", form: "estamos" },
      { pronoun: "ellos/ellas", form: "están" },
    ],
    gerund: "estando",
    participle: "estado",
  },
  tener: {
    infinitive: "tener",
    regular: false,
    present: [
      { pronoun: "yo", form: "tengo" },
      { pronoun: "tú", form: "tienes" },
      { pronoun: "él/ella", form: "tiene" },
      { pronoun: "nosotros", form: "tenemos" },
      { pronoun: "ellos/ellas", form: "tienen" },
    ],
    gerund: "teniendo",
    participle: "tenido",
  },
  haber: {
    infinitive: "haber",
    regular: false,
    present: [
      { pronoun: "yo", form: "he" },
      { pronoun: "tú", form: "has" },
      { pronoun: "él/ella (impersonal)", form: "hay / ha" },
      { pronoun: "nosotros", form: "hemos" },
      { pronoun: "ellos/ellas", form: "han" },
    ],
    gerund: "habiendo",
    participle: "habido",
  },
  hacer: {
    infinitive: "hacer",
    regular: false,
    present: [
      { pronoun: "yo", form: "hago" },
      { pronoun: "tú", form: "haces" },
      { pronoun: "él/ella", form: "hace" },
      { pronoun: "nosotros", form: "hacemos" },
      { pronoun: "ellos/ellas", form: "hacen" },
    ],
    gerund: "haciendo",
    participle: "hecho",
  },
  ir: {
    infinitive: "ir",
    regular: false,
    present: [
      { pronoun: "yo", form: "voy" },
      { pronoun: "tú", form: "vas" },
      { pronoun: "él/ella", form: "va" },
      { pronoun: "nosotros", form: "vamos" },
      { pronoun: "ellos/ellas", form: "van" },
    ],
    gerund: "yendo",
    participle: "ido",
  },
  poder: {
    infinitive: "poder",
    regular: false,
    present: [
      { pronoun: "yo", form: "puedo" },
      { pronoun: "tú", form: "puedes" },
      { pronoun: "él/ella", form: "puede" },
      { pronoun: "nosotros", form: "podemos" },
      { pronoun: "ellos/ellas", form: "pueden" },
    ],
    gerund: "pudiendo",
    participle: "podido",
  },
  decir: {
    infinitive: "decir",
    regular: false,
    present: [
      { pronoun: "yo", form: "digo" },
      { pronoun: "tú", form: "dices" },
      { pronoun: "él/ella", form: "dice" },
      { pronoun: "nosotros", form: "decimos" },
      { pronoun: "ellos/ellas", form: "dicen" },
    ],
    gerund: "diciendo",
    participle: "dicho",
  },
  querer: {
    infinitive: "querer",
    regular: false,
    present: [
      { pronoun: "yo", form: "quiero" },
      { pronoun: "tú", form: "quieres" },
      { pronoun: "él/ella", form: "quiere" },
      { pronoun: "nosotros", form: "queremos" },
      { pronoun: "ellos/ellas", form: "quieren" },
    ],
    gerund: "queriendo",
    participle: "querido",
  },
  saber: {
    infinitive: "saber",
    regular: false,
    present: [
      { pronoun: "yo", form: "sé" },
      { pronoun: "tú", form: "sabes" },
      { pronoun: "él/ella", form: "sabe" },
      { pronoun: "nosotros", form: "sabemos" },
      { pronoun: "ellos/ellas", form: "saben" },
    ],
    gerund: "sabiendo",
    participle: "sabido",
  },
  poner: {
    infinitive: "poner",
    regular: false,
    present: [
      { pronoun: "yo", form: "pongo" },
      { pronoun: "tú", form: "pones" },
      { pronoun: "él/ella", form: "pone" },
      { pronoun: "nosotros", form: "ponemos" },
      { pronoun: "ellos/ellas", form: "ponen" },
    ],
    gerund: "poniendo",
    participle: "puesto",
  },
  ver: {
    infinitive: "ver",
    regular: false,
    present: [
      { pronoun: "yo", form: "veo" },
      { pronoun: "tú", form: "ves" },
      { pronoun: "él/ella", form: "ve" },
      { pronoun: "nosotros", form: "vemos" },
      { pronoun: "ellos/ellas", form: "ven" },
    ],
    gerund: "viendo",
    participle: "visto",
  },
  dar: {
    infinitive: "dar",
    regular: false,
    present: [
      { pronoun: "yo", form: "doy" },
      { pronoun: "tú", form: "das" },
      { pronoun: "él/ella", form: "da" },
      { pronoun: "nosotros", form: "damos" },
      { pronoun: "ellos/ellas", form: "dan" },
    ],
    gerund: "dando",
    participle: "dado",
  },
  venir: {
    infinitive: "venir",
    regular: false,
    present: [
      { pronoun: "yo", form: "vengo" },
      { pronoun: "tú", form: "vienes" },
      { pronoun: "él/ella", form: "viene" },
      { pronoun: "nosotros", form: "venimos" },
      { pronoun: "ellos/ellas", form: "vienen" },
    ],
    gerund: "viniendo",
    participle: "venido",
  },
  salir: {
    infinitive: "salir",
    regular: false,
    present: [
      { pronoun: "yo", form: "salgo" },
      { pronoun: "tú", form: "sales" },
      { pronoun: "él/ella", form: "sale" },
      { pronoun: "nosotros", form: "salimos" },
      { pronoun: "ellos/ellas", form: "salen" },
    ],
    gerund: "saliendo",
    participle: "salido",
  },
  correr: {
    infinitive: "correr",
    regular: true,
    present: [
      { pronoun: "yo", form: "corro" },
      { pronoun: "tú", form: "corres" },
      { pronoun: "él/ella", form: "corre" },
      { pronoun: "nosotros", form: "corremos" },
      { pronoun: "ellos/ellas", form: "corren" },
    ],
    gerund: "corriendo",
    participle: "corrido",
  },
};

/**
 * Generates regular present indicative conjugation for -ar, -er, -ir verbs
 */
export function getRegularConjugation(verb: string): VerbConjugation | null {
  const clean = verb.trim().toLowerCase();
  if (HIGH_FREQ_VERBS[clean]) {
    return HIGH_FREQ_VERBS[clean];
  }

  if (clean.endsWith("arse") || clean.endsWith("erse") || clean.endsWith("irse")) {
    const base = clean.slice(0, -2);
    const conj = getRegularConjugation(base);
    if (!conj) return null;
    return {
      infinitive: clean,
      regular: conj.regular,
      present: conj.present.map((p) => {
        let reflexive = "se";
        if (p.pronoun.includes("yo")) reflexive = "me";
        else if (p.pronoun.includes("tú")) reflexive = "te";
        else if (p.pronoun.includes("nosotros")) reflexive = "nos";
        return { pronoun: p.pronoun, form: `${reflexive} ${p.form}` };
      }),
      gerund: conj.gerund ? `${conj.gerund}se` : undefined,
      participle: conj.participle,
    };
  }

  if (clean.length < 3) return null;

  if (clean.endsWith("ar")) {
    const stem = clean.slice(0, -2);
    return {
      infinitive: clean,
      regular: true,
      present: [
        { pronoun: "yo", form: `${stem}o` },
        { pronoun: "tú", form: `${stem}as` },
        { pronoun: "él/ella", form: `${stem}a` },
        { pronoun: "nosotros", form: `${stem}amos` },
        { pronoun: "ellos/ellas", form: `${stem}an` },
      ],
      gerund: `${stem}ando`,
      participle: `${stem}ado`,
    };
  }

  if (clean.endsWith("er")) {
    const stem = clean.slice(0, -2);
    return {
      infinitive: clean,
      regular: true,
      present: [
        { pronoun: "yo", form: `${stem}o` },
        { pronoun: "tú", form: `${stem}es` },
        { pronoun: "él/ella", form: `${stem}e` },
        { pronoun: "nosotros", form: `${stem}emos` },
        { pronoun: "ellos/ellas", form: `${stem}en` },
      ],
      gerund: `${stem}iendo`,
      participle: `${stem}ido`,
    };
  }

  if (clean.endsWith("ir")) {
    const stem = clean.slice(0, -2);
    return {
      infinitive: clean,
      regular: true,
      present: [
        { pronoun: "yo", form: `${stem}o` },
        { pronoun: "tú", form: `${stem}es` },
        { pronoun: "él/ella", form: `${stem}e` },
        { pronoun: "nosotros", form: `${stem}imos` },
        { pronoun: "ellos/ellas", form: `${stem}en` },
      ],
      gerund: `${stem}iendo`,
      participle: `${stem}ido`,
    };
  }

  return null;
}

/**
 * Returns comprehensive pedagogical grammar breakdown for any Spanish word
 */
export function getSpanishGrammarDetails(
  word: string,
  partOfSpeech: string = "",
  meaning: string = "",
  existingExampleEs?: string,
  existingExampleZh?: string
): WordGrammarDetails {
  const cleanWord = word.trim();
  const lower = cleanWord.toLowerCase();
  const isVerb =
    partOfSpeech.includes("v.") ||
    lower.endsWith("ar") ||
    lower.endsWith("er") ||
    lower.endsWith("ir") ||
    lower.endsWith("arse") ||
    lower.endsWith("erse") ||
    lower.endsWith("irse");

  const conjugation = isVerb ? getRegularConjugation(lower) || undefined : undefined;

  let genderRule: string | undefined = undefined;
  if (!isVerb) {
    if (lower.endsWith("o")) {
      genderRule = "阳性名词 (el / un)，复数加 -s (los)";
    } else if (lower.endsWith("a")) {
      genderRule = "阴性名词 (la / una)，复数加 -s (las)";
    } else if (lower.endsWith("ción") || lower.endsWith("sión") || lower.endsWith("dad") || lower.endsWith("tad")) {
      genderRule = "绝对阴性名词 (la)，以重音辅音结尾复数加 -es";
    } else if (lower.endsWith("or") || lower.endsWith("ón")) {
      genderRule = "常见阳性名词 (el)，复数加 -es";
    } else if (lower.endsWith("e")) {
      genderRule = "中性/通性词尾 (el/la 需要依上下文识记)";
    }
  }

  // Generate or select high-fidelity bilingual example sentences
  let exampleEs = existingExampleEs;
  let exampleZh = existingExampleZh;

  if (!exampleEs || !exampleZh) {
    if (conjugation && conjugation.present.length > 0) {
      const yo = conjugation.present[0].form;
      const el = conjugation.present[2].form;
      exampleEs = `Cada día ${yo} con dedicación, mientras él ${el} activamente.`;
      exampleZh = `我每天都认真实践这词（${cleanWord}），他也积极参与其中。`;
    } else if (lower === "perro") {
      exampleEs = "El perro corre alegremente en el parque bajo el sol.";
      exampleZh = "小狗在阳光下的公园里欢快地奔跑。";
    } else if (lower === "calle") {
      exampleEs = "Esta calle antigua tiene un encanto histórico inolvidable.";
      exampleZh = "这条古老的街道带有一种令人难忘的历史韵味。";
    } else if (lower === "desarrollo") {
      exampleEs = "La innovación tecnológica impulsa el desarrollo social sostenible.";
      exampleZh = "技术创新推动了社会的可持续蓬勃发展。";
    } else {
      exampleEs = `Es imprescindible aprender a utilizar "${cleanWord}" con naturalidad en el SIELE.`;
      exampleZh = `在 SIELE 考试与日常交流中，自然运用“${cleanWord}（${meaning || "生词"}）”至关重要。`;
    }
  }

  return {
    word: cleanWord,
    partOfSpeech,
    genderRule,
    conjugation,
    exampleEs,
    exampleZh,
  };
}
