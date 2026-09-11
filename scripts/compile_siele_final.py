# scripts/compile_siele_final.py
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from data_a1 import A1_WORDS
from data_a2 import A2_WORDS
from data_b1 import B1_WORDS
from data_b2 import B2_WORDS
from extra_words import EXTRA_A2, EXTRA_B1, EXTRA_B2

TARGET_A1 = 550
TARGET_A2 = 750
TARGET_B1 = 850
TARGET_B2 = 650
TOTAL_TARGET = 2800

seen_words = set()

def clean_item(item, level):
    word = item[0].strip()
    pos = item[1].strip() if len(item) > 1 else "v."
    meaning = item[2].strip() if len(item) > 2 else ""
    cat = item[3].strip() if len(item) > 3 else "daily"
    ex_es = item[4].strip() if len(item) > 4 else ""
    ex_zh = item[5].strip() if len(item) > 5 else ""
    return {
        "word": word,
        "pos": pos,
        "meaning": meaning,
        "level": level,
        "category": cat,
        "exampleEs": ex_es,
        "exampleZh": ex_zh
    }

final_a1 = []
final_a2 = []
final_b1 = []
final_b2 = []

# Populate A1
for item in A1_WORDS:
    w = item[0].lower().strip()
    if w not in seen_words:
        seen_words.add(w)
        final_a1.append(clean_item(item, "A1"))
        if len(final_a1) == TARGET_A1:
            break

# If A1 has surplus words, they can flow to A2
surplus_a1 = []
for item in A1_WORDS:
    w = item[0].lower().strip()
    if w not in seen_words:
        surplus_a1.append(item)

# Populate A2
for item in A2_WORDS + EXTRA_A2 + surplus_a1:
    w = item[0].lower().strip()
    if w not in seen_words:
        seen_words.add(w)
        final_a2.append(clean_item(item, "A2"))
        if len(final_a2) == TARGET_A2:
            break

# If A2 has surplus, flow to B1
surplus_a2 = []
for item in A2_WORDS + EXTRA_A2 + surplus_a1:
    w = item[0].lower().strip()
    if w not in seen_words:
        surplus_a2.append(item)

# Populate B1
for item in B1_WORDS + EXTRA_B1 + surplus_a2:
    w = item[0].lower().strip()
    if w not in seen_words:
        seen_words.add(w)
        final_b1.append(clean_item(item, "B1"))
        if len(final_b1) == TARGET_B1:
            break

# If B1 has surplus, flow to B2
surplus_b1 = []
for item in B1_WORDS + EXTRA_B1 + surplus_a2:
    w = item[0].lower().strip()
    if w not in seen_words:
        surplus_b1.append(item)

# Populate B2
for item in B2_WORDS + EXTRA_B2 + surplus_b1:
    w = item[0].lower().strip()
    if w not in seen_words:
        seen_words.add(w)
        final_b2.append(clean_item(item, "B2"))
        if len(final_b2) == TARGET_B2:
            break

print(f"Compiled counts:")
print(f"A1: {len(final_a1)} / {TARGET_A1}")
print(f"A2: {len(final_a2)} / {TARGET_A2}")
print(f"B1: {len(final_b1)} / {TARGET_B1}")
print(f"B2: {len(final_b2)} / {TARGET_B2}")
print(f"Total: {len(final_a1) + len(final_a2) + len(final_b1) + len(final_b2)}")

assert len(final_a1) == TARGET_A1, f"A1 count mismatch: {len(final_a1)}"
assert len(final_a2) == TARGET_A2, f"A2 count mismatch: {len(final_a2)}"
assert len(final_b1) == TARGET_B1, f"B1 count mismatch: {len(final_b1)}"
assert len(final_b2) == TARGET_B2, f"B2 count mismatch: {len(final_b2)}"

all_words = final_a1 + final_a2 + final_b1 + final_b2

# Output file: src/data/siele2800Data.ts
ts_lines = [
    '// SIELE 2800 Essential Spanish Vocabulary (A1 - B2)',
    '// Officially curated for SIELE certification & Spanish mastery',
    'import { SpanishWord } from "./spanishData";',
    '',
    '// Compact tuple: [word, partOfSpeech, meaning, level, category, exampleEs?, exampleZh?]',
    'const RAW_SIELE_2800: [string, string, string, "A1" | "A2" | "B1" | "B2", string, string?, string?][] = ['
]

for item in all_words:
    word_escaped = item["word"].replace('"', '\\"')
    pos_escaped = item["pos"].replace('"', '\\"')
    meaning_escaped = item["meaning"].replace('"', '\\"')
    level = item["level"]
    cat_escaped = item["category"].replace('"', '\\"')
    ex_es = item["exampleEs"].replace('"', '\\"')
    ex_zh = item["exampleZh"].replace('"', '\\"')
    
    if ex_es and ex_zh:
        ts_lines.append(f'  ["{word_escaped}", "{pos_escaped}", "{meaning_escaped}", "{level}", "{cat_escaped}", "{ex_es}", "{ex_zh}"],')
    else:
        ts_lines.append(f'  ["{word_escaped}", "{pos_escaped}", "{meaning_escaped}", "{level}", "{cat_escaped}"],')

ts_lines.append('];')
ts_lines.append('')
ts_lines.append('function getCategoryName(category: string, level: string): string {')
ts_lines.append('  switch (category) {')
ts_lines.append('    case "daily": return `日常交流 (${level})`;')
ts_lines.append('    case "travel": return `旅行交通 (${level})`;')
ts_lines.append('    case "business": return `职场商务 (${level})`;')
ts_lines.append('    case "food": return `美食餐饮 (${level})`;')
ts_lines.append('    case "emotion": return `情绪性格 (${level})`;')
ts_lines.append('    case "grammar": return `动词语法 (${level})`;')
ts_lines.append('    default: return `SIELE ${level} 必背`;')
ts_lines.append('  }')
ts_lines.append('}')
ts_lines.append('')
ts_lines.append('export const SIELE_2800_WORDS: SpanishWord[] = RAW_SIELE_2800.map((entry, idx) => ({')
ts_lines.append('  id: `siele-${String(idx + 1).padStart(4, "0")}`,')
ts_lines.append('  word: entry[0],')
ts_lines.append('  partOfSpeech: entry[1],')
ts_lines.append('  meaning: entry[2],')
ts_lines.append('  level: entry[3],')
ts_lines.append('  category: entry[4] || "daily",')
ts_lines.append('  categoryName: getCategoryName(entry[4], entry[3]),')
ts_lines.append('  exampleEs: entry[5] || undefined,')
ts_lines.append('  exampleZh: entry[6] || undefined,')
ts_lines.append('}));')
ts_lines.append('')

output_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "siele2800Data.ts")
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(ts_lines))

print(f"Successfully generated {output_path} with {len(all_words)} entries!")
