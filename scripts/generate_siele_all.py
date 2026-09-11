# scripts/generate_siele_all.py
# Comprehensive SIELE 2800 Vocabulary Generator
import sys
import os

words_seen = set()
entries_a1 = []
entries_a2 = []
entries_b1 = []
entries_b2 = []

def add_entry(level_list, word, pos, meaning, level, category, ex_es="", ex_zh=""):
    w_clean = word.strip()
    key = w_clean.lower()
    if key in words_seen:
        return
    words_seen.add(key)
    level_list.append((w_clean, pos, meaning, level, category, ex_es, ex_zh))

# Helper to add a batch from tuples: (word, pos, meaning, category)
def add_batch(level_list, level, tuples):
    for item in tuples:
        word, pos, meaning, cat = item[0], item[1], item[2], item[3]
        ex_es = item[4] if len(item) > 4 else ""
        ex_zh = item[5] if len(item) > 5 else ""
        add_entry(level_list, word, pos, meaning, level, cat, ex_es, ex_zh)

print("Starting vocabulary curation...")
