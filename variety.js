// Content variety (original): zombie types, per-chapter mixes, mid-bosses, NPC survivors.
'use strict';
window.VAR={
 // hp, speed mult, grab chance, notes
 ZT:{walker:{hp:3,sp:1,grab:.6},runner:{hp:2,sp:1.9,grab:.4},crawler:{hp:2,sp:.55,grab:.8},bloater:{hp:3,sp:.7,grab:0},
  riot:{hp:4,sp:.85,grab:.5,armor:3},screamer:{hp:2,sp:.9,grab:.3},spitter:{hp:3,sp:.8,grab:.2},drowned:{hp:4,sp:.8,grab:.9},frozen:{hp:5,sp:.65,grab:.5}},
 NAMES:{walker:'WALKER',runner:'RUNNER',crawler:'CRAWLER',bloater:'BLOATER',riot:'RIOT SHELL',screamer:'SCREAMER',spitter:'SPITTER',drowned:'DROWNED',frozen:'FROZEN'},
 // per chapter: type mix (escalates) and city skins
 MIX:[['walker','crawler','walker','runner','walker'],
  ['drowned','walker','bloater','drowned','runner','crawler','spitter','drowned'],
  ['walker','runner','spitter','crawler','riot','screamer'],
  ['frozen','frozen','runner','bloater','screamer','frozen'],
  ['runner','crawler','riot','screamer','spitter','bloater'],
  ['drowned','bloater','spitter','screamer','runner','riot'],
  ['riot','runner','spitter','screamer','bloater'],
  ['runner','riot','spitter','frozen','drowned','screamer']],
 SKINS:[['house','house','civ'],['fisher','civ','market'],['nurse','patient','guard'],['herder','trucker','civ'],['commuter','worker','commuter'],['fisher','civ','market'],['trucker','civ','guard'],['civ','commuter','nurse']],
 // mid-chapter bosses. art = ART BOSS index
 MID:{
  1:{r:4,x:80,y:56,hp:12,art:8,name:'THE DROWNED CAPTAIN',scale:1.05,atk:['charge','grab'],atk2:['summon:drowned','charge'],
    p2:'He drags his anchor chain. The water answers.',fin:'You cut the chain. He sinks for the last time.',drop:{k:'ammo',n:8}},
  2:{r:1,x:80,y:40,hp:12,art:9,name:'THE ORDERLY',scale:1,atk:['charge'],atk2:['charge','slam'],armor:4,
    p2:'His riot visor cracks. He stops guarding.',fin:'The keycard on his chest still says HELP.',drop:{k:'herb'}},
  3:{r:2,x:80,y:56,hp:14,art:10,name:'THE TRAPPER',scale:1.05,atk:['spread'],atk2:['spread','ring'],
    p2:'Frost spreads from the snares. Keep moving!',fin:'His traps go slack in the snow.',drop:{k:'ammo',n:8}},
  4:{r:2,x:80,y:40,hp:12,art:11,name:'THE CONDUCTOR',scale:1.1,atk:['summon:runner','blink'],atk2:['blink','ring'],
    p2:'He swings the lantern. Something answers from the tunnel.',fin:'The lantern goes out. The tunnel is only a tunnel.',drop:{k:'herb'}},
  5:{r:3,x:80,y:56,hp:14,art:12,name:'THE MATRON',scale:1.1,atk:['spread','summon:bloater'],atk2:['ring','summon:bloater'],
    p2:'Her sacs split open. Do not stand close.',fin:'She folds over, quiet, like a sleeper.',drop:{k:'ammo',n:10}}},
 // NPC survivors. look = seed (skin tone, hair, outfit, age). give = side moment reward (once)
 NPC:{
  0:[{r:0,x:40,y:104,seed:3,name:'MRS. ADDO',age:'elder',lines:['"I hid under the stairs for two days."','"My husband went to the cellar. Don\'t."'],give:{k:'herb'},thanks:'"Take my herb. My knees won\'t run anyway."'},
     {r:2,x:120,y:56,seed:11,name:'OWEN',age:'kid',lines:['"Are you a police?"','"I can be very quiet. Watch."']}],
  1:[{r:2,x:40,y:72,seed:21,name:'GRANDPA SAU',age:'elder',lines:['"Forty years on this water."','"The tide waits for no one. Hurry."'],give:{k:'ammo',n:4},thanks:'"Flare rounds. Old, but they bang."'},
     {r:2,x:120,y:72,seed:24,name:'MAI',age:'kid',lines:['"My dad fixes boats too!"','"He\'s on the radio. Every night."']},
     {r:0,x:72,y:40,seed:7,name:'VENDOR THU',lines:['"I kept the stall open. Habit."','"Fish won\'t sell itself. Not anymore."']}],
  2:[{r:2,x:40,y:56,seed:31,name:'DR. OKAFOR',lines:['"Nine floors. One working lift."','"Keep the fuses dry."'],give:{k:'herb'},thanks:'"Sedative-free. Clean. Go."'},
     {r:2,x:120,y:104,seed:35,name:'PATIENT 14',age:'elder',lines:['"I was here for my hip."','"Now I am here for the end of the world."']}],
  3:[{r:1,x:40,y:72,seed:41,name:'AIGERIM',lines:['"The cafe still has tea. Sit."','"My brother drove the convoy."'],give:{k:'herb'},thanks:'"Warm tea, in a flask. For the pass."'},
     {r:1,x:120,y:104,seed:44,name:'BEKZAT',age:'kid',lines:['"I counted 200 crows."','"They all flew south."']}],
  4:[{r:1,x:40,y:104,seed:51,name:'MR. HAN',age:'elder',lines:['"Thirty years I sold tickets here."','"Shh. They hear you."'],give:{k:'ammo',n:4},thanks:'"A guard left these. Quietly now."'},
     {r:1,x:120,y:40,seed:55,name:'SORA',lines:['"I count trains. Habit."','"None since Tuesday."']}],
  5:[{r:2,x:120,y:104,seed:61,name:'DONA ROSA',age:'elder',lines:['"I sang in that chapel once."','"Not that kind of choir."'],give:{k:'herb'},thanks:'"Rosemary and salt. Old cure."'},
     {r:0,x:40,y:40,seed:64,name:'TIAGO',age:'kid',lines:['"The lighthouse blinks wrong."','"Tomas said he\'d fix it."']}],
  6:[{r:0,x:40,y:104,seed:71,name:'THE COOK',lines:['"A truck stops here every night."','"Red jacket. She never eats."'],give:{k:'ammo',n:6},thanks:'"She left these for \'the kid with the recorder\'."'},
     {r:0,x:120,y:56,seed:74,name:'DAISY',age:'kid',lines:['"The truck lady waved at me."','"She has a brother too."']}],
  7:[]},
 OUTFITS:['DEFAULT','FIELD','NIGHT']
};
