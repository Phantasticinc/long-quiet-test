// The Long Quiet — 32-bit edition. Game runtime: chapters, rooms, player, enemies, bosses, camp/siege, cutscenes, memory flashes.
import {THREE,G,TIERS,Renderer,lam,tex,clearTex} from './gfx.js';
import {buildChar,animate,portrait} from './chars.js';
import {HEROES,LINH_TURNED,npcDef,zombieDef,MIDS,BOSSES} from './cast.js';
import {buildRoom,interviewSet,RW,RD,KITS} from './world.js';
import {Phys} from './physics.js';
import {applyScenic,vistaFor} from './scenic.js';
import {loadChars,loadProps,useBlender,loadArt} from './assets.js';
import {geoKey,artKey} from './chars.js';
import * as AU from './audio.js';
import * as U from './ui.js';
import {STORY} from '../story/story.js';
const {IN}=U;const V3=THREE.Vector3;
const canvas=document.getElementById('gl');const R=new Renderer(canvas);U.initUI();U.controls(false);
const S={ch:0,ri:0,state:'boot',t:0,camMode:'fixed',scene:null,room:null};
let save=JSON.parse(localStorage.getItem('lq32.save')||'{"unlocked":1,"best":{}}');
const persist=()=>localStorage.setItem('lq32.save',JSON.stringify(save));
const hash=(s)=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))%100003;return h;};
const ERR=[];addEventListener('error',e=>ERR.push(String(e.message)));addEventListener('unhandledrejection',e=>ERR.push(String(e.reason&&e.reason.stack||e.reason)));

// ---------- chapter state ----------
const _q=new URLSearchParams(location.search);let TEST=_q.has('test')||_q.has('god');
function testBadge(){let b=document.getElementById('testbadge');if(!b){b=document.createElement('div');b.id='testbadge';b.textContent='TEST MODE';b.style.cssText='position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:9999;background:#b00020;color:#fff;font:bold 11px sans-serif;padding:2px 8px;border-radius:4px;pointer-events:none;letter-spacing:1px';document.body.appendChild(b);}b.style.display=TEST?'block':'none';}
function testFill(){if(!TEST||!P)return;P.hp=100;P.ammo=Math.max(P.ammo,99);P.shells=Math.max(P.shells,99);P.keys.add('_shotgun');}
setTimeout(testBadge,0);
let CH,P,ENEM=[],ITEMS=[],NPCS=[],PROJ=[],FX=[],camp,boss=null,mid=null;
const scenePlayed=new Set();
function newChapter(ci){
  CH=STORY.CH[ci];S.ch=ci;scenePlayed.clear();
  P={hp:100,ammo:12,shells:ci>=2?4:0,herbs:1,keys:new Set(),wpn:'pistol',scrap:0,pos:new V3(0,0,1.5),rot:Math.PI,vel:new V3(),cool:0,inv:0,slow:0,recoil:0,ph:0,kills:0,grab:0,aimT:0};
  if(ci>=2)P.keys.add('_shotgun');
  testFill();
  // enemies per chapter (persist across rooms)
  ENEM=CH.enemyRooms.map((r,i)=>({room:r,type:CH.mix[i%CH.mix.length],role:CH.skins[i%CH.skins.length],seed:ci*37+i*11+3,dead:false,i}));
  ITEMS=CH.items.map((it,i)=>({...it,i,taken:false}));
  NPCS=CH.npcs.map((n,i)=>({...n,i,talked:0}));
  camp={accepted:false,done:false,kills0:0,siege:0,safeVisits:0};
  boss={def:CH.boss,dead:false,started:false};mid=CH.mid?{def:CH.mid,dead:false,started:false}:null;
  S.tide=CH.extra.tide||0;S.visited=new Set();S.flags={};
}
// ---------- scene / room ----------
let scene,room,cam=new THREE.PerspectiveCamera(70,1,.05,80),hero,flash,muzzle,lampsDyn=[],weather,phys,live=[],npcObjs=[],itemObjs=[],bossEnt=null;
const hemi=new THREE.HemisphereLight('#8090b0','#201810',.5);
function heroDef(){return S.ch>=6?HEROES[6]:HEROES[S.ch];}
function loadRoom(ri,fromSide){
  if(room){room.group.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose();});}if(phys){phys.clearDyn();phys.clearRags();}
  S.ri=ri;const rd=CH.rooms[ri];
  room=buildRoom(S.ch,ri,rd);scene=new THREE.Scene();S.scene=scene;const K=room.kit;
  scene.background=new THREE.Color(room.out?K.sky:K.fog);scene.fog=new THREE.FogExp2(K.fog,K.fogD*(room.out?.8:1));S.fogBase=scene.fog.density;
  hemi.color.set('#8090b0');hemi.groundColor.set('#201810');scene.add(room.group);hemi.intensity=room.out?.9:.45;scene.add(hemi);
  // dynamic lights: room lamps (limited by tier) + flashlight + muzzle
  lampsDyn=[];for(const l of room.lamps.slice(0,Math.max(1,G.T.lights-2))){const pl=new THREE.PointLight(l.col,room.out?5:4,l.r*1.2,1.6);pl.position.set(l.x,l.y,l.z);scene.add(pl);lampsDyn.push({pl,base:pl.intensity,l,ph:Math.random()*9});}
  flash=new THREE.SpotLight('#fff4e0',room.out?6:9,14,.55,.5,1.4);scene.add(flash,flash.target);
  muzzle=new THREE.PointLight('#ffc070',0,7,2);scene.add(muzzle);
  if(!hero){hero=buildChar(heroDef());}
  scene.add(hero);
  if(phys)phys.scene=scene;else phys=new Phys(scene);phys.loadRoom(room);
  // place player at door
  if(fromSide){const opp={N:'S',S:'N',E:'W',W:'E'}[fromSide];const dr=Object.values(room.doors).find(d=>d.to===S.prevRoom)||room.doors[opp];
    if(dr){P.pos.set(dr.x*.82,0,dr.z*.82);P.rot=Math.atan2(-dr.x,-dr.z);}}
  // weather particles
  const VS=vistaFor(S.ch,rd.n);weather=null;if(!VS&&room.out&&K.weather!=='none'){const n=G.tier==='low'?300:700,g=new THREE.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*20;a[i*3+1]=Math.random()*8;a[i*3+2]=(Math.random()-.5)*18;}
    g.setAttribute('position',new THREE.BufferAttribute(a,3));weather=new THREE.Points(g,new THREE.PointsMaterial({color:K.weather==='snow'?'#fff':K.weather==='ash'?'#888':'#9ab',size:K.weather==='snow'?.08:.04,transparent:true,opacity:.7,fog:true}));weather.userData.kind=K.weather;scene.add(weather);}
  if(!VS&&K.weather==='ash'&&!room.out){const n=200,g=new THREE.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*10;a[i*3+1]=Math.random()*3;a[i*3+2]=(Math.random()-.5)*8;}g.setAttribute('position',new THREE.BufferAttribute(a,3));weather=new THREE.Points(g,new THREE.PointsMaterial({color:'#6a5a7a',size:.04}));weather.userData.kind='ash';scene.add(weather);}
  S.scenic=applyScenic(scene,S.ch,room,rd,G.tier,hemi);S.fogBase=scene.fog.density;S.vista=S.scenic&&S.scenic.vista;
  // spawn live enemies
  live=[];for(const e of ENEM)if(e.room===ri&&!e.dead)spawnZ(e);
  // npcs
  npcObjs=[];for(const n of NPCS)if(n.r===ri){const c=buildChar(npcDef(n));const sp=freeSpot(hash(n.name),1.2);c.position.set(sp.x,0,sp.z);c.rotation.y=Math.atan2(-sp.x,-sp.z);scene.add(c);npcObjs.push({n,c,ph:Math.random()*5});}
  // items (boss-room items appear after boss)
  itemObjs=[];for(const it of ITEMS)if(it.r===ri&&!it.taken){if(ri===CH.boss.r&&!boss.dead&&S.ch<6)continue;placeItem(it);}
  // camp fire / lantern in safe room
  if(rd.safe){const f=new THREE.PointLight('#ff9040',5,8,1.5);f.position.set(0,.6,0);scene.add(f);lampsDyn.push({pl:f,base:5,fire:1,ph:0});
    const fire=new THREE.Mesh(new THREE.ConeGeometry(.18,.45,6),new THREE.MeshBasicMaterial({color:'#ffa040',transparent:true,opacity:.85}));fire.position.set(0,.3,0);fire.userData.fire=1;scene.add(fire);S.fireMesh=fire;
    const pit=new THREE.Mesh(new THREE.CylinderGeometry(.4,.45,.12,8),lam({map:tex('stone'),color:'#555'}));pit.position.y=.06;scene.add(pit);room.boxes.push({x:0,z:0,hx:.4,hz:.4,h:.3});}
  // generator spot
  if(CH.extra.gen&&CH.extra.gen.r===ri)S.genSpot={x:0,z:-RD/2+1.6};else S.genSpot=null;
  // boss / mid
  bossEnt=null;
  U.setRoom(rd.n);AU.ambience(rd.safe?'camp':K.amb2);
  P.pos.y=0;hero.position.copy(P.pos);hero.rotation.y=P.rot;S.camIdx=-1;
}
function freeSpot(seed,clear=.8){let r=seed||1;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647;};
  for(let i=0;i<60;i++){const x=(rnd()-.5)*(RW-2.4),z=(rnd()-.5)*(RD-2.4);if(Math.hypot(x,z)<1)continue;if(!collides(x,z,clear*.6))return{x,z};}return{x:1,z:1};}
function collides(x,z,r){for(const b of room.boxes){if(b.broken)continue;const dx=Math.max(Math.abs(x-b.x)-b.hx,0),dz=Math.max(Math.abs(z-b.z)-b.hz,0);if(dx*dx+dz*dz<r*r)return b;}return null;}
function placeItem(it){const sp=freeSpot(hash(it.k+it.i+CH.id),.7);let m;
  if(it.k==='ammo'){m=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.28,.16,.18),lam({map:tex('metal'),color:'#b09040'}));b.position.y=.08;m.add(b);}
  else if(it.k==='herb'){m=new THREE.Group();const pot=new THREE.Mesh(new THREE.CylinderGeometry(.1,.08,.14,6),lam({color:'#8a5a3a'}));pot.position.y=.07;m.add(pot);for(let i=0;i<4;i++){const l=new THREE.Mesh(new THREE.ConeGeometry(.05,.22,4),lam({color:'#3a9a40'}));l.position.set(Math.cos(i*1.6)*.04,.24,Math.sin(i*1.6)*.04);l.rotation.z=Math.cos(i*1.6)*.4;m.add(l);}}
  else if(it.k==='letter'){m=new THREE.Mesh(new THREE.BoxGeometry(.24,.01,.32),lam({color:'#e8e0c8'}));m.position.y=.02;}
  else{m=new THREE.Mesh(it.k==='moon'||it.k==='sun'?new THREE.CylinderGeometry(.13,.13,.03,10):new THREE.BoxGeometry(.22,.14,.22),lam({map:tex('metal'),color:it.k==='sun'?'#e0b030':it.k==='moon'?'#d0d8e8':'#c06030',emissive:'#302010'}));m.position.y=.12;if(it.k==='moon'||it.k==='sun')m.rotation.x=Math.PI/2;}
  const g=new THREE.Group();g.add(m);g.position.set(sp.x,0,sp.z);
  const glint=new THREE.Sprite(new THREE.SpriteMaterial({color:'#fff6c0',transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));glint.scale.setScalar(.12);glint.position.y=.35;g.add(glint);
  // put on a table/desk if one is near? keep floor for readability
  scene.add(g);itemObjs.push({it,g,glint});}
function spawnZ(e,pos){const T=STORY.ZT[e.type]||STORY.ZT.walker;const c=buildChar(zombieDef(e.type,e.role,e.seed));
  const sp=pos||freeSpot(e.seed*13+7,.8);c.position.set(sp.x,0,sp.z);c.rotation.y=Math.random()*6;scene.add(c);
  const z={e,c,type:e.type,hp:T.hp*(S.ch>=4?1.3:1),sp:T.sp,grab:T.grab,armor:T.armor||0,state:'idle',t:0,ph:Math.random()*6,at:0,cd:1+Math.random(),pos:c.position,awake:e.type==='runner'?0:Math.random()*.5,alert:0,stun:0,hitT:0};
  live.push(z);if(Math.random()<.5)setTimeout(()=>AU.sfx('groan',z.pos,.8),400+Math.random()*1500);return z;}
// ---------- camera ----------
const CAMS=[[-RW/2+.5,2.75,RD/2-.5],[RW/2-.5,2.75,RD/2-.5],[RW/2-.5,2.75,-RD/2+.5],[-RW/2+.5,2.75,-RD/2+.5]];
let camLook=new V3(),camPos=new V3(),camShake=0,camBasis=null,cineCam=null;
function updateCam(dt){
  const portraitScr=innerHeight>innerWidth;cam.fov=portraitScr?82:66;cam.updateProjectionMatrix();
  if(cineCam){cam.position.lerp(cineCam.p,cineCam.snap?1:Math.min(1,dt*2));camLook.lerp(cineCam.l,cineCam.snap?1:Math.min(1,dt*2));cineCam.snap=0;}
  else if(S.camMode==='fixed'){
    const pp=P.pos;let best=S.camIdx,bd=-1;CAMS.forEach((c,i)=>{const d=Math.hypot(c[0]-pp.x,c[2]-pp.z)+(i===S.camIdx?1.6:0);if(d>bd){bd=d;best=i;}});
    if(room.out){const c=CAMS[best];camPos.set(c[0]*1.15,3.6,c[2]*1.15);}else camPos.set(...CAMS[best]);
    const tgt=new V3(pp.x*.75,1,pp.z*.75);
    if(best!==S.camIdx){S.camIdx=best;cam.position.copy(camPos);camLook.copy(tgt);}else{cam.position.lerp(camPos,.2);camLook.lerp(tgt,Math.min(1,dt*4));}
  }else{const back=new V3(-Math.sin(P.rot),0,-Math.cos(P.rot));const want=P.pos.clone().addScaledVector(back,2.6);want.y=2.1;
    want.x=THREE.MathUtils.clamp(want.x,-RW/2+.35,RW/2-.35);want.z=THREE.MathUtils.clamp(want.z,-RD/2+.35,RD/2-.35);
    cam.position.lerp(want,Math.min(1,dt*5));camLook.lerp(new V3(P.pos.x,1.2,P.pos.z).addScaledVector(back,-1.5),Math.min(1,dt*6));}
  cam.lookAt(camLook);if(camShake>0){cam.position.x+=(Math.random()-.5)*camShake*.2;cam.position.y+=(Math.random()-.5)*camShake*.2;camShake=Math.max(0,camShake-dt*2);}
  AU.listener(cam);
}
// ---------- input → player ----------
function stickWorld(){if(IN.mag<=0){camBasis=null;return null;}
  if(!camBasis){const f=new V3();cam.getWorldDirection(f);f.y=0;f.normalize();camBasis={f,r:new V3(-f.z,0,f.x)};}
  const d=camBasis.f.clone().multiplyScalar(-IN.y).addScaledVector(camBasis.r,IN.x);return d.lengthSq()>1e-6?d.normalize():null;}
function moveCircle(pos,dx,dz,r){let nx=pos.x+dx,nz=pos.z+dz;
  for(let k=0;k<2;k++)for(const b of room.boxes){if(b.broken)continue;const cx=THREE.MathUtils.clamp(nx,b.x-b.hx,b.x+b.hx),cz=THREE.MathUtils.clamp(nz,b.z-b.hz,b.z+b.hz);const ddx=nx-cx,ddz=nz-cz,d2=ddx*ddx+ddz*ddz;
    if(d2<r*r){const d=Math.sqrt(d2)||1e-4;if(d2<1e-8){nx=pos.x;nz=pos.z;}else{nx=cx+ddx/d*r;nz=cz+ddz/d*r;}}}
  const lim=room.out?RW/2+2.6:RW/2-.3,limz=room.out?RD/2+2.6:RD/2-.3;pos.x=THREE.MathUtils.clamp(nx,-lim,lim);pos.z=THREE.MathUtils.clamp(nz,-limz,limz);}
let stepT=0,heartT=0,lastAimTarget=null;
function playerUpdate(dt){
  const d=stickWorld();P.cool-=dt;P.inv-=dt;P.recoil=Math.max(0,P.recoil-dt*4);
  const run=IN.mag>.62,slow=P.slow>0?.55:1;P.slow-=dt;
  let moving=false;
  if(P.grab>0){P.grab-=dt;if(consume2())P.grab-=.35;}
  else if(d&&!S.healing){const sp=(run?3.7:1.7*Math.min(1,.4+IN.mag/.62))*slow;moveCircle(P.pos,d.x*sp*dt,d.z*sp*dt,.3);
    const tr=Math.atan2(d.x,d.z);P.rot=lerpAng(P.rot,tr,Math.min(1,dt*14));moving=true;P.ph+=dt*(run?11:6.5);
    stepT-=dt*(run?1.7:1);if(stepT<0){stepT=.42;AU.sfx('step',P.pos,run?1:.6);}}
  // aim: stick direction is the aim; soft lock to nearest target within the cone
  let tgt=null,bd=1e9;const fwd=new V3(Math.sin(P.rot),0,Math.cos(P.rot));
  for(const z of liveTargets()){const to=z.pos.clone().sub(P.pos);to.y=0;const dist=to.length();if(dist>11)continue;to.normalize();const dot=to.dot(fwd);if(dot<.72)continue;const sc=dist*(1.6-dot);if(sc<bd){bd=sc;tgt=z;}}
  lastAimTarget=tgt;
  if(IN.fire&&P.cool<=0&&!S.healing)fire(fwd,tgt);
  if(U.consume('heal'))heal();
  if(U.consume('wpn')){if(P.keys.has('_shotgun')){P.wpn=P.wpn==='pistol'?'shotgun':'pistol';AU.sfx('click');U.toast(P.wpn.toUpperCase(),900);}else U.toast('No other weapon yet.',1200);}
  if(U.consume('act'))act();
  const aiming=IN.fire||P.aimT>0;P.aimT-=dt;
  animate(hero,{state:S.healing?'heal':P.grab>0?'hit':moving?(run?'run':'walk'):'idle',ph:P.ph,aim:aiming&&!S.healing,recoil:P.recoil,limp:P.hp<30},S.t);
  hero.position.copy(P.pos);hero.rotation.y=P.rot;
  // flashlight follows aim
  flash.position.set(P.pos.x+fwd.x*.2,1.35,P.pos.z+fwd.z*.2);flash.target.position.set(P.pos.x+fwd.x*6,.4,P.pos.z+fwd.z*6);
  // tension / heartbeat
  let near=99;for(const z of liveTargets())near=Math.min(near,z.pos.distanceTo(P.pos));
  heartT-=dt;if((P.hp<35||near<2.6)&&heartT<0){heartT=P.hp<20?.55:.85;AU.sfx('heart',null,P.hp<35?1:.6);U.haptic(P.hp<20?[30,80,20]:20);}
  R.post.uniforms.red.value=Math.max(R.post.uniforms.red.value-dt*1.5,P.hp<25?.25+Math.sin(S.t*6)*.08:0);
  if(!S.inBoss&&!CH.rooms[S.ri].safe&&!S.cine){const m=near<4?'combat':near<9?'tension':'calm';if(AU.A.mode!==m&&AU.A.mode!=='memory')AU.setMode(m);}
  // doors
  for(const side in room.doors){const dr=room.doors[side],bx=dr.x/.82*0+dr.x,bz=dr.z;const doorPt={N:[0,-RD/2],S:[0,RD/2],E:[RW/2,0],W:[-RW/2,0]}[side];
    if(Math.hypot(P.pos.x-doorPt[0],P.pos.z-doorPt[1])<.72&&d&&(d.x*doorPt[0]+d.z*doorPt[1])>0){useDoor(side,dr);break;}}
  // prompts
  const it=nearItem(),np=nearNPC();U.prompt(it?'ACT · '+(it.it.name||it.it.k.toUpperCase()):np?'ACT · TALK':nearGen()?'ACT · GENERATOR':null);
}
function consume2(){return U.consume('fire')||U.consume('act');}
function lerpAng(a,b,t){let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*t;}
function liveTargets(){const a=live.filter(z=>z.hp>0);if(bossEnt&&bossEnt.hp>0&&!bossEnt.hidden)a.push(bossEnt);return a;}
function fire(fwd,tgt){
  const sg=P.wpn==='shotgun';if(sg?P.shells<=0:P.ammo<=0){AU.sfx('click');P.cool=.35;U.toast(sg?'Out of shells.':'Out of ammo.',900);return;}
  if(!TEST){if(sg)P.shells--;else P.ammo--;}P.cool=sg?.95:.38;P.recoil=1;P.aimT=1.2;
  AU.sfx(sg?'shotgun':'shot',P.pos);U.haptic(sg?35:18);muzzle.intensity=sg?14:9;muzzle.position.set(P.pos.x+fwd.x*.7,1.35,P.pos.z+fwd.z*.7);camShake=Math.max(camShake,sg?.6:.25);
  if(tgt){P.rot=Math.atan2(tgt.pos.x-P.pos.x,tgt.pos.z-P.pos.z);}
  const dir=tgt?tgt.pos.clone().sub(P.pos).setY(0).normalize():fwd;
  // AI-free hitscan along dir; check breakables, then targets
  const pel=sg?5:1;for(let k=0;k<pel;k++){const a=Math.atan2(dir.x,dir.z)+(sg?(k-2)*.07:0),dv=new V3(Math.sin(a),0,Math.cos(a));
    let hit=null,hd=sg?7:14;for(const z of liveTargets()){const to=z.pos.clone().sub(P.pos);const t=to.dot(dv);if(t<0||t>hd)continue;const perp=to.clone().addScaledVector(dv,-t).length();if(perp<(z.isBoss?.7:.45)){hd=t;hit=z;}}
    let brk=null;for(const b of room.breakables){if(b.broken)continue;const to=new V3(b.x-P.pos.x,0,b.z-P.pos.z);const t=to.dot(dv);if(t<0||t>hd)continue;if(to.clone().addScaledVector(dv,-t).length()<Math.max(b.hx,b.hz)+.1){hd=t;brk=b;hit=null;}}
    if(hit)damage(hit,(sg?1.1:1)*(hit.stun>0?2:1),dv);
    if(brk){brk.hp-=sg?1:1;if(brk.hp<=0)breakProp(brk,dv);else AU.sfx('hit',new V3(brk.x,1,brk.z));}
    if(!hit&&!brk){const p=P.pos.clone().addScaledVector(dv,hd);puff(p.setY(1.2),'#bbb');}}
}
function breakProp(b,dv){b.broken=true;phys.shatter(b,dv);AU.sfx(b.type==='vase'?'glass':'break',new V3(b.x,.6,b.z));U.haptic(25);camShake=Math.max(camShake,.3);
  if(b.type==='barrel'&&S.ch===1||Math.random()<.5){const kind=Math.random()<.45?'scrap':Math.random()<.6?'ammo':'herb';const it={r:S.ri,k:kind,n:kind==='ammo'?3:1,i:'d'+Math.random(),drop:1};ITEMS.push(it);room.boxes=room.boxes.filter(x=>x!==b);placeItem(it);itemObjs[itemObjs.length-1].g.position.set(b.x,0,b.z);}
  else room.boxes=room.boxes.filter(x=>x!==b);}
function puff(p,col){const m=new THREE.Mesh(new THREE.SphereGeometry(.06,4,3),new THREE.MeshBasicMaterial({color:col,transparent:true}));m.position.copy(p);scene.add(m);FX.push({m,t:0,life:.25,grow:4});}
function damage(z,amt,dv){
  if(z.isBoss){bossDamage(z,amt,dv);return;}
  const a=z.armor&&!(z.e&&z.e.dead)?Math.max(.34,amt-z.armor*.2):amt;z.hp-=a;z.hitT=.25;z.state='chase';z.awake=0;AU.sfx('hit',z.pos);
  phys.gore(z.pos.clone().setY(1.3),dv,3,z.type==='bloater'?'#6a7a30':'#4a0806');
  z.pos.addScaledVector(dv,.15);
  if(z.hp<=0)kill(z,dv);}
function kill(z,dv){z.e.dead=true;z.state='dead';P.kills++;AU.sfx('splat',z.pos);U.haptic(30);
  if(z.type==='bloater'){explode(z.pos,2.6,22,'#7a8a30');scene.remove(z.c);}
  else{animate(z.c,{state:'dead'},S.t);phys.ragdoll(z.c,z.pos.clone(),dv,z.type==='riot'?3:5);}
  live=live.filter(x=>x!==z);checkCampKills();
  if(Math.random()<.22){const it={r:S.ri,k:'ammo',n:2,i:'z'+Math.random(),drop:1};ITEMS.push(it);placeItem(it);itemObjs[itemObjs.length-1].g.position.set(z.pos.x,0,z.pos.z);}}
function explode(p,r,dmg,col){AU.sfx('splat',p,1.4);AU.sfx('thud',p);phys.gore(p.clone().setY(1),new V3(),12,col);camShake=1;R.post.uniforms.flash.value=.25;
  if(P.pos.distanceTo(p)<r)hurt(dmg,p);for(const z of live)if(z.pos.distanceTo(p)<r&&z.hp>0)damage(z,3,z.pos.clone().sub(p).setY(0).normalize());
  for(const b of room.breakables)if(!b.broken&&Math.hypot(b.x-p.x,b.z-p.z)<r)breakProp(b,new V3(b.x-p.x,0,b.z-p.z).normalize());}
function hurt(dmg,from){if(P.inv>0||S.cine)return;P.hp-=dmg;if(TEST)P.hp=100;P.inv=.7;AU.sfx('hurt',P.pos);U.haptic([40,30,60]);R.post.uniforms.red.value=.6;camShake=Math.max(camShake,.7);
  if(from){const k=P.pos.clone().sub(from).setY(0);if(k.lengthSq()>0){k.normalize();moveCircle(P.pos,k.x*.5,k.z*.5,.3);}}
  if(P.hp<=0)die();}
function heal(){if(P.herbs<=0){U.toast('No herbs.',900);return;}if(P.hp>=100){U.toast('Condition: FINE.',900);return;}
  P.herbs--;S.healing=true;AU.sfx('heal');U.haptic(15);setTimeout(()=>{P.hp=Math.min(100,P.hp+45);S.healing=false;},700);}
// ---------- interactions ----------
function nearItem(){let b=null,bd=1.1;for(const o of itemObjs){const d=Math.hypot(o.g.position.x-P.pos.x,o.g.position.z-P.pos.z);if(d<bd){bd=d;b=o;}}return b;}
function nearNPC(){for(const o of npcObjs)if(o.c.position.distanceTo(P.pos)<1.5)return o;return null;}
function nearGen(){return S.genSpot&&Math.hypot(S.genSpot.x-P.pos.x,S.genSpot.z-P.pos.z)<1.8&&!P.keys.has('power');}
async function act(){if(S.busy)return;
  const it=nearItem();if(it)return pickup(it);
  const np=nearNPC();if(np)return talk(np);
  if(nearGen()){const g=CH.extra.gen;if(g.needs.every(k=>P.keys.has(k))){P.keys.add('power');AU.sfx('thud');AU.sting('swell');U.toast(g.msg,3000);for(const l of lampsDyn)l.base*=1.5;}else U.toast('The generator needs '+g.needs.map(k=>U.KEYNAMES[k]).join(' + ')+'.');return;}
  // examine exit door
  const ex=CH.exit;if(ex&&ex.r===S.ri)for(const s in room.doors)if(room.doors[s].to==='exit'&&Math.hypot(room.doors[s].x-P.pos.x,room.doors[s].z-P.pos.z)<1.6)return tryExit();
}
async function pickup(o){const it=o.it;it.taken=true;scene.remove(o.g);itemObjs=itemObjs.filter(x=>x!==o);U.haptic(12);
  if(it.k==='ammo'){P.ammo+=it.n||6;AU.sfx('pickup');U.toast(`Handgun ammo ×${it.n||6}`,1400);if(S.ch>=2&&Math.random()<.4){P.shells+=2;}}
  else if(it.k==='herb'){P.herbs++;AU.sfx('pickup');U.toast('Herb',1200);}
  else if(it.k==='scrap'){P.scrap++;AU.sfx('pickup');U.toast('Scrap',1000);}
  else if(it.k==='letter'){AU.sting('item');S.busy=true;await scenePause(async()=>{await U.say('LETTER',it.read.replace(/^"|"$/g,''),null);if(it.mem)await memory(it.mem);});S.busy=false;}
  else{P.keys.add(it.k);AU.sting('item');U.toast(it.name||U.KEYNAMES[it.k]||it.k,2400);await maybeScene('item:'+it.k);
    for(const sc of CH.scares)if(sc.r===S.ri&&sc.after===it.k&&!S.flags['sc'+sc.after])scare(sc);}
}
async function talk(o){S.busy=true;const n=o.n;const port=getPortrait(o.c);
  await scenePause(async()=>{
    if(n.i===0&&!scenePlayed.has('npc0')){scenePlayed.add('npc0');await playScene(CH.scenes.find(s=>s.on==='npc0'),true);}
    const req=CH.camp.req;
    if(req&&req.who===n.i&&req.text){
      if(!camp.accepted){camp.accepted=true;camp.kills0=P.kills;await U.say(n.name,strip(req.text),port);}
      else if(!camp.done&&campReady()){camp.done=true;if(req.need){if(req.need.k==='scrap')P.scrap-=req.need.n;else P.herbs-=req.need.n;}grant(req.reward);await U.say(n.name,strip(req.done),port);AU.sting('save');}
      else if(!camp.done){await U.say(n.name,strip(req.text)+(req.kills?`  (${Math.max(0,req.kills-(P.kills-camp.kills0))} left)`:` (have ${req.need.k==='scrap'?P.scrap:P.herbs}/${req.need.n})`),port);}
      else await U.say(n.name,strip(n.lines[o.talked++%n.lines.length]),port);
    }else{await U.say(n.name,strip(n.lines[o.talked%n.lines.length]),port);
      if(n.give&&!n.gave){n.gave=1;if(n.thanks)await U.say(n.name,strip(n.thanks),port);grant(n.give);}o.talked++;}
  });S.busy=false;}
const strip=s=>{if(typeof s!=='string'){console.warn('strip: missing text');return '';}return s.replace(/^"|"$/g,'');};
function campReady(){const r=CH.camp.req;if(r.kills)return P.kills-camp.kills0>=r.kills;return(r.need.k==='scrap'?P.scrap:P.herbs)>=r.need.n;}
function checkCampKills(){const r=CH.camp.req;if(camp.accepted&&!camp.done&&r.kills&&P.kills-camp.kills0===r.kills)U.toast('Request complete. Return to camp.',2400);}
function grant(g){if(g.k==='ammo'){P.ammo+=g.n||6;U.toast(`Ammo ×${g.n||6}`);}else if(g.k==='herb'){P.herbs+=g.n||1;U.toast(`Herb ×${g.n||1}`);}AU.sfx('pickup');}
async function useDoor(side,dr){if(S.busy)return;
  if(dr.to==='exit')return tryExit();
  if(boss.started&&!boss.dead&&S.inBoss){U.toast('No way out. Not now.',900);return;}
  S.busy=true;AU.sfx('door',null);U.haptic(10);U.prompt(null);await U.fade(1,260);
  S.prevRoom=S.ri;loadRoom(dr.to,side);await U.fade(0,260);S.busy=false;onEnter();}
async function tryExit(){const ex=CH.exit;if(!ex)return;if(S.busy)return;
  if(!ex.needs.every(k=>P.keys.has(k))){S.busy=true;await scenePause(()=>U.say('',ex.locked,null));S.busy=false;P.pos.multiplyScalar(.8);return;}
  if(!boss.dead){S.busy=true;await scenePause(()=>U.say('','Something is still down here. You can hear it breathing.',null));S.busy=false;P.pos.multiplyScalar(.8);return;}
  S.busy=true;AU.sfx('door');await scenePause(()=>U.say('',ex.done,null));chapterEnd();}
async function onEnter(){const rd=CH.rooms[S.ri];const first=!S.visited.has(S.ri);S.visited.add(S.ri);
  if(rd.safe){AU.setMode('safe');camp.safeVisits++;if(first){AU.sting('save');saveProgress();U.toast('SAFE ZONE · progress saved',2000);}
    // siege: once per chapter, after the player has found at least one key item and returns
    if(!camp.siege&&camp.safeVisits>=2&&[...P.keys].some(k=>!k.startsWith('_')))siege();}
  await maybeScene('room:'+S.ri);
  for(const sc of CH.scares)if(sc.r===S.ri&&!sc.after&&!S.flags['sc'+S.ri]){S.flags['sc'+S.ri]=1;scare(sc);}
  if(mid&&!mid.started&&mid.def.r===S.ri&&!mid.dead)startMid();
  if(!boss.started&&CH.boss.r===S.ri&&!boss.dead&&(S.ch>=6?true:true))startBoss();
}
function scare(sc){S.flags['sc'+(sc.after||S.ri)]=1;
  if(sc.type==='window'){AU.sfx('glass',new V3(RW/2-1,2,0));AU.sting('scare');camShake=1;U.haptic([60,40,60]);R.post.uniforms.flash.value=.35;
    const e={room:S.ri,type:'runner',role:CH.skins[0],seed:777+S.ri,dead:false};ENEM.push(e);const z=spawnZ(e,{x:P.pos.x>0?-RW/2+1.2:RW/2-1.2,z:0});z.state='chase';z.awake=0;
    for(let i=0;i<6;i++)puff(new V3(z.pos.x,1.5,z.pos.z),'#cde');}
  else{AU.setMode('silence');setTimeout(()=>{AU.sfx('thud',new V3(-3,3,-3),.6);},2600);}}
async function siege(){camp.siege=1;await U.wait(1400);U.toast('They followed you. Hold the camp!',2600);AU.sting('scare');AU.setMode('combat');
  const n=3+Math.min(3,S.ch);const types=CH.mix;for(let i=0;i<n;i++){setTimeout(()=>{if(S.ri===undefined||!CH.rooms[S.ri].safe)return;const sides=Object.values(room.doors);const d=sides[i%sides.length];
    const e={room:S.ri,type:types[i%types.length],role:CH.skins[i%CH.skins.length],seed:900+i,dead:false};ENEM.push(e);const z=spawnZ(e,{x:d.x*.9,z:d.z*.9});z.state='chase';z.awake=0;},i*1600);}
  S.siegeOn=1;}
// ---------- enemies ----------
function zUpdate(z,dt){
  z.t+=dt;z.hitT-=dt;z.cd-=dt;if(z.stun>0){z.stun-=dt;animate(z.c,{state:'hit'},S.t);return;}
  const to=P.pos.clone().sub(z.pos);to.y=0;const dist=to.length();to.normalize();
  if(z.state==='idle'){animate(z.c,{state:z.type==='crawler'?'crawl':'idle',ph:z.ph},S.t);if(dist<7.5||z.alert){z.awake-=dt;if(z.awake<=0){z.state='chase';if(Math.random()<.6)AU.sfx('groan',z.pos);if(z.type==='screamer')screamAlert(z);}}return;}
  if(z.hitT>0){animate(z.c,{state:'hit'},S.t);return;}
  const T=z.type;let sp=z.sp*(T==='runner'?1.9:1)*1.05;let st=T==='crawler'?'crawl':T==='runner'?'sprint':'shamble';
  if(T==='spitter'&&dist<7&&dist>2.5){sp=0;st='spit';if(z.cd<=0){z.cd=2.6;z.at=0;setTimeout(()=>spit(z.pos.clone().setY(1.4),P.pos.clone().setY(1.1),'#9ac020',10,.35),300);AU.sfx('splat',z.pos,.5);}z.at=Math.min(1,z.at+dt*3);}
  if(T==='screamer'&&z.cd<=0&&dist<8){z.cd=9;screamAlert(z);}
  if(dist<1.05&&T!=='spitter'){sp=0;st='attack';z.at+=dt*2;if(z.at>1){z.at=0;if(T==='bloater'){kill(z,to);return;}
      hurt(Math.round(8+z.grab*12),z.pos);if(Math.random()<z.grab*.6){P.grab=1.1;U.toast('GRABBED! Tap FIRE/ACT to shake free',1100);}if(T==='frozen')P.slow=2.5;}}
  else z.at=0;
  z.ph+=dt*(T==='runner'?9:4)*sp;const nr=Math.atan2(to.x,to.z);z.c.rotation.y=lerpAng(z.c.rotation.y,nr,Math.min(1,dt*4));
  if(sp>0){const v=new V3(Math.sin(z.c.rotation.y),0,Math.cos(z.c.rotation.y)).multiplyScalar(sp*dt);
    for(const o of live)if(o!==z&&o.hp>0){const dd=o.pos.distanceTo(z.pos);if(dd<.6&&dd>0){v.addScaledVector(z.pos.clone().sub(o.pos).normalize(),dt*.8);}}
    moveCircle(z.pos,v.x,v.z,.3);}
  animate(z.c,{state:st,ph:z.ph,at:z.at,hunch:T==='walker'?.2:0},S.t);
}
function screamAlert(z){AU.sfx('scream',z.pos);camShake=.6;U.haptic([20,20,20]);for(const o of live)o.alert=1;
  if(live.length<7&&Math.random()<.6){const e={room:S.ri,type:'walker',role:CH.skins[0],seed:500+(Math.random()*99|0),dead:false};ENEM.push(e);const ds=Object.values(room.doors);const d=ds[(Math.random()*ds.length)|0];if(d){const n=spawnZ(e,{x:d.x*.9,z:d.z*.9});n.state='chase';n.awake=0;}}}
function spit(from,to,col,dmg,r,slow){const m=new THREE.Mesh(new THREE.SphereGeometry(r*.5,6,4),new THREE.MeshBasicMaterial({color:col}));m.position.copy(from);scene.add(m);
  const v=to.clone().sub(from).normalize().multiplyScalar(6);PROJ.push({m,v,dmg,life:3,slow});}
function projUpdate(dt){for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.life-=dt;p.m.position.addScaledVector(p.v,dt);
  const pp=p.m.position;if(Math.hypot(pp.x-P.pos.x,pp.z-P.pos.z)<.45&&pp.y<1.9){hurt(p.dmg,pp);if(p.slow)P.slow=2;p.life=0;}
  if(collides(pp.x,pp.z,.05))p.life=0;if(p.life<=0){scene.remove(p.m);puff(pp.clone(),'#8a9a30');PROJ.splice(i,1);}}
  for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;f.m.scale.setScalar(1+f.t*f.grow*4);f.m.material.opacity=1-f.t/f.life;if(f.t>f.life){scene.remove(f.m);FX.splice(i,1);}}}
// ---------- bosses ----------
function startMid(){mid.started=true;const md=mid.def;const c=buildChar(MIDS[S.ch]);c.position.set(0,0,-RD/2+2);scene.add(c);
  bossEnt={isBoss:1,mid:1,c,pos:c.position,hp:md.hp,max:md.hp,name:md.name,phase:1,cd:2.5,state:'chase',ph:0,at:0,stun:0,armor:md.armor||0,ai:0,def:md};
  AU.sting('boss');AU.setMode('boss');S.inBoss=1;U.bossBar(md.name,1);maybeScene('mid');}
async function startBoss(){boss.started=true;const bd=CH.boss;const def=S.ch===6?LINH_TURNED:BOSSES[S.ch];const c=buildChar(def);
  c.position.set(0,0,-RD/2+1.8);c.rotation.y=0;scene.add(c);
  bossEnt={isBoss:1,c,pos:c.position,hp:bd.hp*1.8,max:bd.hp*1.8,name:bd.name,phase:1,cd:3,state:'chase',ph:0,at:0,stun:0,mech:bd.mech,def:bd,ai:0};
  S.inBoss=1;await maybeScene('boss');AU.sting('boss');AU.setMode('boss');U.bossBar(bd.name,1);AU.sfx('roar',bossEnt.pos);camShake=1.2;}
function bossDamage(b,amt,dv){let a=amt;if(b.armor&&b.phase===1)a*=.4;if(b.blocked)return;b.hp-=a;AU.sfx('hit',b.pos);phys.gore(b.pos.clone().setY(1.5),dv,2);
  U.bossBar(b.name,b.hp/b.max);
  if(b.phase===1&&b.hp<b.max*.5){b.phase=2;bossPhase2(b);}
  else if(b.phase===2&&b.def.p3&&b.hp<b.max*.22){b.phase=3;U.toast(b.def.p3,3000);AU.sting('scare');R.post.uniforms.flash.value=.6;}
  if(b.hp<=0)bossDie(b,dv);}
async function bossPhase2(b){AU.sting('scare');camShake=1;U.haptic([50,30,80]);AU.sfx('roar',b.pos);
  if(b.mid){U.toast(b.def.p2,2600);return;}
  U.toast(b.def.p2,3000);
  if(b.def.memP2){S.busy=true;await scenePause(()=>memory(b.def.memP2));S.busy=false;}
  if(b.mech==='final'){S.busy=true;const k=await scenePause(async()=>{await U.say('MINH','Linh. It\'s me. It\'s Minh.',null);return U.choice([['spare',P.keys.has('tape')?'PLAY HER TAPE':'LOWER THE GUN'],['fight','RAISE THE GUN']]);});S.busy=false;
    if(k==='spare'){S.spared=1;b.hp=0;bossDie(b,new V3(0,0,-1),true);}}
  if(b.mech==='whiteout')scene.fog.density=S.fogBase*3;}
async function bossDie(b,dv,spared){if(b.dead)return;b.dead=true;U.bossBar(null);S.inBoss=0;AU.sfx('roar',b.pos,.8);R.post.uniforms.flash.value=.5;camShake=1.5;
  if(spared)animate(b.c,{state:'sit'},S.t);else{animate(b.c,{state:'dead'},S.t);phys.ragdoll(b.c,b.pos.clone(),dv||new V3(0,0,-1),2);}
  for(const z of live.slice())if(z.hp>0&&b.mid!==1){z.hp=0;kill(z,new V3(0,0,1));}
  for(const l of lampsDyn)l.pl.visible=true;scene.fog.density=S.fogBase;
  if(b.mid){mid.dead=true;bossEnt=null;U.toast(b.def.fin,2800);if(b.def.drop){const it={r:S.ri,...b.def.drop,i:'mid',drop:1};ITEMS.push(it);placeItem(it);itemObjs.at(-1).g.position.set(b.pos.x,0,b.pos.z);}await maybeScene('midfin');AU.setMode('tension');return;}
  boss.dead=true;bossEnt=null;S.busy=true;await U.wait(1200);
  await scenePause(async()=>{if(CH.boss.memFin)await memory(CH.boss.memFin);});
  await maybeScene('bossfin');AU.setMode('calm');S.busy=false;
  for(const it of ITEMS)if(it.r===S.ri&&!it.taken&&!itemObjs.some(o=>o.it===it))placeItem(it);
  if(!CH.exit)chapterEnd();}
function bossUpdate(b,dt){
  if(b.dead)return;b.cd-=dt;const to=P.pos.clone().sub(b.pos);to.y=0;const dist=to.length();to.normalize();
  if(b.stun>0){b.stun-=dt;animate(b.c,{state:'hit'},S.t);return;}
  const mech=b.mech,ph=b.phase;let sp=b.mid?1.25:1.0+(ph-1)*.35,st='shamble';if(mech==='final'||mech==='charge'&&ph>1)sp*=1.25;
  // strobe: lights flicker, it moves only in the dark
  if(mech==='strobe'&&ph>1){const on=Math.sin(S.t*5)>0;for(const l of lampsDyn)l.pl.visible=on;flash.visible=on||Math.sin(S.t*23)>.6;if(on)sp=0;}
  if(mech==='secret'&&ph>=2){b.hidden=Math.sin(S.t*1.3)>.4;b.c.visible=!b.hidden||Math.random()<.1;}
  // charge
  if(b.state==='wind'){b.at+=dt;st='scream';sp=0;if(b.at>.8){b.state='dash';b.dir=to.clone();b.at=0;AU.sfx('roar',b.pos,.7);}}
  else if(b.state==='dash'){st='sprint';b.at+=dt;const v=b.dir.clone().multiplyScalar(9*dt);const before=b.pos.clone();moveCircle(b.pos,v.x,v.z,.55);b.ph+=dt*12;
    if(dist<1.2){hurt(25,b.pos);b.state='chase';}if(b.pos.distanceTo(before)<v.length()*.5||b.at>1.6){b.state='chase';if(b.at<=1.6){b.stun=2.5;AU.sfx('thud',b.pos);camShake=1.2;U.toast('Stunned!',900);}}
    animate(b.c,{state:st,ph:b.ph},S.t);b.c.rotation.y=Math.atan2(b.dir.x,b.dir.z);return;}
  else if(b.cd<=0){
    let atk=mech||'charge';if(b.mid){const L=ph>1?b.def.atk2:b.def.atk;atk=L[b.ai++%L.length];}
    b.cd=b.mid?3.4:4.2-(ph-1)*.8;
    if(atk==='charge'||((mech==='final'||mech==='whiteout'||mech==='strobe')&&Math.random()<.5)){b.state='wind';b.at=0;}
    else if(atk==='grab'){if(dist<2.4){hurt(18,b.pos);P.grab=1.4;U.toast('GRABBED!',900);}else{b.state='wind';b.at=.3;}}
    else if(atk.startsWith('summon')||mech==='summon'||mech==='scream'||mech==='waves'||mech==='tide'){const ty=atk.split(':')[1]||(mech==='summon'?'drowned':mech==='scream'?'runner':CH.mix[0]);
      const n=mech==='waves'?(ph>1?4:2):2;if(mech==='scream'){AU.sfx('scream',b.pos);camShake=.8;}
      for(let i=0;i<n&&live.length<7;i++){const e={room:S.ri,type:ty,role:CH.skins[i%CH.skins.length],seed:1000+(Math.random()*999|0),dead:false};ENEM.push(e);const ds=Object.values(room.doors);const d=ds[i%Math.max(1,ds.length)];const z=spawnZ(e,d?{x:d.x*.85,z:d.z*.85}:{x:b.pos.x+1,z:b.pos.z});z.state='chase';z.awake=0;}}
    else if(atk==='slam'||mech==='whiteout'&&ph>1){st='attack';if(dist<2.8){hurt(20,b.pos);}AU.sfx('thud',b.pos);camShake=1;puff(b.pos.clone().setY(.2),'#aaa');}
    else if(atk==='spread'||mech==='secret'&&ph===1){for(const a of[-.35,0,.35]){const d=to.clone().applyAxisAngle(new V3(0,1,0),a);spit(b.pos.clone().setY(1.4),b.pos.clone().setY(1.2).addScaledVector(d,5),mech==='secret'?'#a080ff':'#a0d0ff',12,.35,atk==='spread');}}
    else if(atk==='ring'||mech==='secret'&&ph===3){for(let i=0;i<10;i++){const a=i/10*Math.PI*2;spit(b.pos.clone().setY(1.2),b.pos.clone().setY(1.2).add(new V3(Math.sin(a),0,Math.cos(a))),'#c0a0ff',10,.3);}}
    else if(atk==='blink'||mech==='secret'&&ph===2){const a=Math.random()*6.28;b.pos.set(THREE.MathUtils.clamp(P.pos.x+Math.sin(a)*2.5,-4,4),0,THREE.MathUtils.clamp(P.pos.z+Math.cos(a)*2.5,-3,3));AU.sting('static');R.post.uniforms.noise.value=.8;}
    else if(mech==='final'||mech==='noise'){b.state='wind';b.at=.2;}
  }
  if(mech==='tide'||(S.ch===1&&!b.mid)){} // tide is chapter-level
  if(dist<1.3){sp=0;st='attack';b.at+=dt*1.6;if(b.at>1){b.at=0;hurt(b.mid?14:18,b.pos);}}
  b.ph+=dt*4*sp;const nr=Math.atan2(to.x,to.z);b.c.rotation.y=lerpAng(b.c.rotation.y,nr,Math.min(1,dt*3));
  if(sp>0){const v=new V3(Math.sin(b.c.rotation.y),0,Math.cos(b.c.rotation.y)).multiplyScalar(sp*dt);moveCircle(b.pos,v.x,v.z,.5);}
  animate(b.c,{state:st,ph:b.ph,at:b.at,hunch:.3},S.t);
  R.post.uniforms.noise.value=Math.max(0,R.post.uniforms.noise.value-dt);
}
// ---------- cutscenes ----------
const portCache=new Map();
function getPortrait(c){const k=c.userData.def.name+'|'+c.userData.def.seed;if(!portCache.has(k))portCache.set(k,portrait(R.r,c,96));return portCache.get(k);}
let iscene=null,minhC=null,linhC=null;
function interview(){if(!iscene){iscene=new THREE.Scene();iscene.background=new THREE.Color('#0a0806');iscene.fog=new THREE.Fog('#0a0806',3,9);iscene.add(interviewSet());iscene.add(new THREE.AmbientLight('#604838',1));
  minhC=buildChar(HEROES[6]);minhC.position.set(0,0,-.75);iscene.add(minhC);}return iscene;}
async function scenePause(fn){const prev=S.cine;S.cine=true;U.controls(false);U.prompt(null);IN.x=IN.y=IN.mag=0;try{return await fn();}finally{S.cine=prev;if(!prev)U.controls(true);}}
async function maybeScene(on){if(scenePlayed.has(on))return;const sc=CH.scenes.find(s=>s.on===on);if(!sc)return;scenePlayed.add(on);S.busy=true;await playScene(sc);S.busy=false;}
function shotFor(who){
  const sub=who==='hero'||who==='radio'?hero:who==='boss'||who==='mid'?bossEnt?.c:who&&who.startsWith('npc')?npcObjs.find(o=>o.n.i===+who.slice(3))?.c:null;return sub;}
async function playScene(sc,nested){if(!sc)return;U.cine(true);U.controls(false);U.prompt(null);S.cine=true;IN.x=IN.y=IN.mag=0;
  for(const [who,line,camK,fx] of sc.s){
    // camera cut
    S.iview=camK==='minh';let subj=null;
    if(S.iview){interview();cineCam=null;}
    else if(camK==='wide'||!shotFor(camK)){const c=CAMS[(hash(line)%4)];cineCam={p:new V3(c[0]*.9,2.9,c[2]*.9),l:new V3(0,.9,0),snap:1};}
    else{subj=shotFor(camK);const hp=new V3();subj.userData.bones.head.getWorldPosition(hp);const f=new V3(Math.sin(subj.rotation.y),0,Math.cos(subj.rotation.y));
      const side=new V3(f.z,0,-f.x).multiplyScalar(hash(line)%2?.5:-.5);const p=hp.clone().addScaledVector(f,camK==='boss'||camK==='mid'?2.6:1.25).add(side);p.y=hp.y+(camK==='boss'?-.6:.02);
      p.x=THREE.MathUtils.clamp(p.x,-RW/2+.3,RW/2-.3);p.z=THREE.MathUtils.clamp(p.z,-RD/2+.3,RD/2-.3);cineCam={p,l:hp,snap:1};}
    if(fx==='shake'){camShake=1;U.haptic(40);}if(fx==='flash'){R.post.uniforms.flash.value=.7;}if(fx==='static'){AU.sting('static');R.post.uniforms.noise.value=1;}
    if(fx==='silence')AU.setMode('silence');if(fx==='swell')AU.sting('swell');
    const speaker=who==='hero'?heroDef().name:who==='radio'?'RADIO':who==='boss'?CH.boss.name:who==='mid'?CH.mid?.name:who==='minh'?'MINH':who==='linh'?'LINH (TAPE)':who&&who.startsWith('npc')?CH.npcs[+who.slice(3)]?.name:'';
    let port=null;try{if(who==='minh')port=getPortrait(minhC||interview()&&minhC);else if(who==='linh'){linhC=linhC||buildChar(HEROES[0]);port=getPortrait(linhC);}else{const c=shotFor(who==='radio'?null:who);if(c)port=getPortrait(c);}}catch(e){}
    let talker=who==='minh'?minhC:shotFor(who);
    S.talker=talker;await U.say(speaker,line,port,{onType:()=>AU.sfx('type'),auto:window.__lqAuto?900:0});S.talker=null;
  }
  S.iview=false;cineCam=null;S.cine=!!nested&&false;U.cine(false);if(!nested)U.controls(true);S.camIdx=-1;
  if(AU.A.mode==='silence')AU.setMode(CH.rooms[S.ri].safe?'safe':'calm');}
async function memory(lines){AU.setMode('memory');AU.sting('mem');R.post.uniforms.sepia.value=1;U.haptic([10,60,10]);
  await U.typeCard(lines,{cls:'mem',onType:()=>{},auto:window.__lqAuto?800:0});R.post.uniforms.sepia.value=0;AU.setMode(S.inBoss?'boss':'calm');}
// ---------- chapter flow ----------
function saveProgress(){save.ch=S.ch;persist();}
function chapterKeys(ci){const c=STORY.CH[ci],k=new Set();for(const t of c.mix||[])for(const r of c.skins||[])for(let s=0;s<12;s++)k.add(geoKey(zombieDef(t,r,s)));
  for(const n of c.npcs||[])k.add(geoKey(npcDef(n)));if(MIDS[ci])k.add(geoKey(MIDS[ci]));if(BOSSES[ci])k.add(geoKey(BOSSES[ci]));k.add(geoKey(LINH_TURNED));return k;}
async function startChapter(ci){try{const c=STORY.CH[ci],ak=new Set();for(const t of c.mix||[])ak.add(artKey(zombieDef(t,'civ',1)));for(const n of c.npcs||[])ak.add(artKey(npcDef(n)));if(BOSSES[ci])ak.add(artKey(BOSSES[ci]));await loadArt(ak);}catch(e){console.warn(e);}
  U.controls(false);newChapter(ci);hero=null;AU.setChapter(ci);
  const h=`<h2>CHAPTER ${ci===7?'?':ci+1} · ${CH.place.toUpperCase()}</h2><h1>${CH.title}</h1><h2>${CH.who}</h2>`;
  const c=U.card(h+'<div class="tap">TAP</div>');AU.sting('swell');await U.tapWait(window.__lqAuto?1500:0);c.remove();
  if(CH.memOpen)await memory(CH.memOpen);
  await U.typeCard(CH.intro,{auto:window.__lqAuto?800:0});
  loadRoom(0);S.visited.add(0);S.state='play';U.controls(true);updHUD();
  if(CH.rooms[0].safe){AU.setMode('safe');saveProgress();}else AU.setMode('calm');
  await maybeScene('start');await onEnter2();}
async function onEnter2(){await maybeScene('room:0');if(!boss.started&&CH.boss.r===0)startBoss();}
async function chapterEnd(){S.state='end';S.busy=true;U.controls(false);U.prompt(null);AU.sting('win');await U.fade(1,800);
  await U.typeCard(S.spared&&S.ch===6?['"Linh sat down in the road.','She held the tape player','like a parcel to deliver.','I sat with her until dawn."']:CH.outro,{auto:window.__lqAuto?800:0});
  if(CH.camp.bye&&CH.camp.bye.length)await U.typeCard(CH.camp.bye,{auto:window.__lqAuto?800:0,head:'<h2>CAMP</h2>'});
  const end=CH.scenes.find(s=>s.on==='end');if(end){scenePlayed.add('end');await U.fade(0,300);S.state='play';await playScene(end,true);S.state='end';}
  save.unlocked=Math.max(save.unlocked,S.ch+2);save.best[S.ch]=Math.max(save.best[S.ch]||0,P.kills);persist();await U.fade(0,10);S.busy=false;
  const next=S.ch<6?S.ch+1:S.ch===6&&save.unlocked>=8?7:-1;
  if(next>=0)startChapter(next);else credits();}
async function die(){if(S.state!=='play')return;if(TEST){testFill();return;}S.state='dead';U.controls(false);U.prompt(null);animate(hero,{state:'dead'},S.t);AU.setMode('silence');AU.sfx('thud');
  R.post.uniforms.red.value=.8;await U.wait(1400);const k=await U.menu('YOU DIED','THE QUIET TAKES ANOTHER',[['retry','RETRY CHAPTER'],['title','TITLE']]);R.post.uniforms.red.value=0;
  if(k==='retry')startChapter(S.ch);else title();}
async function credits(){await U.typeCard(['THE LONG QUIET','Seven accounts. One road.','Thank you for listening.'],{head:'<h2>END</h2>'});title();}
function updHUD(){U.setInv(P);}
// ---------- title / menu ----------
async function title(){S.state='title';U.controls(false);newChapter(save.ch&&save.ch<7?save.ch:0);hero=null;
  // title backdrop: a live room
  {const vi=CH.rooms.findIndex(r=>vistaFor(S.ch,r.n));loadRoom(vi<0?0:vi);}S.titleCam=true;AU.setMode('calm');
  const items=[['new','NEW GAME']];if(save.ch)items.push(['cont','CONTINUE · CH '+(save.ch+1)]);items.push(['chap','CHAPTERS'],['opt','OPTIONS']);
  const k=await U.menu('THE LONG QUIET','A SURVIVAL HORROR IN SEVEN ACCOUNTS',items);AU.initAudio();S.titleCam=false;
  if(k==='new')startChapter(0);else if(k==='cont')startChapter(save.ch);else if(k==='chap'){const L=STORY.CH.map((c,i)=>[i,(i===7?'? ':(i+1)+' · ')+c.title]).filter(([i])=>i<save.unlocked||new URLSearchParams(location.search).has('all'));L.push(['back','BACK']);const c=await U.menu('CHAPTERS','',L);if(c==='back')title();else startChapter(+c);}
  else options(title);}
async function options(back){const k=await U.menu('OPTIONS','',[['tier','QUALITY · '+G.tier.toUpperCase()],['snap','RETRO WOBBLE · '+(G.snapOn?'ON':'OFF')],['cam','CAMERA · '+(S.camMode==='fixed'?'CINEMATIC':'FOLLOW')],['snd','SOUND · '+(AU.A.on?'ON':'OFF')],['test','TEST MODE · '+(TEST?'ON':'OFF')],['back','BACK']]);
  if(k==='tier'){const o=['low','med','high'];R.setTier(o[(o.indexOf(G.tier)+1)%3]);clearTex();if(S.state==='play'){loadRoom(S.ri);}return options(back);}
  if(k==='snap'){G.snapOn=!G.snapOn;return options(back);}if(k==='cam'){S.camMode=S.camMode==='fixed'?'follow':'fixed';return options(back);}
  if(k==='test'){TEST=!TEST;testBadge();testFill();return options(back);}
  if(k==='snd'){AU.A.on=!AU.A.on;AU.setVol(AU.A.on?.8:0);return options(back);}back();}
document.getElementById('bcam').onclick=()=>{S.camMode=S.camMode==='fixed'?'follow':'fixed';S.camIdx=-1;U.toast(S.camMode==='fixed'?'CINEMATIC CAMERA':'FOLLOW CAMERA',900);};
document.getElementById('bmenu').onclick=async()=>{if(S.state!=='play'||S.busy)return;S.paused=true;U.controls(false);const k=await U.menu('PAUSED','',[['resume','RESUME'],['opt','OPTIONS'],['title','QUIT TO TITLE']]);
  if(k==='opt')await new Promise(r=>options(r));S.paused=false;if(k==='title')return title();U.controls(true);};
// ---------- main loop ----------
let last=performance.now(),hudT=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;S.t+=dt;
  if(!scene)return;
  if(S.state==='play'&&!S.paused){
    if(!S.cine&&!S.busy)playerUpdate(dt);else{animate(hero,{state:S.talker===hero?'talk':'idle'},S.t);hero.position.copy(P.pos);hero.rotation.y=P.rot;}
    if(!S.cine){for(const z of live.slice())zUpdate(z,dt);if(bossEnt)bossUpdate(bossEnt,dt);projUpdate(dt);}
    else{for(const z of live)animate(z.c,{state:z.type==='crawler'?'crawl':'idle',ph:z.ph},S.t);if(bossEnt)animate(bossEnt.c,{state:S.talker===bossEnt.c?'scream':'idle',hunch:.3},S.t);}
    for(const o of npcObjs){const to=P.pos.clone().sub(o.c.position);o.c.rotation.y=lerpAng(o.c.rotation.y,Math.atan2(to.x,to.z),dt*2);animate(o.c,{state:S.talker===o.c?'talk':o.n.age==='kid'?'idle':'sit'},S.t+o.ph);}
    phys.step(dt,P.pos);
    // tide (Ch2)
    if(S.tide>0&&!CH.rooms[S.ri].safe){S.tide-=dt;if(S.tide<=0){U.toast('The tide is in. The water pulls at your legs.',2600);P.slow=999;}else if((S.tide|0)%30===0&&(S.tide%1)<dt)U.toast(`Tide: ${S.tide|0}s`,1400);}
    hudT-=dt;if(hudT<0){hudT=.2;updHUD();}U.drawECG(P.hp,dt);
  }else if(S.state==='title'||S.state==='end'){hero&&animate(hero,{state:'idle'},S.t);}
  if(S.scenic)S.scenic.update(dt,S.t);
  // ambient: lamp flicker, fire, items glint, weather
  for(const l of lampsDyn){l.ph+=dt;l.pl.intensity=l.base*(l.fire?.8+Math.sin(l.ph*9)*.1+Math.random()*.15:Math.random()<.004?.15:1);}
  if(S.fireMesh&&S.fireMesh.parent){S.fireMesh.scale.set(1+Math.sin(S.t*11)*.1,1+Math.sin(S.t*7)*.2,1);}
  for(const o of itemObjs){o.glint.material.opacity=.4+Math.sin(S.t*4+o.g.position.x)*.4;o.g.children[0].rotation.y+=dt;}
  if(weather){const a=weather.geometry.attributes.position.array;const k=weather.userData.kind;const vy=k==='snow'?.8:k==='ash'?.25:9;
    for(let i=0;i<a.length;i+=3){a[i+1]-=vy*dt;if(k!=='rain')a[i]+=Math.sin(S.t+i)*dt*.3;if(a[i+1]<0)a[i+1]=k==='ash'?3:8;}weather.geometry.attributes.position.needsUpdate=true;}
  muzzle.intensity=Math.max(0,muzzle.intensity-dt*90);R.post.uniforms.flash.value=Math.max(0,R.post.uniforms.flash.value-dt*1.5);
  if(S.titleCam){const a=S.t*.12;cam.position.set(Math.sin(a)*3.2,2.4,Math.cos(a)*2.6);cam.lookAt(0,1,0);R.render(scene,cam,S.t);return;}
  if(S.iview){const sc=interview();animate(minhC,{state:'sit'},S.t);minhC.position.y=0;cam.position.set(.9,1.25,1.6);cam.lookAt(0,1.1,-.5);R.render(sc,cam,S.t);return;}
  updateCam(dt);R.render(scene,cam,S.t);
}
requestAnimationFrame(frame);
// ---------- test hook ----------
window.__lq={S,get P(){return P},get CH(){return CH},get live(){return live},get boss(){return bossEnt},get room(){return room},ERR,IN,
  start:(c)=>{AU.initAudio();document.querySelectorAll('.card').forEach(e=>e.remove());S.titleCam=false;return startChapter(c||0);},goto:(ri)=>{S.prevRoom=S.ri;loadRoom(ri);onEnter();},give:(k)=>P.keys.add(k),
  tp:(x,z)=>P.pos.set(x,0,z),killAll:()=>{for(const z of live.slice())kill(z,new V3(0,0,1));},hurtBoss:(n)=>bossEnt&&bossDamage(bossEnt,n,new V3(0,0,-1)),
  items:()=>itemObjs.map(o=>({k:o.it.k,x:o.g.position.x,z:o.g.position.z})),npcs:()=>npcObjs.map(o=>({n:o.n.name,x:o.c.position.x,z:o.c.position.z})),
  door:(s)=>useDoor(s,room.doors[s]),vistaRoom:()=>CH.rooms.findIndex(r=>vistaFor(S.ch,r.n)),act:()=>act(),exit:()=>tryExit(),save:()=>save,setAuto:(v)=>window.__lqAuto=v};
(async()=>{try{await Promise.all([loadArt(new Set(['linh','minh'])),loadProps()]);}catch(e){console.warn(e);}title();})();
