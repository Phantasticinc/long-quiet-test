# The Long Quiet (original 32-bit survival horror)

A phone-first, portrait-layout survival horror game in a PS1-like 2.5D style. It is built with Three.js r170, which is bundled locally. It has 7 chapters across 7 cities, plus a secret chapter. All characters, places and story are original.

## Run
`python3 -m http.server 8765` in this folder, then open http://localhost:8765/ . Use a phone in portrait for the best results.

## Controls
| Action | Touch | Keys |
|---|---|---|
| Move | D-pad | Arrows / WASD |
| Fire / talk / interact / advance cutscene | A | J / Space |
| Knife / skip cutscene | B | K |
| Medkit | MED | (touch) |
| Items / pause | ITEMS / START | I or Tab / Enter |
| Chapter select: change outfit | left/right on a chapter row | left/right |

## What's in v4
- **Costumes:** each survivor wears layered, job- and city-specific gear:
  - Linh: courier jacket with patches and a satchel.
  - Huong: coveralls, a nón lá and a wrench.
  - Adaeze: scrubs, a stethoscope and a lanyard.
  - Yerlan: a sheepskin coat and fur hat.
  - Ji-woo: hi-vis, a hard hat and a tool belt.
  - Tomas: a parka and headphones.
  - Minh: a trench coat and press badge.
  - Each survivor has 3 outfits (DEFAULT / FIELD / NIGHT), chosen in chapter select.
  - Wear builds up as the story goes on and when your health is low: rips, then blood, then bandages.
- **Zombies (9 types):**
  - walker;
  - runner (fast);
  - crawler (low, grabs, weak to the knife);
  - bloater (explodes);
  - riot shell (armor soaks bullets; use the knife or crits);
  - screamer (alerts the room and calls a runner);
  - spitter (keeps its distance and spits acid);
  - drowned (strong grab);
  - frozen (tough; bursts into ice shards that slow you).
  - Each city has its own skins: house, civilian, market, fisher, nurse, patient, guard, herder, trucker, commuter and worker.
  - The mix of zombies gets harder chapter by chapter.
- **Bosses:**
  - The original 7 chapter bosses.
  - 5 mid-bosses, each with 2 phases, a finisher and a reward drop:
    - The Drowned Captain (Ch2)
    - The Orderly (Ch3, armored)
    - The Trapper (Ch4)
    - The Conductor (Ch5)
    - The Matron (Ch6)
  - **Secret chapter X, "The First Quiet":** unlocks after you beat Ch7. Its 3-phase boss fires a fan of shots, teleports while the lights fail, then fires rings and summons zombies.
- **NPC survivors:** 15 named civilians across the cities, of different ages, skin tones and hair. Talk to them with A; some give items.
- **Cutscenes:** 58 scripted scenes, 7-8 per chapter. They include:
  - character intros;
  - story beats;
  - mid-boss and boss entrances and deaths;
  - flashbacks;
  - a "Courier" CB radio broadcast in every chapter that builds the twist;
  - Minh interludes;
  - a longer finale and epilogue.
  - Scenes use letterboxing, portraits, camera focus and music swells or silence. Press A to advance and B to skip.
- **Suspense director:**
  - quiet stretches;
  - unexplained creaks, knocks and footsteps;
  - shadow figures at the edge of the room that vanish as you get close;
  - failing lights;
  - false scares with a building heartbeat;
  - music that drops to silence;
  - silence plus a heartbeat before every boss reveal;
  - a timed **RUN!** chase after you pick up the first key item. Reach a safe room or outlast the timer.

## Files
- `index.html`: the page.
- `game.js`: game logic, HUD, scenes, suspense and AI.
- `render3d.js`: the 3D view.
- `art.js`: procedural sprites for costumes, zombies, bosses and NPCs.
- `variety.js`: zombie types, chapter mixes, mid-bosses, NPCs and outfits.
- `scenes.js`: cutscene scripts.
- `audio.js`, `physics.js`: sound and physics.
- `chapters/01-07*.js`, `chapters/08-first-quiet.js`: chapter data.
- `lineup.html`: character sheet viewer. Use `?p=zombies` or `?p=costumes`.
- `shots/`: screenshots. This includes `lineup-zombies.png`, `lineup-costumes.png`, `boss-*.png`, `v4/` (per-chapter scenes and bosses) and `trailer.mp4`.

## v5 (in progress): safe zones + 3D characters
- **Safe zones:** stand at the lantern or campfire in a chapter's safe room and press A to make camp. The camp menu lets you rest and save, craft ammo, brew herbs, repair barricades, trade, and take a survivor's side request. Later the camp is besieged in three timed waves. When you leave the chapter, the survivors say goodbye in a cutscene. Zombies drop scrap.
- **3D characters:** on MED and HIGH tiers, the hero, NPCs, zombies, mid-bosses and bosses are procedural low-poly skinned models (`chars3d.js`) with face textures and skeletal animation. The LOW tier keeps sprites. Cutscenes use camera cuts with key and rim lighting.
- **Siege:** it triggers when you come back to an established camp after a mid-boss fight, a chase or a run of kills. Preview: `lineup3d.html?p=heroes|zombies|bosses`. Trailer: `shots/trailer-v5.mp4`.
