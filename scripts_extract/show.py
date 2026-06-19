# -*- coding: utf-8 -*-
import sys, json
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open(sys.argv[1], encoding='utf-8'))
byidx = {o['idx']: o for o in data}
want = [int(x) for x in sys.argv[2:]] if len(sys.argv) > 2 else [43,44,75,100,130,150,160,220,235,260,281,290]
for i in want:
    o = byidx.get(i)
    if not o: continue
    print(f"\n=== [{i}] {o['name']}  ({o['cat']}, {o['degre']}°, mac={o['mac']}j '{o['mactxt']}') id={o['id']}")
    print("  themes:", o['themes'], "grav:", o['gravure'])
    for ing in o['ingredients']:
        print(f"    ing  qte={ing['qte']!r} unite={ing['unite']!r} nom={ing['nom']!r} scal={ing.get('scalable')}")
    for s in o['steps']:
        print("    step:", s[:140])
