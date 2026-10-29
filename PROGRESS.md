# PROGRESS (resume checkpoint)
- [x] v2: Ch.1 in 2.5D (game.js + render3d.js), zip 8bit-horror-v2.zip
- [ ] Engine refactor: chapters/*.js data, pixel font, BFS pathfinding, chapter select, per-chapter saves
- [ ] Ch.2 Salt Road  - [ ] Ch.3 Ninth Floor  - [ ] Ch.4 White Line  - [ ] Ch.5 Sub-Level  - [ ] Ch.6 Quarantine Choir  - [ ] Ch.7 The Interviewer
- [ ] trailer.mp4, zip v3
Backups of v2 code: /tmp/game_v2.js /tmp/r3_v2.js (also inside 8bit-horror-v2.zip)

## v3 scope change (Oct 28, 9:03 PM CT) — Huy
- [x] ART (Ch1 verified; applies engine-wide): 32-bit (PS1/Saturn) style. Portrait internal res 320x568 (Low/Med), 480x852 (High). 64-96px sprites per survivor (walk/attack/hurt), portraits for Linh, Minh, survivors, bosses. Richer palette, detailed textures, PS1 wobble + dither option. Ch1 first.
- [x] AUDIO (audio.js): per-city ambient layers, positional audio, adaptive music layers (explore/tension/combat/boss) per chapter, footsteps per surface.
- [x] PHYSICS (physics.js): custom light physics: breakable crates/bottles/glass, debris, shell casings, knocked props, boss rubble; body cap by tier.
Engine refactor (data-driven game.js, pixel font, BFS, mechanics, chapter select, per-chapter saves) = DONE (untested).
- [x] Ch1 tested headless (shots/ch1-*.png)
- [x] Ch2-Ch7 tested headless (shots/chN-*.png); no JS errors. Ch7 spare+voicemail ending verified.
- [x] Camera moved closer (0,5.4,4.8)
- [x] Trailer: shots/trailer.mp4 (62s, 360x780)

## v4 — variety, cutscenes, costumes, suspense (checkpoint 2026-10-28 ~9:55 PM CT)
- [x] variety.js: 9 zombie types + 11 city skins, escalating per-chapter mix; 5 mid-bosses (Ch2-6); 15 NPCs; 3 outfits
- [x] art.js: layered job costumes, wear 0-3, distinct zombie/boss silhouettes, secret boss sprite
- [x] scenes.js + scene engine (letterbox, portraits, cam focus, swell/silence/static/shake, A next / B skip): 58 scenes
- [x] Suspense director (shadows, creaks, steps, flicker, false scares + heartbeat, silence) + timed RUN chase
- [x] Secret chapter X "The First Quiet" (3 phases), unlocked after Ch7
- [x] Tested all 8 chapters headless, 0 JS errors (shots/v4/), lineups (shots/lineup-*.png), boss shots (shots/boss-*.png)
- [x] Trailer refreshed: shots/trailer.mp4 (71s)
- [x] README updated
## v5 (in progress): safe zones + low-poly 3D skinned characters — Ch1 first
- [x] camp.js + game.js safe-zone loop: make camp (YES/NO) → setup cutscene → menu (rest/save, craft ammo, brew herb, barricades, trade, side request) → 3-wave siege (+3 scrap) → goodbye cutscene in finish(). Scrap drops from kills.
- [x] chars3d.js: procedural 14-bone skinned low-poly characters (hero ×7 costumes, NPC by seed/age, 8 zombie variants), 32px face textures, walk/run/aim/attack/grab/hurt/death. Used on MED/HIGH tiers; LOW keeps sprites. Bosses stay sprites for now.
- [x] render3d.js: models wired in; campfire/lantern with flickering light, barricade planks by hp; cutscene camera cuts (close-up / low angle / three-quarter, snap on shot change) + warm key / cool rim light.
- [x] Ch1 headless test (/tmp/t5.py): camp, menu, barricades, siege, goodbye — 0 JS errors. Shots in shots/v5/.
- [x] Regression Ch2–Ch8 (t4.py) after model swap: 0 JS errors (fixed a room=-1 guard in game.js/render3d.js).
- [x] Boss 3D models: 6 chapter bosses + secret boss (The First Quiet) + 5 mid-bosses (kind "boss" in chars3d.js, ~390–510 tris each, idle/attack/rage poses). Ch7 courier uses the hero model. LOW tier keeps sprites.
- [x] Camp + siege playtest in all 8 chapters (/tmp/t5.py): make camp, menu, barricades, siege trigger, 3 waves, goodbye — 0 JS errors. Secret chapter got a solo lantern camp (no survivors).
- [x] Siege trigger tuned: needs camp ≥40s old, you must leave and come back, boss alive, and a "hot" chapter (mid-boss down / chased / 4+ch/2 kills since camp). Waits for scenes and dialogs, and won't start with you at ≤1 HP. Ch3+ waves have +1 zombie.
- [x] Regression t4 (all 8 chapters with 3D bosses): 0 JS errors. Shots: shots/v5/.
- [x] 3D lineup: lineup3d.html → shots/lineup3d-{heroes,zombies,bosses,all}.png.
- [x] Trailer: shots/trailer-v5.mp4 (93s, 3D lineup intro + all chapters, camps, sieges, bosses, at 2x speed).
- Known: models are 310–510 tris (under the 500–1500 target); close-up cutscene shots frame kids too high; story text in camp.js needs Huy's review.
