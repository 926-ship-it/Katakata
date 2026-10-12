/**
 * English Phonetic / IPA (International Phonetic Alphabet) System
 * Provides curated IPA symbols with primary/secondary stress and syllable divisions,
 * plus a rule-based algorithmic G2P fallback engine for custom words and phrases.
 */

export interface EnglishPhoneticInfo {
  us: string;       // US / KK phonetic (e.g., /ˈæp.əl/)
  uk: string;       // UK / DJ phonetic (e.g., /ˈæp.l/)
  primary: string;  // Primary recommended IPA
  syllables?: string[];
}

/**
 * Curated IPA dictionary for system-level overlays, common nouns, names, and concepts.
 */
const CURATED_IPA_DICT: Record<string, { us: string; uk?: string }> = {
  // Names & Historical figures
  "richard": { us: "/ˈrɪtʃ.ərd/", uk: "/ˈrɪtʃ.əd/" },
  "william": { us: "/ˈwɪl.jəm/", uk: "/ˈwɪl.jəm/" },
  "chloe": { us: "/ˈkloʊ.i/", uk: "/ˈkləʊ.i/" },
  "jones": { us: "/dʒoʊnz/", uk: "/dʒəʊnz/" },
  "olivia": { us: "/oʊˈlɪv.i.ə/", uk: "/əˈlɪv.i.ə/" },
  "elizabeth": { us: "/ɪˈlɪz.ə.bəθ/", uk: "/ɪˈlɪz.ə.bəθ/" },
  "james": { us: "/dʒeɪmz/", uk: "/dʒeɪmz/" },
  "robert": { us: "/ˈrɑː.bɚt/", uk: "/ˈrɒb.ət/" },
  "arthur": { us: "/ˈɑːr.θɚ/", uk: "/ˈɑː.θə/" },
  "haruto": { us: "/hɑːˈruː.toʊ/", uk: "/hɑːˈruː.təʊ/" },
  "yuto": { us: "/ˈjuː.toʊ/", uk: "/ˈjuː.təʊ/" },
  "sota": { us: "/ˈsoʊ.tə/", uk: "/ˈsəʊ.tə/" },
  "yua": { us: "/ˈjuː.ɑː/", uk: "/ˈjuː.ɑː/" },
  "mei": { us: "/meɪ/", uk: "/meɪ/" },
  "tsumugi": { us: "/tsuːˈmuː.ɡi/", uk: "/tsuːˈmuː.ɡi/" },
  "akira": { us: "/əˈkɪr.ə/", uk: "/æˈkɪə.rə/" },
  "kenji": { us: "/ˈken.dʒi/", uk: "/ˈken.dʒi/" },
  "ren": { us: "/ren/", uk: "/ren/" },
  "aoi": { us: "/ˈaʊ.i/", uk: "/ˈaʊ.i/" },
  "rin": { us: "/rɪn/", uk: "/rɪn/" },
  "takumi": { us: "/tɑːˈkuː.mi/", uk: "/tɑːˈkuː.mi/" },

  // Nature, food & daily life
  "strawberry": { us: "/ˈstrɔːˌber.i/", uk: "/ˈstrɔː.bər.i/" },
  "mountain": { us: "/ˈmaʊn.tən/", uk: "/ˈmaʊn.tɪn/" },
  "peak": { us: "/piːk/", uk: "/piːk/" },
  "mountain peak": { us: "/ˈmaʊn.tən piːk/", uk: "/ˈmaʊn.tɪn piːk/" },
  "blue": { us: "/bluː/", uk: "/bluː/" },
  "sky": { us: "/skaɪ/", uk: "/skaɪ/" },
  "blue sky": { us: "/ˌbluː ˈskaɪ/", uk: "/ˌbluː ˈskaɪ/" },
  "morning": { us: "/ˈmɔːr.nɪŋ/", uk: "/ˈmɔː.nɪŋ/" },
  "glory": { us: "/ˈɡlɔːr.i/", uk: "/ˈɡlɔː.ri/" },
  "morning glory": { us: "/ˌmɔːr.nɪŋ ˈɡlɔːr.i/", uk: "/ˌmɔː.nɪŋ ˈɡlɔː.ri/" },
  "melody": { us: "/ˈmel.ə.di/", uk: "/ˈmel.ə.di/" },
  "seasons": { us: "/ˈsiː.zənz/", uk: "/ˈsiː.zənz/" },
  "season": { us: "/ˈsiː.zən/", uk: "/ˈsiː.zən/" },
  "sweet": { us: "/swiːt/", uk: "/swiːt/" },
  "cake": { us: "/keɪk/", uk: "/keɪk/" },
  "sweet cake": { us: "/ˌswiːt ˈkeɪk/", uk: "/ˌswiːt ˈkeɪk/" },
  "maple": { us: "/ˈmeɪ.pəl/", uk: "/ˈmeɪ.pəl/" },
  "leaf": { us: "/liːf/", uk: "/liːf/" },
  "maple leaf": { us: "/ˌmeɪ.pəl ˈliːf/", uk: "/ˌmeɪ.pəl ˈliːf/" },
  "tumbling toy": { us: "/ˈtʌm.blɪŋ tɔɪ/", uk: "/ˈtʌm.blɪŋ tɔɪ/" },
  "harmony": { us: "/ˈhɑːr.mə.ni/", uk: "/ˈhɑː.mə.ni/" },
  "broadway": { us: "/ˈbrɔːd.weɪ/", uk: "/ˈbrɔːd.weɪ/" },
  "director": { us: "/dəˈrek.tɚ/", uk: "/daɪˈrek.tə/" },
  "sushi": { us: "/ˈsuː.ʃi/", uk: "/ˈsuː.ʃi/" },
  "rice": { us: "/raɪs/", uk: "/raɪs/" },
  "sushi rice": { us: "/ˈsuː.ʃi raɪs/", uk: "/ˈsuː.ʃi raɪs/" },
  "green": { us: "/ɡriːn/", uk: "/ɡriːn/" },
  "tea": { us: "/tiː/", uk: "/tiː/" },
  "green tea": { us: "/ˌɡriːn ˈtiː/", uk: "/ˌɡriːn ˈtiː/" },
  "spicy": { us: "/ˈspaɪ.si/", uk: "/ˈspaɪ.si/" },
  "noodles": { us: "/ˈnuː.dəlz/", uk: "/ˈnuː.dəlz/" },
  "noodle": { us: "/ˈnuː.dəl/", uk: "/ˈnuː.dəl/" },
  "spicy noodles": { us: "/ˌspaɪ.si ˈnuː.dəlz/", uk: "/ˌspaɪ.si ˈnuː.dəlz/" },
  "cheesecake": { us: "/ˈtʃiːz.keɪk/", uk: "/ˈtʃiːz.keɪk/" },
  "bottled water": { us: "/ˌbɑː.təld ˈwɑː.t̬ɚ/", uk: "/ˌbɒt.əld ˈwɔː.tə/" },
  "cathedral": { us: "/kəˈθiː.drəl/", uk: "/kəˈθiː.drəl/" },
  "shadow agent": { us: "/ˈʃæd.oʊ ˌeɪ.dʒənt/", uk: "/ˈʃæd.əʊ ˌeɪ.dʒənt/" },
  "knight": { us: "/naɪt/", uk: "/naɪt/" },
  "lunch box": { us: "/ˈlʌntʃ ˌbɑːks/", uk: "/ˈlʌntʃ ˌbɒks/" },
  "hot spring": { us: "/ˌhɑːt ˈsprɪŋ/", uk: "/ˌhɒt ˈsprɪŋ/" },
  "firefly": { us: "/ˈfaɪr.flaɪ/", uk: "/ˈfaɪə.flaɪ/" },
  "cicada": { us: "/sɪˈkeɪ.də/", uk: "/sɪˈkɑː.də/" },
  "poetry": { us: "/ˈpoʊ.ə.tri/", uk: "/ˈpəʊ.ɪ.tri/" },
  "gateway": { us: "/ˈɡeɪt.weɪ/", uk: "/ˈɡeɪt.weɪ/" },
  "fireworks": { us: "/ˈfaɪr.wɚks/", uk: "/ˈfaɪə.wɜːks/" },
  "buckwheat": { us: "/ˈbʌk.wiːt/", uk: "/ˈbʌk.wiːt/" },
  "fried shrimp": { us: "/ˌfraɪd ˈʃrɪmp/", uk: "/ˌfraɪd ˈʃrɪmp/" },
  "octopus ball": { us: "/ˈɑːk.tə.pəs bɔːl/", uk: "/ˈɒk.tə.pəs bɔːl/" },
  "mochi": { us: "/ˈmoʊ.tʃi/", uk: "/ˈmɒtʃ.i/" },
  "rice bowl": { us: "/ˈraɪs ˌboʊl/", uk: "/ˈraɪs ˌbəʊl/" },
  "kimono dress": { us: "/kɪˈmoʊ.noʊ dres/", uk: "/kɪˈməʊ.nəʊ dres/" },
  "festival": { us: "/ˈfes.tə.vəl/", uk: "/ˈfes.tɪ.vəl/" },
  "star actor": { us: "/ˈstɑːr ˌæk.tɚ/", uk: "/ˈstɑː ˌæk.tə/" },
  "paper crane": { us: "/ˌpeɪ.pɚ ˈkreɪn/", uk: "/ˌpeɪ.pə ˈkreɪn/" },
  "silk robe": { us: "/ˌsɪlk ˈroʊb/", uk: "/ˌsɪlk ˈrəʊb/" },
  "moon": { us: "/muːn/", uk: "/muːn/" },
  "snow": { us: "/snoʊ/", uk: "/snəʊ/" },
  "wind breeze": { us: "/ˈwɪnd briːz/", uk: "/ˈwɪnd briːz/" },
  "shiba dog": { us: "/ˈʃiː.bə dɔːɡ/", uk: "/ˈʃiː.bə dɒɡ/" },
  "katana sword": { us: "/kəˈtɑː.nə sɔːrd/", uk: "/kəˈtɑː.nə sɔːd/" },
  "comic book": { us: "/ˈkɑː.mɪk bʊk/", uk: "/ˈkɒm.ɪk bʊk/" },
  "grilled chicken": { us: "/ˌɡrɪld ˈtʃɪk.ən/", uk: "/ˌɡrɪld ˈtʃɪk.ɪn/" },
  "golden pavilion": { us: "/ˌɡoʊl.dən pəˈvɪl.jən/", uk: "/ˌɡəʊl.dən pəˈvɪl.jən/" },
  "green wasabi": { us: "/ˌɡriːn wəˈsɑː.bi/", uk: "/ˌɡriːn wəˈsɑː.bi/" },
  "sunshine": { us: "/ˈsʌn.ʃaɪn/", uk: "/ˈsʌn.ʃaɪn/" },
  "volcano peak": { us: "/vɑːlˈkeɪ.noʊ piːk/", uk: "/vɒlˈkeɪ.nəʊ piːk/" },
  "general": { us: "/ˈdʒen.ər.əl/", uk: "/ˈdʒen.ər.əl/" },
  "straw mat": { us: "/ˌstrɔː ˈmæt/", uk: "/ˌstrɔː ˈmæt/" },
  "camellia": { us: "/kəˈmiː.li.ə/", uk: "/kəˈmiː.li.ə/" },
  "barbecue sauce": { us: "/ˈbɑːr.bə.kjuː sɔːs/", uk: "/ˈbɑː.bɪ.kjuː sɔːs/" },
  "meditation": { us: "/ˌmed.əˈteɪ.ʃən/", uk: "/ˌmed.ɪˈteɪ.ʃən/" },
  "traditional harp": { us: "/trəˈdɪʃ.ən.əl hɑːrp/", uk: "/trəˈdɪʃ.ən.əl hɑːp/" },
  "calligraphy": { us: "/kəˈlɪɡ.rə.fi/", uk: "/kəˈlɪɡ.rə.fi/" },
  "folding fan": { us: "/ˌfoʊl.dɪŋ ˈfæn/", uk: "/ˌfəʊl.dɪŋ ˈfæn/" },
  "classic harp": { us: "/ˌklæs.ɪk ˈhɑːrp/", uk: "/ˌklæs.ɪk ˈhɑːp/" },
  "paper umbrella": { us: "/ˌpeɪ.pɚ ʌmˈbrel.ə/", uk: "/ˌpeɪ.pə ʌmˈbrel.ə/" },
  "citrus fruit": { us: "/ˈsɪt.rəs fruːt/", uk: "/ˈsɪt.rəs fruːt/" },
  "wrapping cloth": { us: "/ˈræp.ɪŋ klɑːθ/", uk: "/ˈræp.ɪŋ klɒθ/" },
  "white radish": { us: "/ˌwaɪt ˈræd.ɪʃ/", uk: "/ˌwaɪt ˈræd.ɪʃ/" },
  "temple clean": { us: "/ˈtem.pəl kliːn/", uk: "/ˈtem.pəl kliːn/" },
  "sudoku puzzle": { us: "/suːˈdoʊ.kuː ˌpʌz.əl/", uk: "/suːˈdəʊ.kuː ˌpʌz.əl/" },
  "flower art": { us: "/ˈflaʊ.ɚ ɑːrt/", uk: "/ˈflaʊ.ə ɑːt/" },
  "cup and ball": { us: "/ˌkʌp ənd ˈbɔːl/", uk: "/ˌkʌp ənd ˈbɔːl/" },
  "abacus tool": { us: "/ˈæb.ə.kəs tuːl/", uk: "/ˈæb.ə.kəs tuːl/" },
  "fortune cat": { us: "/ˈfɔːr.tʃuːn kæt/", uk: "/ˈfɔː.tʃuːn kæt/" },
  "wooden doll": { us: "/ˌwʊd.ən ˈdɑːl/", uk: "/ˌwʊd.ən ˈdɒl/" },
  "mountain tengu": { us: "/ˈmaʊn.tən ˈteŋ.ɡuː/", uk: "/ˈmaʊn.tɪn ˈteŋ.ɡuː/" },
  "wish strip": { us: "/ˈwɪʃ strɪp/", uk: "/ˈwɪʃ strɪp/" },
  "bento box": { us: "/ˈben.toʊ bɑːks/", uk: "/ˈben.təʊ bɒks/" },
  "snow igloo": { us: "/ˈsnoʊ ˌɪɡ.luː/", uk: "/ˈsnəʊ ˌɪɡ.luː/" },
  "rain doll": { us: "/ˈreɪn dɑːl/", uk: "/ˈreɪn dɒl/" },
  "sparkler fire": { us: "/ˈspɑːr.klɚ ˈfaɪr/", uk: "/ˈspɑː.klə ˈfaɪə/" },
  "flying crane": { us: "/ˌflaɪ.ɪŋ ˈkreɪn/", uk: "/ˌflaɪ.ɪŋ ˈkreɪn/" },
  "mount fuji": { us: "/ˌmaʊnt ˈfuː.dʒi/", uk: "/ˌmaʊnt ˈfuː.dʒi/" },
  "hot spring egg": { us: "/ˌhɑːt ˈsprɪŋ eɡ/", uk: "/ˌhɒt ˈsprɪŋ eɡ/" },
  "green bean": { us: "/ˌɡriːn ˈbiːn/", uk: "/ˌɡriːn ˈbiːn/" },
  "raccoon dog": { us: "/rəˈkuːn dɔːɡ/", uk: "/rəˈkuːn dɒɡ/" },
  "maiden": { us: "/ˈmeɪ.dən/", uk: "/ˈmeɪ.dən/" },

  // Basic everyday essentials
  "apple": { us: "/ˈæp.əl/", uk: "/ˈæp.l/" },
  "banana": { us: "/bəˈnæn.ə/", uk: "/bəˈnɑː.nə/" },
  "orange": { us: "/ˈɔːr.ɪndʒ/", uk: "/ˈɒr.ɪndʒ/" },
  "water": { us: "/ˈwɑː.t̬ɚ/", uk: "/ˈwɔː.tə/" },
  "coffee": { us: "/ˈkɑː.fi/", uk: "/ˈkɒf.i/" },
  "bread": { us: "/bred/", uk: "/bred/" },
  "cheese": { us: "/tʃiːz/", uk: "/tʃiːz/" },
  "house": { us: "/haʊs/", uk: "/haʊs/" },
  "friend": { us: "/frend/", uk: "/frend/" },
  "family": { us: "/ˈfæm.əl.i/", uk: "/ˈfæm.əl.i/" },
  "love": { us: "/lʌv/", uk: "/lʌv/" },
  "life": { us: "/laɪf/", uk: "/laɪf/" },
  "time": { us: "/taɪm/", uk: "/taɪm/" },
  "dream": { us: "/driːm/", uk: "/driːm/" },
  "heart": { us: "/hɑːrt/", uk: "/hɑːt/" },
  "journey": { us: "/ˈdʒɝː.ni/", uk: "/ˈdʒɜː.ni/" },
  "sun": { us: "/sʌn/", uk: "/sʌn/" },
  "star": { us: "/stɑːr/", uk: "/stɑː/" },
  "beach": { us: "/biːtʃ/", uk: "/biːtʃ/" },
  "sea": { us: "/siː/", uk: "/siː/" },
  "city": { us: "/ˈsɪt.i/", uk: "/ˈsɪt.i/" },
  "world": { us: "/wɝːld/", uk: "/wɜːld/" },
  "road": { us: "/roʊd/", uk: "/rəʊd/" },
  "path": { us: "/pæθ/", uk: "/pɑːθ/" },
  "delicious": { us: "/dɪˈlɪʃ.əs/", uk: "/dɪˈlɪʃ.əs/" },
  "beautiful": { us: "/ˈbjuː.t̬ə.fəl/", uk: "/ˈbjuː.tɪ.fəl/" },
  "happy": { us: "/ˈhæp.i/", uk: "/ˈhæp.i/" },
  "easy": { us: "/ˈiː.zi/", uk: "/ˈiː.zi/" },
  "hello": { us: "/həˈloʊ/", uk: "/həˈləʊ/" },
  "goodbye": { us: "/ˌɡʊdˈbaɪ/", uk: "/ˌɡʊdˈbaɪ/" },
  "please": { us: "/pliːz/", uk: "/pliːz/" },
  "thank": { us: "/θæŋk/", uk: "/θæŋk/" },
  "thanks": { us: "/θæŋks/", uk: "/θæŋks/" },
  "welcome": { us: "/ˈwel.kəm/", uk: "/ˈwel.kəm/" },
  "computer": { us: "/kəmˈpjuː.t̬ɚ/", uk: "/kəmˈpjuː.tə/" },
  "algorithm": { us: "/ˈæl.ɡə.rɪ.ðəm/", uk: "/ˈæl.ɡə.rɪ.ðəm/" },
  "coding": { us: "/ˈkoʊ.dɪŋ/", uk: "/ˈkəʊ.dɪŋ/" },
  "keyboard": { us: "/ˈkiː.bɔːrd/", uk: "/ˈkiː.bɔːd/" },
  "language": { us: "/ˈlæŋ.ɡwɪdʒ/", uk: "/ˈlæŋ.ɡwɪdʒ/" },
  "learning": { us: "/ˈlɝː.nɪŋ/", uk: "/ˈlɜː.nɪŋ/" },
  "practice": { us: "/ˈpræk.tɪs/", uk: "/ˈpræk.tɪs/" },
  "memory": { us: "/ˈmem.ər.i/", uk: "/ˈmem.ər.i/" },
  "speed": { us: "/spiːd/", uk: "/spiːd/" },
  "accuracy": { us: "/ˈæk.jɚ.ə.si/", uk: "/ˈæk.jə.rə.si/" },
};

/**
 * Common English grapheme-to-phoneme heuristic patterns for algorithmic fallback.
 */
function heuristicWordToIpa(word: string): string {
  const clean = word.toLowerCase().trim();
  if (!clean) return "";

  // Direct lookup
  if (CURATED_IPA_DICT[clean]) {
    return CURATED_IPA_DICT[clean].us;
  }

  // Multi-word phrase handling (e.g. "Mountain Road")
  if (clean.includes(" ")) {
    const parts = clean.split(/\s+/);
    const ipaParts = parts.map((p) => heuristicWordToIpa(p));
    return ipaParts.join(" ");
  }

  // Remove trailing punctuation
  const stripped = clean.replace(/[^a-z]/g, "");
  if (!stripped) return `/${word}/`;

  if (CURATED_IPA_DICT[stripped]) {
    return CURATED_IPA_DICT[stripped].us;
  }

  // Heuristic rule-based synthesis for arbitrary English words
  let ipa = stripped;

  // Silent combinations and initial digraphs
  ipa = ipa.replace(/^kn/, "n");
  ipa = ipa.replace(/^wr/, "r");
  ipa = ipa.replace(/^ps/, "s");
  ipa = ipa.replace(/^gn/, "n");

  // Common strong suffixes
  ipa = ipa.replace(/tion$/g, "ʃən");
  ipa = ipa.replace(/sion$/g, "ʒən");
  ipa = ipa.replace(/cious$/g, "ʃəs");
  ipa = ipa.replace(/tious$/g, "ʃəs");
  ipa = ipa.replace(/cial$/g, "ʃəl");
  ipa = ipa.replace(/tial$/g, "ʃəl");
  ipa = ipa.replace(/ture$/g, "tʃɚ");
  ipa = ipa.replace(/able$/g, "əbəl");
  ipa = ipa.replace(/ible$/g, "ɪbəl");
  ipa = ipa.replace(/ment$/g, "mənt");
  ipa = ipa.replace(/ness$/g, "nɪs");
  ipa = ipa.replace(/less$/g, "lɪs");
  ipa = ipa.replace(/ful$/g, "fʊl");
  ipa = ipa.replace(/ing$/g, "ɪŋ");
  ipa = ipa.replace(/ous$/g, "əs");
  ipa = ipa.replace(/ize$/g, "aɪz");
  ipa = ipa.replace(/ise$/g, "aɪz");
  ipa = ipa.replace(/ly$/g, "li");

  // Vowel digraphs and combinations
  ipa = ipa.replace(/ight/g, "aɪt");
  ipa = ipa.replace(/igh/g, "aɪ");
  ipa = ipa.replace(/ough/g, "ɔː");
  ipa = ipa.replace(/augh/g, "ɔː");
  ipa = ipa.replace(/ee/g, "iː");
  ipa = ipa.replace(/ea/g, "iː");
  ipa = ipa.replace(/oo/g, "uː");
  ipa = ipa.replace(/ou/g, "aʊ");
  ipa = ipa.replace(/ow/g, "oʊ");
  ipa = ipa.replace(/oa/g, "oʊ");
  ipa = ipa.replace(/ai/g, "eɪ");
  ipa = ipa.replace(/ay/g, "eɪ");
  ipa = ipa.replace(/oi/g, "ɔɪ");
  ipa = ipa.replace(/oy/g, "ɔɪ");
  ipa = ipa.replace(/aw/g, "ɔː");
  ipa = ipa.replace(/au/g, "ɔː");

  // Consonant clusters
  ipa = ipa.replace(/ph/g, "f");
  ipa = ipa.replace(/ch/g, "tʃ");
  ipa = ipa.replace(/sh/g, "ʃ");
  ipa = ipa.replace(/th/g, "θ");
  ipa = ipa.replace(/ck/g, "k");
  ipa = ipa.replace(/ng/g, "ŋ");
  ipa = ipa.replace(/qu/g, "kw");
  ipa = ipa.replace(/wh/g, "w");

  // Magic e: a_e -> eɪ, i_e -> aɪ, o_e -> oʊ, u_e -> juː
  ipa = ipa.replace(/a([b-df-hj-np-tv-z])e$/g, "eɪ$1");
  ipa = ipa.replace(/i([b-df-hj-np-tv-z])e$/g, "aɪ$1");
  ipa = ipa.replace(/o([b-df-hj-np-tv-z])e$/g, "oʊ$1");
  ipa = ipa.replace(/u([b-df-hj-np-tv-z])e$/g, "juː$1");

  // Single vowels heuristic
  ipa = ipa.replace(/a/g, "æ");
  ipa = ipa.replace(/e/g, "e");
  ipa = ipa.replace(/i/g, "ɪ");
  ipa = ipa.replace(/o/g, "ɑː");
  ipa = ipa.replace(/u/g, "ʌ");
  ipa = ipa.replace(/y$/g, "i");

  // Add primary stress marker at front if not present
  if (!ipa.startsWith("ˈ") && !ipa.startsWith("ˌ")) {
    ipa = "ˈ" + ipa;
  }

  return `/${ipa}/`;
}

/**
 * Returns formatted IPA phonetic transcription for any English word or phrase.
 * If dialect is specified as "uk" and available, returns UK transcription.
 */
export function getEnglishPhonetic(word: string, dialect: "us" | "uk" = "us"): string {
  if (!word || typeof word !== "string") return "";
  const clean = word.toLowerCase().trim();

  // 1. Direct dictionary match
  if (CURATED_IPA_DICT[clean]) {
    const entry = CURATED_IPA_DICT[clean];
    if (dialect === "uk" && entry.uk) return entry.uk;
    return entry.us;
  }

  // 2. Phrase matching word-by-word
  if (clean.includes(" ")) {
    const parts = clean.split(/\s+/).filter(Boolean);
    const ipaParts = parts.map((part) => {
      if (CURATED_IPA_DICT[part]) {
        const item = CURATED_IPA_DICT[part];
        return dialect === "uk" && item.uk ? item.uk.replace(/^\/|\/$/g, "") : item.us.replace(/^\/|\/$/g, "");
      }
      return heuristicWordToIpa(part).replace(/^\/|\/$/g, "");
    });
    return `/${ipaParts.join(" ")}/`;
  }

  // 3. Heuristic fallback
  return heuristicWordToIpa(clean);
}

/**
 * Returns detailed phonetic metadata (US, UK, display syllables)
 */
export function getEnglishPhoneticDetails(word: string): EnglishPhoneticInfo {
  const clean = word.toLowerCase().trim();
  const us = getEnglishPhonetic(clean, "us");
  const uk = getEnglishPhonetic(clean, "uk");
  
  // Extract clean readable syllables from IPA (splitting by '.' or spaces)
  const syllables = us
    .replace(/^\/|\/$/g, "")
    .replace(/[ˈˌ]/g, "")
    .split(/[.\s]/)
    .filter(Boolean);

  return {
    us,
    uk,
    primary: us,
    syllables: syllables.length > 0 ? syllables : [clean],
  };
}

/**
 * Helper to test or clean IPA display text
 */
export function cleanIpa(ipa: string): string {
  if (!ipa) return "";
  let res = ipa.trim();
  if (!res.startsWith("/")) res = "/" + res;
  if (!res.endsWith("/")) res = res + "/";
  return res;
}
