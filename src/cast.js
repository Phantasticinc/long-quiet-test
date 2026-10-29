// Character designs (original). Heroes, survivors, 9 zombie types, mid-bosses and bosses.
import {buildChar} from './chars.js';
export const HEROES=[
 {name:'LINH',art:'linh',skin:'#d8b088',hair:'tail',hairCol:'#141010',female:1,top:'jacket',topCol:'#3a4a6a',sleeveCol:'#3a4a6a',botCol:'#2a2a30',shoeCol:'#3a2a1a',trim:'#c8a040',face:{eye:'#2a1a10',brow:'#141010'},extras:['satchel','patches','cap'],hatCol:'#c84a2a',build:{h:.96,w:.92},belt:'#3a2a1a',seed:11},
 {name:'HUONG',skin:'#c89a70',hair:'bun',hairCol:'#100c0a',female:1,top:'tshirt',topCol:'#4a6a5a',botCol:'#3a3a48',shoeCol:'#222',face:{eye:'#20140c'},extras:['nonla','apron'],apron:'#5a4a3a',build:{h:.94,w:.9},seed:22},
 {name:'ADAEZE',skin:'#6a4430',hair:'bun',hairCol:'#0a0806',female:1,top:'scrubs',topCol:'#3a8a9a',botCol:'#3a8a9a',shoeCol:'#ddd',face:{eye:'#140a06',lip:'#4a2420'},extras:['scrubCap','stetho','badge'],build:{h:1,w:.92},seed:33},
 {name:'YERLAN',skin:'#c09070',hair:'short',hairCol:'#2a2018',top:'coat',topCol:'#6a4a30',botCol:'#2a2a2a',shoeCol:'#1a1410',face:{beard:'#2a2018',narrow:1,eye:'#1a120a'},extras:['sheepskin','furhat'],hatCol:'#4a3426',build:{h:1.04,w:1.1,bulk:1.08},seed:44},
 {name:'JI-WOO',skin:'#e0bc98',hair:'side',hairCol:'#120e0c',female:1,top:'jacket',topCol:'#2a3a4a',botCol:'#2a3040',shoeCol:'#222',face:{eye:'#1a120a',glasses:1},extras:['hivis','hardhat'],build:{h:.95,w:.9},seed:55},
 {name:'TOMAS',skin:'#c8a080',hair:'spiky',hairCol:'#3a2618',top:'jacket',topCol:'#8a2a24',botCol:'#2a3448',shoeCol:'#eee',face:{freckles:1,eye:'#3a2a14'},extras:['parka','headphones'],build:{h:.97,w:.92},seed:66},
 {name:'MINH',art:'minh',skin:'#d0a880',hair:'short',hairCol:'#141010',top:'coat',topCol:'#5a5040',botCol:'#2a2a2e',shoeCol:'#221a14',face:{eye:'#20140c',scar:1},extras:['trench','recorder','scarf'],scarf:'#4a3a2a',build:{h:1.02,w:1},seed:77},
];
HEROES[7]=HEROES[6];
export const LINH_TURNED={...HEROES[0],art:null,skin:'#a8a890',face:{eye:'#d0c060',mouth:'open'},zombie:1,blood:1,extras:['satchel','patches','cap','rags'],seed:99};

const SK=['#e0c0a0','#c8a080','#a07050','#6a4430','#4a2e20','#d8b890'];
const HC=['#141010','#3a2618','#6a5040','#a09080','#d8d0c0','#2a1a10'];
const TC=['#5a3a3a','#3a4a5a','#4a5a3a','#6a6050','#2a2a3a','#7a5a3a','#5a6a7a'];
export function npcDef(n){const s=n.seed||1,kid=n.age==='kid',eld=n.age==='elder',fem=s%2===1;
  return {name:n.name,skin:SK[s%SK.length],hair:eld&&s%3==0?'bald':['short','long','bun','bangs','tail'][s%5],hairCol:eld?'#c8c4b8':HC[s%HC.length],female:fem,
    top:['jacket','tshirt','coat','dress'][s%4],topCol:TC[s%TC.length],botCol:TC[(s+3)%TC.length],shoeCol:'#2a2018',
    face:{age:n.age,smile:kid,blush:kid,beard:!fem&&!kid&&s%3==1?'#3a3028':0,glasses:eld&&s%2==0},extras:kid?[]:['scarf'],scarf:TC[(s+1)%TC.length],
    build:{h:kid?.62:eld?.93:1,w:kid?.9:1},seed:s,art:{'MRS. ADDO':'addo','OWEN':'owen'}[n.name]};}

// zombie palette by "skin" role (civ, fisher, nurse...) + type
const ROLE={house:{top:'#5a4a3a',bot:'#3a3028'},civ:{top:'#4a5060',bot:'#2a2a30'},fisher:{top:'#8a6a20',bot:'#2a3a40'},market:{top:'#7a3a3a',bot:'#3a3a3a'},
 nurse:{top:'#5a8a8a',bot:'#5a8a8a',top2:'scrubs'},patient:{top:'#9ab0b8',bot:'#9ab0b8',top2:'dress'},guard:{top:'#2a3040',bot:'#20242c'},herder:{top:'#6a5038',bot:'#3a3028',top2:'coat'},
 trucker:{top:'#3a4a3a',bot:'#2a3040'},commuter:{top:'#3a3a44',bot:'#2a2a30',top2:'coat'},worker:{top:'#c8d020',bot:'#3a3a40'}};
export function zombieDef(type,role='civ',seed=1){
  const r=ROLE[role]||ROLE.civ,base={zombie:1,seed,skin:['#8a9478','#9a9a80','#7a8470','#a09a88'][seed%4],hair:['short','long','bald','bangs'][seed%4],hairCol:HC[seed%HC.length],
    top:r.top2||['jacket','tshirt','coat'][seed%3],topCol:r.top,botCol:r.bot,shoeCol:'#1a1410',face:{eye:'#c02010'},blood:1,extras:['rags'],build:{h:.95+((seed*7)%10)/100,w:1}};
  const T={
   walker:{},
   runner:{build:{h:.95,w:.85,bulk:.85},face:{eye:'#ff3010',mouth:'open'},extras:['rags','ribs']},
   crawler:{build:{h:.9,w:.9,bulk:.9},extras:['rags','ribs']},
   bloater:{skin:'#8a9a60',skin2:'#9aa868',build:{h:1.05,w:1.25,bulk:1.4},extras:['belly']},
   riot:{extras:['armor','helmet'],build:{h:1.05,w:1.1,bulk:1.1},topCol:'#20242c',botCol:'#20242c'},
   screamer:{build:{h:1.05,w:.85,bulk:.85},face:{mouth:'scream',eye:'#fff0a0'},extras:['jaw','rags']},
   spitter:{skin:'#8a9a50',extras:['throat','rags'],face:{mouth:'open',eye:'#c0d020'}},
   drowned:{skin:'#6a8a88',hairCol:'#1a2a20',extras:['weed','rags'],build:{h:1,w:1.1,bulk:1.15}},
   frozen:{skin:'#a8b8c8',face:{eye:'#80c0ff'},extras:['ice','rags'],build:{h:1,w:1.05,bulk:1.05}},
  }[type]||{};
  return {...base,...T,ztype:type,face:{...base.face,...(T.face||{})}};
}
export const MIDS=[null,
 {skin:'#5a7a78',hair:'bald',top:'coat',topCol:'#1a2a3a',botCol:'#1a1a22',extras:['capthat','chain','weed'],face:{eye:'#60f0d0',beard:'#2a3a30',angry:1},build:{h:1.35,w:1.2,bulk:1.2}},
 {skin:'#8a8a78',hair:'short',top:'scrubs',topCol:'#d8d8d0',botCol:'#d8d8d0',extras:['armor','visor'],face:{eye:'#c02010',angry:1},build:{h:1.35,w:1.25,bulk:1.25}},
 {skin:'#a0a8b8',hair:'long',hairCol:'#ddd',top:'coat',topCol:'#5a4a38',botCol:'#3a3028',extras:['hood','snares','ice'],face:{eye:'#90d0ff',beard:'#ccc'},build:{h:1.3,w:1.15,bulk:1.15}},
 {skin:'#8a8070',hair:'short',top:'coat',topCol:'#1a2a4a',botCol:'#1a1a2a',extras:['condcap','lantern'],face:{eye:'#ffd060',mouth:'open'},build:{h:1.4,w:1,bulk:.95}},
 {skin:'#9aa070',hair:'bun',hairCol:'#666',female:1,top:'dress',topCol:'#d8d4c8',extras:['nursecap','sacs','belly'],skin2:'#a8b060',face:{eye:'#c0d020',mouth:'open'},build:{h:1.35,w:1.3,bulk:1.3}},
];
export const BOSSES=[
 {art:'swollen',skin:'#9a9a6a',skin2:'#a8a870',hair:'bald',top:'tshirt',topCol:'#6a6050',botCol:'#3a3a30',extras:['belly','pipe','rags'],face:{eye:'#ff4020',mouth:'open',angry:1},build:{h:1.55,w:1.4,bulk:1.6}},
 {skin:'#5a7a70',hair:'long',hairCol:'#1a2a20',top:'coat',topCol:'#2a3a40',botCol:'#1a2028',extras:['net','weed'],face:{eye:'#60ffd0',mouth:'open'},build:{h:1.7,w:1.3,bulk:1.4}},
 {skin:'#a09a90',hair:'bald',top:'dress',topCol:'#6a8a7a',extras:['gown','scalpels','longarms'],gown:'#6a8a7a',face:{mask:'#8ab0a0',eye:'#fff'},build:{h:1.6,w:.95,bulk:.9}},
 {skin:'#b0b8c8',hair:'spiky',hairCol:'#e0e8f0',top:'coat',topCol:'#8a8a90',botCol:'#4a4a50',extras:['fur','ice','longarms'],face:{eye:'#60c0ff',mouth:'open',angry:1},build:{h:1.5,w:1.2,bulk:1.2}},
 {skin:'#8a8278',hair:'bald',top:'tshirt',topCol:'#3a3a40',botCol:'#2a2a2e',extras:['ears','longarms','ribs'],face:{blind:1,mouth:'scream'},build:{h:1.6,w:1,bulk:.9}},
 {skin:'#8a8a78',hair:'long',hairCol:'#333',top:'dress',topCol:'#3a2a3a',extras:['heads','rags','belly'],skin2:'#8a8a78',face:{mouth:'scream',eye:'#ff2020'},build:{h:1.6,w:1.4,bulk:1.4}},
 null, // Courier = LINH_TURNED
 {skin:'#2a2a34',hair:'bald',top:'dress',topCol:'#101016',botCol:'#101016',extras:['void','longarms'],face:{eye:'#f0f0ff',blind:1,mouth:'scream'},build:{h:2.0,w:1.1,bulk:1}},
];
export function makeHero(i){return buildChar(HEROES[i]);}
export {buildChar};
