# -*- coding: utf-8 -*-
import re, sys, html, json
sys.stdout.reconfigure(encoding='utf-8')

SRC = sys.argv[1]
OUT = sys.argv[2]
t = open(SRC, encoding='utf-8').read()

def textify(s):
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.I)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    s = s.replace(' ', ' ').replace('﻿', '')
    s = re.sub(r'[ \t]+', ' ', s)
    return s.strip()

heads = []
for m in re.finditer(r'<h3[^>]*>(.*?)</h3>', t, re.S | re.I):
    if re.search(r'<a\s+id=', m.group(1), re.I):
        name = textify(m.group(1))
        if name:
            heads.append((m.start(), m.end(), name))

SEP = '␟'  # marqueur de séparation de paragraphe

def block_paras(block):
    b = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', block, flags=re.S | re.I)
    # frontières de niveau bloc -> séparateur
    b = re.sub(r'</(p|div|li|h[1-6]|td|tr|table|ul|ol|blockquote)>', SEP, b, flags=re.I)
    b = re.sub(r'<(br|hr)\s*/?>', SEP, b, flags=re.I)
    b = re.sub(r'<(p|div|li|h[1-6]|td|tr)[^>]*>', SEP, b, flags=re.I)
    parts = [textify(x) for x in b.split(SEP)]
    return [p for p in parts if p]

recs = []
for i, (s, e, name) in enumerate(heads):
    end = heads[i + 1][0] if i + 1 < len(heads) else len(t)
    recs.append({'name': name, 'paras': block_paras(t[e:end])})

json.dump(recs, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print("recipe blocks:", len(recs))
for idx in [0, 42, 43, 44, 100, 150, 167, 199, 217, 250, 290]:
    if idx < len(recs):
        r = recs[idx]
        print("\n===", idx, "|", r['name'], "===")
        for p in r['paras'][:5]:
            print("  -", p[:200])
