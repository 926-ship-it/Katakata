// Clean translation system for English mode in Katakata
import { CELEBRITY_ENGLISH_OVERLAYS } from "../data/celebrityData";
import { KPOP_RIVALRY_ENGLISH_OVERLAYS } from "../data/kpopAndRivalryData";

const BASE_LANG_MAPPING: Record<string, { title: string; categoryName: string; meaning: string }> = {
  sato: {
    title: "Sato (Family Name)",
    categoryName: "Japanese Names",
    meaning: "The #1 Japanese surname. Traced back to the aristocratic Fujiwara clan's branch in the Heian period."
  },
  suzuki: {
    title: "Suzuki (Family Name)",
    categoryName: "Japanese Names",
    meaning: "The #2 Japanese surname. Mystically related to the sacred bell representing holy trees and heavy harvests."
  },
  kimura: {
    title: "Kimura (Family Name)",
    categoryName: "Japanese Names",
    meaning: "Literally meaning 'village surrounded by trees'. A historic family name evoking serene rustic vibes."
  },
  tanaka: {
    title: "Tanaka (Family Name)",
    categoryName: "Japanese Names",
    meaning: "Literally meaning 'middle of the rice fields'. A foundational agrarian family name of ancient Japan."
  },
  yamada: {
    title: "Yamada (Family Name)",
    categoryName: "Japanese Names",
    meaning: "Literally meaning 'rice field at the mountain's foot'. An archetypal Japanese family name."
  },
  oda: {
    title: "Oda (Historical Surname)",
    categoryName: "Japanese Names",
    meaning: "The legendary surname of Oda Nobunaga, the epochal Sengoku warlord who pioneered national unification."
  },
  sakura: {
    title: "Cherry Blossom",
    categoryName: "Nature & Scenery",
    meaning: "Cherry blossoms, the ultimate icon of Japanese spring, embodying the ephemeral aesthetic of Mono no Aware."
  },
  fuji: {
    title: "Mount Fuji",
    categoryName: "Nature & Scenery",
    meaning: "Mount Fuji, the majestic volcanic peak symbolizing longevity, eternity, and supreme fortune."
  },
  aozora: {
    title: "Blue Sky",
    categoryName: "Nature & Scenery",
    meaning: "Blue sky. Clear, crisp sunny skies representing dynamic Japanese aesthetic palettes of pure indigo."
  },
  asagao: {
    title: "Morning Glory",
    categoryName: "Nature & Scenery",
    meaning: "Morning glory. Literally meaning 'morning face'. It blooms at dawn and fades by noon."
  },
  kotone: {
    title: "Kotone (Harp Sound)",
    categoryName: "Japanese Names",
    meaning: "The elegant resonance of a Koto (Japanese harp). Reflects grace, peace, and classical poetry."
  },
  shiki: {
    title: "Four Seasons",
    categoryName: "Nature & Scenery",
    meaning: "Four seasons. The rhythmic rotation of spring sakura, summer festivals, autumn maples, and winter snow."
  },
  dango: {
    title: "Sweet Dumplings",
    categoryName: "Cuisine & Food",
    meaning: "Traditional skewered sweet rice flour dumplings, featured in core folklore and seasonal feasts."
  },
  momiji: {
    title: "Autumn Maple",
    categoryName: "Nature & Scenery",
    meaning: "Autumn maple leaves colored in fiery crimson, representing elegant walks under scarlet tree canopies."
  },
  daruma: {
    title: "Daruma Doll",
    categoryName: "Tradition & Folklore",
    meaning: "Daruma doll, a tumbling talisman of luck. Draw one pupil upon a wish, and the other upon completion."
  },
  heiwa: {
    title: "Peace",
    categoryName: "Tradition & Folklore",
    meaning: "Peace and quiet harmony. A vital concept deeply embedded in Japanese Zen lifestyle and daily wisdom."
  },
  kabuki: {
    title: "Kabuki Theatre",
    categoryName: "Tradition & Folklore",
    meaning: "Traditional theatre art combining magnificent stylized makeup, grand attire, and high-impact actions."
  },
  toyotomi: {
    title: "Toyotomi (Historical Name)",
    categoryName: "Japanese Names",
    meaning: "The imperial surname of Toyotomi Hideyoshi, the great Sengoku unifier of feudal Japan."
  },
  tokugawa: {
    title: "Tokugawa (Historical Name)",
    categoryName: "Japanese Names",
    meaning: "The legendary clan of Tokugawa Ieyasu that established 250 years of peaceful Edo shogunate rule."
  },
  kawabata: {
    title: "Kawabata (Novelist Name)",
    categoryName: "Japanese Names",
    meaning: "Yasunari Kawabata, the first Japanese Nobel laureate. His literature traces profound ephemeral beauty."
  },
  miyazaki: {
    title: "Miyazaki (Anime Director)",
    categoryName: "Japanese Names",
    meaning: "Hayao Miyazaki, globally acclaimed anime maestro whose touching hand-drawn masterpieces warm humanity."
  },
  sushi: {
    title: "Sushi",
    categoryName: "Cuisine & Food",
    meaning: "Iconic Japanese food made of vinegared rice topped with fresh sashimi slices, prepared with high care."
  },
  matcha: {
    title: "Matcha Tea",
    categoryName: "Cuisine & Food",
    meaning: "Finely-milled green tea powder. Its delicate balance of bitter and sweet represents ancient Zen rituals."
  },
  ramen: {
    title: "Ramen Noodles",
    categoryName: "Cuisine & Food",
    meaning: "Delectable wheat noodles in robust bone broth, representing a warm hug under neon-lit night streets."
  },
  wagashi: {
    title: "Japanese Sweet",
    categoryName: "Cuisine & Food",
    meaning: "Artisanal hand-crafted Japanese confections reflecting micro-seasonal changes of nature."
  },
  sake: {
    title: "Rice Wine",
    categoryName: "Cuisine & Food",
    meaning: "Classical Japanese rice wine brewed using pure mountain spring water, enjoyed globally."
  },
  jinja: {
    title: "Shinto Shrine",
    categoryName: "Tradition & Folklore",
    meaning: "Shinto shrines dedicated to the land's eight million spirits, marked by tall red Torii gates."
  },
  ninja: {
    title: "Ninja",
    categoryName: "Tradition & Folklore",
    meaning: "Shadow agents of feudal Japan, masterfully specializing in stealth, espionage, and extreme self-control."
  },
  bushi: {
    title: "Samurai",
    categoryName: "Tradition & Folklore",
    meaning: "Samurai warriors strictly following the code of Bushido: integrity, supreme courage, and loyalty."
  },
  bento: {
    title: "Bento Box",
    categoryName: "Tradition & Folklore",
    meaning: "Crafted boxed lunch boxes stuffed with love, usually prepared for long-distance picnics or school days."
  },
  onsen: {
    title: "Hot Spring",
    categoryName: "Nature & Scenery",
    meaning: "Therapeutic hot springs powered by geothermal energy, letting you relax amidst snowy woods."
  },
  hotaru: {
    title: "Firefly",
    categoryName: "Nature & Scenery",
    meaning: "Summer fireflies. Their brief, magical glowing light evokes nostalgia and deep reflections on life."
  },
  semi: {
    title: "Cicada",
    categoryName: "Nature & Scenery",
    meaning: "Summer cicadas, the robust rustic song marking summer festivals, wind chimes, and lush dynamic seasons."
  },
  haiku: {
    title: "Haiku Poem",
    categoryName: "Tradition & Folklore",
    meaning: "Highly structured seventeen-syllable (5-7-5) poetry capturing cosmic nature moments with brevity."
  },
  torii: {
    title: "Shrine Gate",
    categoryName: "Tradition & Folklore",
    meaning: "Sacred Shinto gates separating the secular world from spiritual tranquility."
  },
  hanabi: {
    title: "Fireworks",
    categoryName: "Nature & Scenery",
    meaning: "Brilliant summer fireworks blooming in dynamic patterns, fading peacefully into dark night skies."
  },
  soba: {
    title: "Buckwheat Noodles",
    categoryName: "Cuisine & Food",
    meaning: "Rustic Japanese buckwheat noodles served chilled on bamboo mats or hot with warm broth."
  },
  tempura: {
    title: "Fried Tempura",
    categoryName: "Cuisine & Food",
    meaning: "Lightly battered fried seafood or vegetables cooked to perfect golden crispiness."
  },
  takoyaki: {
    title: "Octopus Balls",
    categoryName: "Cuisine & Food",
    meaning: "Savory ball-shaped street food stuffed with tender octopus pieces, topped with dynamic bonito flakes."
  },
  mochi: {
    title: "Rice Cake",
    categoryName: "Cuisine & Food",
    meaning: "Pounded glutinous rice cakes, soft, chewy, and served in sweet red bean soup or savory broth."
  },
  gohan: {
    title: "Steamed Rice",
    categoryName: "Cuisine & Food",
    meaning: "Steamed white rice, the fundamental cornerstone of Japanese meals, grown with sheer attention."
  },
  yukata: {
    title: "Summer Kimono",
    categoryName: "Tradition & Folklore",
    meaning: "Lightweight cotton summer kimonos styled with bright sashes, worn to energetic firework festivals."
  },
  matsuri: {
    title: "Summer Festival",
    categoryName: "Tradition & Folklore",
    meaning: "Traditional celebrations featuring giant palanquins, powerful taiko drums, and energetic street food stalls."
  },
  geisha: {
    title: "Geisha Artist",
    categoryName: "Tradition & Folklore",
    meaning: "Folk performing artists who master traditional theatrical dances, lute playing, and elegant hospitality."
  },
  origami: {
    title: "Paper Folding",
    categoryName: "Tradition & Folklore",
    meaning: "Japanese art of paper folding. Folding a single piece of square paper into complex shapes."
  },
  kimono: {
    title: "Silk Kimono",
    categoryName: "Tradition & Folklore",
    meaning: "Traditional full formal dress of Japan, styled with premium fabrics and majestic decorative sashes."
  },
  tsuki: {
    title: "The Moon",
    categoryName: "Nature & Scenery",
    meaning: "The beautiful full moon, representing elegant poetic whispers and standard timeless romance."
  },
  yuki: {
    title: "Winter Snow",
    categoryName: "Nature & Scenery",
    meaning: "Pristine white winter snow draping ancient lands in pure silence, reminiscent of classical fables."
  },
  kaze: {
    title: "Summer Breeze",
    categoryName: "Nature & Scenery",
    meaning: "A warm summer breeze dancing across fields of rice, whispering to wind chimes under the eaves."
  },
  shiba: {
    title: "Shiba Inu",
    categoryName: "Nature & Scenery",
    meaning: "The adorable Shiba Inu dog breed. High-spirited, loyal, and worldwide icon of healing smiles."
  }
};

const CELEB_MAPPINGS = Object.entries({
  ...CELEBRITY_ENGLISH_OVERLAYS,
  ...KPOP_RIVALRY_ENGLISH_OVERLAYS
}).reduce<Record<string, { title: string; categoryName: string; meaning: string }>>((acc, [k, v]) => {
  acc[k] = {
    title: v.word,
    categoryName: v.categoryName,
    meaning: v.meaning
  };
  return acc;
}, {});

export const LANG_MAPPING: Record<string, { title: string; categoryName: string; meaning: string }> = {
  ...BASE_LANG_MAPPING,
  ...CELEB_MAPPINGS
};

// UI translation helper
export const uiTranslate = (key: string, isEnglish: boolean, fallback: string): string => {
  return fallback;
};

