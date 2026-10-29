// THE LONG QUIET — original 8-bit survival horror. (c) Phantastic.Vanguard LLC
// Engine: gameplay logic + HUD (+2D fallback). Content lives in chapters/*.js. render3d.js only READS state.
'use strict';
const W=160,H=144,T=16,cv=document.getElementById('c'),g=cv.getContext('2d');
const P=['#0f0f1b','#3a2e3f','#7a2030','#c24040','#e8d9b0','#6b7a3a','#a8b860','#8a6a40','#5a4a6a','#d8a040'];
const CHS=window.CHAPTERS;
const HW=160,HH=284; // HUD logical space (canvas is 320x568, drawn at 2x) — portrait 32-bit era layout
function fit(){const land=innerWidth>innerHeight&&innerHeight<600;
 const mw=land?innerWidth-400:innerWidth-8, mh=land?innerHeight-8:innerHeight-214;
 let s=Math.max(.5,Math.min(mw/HW,mh/HH));
 const v=document.getElementById('view');v.style.width=HW*s+'px';v.style.height=HH*s+'px';
 for(const c of v.querySelectorAll('canvas,#vig')){c.style.width=HW*s+'px';c.style.height=HH*s+'px';}}
addEventListener('resize',fit);fit();
// ---------- settings / progress ----------
const CFG=Object.assign({scare:1,hd:1,unlocked:1,ps1:1},JSON.parse(localStorage.getItem('lq_cfg')||'{}'));
const saveCfg=()=>localStorage.setItem('lq_cfg',JSON.stringify(CFG));
const SC=()=>[.4,1,1.5][CFG.scare];
// ---------- input ----------
const K={u:0,d:0,l:0,r:0,A:0,B:0,M:0,I:0,Q:0},pr={},rel={};
const km={ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d',ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',KeyJ:'A',Space:'A',KeyK:'B',Enter:'M',KeyI:'I',Tab:'I',KeyQ:'Q'};
const press=k=>{if(!K[k])pr[k]=1;K[k]=1;audio();},release=k=>{if(K[k])rel[k]=1;K[k]=0;};
addEventListener('keydown',e=>{const k=km[e.code];if(k){e.preventDefault();press(k);}});
addEventListener('keyup',e=>{const k=km[e.code];if(k)release(k);});
function haptic(ms){if(CFG.scare==0&&ms>30)ms=30;try{const Hp=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Haptics;if(Hp)Hp.impact({style:ms>60?'HEAVY':ms>25?'MEDIUM':'LIGHT'});else if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
for(const id of Object.keys(K)){const el=document.getElementById(id);if(!el)continue;
 el.addEventListener('pointerdown',e=>{e.preventDefault();press(id);el.classList.add('on');haptic(8);});
 for(const ev of ['pointerup','pointerleave','pointercancel'])el.addEventListener(ev,e=>{e.preventDefault();release(id);el.classList.remove('on');});}
// swipe on the game view counts as "mash" during grabs
{let sx=0,sy=0;const v=document.getElementById('view');v.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;});v.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-sx,e.clientY-sy)>30)pr.swipe=1;});}
const hit=k=>{const v=pr[k];pr[k]=0;return v;},up=k=>{const v=rel[k];rel[k]=0;return v;};
// ---------- audio (original, synthesized) ----------
let ac=null,mg,musT=0,step=0,beatT=0,breathT=0;
function audio(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();mg.gain.value=.18;mg.connect(ac.destination);}catch(e){}}
function tone(f,d,type='square',v=.3,sl=0,pan=0){if(!ac)return;const o=ac.createOscillator(),q=ac.createGain(),t=ac.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);q.gain.setValueAtTime(v,t);q.gain.exponentialRampToValueAtTime(.001,t+d);let n=o.connect(q);if(pan&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));n=n.connect(p);}n.connect(mg);o.start(t);o.stop(t+d);}
function noise(d,v=.4,hp=0){if(!ac)return;const b=ac.createBuffer(1,ac.sampleRate*d|0,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=ac.createBufferSource(),q=ac.createGain();q.gain.value=v;s.buffer=b;let n=s.connect(q);if(hp){const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=hp;n=n.connect(f);}n.connect(mg);s.start();}
const SFX={shot:()=>{noise(.18,.6);tone(220,.1,'square',.3,60)},crit:()=>{noise(.3,.8);tone(90,.4,'sawtooth',.4,30)},slash:()=>tone(900,.08,'sawtooth',.2,200),hurt:()=>tone(160,.25,'square',.4,50),
 groan:(pan=0,v=.25)=>tone(70+Math.random()*20,.7,'triangle',v,45,pan),pick:()=>{tone(660,.08);setTimeout(()=>tone(990,.12),80)},door:()=>{tone(110,.3,'triangle',.4,70);noise(.2,.2)},
 type:()=>tone(1800,.03,'square',.15),click:()=>tone(80,.1,'square',.3),heal:()=>{[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.15,'triangle'),i*90))},
 beat:v=>{tone(55,.12,'sine',.7*v);setTimeout(()=>tone(48,.1,'sine',.5*v),130)},breath:()=>noise(.6,.12,700),dodge:()=>noise(.15,.25,1500),
 sting:()=>{const v=.5*SC();[0,1,2].forEach(i=>tone(440*Math.pow(1.06,i),.9,'sawtooth',v*.4,220));noise(.5,v)},glass:()=>{for(let i=0;i<6;i++)setTimeout(()=>tone(2000+Math.random()*3000,.08,'square',.12),i*25);noise(.3,.5,3000)},
 roar:()=>{tone(90,1.2,'sawtooth',.5*SC(),40);noise(1,.4,300)},memory:()=>{[392,494,587,740].forEach((f,i)=>setTimeout(()=>tone(f,.9,'triangle',.18),i*180))},
 tape:()=>{[523,494,440,392,440].forEach((f,i)=>setTimeout(()=>tone(f,.5,'sine',.25),i*300))}};
const SONG={title:[[110,0],[0,0],[131,0],[123,0],[110,0],[0,0],[98,0],[104,0]],house:[[55,220],[0,0],[0,262],[58,0],[55,247],[0,0],[0,233],[52,0]],safe:[[131,330],[0,392],[0,330],[0,0],[98,294],[0,349],[0,294],[0,0]],boss:[[55,110],[55,0],[58,117],[55,0],[52,104],[55,0],[62,124],[58,0]],
 memory:[[131,523],[0,659],[0,784],[0,659],[110,440],[0,523],[0,659],[0,523]],final:[[65,262],[0,0],[73,294],[0,330],[65,262],[0,0],[58,247],[0,0]]};
let song='title',intensity=0,calm=0;
function music(dt){if(window.AUD&&AUD.on&&mode=='play')return;if(!ac||!SONG[song]||calm>0)return;musT-=dt;if(musT>0)return;
 const fast=song=='boss'?.14:song=='memory'||song=='final'?.4:.32-.14*intensity;musT=fast;const s=SONG[song],[b,m]=s[step%s.length];step++;
 if(b)tone(b,.3,'triangle',.5);if(m)tone(m*(intensity>.6&&step%2&&song=='house'?1.06:1),.25,song=='memory'?'triangle':'square',.12);if(song=='house'&&intensity>.35&&step%2)noise(.04,.15*intensity,6000);}
// ---------- world ----------
let S,CH=CHS[0],mode='title',menuI=0,dialog=null,introT=0;
const RM=()=>CH.rooms;
function solid(ri,tx,ty){if(tx<0||ty<0||tx>9||ty>8)return 1;const r=CH.rooms[ri];
 if(r.blk&&r.blk.some(b=>b[0]==tx&&b[1]==ty))return 1;
 if(tx>0&&tx<9&&ty>0&&ty<8)return 0;
 if(ty==0&&(tx==4||tx==5)&&r.d.N!=null)return 0;if(ty==8&&(tx==4||tx==5)&&r.d.S!=null)return 0;
 if(tx==0&&ty==4&&r.d.W!=null)return 0;if(tx==9&&ty==4&&r.d.E!=null)return 0;return 1;}
const CI=()=>Math.max(0,CHS.indexOf(CH));
const Z=(r,x,y,o={})=>{const z={r,x,y,hp:3,cd:0,fl:0,...o};if(!z.big&&z.mb==null){const ch=CI(),mx=VAR.MIX[ch]||VAR.MIX[0],i=o.i!=null?o.i:(Math.random()*99|0);
 z.t=z.t||mx[i%mx.length];const T=VAR.ZT[z.t];if(o.hp==null)z.hp=T.hp;z.armor=T.armor||0;z.sk=z.t+':'+(VAR.SKINS[ch]||VAR.SKINS[0])[i%3]+':'+(ch*10+i);}return z;};
function newGame(ch){CH=CHS[ch];const b=CH.boss;
 S={ch,room:0,p:{x:72,y:96,dir:'u',hp:5,inv:{ammo:9+ch*2,herb:1},cool:0,inv0:0,flash:0,aim:-1,dodge:0,lock:-1},
 items:CH.items.map(i=>({...i})),en:[...CH.enemies.map((e,i)=>Z(e[0],e[1],e[2],{i})),Z(b.r,b.x,b.y,{hp:b.hp,max:b.hp,big:1,ph:1}),...(VAR.MID[ch]?[(m=>Z(m.r,m.x,m.y,{hp:m.hp,max:m.hp,mb:ch,ph:1,armor:m.armor||0}))(VAR.MID[ch])]:[])],npcs:(VAR.NPC[ch]||[]).map((n,i)=>({...n,i,li:0})),proj:[],sus:12,kills:0,camp:{on:0,bars:{},siege:null,req:0},chase:null,sq:[],ghost:null,
 shots:[],msg:'',msgT:0,time:0,saves:0,fx:{shake:0,punch:0,stop:0,slow:0,blood:[],sting:0,beat:0,danger:0},cine:null,grab:null,mem:null,
 flags:{},power:CH.mech=='dark'?0:1,heat:1,tide:CH.tide||0,noise:0,wave:0};
 if(CH.mech=='dark')S.p.x=72,S.p.y=72;
 for(const o of [...S.items,...S.en])unstick(o.r,o);unstick(0,S.p);PHYS.room(S,CH);}
function unstick(ri,o){let tx=Math.floor(o.x/T),ty=Math.floor(o.y/T);if(!solid(ri,tx,ty))return;
 for(let d=1;d<6;d++)for(let a=-d;a<=d;a++)for(let b=-d;b<=d;b++){const x=tx+a,y=ty+b;if(x>0&&y>0&&x<9&&y<8&&!solid(ri,x,y)){o.x=x*T+8;o.y=y*T+8;return;}}}
function say(t,s=2.5,who){S.msg=t;S.msgT=s;S.msgP=who||null;}
function portrait(who,x,y,sz=48){if(!window.ART||!who)return;const b=who.boss,c=b!=null?ART.portrait(null,b):ART.portrait(who);g.drawImage(c,x,y,sz,sz);}
const BP=()=>CH.final?'courier':{boss:S.ch};const HERO=()=>ART.heroOf(S.ch);
const box=(a,b,c,d)=>Math.abs(a.x-c.x)<b+d&&Math.abs(a.y-c.y)<b+d;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function save(){localStorage.setItem('lq_save_'+S.ch,JSON.stringify(S));localStorage.setItem('lq_last',S.ch);}
function load(ch){const s=localStorage.getItem('lq_save_'+ch);if(!s)return 0;S=JSON.parse(s);CH=CHS[S.ch];S.camp=S.camp||{on:0,bars:{},siege:null,req:0};S.npcs=S.npcs||[];S.proj=[];S.sq=[];S.kills=S.kills||0;S.chase=null;S.scene=null;PHYS.room(S,CH);return 1;}
const hasSave=ch=>!!localStorage.getItem('lq_save_'+ch);
// ---------- juice ----------
function blood(x,y,n=10,c=3){for(let i=0;i<n;i++)S.fx.blood.push({x,y,z:4,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60,vz:20+Math.random()*30,c:Math.random()<.5?c:2,t:1.2});}
function shake(a){S.fx.shake=Math.max(S.fx.shake,a*SC());}
function cine(type,t,o={}){S.cine={type,t,max:t,...o};}
function memory(key,lines){if(!lines||S.flags['m_'+key])return;S.flags['m_'+key]=1;S.mem={l:lines,t:1.2+lines.length*.7};SFX.memory();}
// ---------- pathfinding (BFS flow field from player tile, recomputed per frame; room is 10x9) ----------
let flow=null;
function buildFlow(){const p=S.p,f=new Int16Array(90).fill(-1),q=[];const sx=Math.floor(p.x/T),sy=Math.floor(p.y/T);if(sx<0||sx>9||sy<0||sy>8)return null;
 f[sy*10+sx]=0;q.push(sx,sy);for(let i=0;i<q.length;i+=2){const x=q[i],y=q[i+1],d=f[y*10+x];for(const[a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(nx<0||ny<0||nx>9||ny>8||f[ny*10+nx]>=0||solid(S.room,nx,ny))continue;f[ny*10+nx]=d+1;q.push(nx,ny);}}return f;}
function steer(e){const tx=Math.floor(e.x/T),ty=Math.floor(e.y/T),p=S.p;if(!flow||flow[ty*10+tx]<=1)return Math.atan2(p.y-e.y,p.x-e.x);
 let best=null,bd=999;for(const[a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=tx+a,ny=ty+b;if(nx<0||ny<0||nx>9||ny>8)continue;const d=flow[ny*10+nx];if(d>=0&&d<bd){bd=d;best=[nx,ny];}}
 return best?Math.atan2(best[1]*T+8-e.y,best[0]*T+8-e.x):Math.atan2(p.y-e.y,p.x-e.x);}
// ---------- update ----------
const TITLE_MENU=()=>['NEW ACCOUNT','CONTINUE','CHAPTERS','SCARE: '+['MILD','NORMAL','INTENSE'][CFG.scare]];
function startChapter(ch,fromSave){if(fromSave&&load(ch)){mode='play';song='house';say('Account resumed.');return;}newGame(ch);mode='intro';introT=0;song='memory';cine('intro',30);}
function update(rdt){music(rdt);
 if(mode=='title'){song='title';const n=TITLE_MENU().length;if(hit('u'))menuI=(menuI+n-1)%n;if(hit('d'))menuI=(menuI+1)%n;
  if(menuI==3&&(hit('l')||hit('r')||hit('A'))){CFG.scare=(CFG.scare+1)%3;saveCfg();SFX.click();return;}
  if(hit('A')||hit('M')){SFX.pick();if(menuI==0)startChapter(0);if(menuI==1){const l=+(localStorage.getItem('lq_last')||0);if(hasSave(l))startChapter(l,1);else startChapter(0);}if(menuI==2){mode='select';menuI=0;}}return;}
 if(mode=='select'){const NC=CHS.length;if(hit('u'))menuI=(menuI+NC-1)%NC;if(hit('d'))menuI=(menuI+1)%NC;if((hit('l')||hit('r'))&&menuI<7){CFG.outfit=CFG.outfit||{};CFG.outfit[menuI]=((CFG.outfit[menuI]||0)+1)%3;ART.of=CFG.outfit;saveCfg();SFX.click();}if(hit('B')||hit('M')){mode='title';menuI=0;return;}
  if(hit('A')){if(menuI<CFG.unlocked||(menuI==7&&CFG.secret)){SFX.pick();startChapter(menuI,hasSave(menuI));}else SFX.click();}return;}
 if(mode=='intro'){introT+=rdt;const md=CH.memOpen.length*.55+1.5;if(introT>md&&!S.flags.cut){S.flags.cut=1;SFX.sting();song='house';haptic(60);}
  if(hit('A')||hit('M')){if(introT<md){introT=md;}else{mode='play';song=CH.final?'final':'house';S.cine=null;cine('enter',1.2);say(CH.rooms[0].n,1.5);queueScene('start');S.npcs.forEach((n,i)=>{if(n.r==0)queueScene('npc'+i);});}}if(S.cine)S.cine.t-=rdt;return;}
 if(mode=='over'){if(S.cine)S.cine.t-=rdt;if(hit('A')||hit('M')){mode='title';menuI=hasSave(S.ch)?1:0;}return;}
 if(mode=='win'){introT+=rdt;if(S.cine)S.cine.t-=rdt;if((hit('A')||hit('M'))&&introT>1.5){mode='title';menuI=2;}return;}
 if(mode=='scene'){sceneUpdate(rdt);return;}
 if(dialog){const nO=dialog.o.length;if(hit('u'))dialog.i=(dialog.i+nO-1)%nO;if(hit('d'))dialog.i=(dialog.i+1)%nO;if(hit('B'))dialog=null;else if(hit('A')){const f=dialog.cb[dialog.i];dialog=null;f&&f();}return;}
 if(mode=='inv'){const ks=invList();if(hit('u'))menuI=(menuI+ks.length-1)%ks.length;if(hit('d'))menuI=(menuI+1)%ks.length;
  if(hit('A')){const k=ks[menuI],it=S.items.find(i=>i.k==k);if(k=='herb'&&S.p.inv.herb>0){S.p.inv.herb--;S.p.hp=5;SFX.heal();say('You chew the bitter herb. Healed.');mode='play';}
   else if(it&&it.read){say(it.read,5);mode='play';}}
  if(hit('I')||hit('B')||hit('M'))mode='play';return;}
 const fx=S.fx;
 if(S.mem){S.mem.t-=rdt;if(S.mem.t<=0||(S.mem.t<S.mem.l.length*.7&&hit('A'))){S.mem=null;shake(.4);SFX.sting();haptic(50);}return;}
 if(fx.stop>0){fx.stop-=rdt;return;}
 let dt=rdt;if(fx.slow>0){fx.slow-=rdt;dt*=.3;}
 fx.shake=Math.max(0,fx.shake-rdt*2);fx.punch=Math.max(0,fx.punch-rdt*1.5);fx.sting=Math.max(0,fx.sting-rdt);
 for(const b of fx.blood){b.t-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z=Math.max(0,b.z+b.vz*dt);b.vz-=120*dt;if(b.z==0){b.vx*=.8;b.vy*=.8;}}fx.blood=fx.blood.filter(b=>b.t>0).slice(-120);
 if(S.cine){S.cine.t-=rdt;if(S.cine.t<=0){const c=S.cine;S.cine=null;if(c.type=='finisher'&&c.mid){queueScene('midfin');}else if(c.type=='finisher'){memory('fin',CH.boss.memFin);S.flags.bossDown=1;queueScene('bossfin',(CH.final||CH.boss.secretEnd)?finish:null);}}}
 if(!S.mem&&!S.cine&&!S.grab&&S.sq.length&&mode=='play'){const q=S.sq.shift();S.scene={s:q.s,i:0,t:0,then:q.then,last:-1};mode='scene';return;}
 if(calm>0)calm-=dt;
 if(S.grab){grabUpdate(dt);return;}
 if(hit('I')||hit('M')){mode='inv';menuI=0;SFX.click();return;}
 const p=S.p,r=RM()[S.room],boss=S.en.find(e=>e.big&&e.r==S.room&&e.hp>0);
 song=r&&r.safe?'safe':(boss?(CH.final?'final':'boss'):'house');
 S.time+=dt;if(S.msgT>0)S.msgT-=dt;p.cool-=dt;p.inv0-=dt;p.flash-=dt;p.dodge-=dt;
 mechanics(dt,boss);if(mode!='play')return;
 ART.wear=Math.min(3,Math.floor(S.ch/2)+(p.hp<=2?1:0));suspense(dt,boss);chaseUpdate(dt);siegeUpdate(dt);campTick(dt);projUpdate(dt);if(mode!='play')return;if(p.slow>0)p.slow-=dt;
 PHYS.tier=window.R3D?R3D.q:1;PHYS.step(dt,S,solid);physEvents();
 flow=buildFlow();
 const live=S.en.filter(e=>e.r==S.room&&e.hp>0);let nd=999;for(const e of live)nd=Math.min(nd,dist(p,e));
 fx.danger=Math.max(0,Math.min(1,1-(nd-16)/80));intensity+=((boss?1:fx.danger)-intensity)*dt*1.5;
 const bpm=60+fx.danger*90+(p.hp<=2?30:0);beatT-=dt;
 if((fx.danger>.15||p.hp<=2)&&beatT<=0){beatT=60/bpm;SFX.beat(.4+fx.danger*.6*SC());haptic(Math.round(10+fx.danger*30));fx.beat=1;}fx.beat=Math.max(0,fx.beat-dt*4);
 breathT-=dt;if((p.hp<=2||p.dodge>-.6&&p.dodge<0)&&breathT<=0){breathT=p.hp<=2?1.6:3;SFX.breath();}
 if(Math.random()<dt*.12*SC()){const nb=Object.entries(r.d).find(([s,ri])=>ri!=='exit'&&S.en.some(e=>e.r==ri&&e.hp>0));if(nb)SFX.groan({W:-.9,E:.9,N:0,S:0}[nb[0]],.12);}
 let dx=K.r-K.l,dy=K.d-K.u,aiming=p.aim>=0;
 if((dx||dy)&&!aiming)p.dir=dx?(dx>0?'r':'l'):(dy>0?'d':'u');
 S.noise=Math.max(0,S.noise-dt*2);
 if(p.dodge>0){const v={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}[p.dir];move(p,v[0]*130*dt,v[1]*130*dt,5);S.noise=1;}
 else{const sl=p.slow>0?.5:1;move(p,dx*(aiming?14:40)*sl*dt,dy*(aiming?14:40)*sl*dt,5);if((dx||dy)&&!aiming)S.noise=Math.max(S.noise,.6);}
 if(p.y<6&&r.d.N!=null)go(r.d.N,'N');else if(p.y>H-6&&r.d.S!=null)go(r.d.S,'S');else if(p.x<6&&r.d.W!=null)go(r.d.W,'W');else if(p.x>W-6&&r.d.E!=null)go(r.d.E,'E');
 if(hit('A')){const tw=CH.tw,ex=CH.exit,gen=CH.gen;
  if(campNear()&&!S.camp.siege){if(S.camp.on)campMenu();else dialog={q:CP().kind=='campfire'?'Build a campfire here?':'Hang a lantern and make camp?',o:['YES','NO'],i:0,cb:[campSetup,null]};}
  else if(S.room==tw.r&&box(p,6,tw,10))dialog={q:'Use the typewriter to save?',o:['YES','NO'],i:0,cb:[()=>{S.saves++;save();SFX.type();say('Your account was recorded.')},null]};
  else if(gen&&S.room==gen.r&&box(p,6,gen,14))genTry();
  else if(ex&&S.room==ex.r&&box(p,6,ex,16))gateTry();
  else if(boss&&boss.spared!=null&&dist(p,boss)<60)playTape(boss);
  else if(S.npcs.some(n=>n.r==S.room&&dist(n,p)<18))npcTalk(S.npcs.find(n=>n.r==S.room&&dist(n,p)<18));
  else{p.aim=0;S.noise=1;}}
 if(p.aim>=0){p.aim+=dt;const t=lockTarget();p.lock=t?S.en.indexOf(t):-1;if(t){const ddx=t.x-p.x,ddy=t.y-p.y;p.dir=Math.abs(ddx)>Math.abs(ddy)?(ddx>0?'r':'l'):(ddy>0?'d':'u');}
  if(up('A')||!K.A){const crit=p.aim>.45&&p.aim<.75;p.aim=-1;fire(crit);}}else{up('A');p.lock=-1;}
 if(hit('B')&&p.cool<=0){if(dx||dy){p.dodge=.18;p.inv0=Math.max(p.inv0,.3);p.cool=.4;SFX.dodge();haptic(15);}else knife();}
 for(const it of S.items)if(it.r==S.room&&!it.got&&box(p,5,it,5))pickup(it);
 scares();
 for(const e of live){e.fl-=dt;e.cd-=dt;
  if(e.spared!=null){e.sway=(e.sway||0)+dt;continue;}
  if(e.mb!=null){midUpdate(e,dt);if(mode!='play'||S.grab)return;continue;}
  if(e.sd&&S.camp.bars[e.sd]>0){e.bt=(e.bt||0)+dt;e.charge=.1;if(e.bt>1.4){e.bt=0;S.camp.bars[e.sd]--;shake(.15);window.AUD&&AUD.fx('wood',e.x,e.y);if(!S.camp.bars[e.sd])say('A BARRICADE BROKE!',1.2);}continue;}
  let sp=(e.big?(e.ph==2?30:20):12+S.ch*.8)*dt;const TT=!e.big&&VAR.ZT[e.t];if(TT)sp*=TT.sp;if(e.big&&e.ph==3)sp*=1.3;
  if(TT&&e.charge<=0&&zSpecial(e,dt,sp))continue;
  if(CH.mech=='dark'&&!S.power)sp*=1.4;
  if(e.big&&(e.ph>=2||CH.boss.mech=='secret')&&e.cd<=0&&dist(e,p)<90){bossSpecial(e);}
  if(e.charge>0){e.charge-=dt;sp*=4;}
  if(e.big&&CH.boss.mech=='strobe'&&e.ph==2&&S.flags.strobeOn)sp=0;
  // sound mechanic: blind enemies only track noise
  if(CH.mech=='sound'&&!e.big&&!(S.noise>.3&&dist(e,p)<70+S.noise*40)){e.wa=(e.wa||Math.random()*6)+dt*(Math.random()-.5)*4;move(e,Math.cos(e.wa)*sp*.4,Math.sin(e.wa)*sp*.4,5);continue;}
  const a=steer(e);move(e,Math.cos(a)*sp,Math.sin(a)*sp,e.big?7:5);
  if(Math.random()<dt*.15)SFX.groan((e.x-p.x)/80);
  if(box(p,5,e,e.big?7:5)&&p.inv0<=0&&p.dodge<=0){
   const ang=Math.atan2(p.y-e.y,p.x-e.x);
   if(!e.big&&Math.random()<(TT?TT.grab:.6)){S.grab={e,m:0,t:0};SFX.sting();shake(.4);haptic(120);fx.punch=1;return;}
   hurt(e.big?2:1);p.x+=Math.cos(ang)*10;p.y+=Math.sin(ang)*10;move(p,0,0,5);if(mode!='play')return;}}
}
function physEvents(){for(const ev of PHYS.events.splice(0)){window.AUD&&AUD.fx(ev.t,ev.x,ev.y);
 if(ev.t=='explode'){shake(.9);haptic(120);S.fx.punch=1;for(const e of S.en)if(e.r==S.room&&e.hp>0&&Math.hypot(e.x-ev.x,e.y-ev.y)<ev.r)damage(e,e.big?3:4,0,Math.atan2(e.y-ev.y,e.x-ev.x));if(Math.hypot(S.p.x-ev.x,S.p.y-ev.y)<ev.r*.6&&S.p.inv0<=0)hurt(1);}
 if(ev.t=='rock'&&Math.hypot(S.p.x-ev.x,S.p.y-ev.y)<8&&S.p.inv0<=0){hurt(1);}}}
function hurt(n){const p=S.p;p.hp-=n;p.inv0=1.2;SFX.hurt();haptic(90);shake(.6);blood(p.x,p.y,8,2);if(p.hp<=0){mode='over';song='';cine('death',3);}}
function mechanics(dt,boss){const p=S.p,r=RM()[S.room];
 if(CH.mech=='tide'){S.tide-=dt;if(S.tide<=0){say('The tide took the pier.');mode='over';song='';cine('death',3);}}
 if(CH.mech=='cold'){const nearFire=(r.lamps||[]).some(([x,y])=>Math.hypot(x*T+8-p.x,y*T+8-p.y)<34)||r.safe;
  S.heat=Math.max(0,Math.min(1,S.heat+(nearFire?.25:-.022)*dt*(S.flags.whiteout?2:1)));if(S.heat<=0){S.heatT=(S.heatT||0)+dt;if(S.heatT>2.5){S.heatT=0;hurt(1);say('The cold bites. Find a fire!',1.5);}}}
 if(CH.mech=='siege'&&boss&&!S.flags.bossDown){S.wave-=dt;if(S.wave<=0){S.wave=boss.ph==2?4:7;const s=[[16,72],[144,72],[80,128]][Math.random()*3|0];S.en.push(Z(S.room,s[0],s[1],{burst:1}));SFX.groan(0,.3);}}
 if(CH.boss.mech=='strobe'&&boss&&boss.ph==2){S.strobeT=(S.strobeT||0)+dt;S.flags.strobeOn=S.strobeT%1.6<.8;}
 if(CH.boss.mech=='final'&&boss){for(const [hp,l] of CH.boss.lines){if(boss.hp<=hp&&!S.flags['l'+hp]){S.flags['l'+hp]=1;say(l,3,'courier');}}}
}
function bossSpecial(e){const m=CH.boss.mech;e.cd=3;
 if(m=='secret'){const p=S.p,ang=Math.atan2(p.y-e.y,p.x-e.x);if(e.ph==2){const aa=Math.random()*6.28;e.x=Math.max(20,Math.min(140,p.x+Math.cos(aa)*40));e.y=Math.max(24,Math.min(120,p.y+Math.sin(aa)*40));unstick(S.room,e);S.flick=1;e.charge=.5;SFX.sting();}
  else if(e.ph==3){spit(e,0,10,Math.PI/5,50,'acid');if(S.en.filter(o=>o.r==S.room&&o.hp>0).length<7)S.en.push(Z(S.room,e.x+20,e.y,{burst:1}));e.cd=2.4;}else spit(e,ang,5,.25,60,'acid');return;}
 if(m=='charge'||m=='whiteout'||m=='final'){e.charge=.6;SFX.roar();shake(.5);}PHYS.rubble(m=='final'?2:4);
 if(m=='summon'||m=='scream'){SFX.roar();shake(.7);for(let i=0;i<2;i++)S.en.push(Z(S.room,e.x+(i?-20:20),e.y,{hp:2,burst:1}));e.cd=m=='scream'?4:5;}
 if(m=='strobe'){e.charge=.4;e.cd=2;}}
const MB=e=>VAR.MID[e.mb];
function spit(e,a,n,spr,sp,kind){for(let i=0;i<n;i++){const aa=a+(i-(n-1)/2)*spr;S.proj.push({x:e.x,y:e.y,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp,t:2.5,k:kind||'acid'});}window.AUD&&AUD.fx('clink',e.x,e.y);}
function zSpecial(e,dt,sp){const p=S.p,d=dist(e,p);
 if(e.t=='spitter'){if(e.cd<=0&&d<95&&clear(e,p)){e.cd=2.6;spit(e,Math.atan2(p.y-e.y,p.x-e.x),1,0,55,'acid');}if(d<42){const a=Math.atan2(e.y-p.y,e.x-p.x);move(e,Math.cos(a)*sp,Math.sin(a)*sp,5);return 1;}}
 if(e.t=='screamer'&&!e.scr&&d<75){e.scr=1;SFX.roar();shake(.5);haptic(80);S.fx.sting=1;say('A SCREAMER! Others are coming.',1.6);
  for(const o of S.en)if(o.r==S.room&&o.hp>0&&!o.big&&o.mb==null)o.charge=.8;const s=[[16,72],[144,72]][Math.random()*2|0];S.en.push(Z(S.room,s[0],s[1],{burst:1,t:'runner'}));}
 if(e.t=='bloater'&&d<13){e.hp=0;pop(e);return 1;}
 return 0;}
function pop(e){PHYS.events.push({t:'explode',x:e.x,y:e.y,r:30});blood(e.x,e.y,40,6);PHYS.debris(e.x,e.y,12,6,'#9a9040',70,'chip');}
function midUpdate(e,dt){const m=MB(e),p=S.p,d=dist(e,p);let sp=(e.ph==2?28:21)*dt;if(e.charge>0){e.charge-=dt;sp*=3.6;}
 if(e.cd<=0&&d<110){const L=e.ph==2?m.atk2:m.atk,a=L[(e.k=(e.k||0)+1)%L.length],ang=Math.atan2(p.y-e.y,p.x-e.x);e.cd=2.6;
  if(a=='charge'){e.charge=.6;SFX.roar();shake(.4);}
  if(a=='grab'&&d<26&&p.inv0<=0){S.grab={e,m:0,t:0};SFX.sting();shake(.5);}
  if(a.startsWith('summon')&&S.en.filter(o=>o.r==S.room&&o.hp>0).length<8){const t=a.split(':')[1];for(let i=0;i<2;i++)S.en.push(Z(S.room,e.x+(i?-22:22),e.y,{t,burst:1}));SFX.roar();e.cd=5;}
  if(a=='spread')spit(e,ang,3,.35,62,m.art==10?'ice':'acid');
  if(a=='ring'){spit(e,0,8,Math.PI/4,48,m.art==10?'ice':'acid');e.cd=3.4;}
  if(a=='slam'){shake(.9);PHYS.rubble(4);if(d<32&&p.inv0<=0)hurt(1);}
  if(a=='blink'){const aa=Math.random()*6.28;e.x=Math.max(20,Math.min(140,p.x+Math.cos(aa)*34));e.y=Math.max(20,Math.min(124,p.y+Math.sin(aa)*34));unstick(S.room,e);S.fx.sting=1;SFX.sting();e.charge=.3;}}
 const a=steer(e);move(e,Math.cos(a)*sp,Math.sin(a)*sp,7);
 if(box(p,5,e,7)&&p.inv0<=0&&p.dodge<=0){const ang=Math.atan2(p.y-e.y,p.x-e.x);hurt(e.ph==2?2:1);p.x+=Math.cos(ang)*10;p.y+=Math.sin(ang)*10;move(p,0,0,5);}}
function projUpdate(dt){const p=S.p;for(const q of S.proj){q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(solid(S.room,Math.floor(q.x/T),Math.floor(q.y/T)))q.t=0;
  if(q.t>0&&Math.hypot(q.x-p.x,q.y-p.y)<6&&p.dodge<=0&&p.inv0<=0){q.t=0;hurt(1);if(q.k=='ice'){p.slow=1.6;say('FROSTBITTEN - slowed',1);}}}S.proj=S.proj.filter(q=>q.t>0);}
function npcTalk(n){const l=n.lines[n.li%n.lines.length];n.li++;say(l,3,npcWho(n));SFX.type();
 if(n.give&&!n.gave&&n.li>=n.lines.length){n.gave=1;const g=n.give;S.p.inv[g.k]=(S.p.inv[g.k]||0)+(g.n||1);setTimeout(()=>say(n.thanks||'"Take this."',3,npcWho(n)),1600);SFX.pick();}}
const npcWho=n=>'npc:'+n.seed+':'+(n.age||'adult');
// ---- cutscenes
function sceneWho(w){if(w=='hero')return HERO();if(w=='minh'||w=='linh')return w;if(w=='boss')return BP();if(w=='mid'){const m=VAR.MID[S.ch];return m?{boss:m.art}:null;}
 if(w&&w.startsWith('npc')){const n=S.npcs[+w.slice(3)];return n?npcWho(n):null;}return null;}
function queueScene(on,then){const L=(window.SCN&&SCN[S.ch])||[];const sc=L.find(x=>x.on==on);if(!sc||S.flags['sc_'+on]){if(then)then();return;}S.flags['sc_'+on]=1;S.sq.push({s:sc.s,then,on});}
function sceneFocus(cam){const p=S.p;if(cam=='boss'){const b=S.en.find(e=>e.big);if(b&&b.r==S.room)return b;}if(cam=='mid'){const b=S.en.find(e=>e.mb!=null);if(b&&b.r==S.room)return b;}
 if(cam&&cam.startsWith('npc')){const n=S.npcs[+cam.slice(3)];if(n&&n.r==S.room)return n;}if(cam=='wide')return{x:80,y:72};return p;}
function sceneShot(){const Q=S.scene,sh=Q.s[Q.i];const f=sceneFocus(sh[2]);S.cine={type:'bossintro',t:99,max:99,x:f.x,y:f.y,scene:1};Q.t=0;
 const fx=sh[3];if(fx=='swell'){SFX.memory();}if(fx=='silence'){calm=2.5;window.AUD&&(AUD.duck=2.5);}if(fx=='static'){window.AUD&&AUD.fx('ric',80,72);S.fx.sting=.4;}if(fx=='shake'){shake(.7);SFX.roar();}if(fx=='flash'){S.fx.sting=1;SFX.sting();}}
function sceneUpdate(dt){const Q=S.scene;Q.t+=dt;
 if(hit('M')||hit('B')){Q.i=Q.s.length;}else if(hit('A')){const sh=Q.s[Q.i];if(Q.t*30<sh[1].length)Q.t=99;else Q.i++;}
 if(Q.i>=Q.s.length){S.scene=null;S.cine=null;mode='play';if(Q.then)Q.then();return;}if(Q.last!==Q.i){Q.last=Q.i;sceneShot();}}
function drawScene(){const Q=S.scene,sh=Q.s[Math.min(Q.i,Q.s.length-1)],who=sceneWho(sh[0]);const W=HW,H=HH;
 rect(0,0,0,W,34);rect(0,0,H-74,W,74);rect(8,0,H-74,W,1);if(sh[3]=='static')for(let i=0;i<60;i++){g.fillStyle='rgba(220,220,220,.25)';g.fillRect(Math.random()*W,34+Math.random()*(H-108),2,1);}
 const n=Math.floor(Q.t*30);const line=sh[1].slice(0,n);
 if(who){portrait(who,4,H-68,40);const nm=sh[0]=='radio'?'RADIO':sh[0]=='hero'?HERO().split('#')[0]:sh[0]=='boss'?CH.boss.name:sh[0]=='mid'?VAR.MID[S.ch].name:sh[0].startsWith('npc')?(S.npcs[+sh[0].slice(3)]||{}).name:sh[0];txt(nm,48,H-68,9);wrap(line,48,H-60,4,27);}
 else if(sh[0]=='radio'){rect(1,6,H-66,34,30);rect(3,10,H-60,6,6);txt('CB',22,H-58,4);txt('RADIO',48,H-68,9);wrap(line,48,H-60,6,27);}
 else wrap(line,6,H-66,8,38);
 txt('A NEXT  B SKIP',W-58,H-8,1);}
// ---- suspense director: quiet stretches, unexplained sounds, glimpsed figures, failing lights, false scares, chases
function suspense(dt,boss){const p=S.p,r=RM()[S.room];if(r.safe||boss||S.scene)return;
 if(S.pre>0){S.pre-=dt;S.fx.danger=Math.max(S.fx.danger,1-S.pre/2);if(S.pre<=0&&S.preDo){const f=S.preDo;S.preDo=null;f();}}
 if(S.ghost){S.ghost.t-=dt;if(S.ghost.t<=0||dist(S.ghost,p)<40)S.ghost=null;}
 if(S.flick>0)S.flick-=dt;
 S.sus-=dt*SC();if(S.sus>0)return;S.sus=9+Math.random()*14;
 const ev=['shadow','creak','lights','steps','false','silence','knock'][Math.random()*7|0],ex=Math.random()<.5?14:146,ey=20+Math.random()*100;
 if(ev=='shadow'){S.ghost={x:ex,y:ey,t:1.4};SFX.breath();}
 if(ev=='creak'){window.AUD&&AUD.fx('wood',ex,ey);tone(90,1.2,'sawtooth',.08,140,ex<80?-.8:.8);S.flags.doorCreak=1.5;}
 if(ev=='lights'){S.flick=2.5;window.AUD&&AUD.fx('glass',80,20);}
 if(ev=='steps'){for(let i=0;i<4;i++)setTimeout(()=>window.AUD&&AUD.fx('knock',ex,ey),i*380);}
 if(ev=='knock'){for(let i=0;i<3;i++)setTimeout(()=>{window.AUD&&AUD.fx('knock',ex,ey);shake(.1);},i*600);}
 if(ev=='false'){S.pre=2.4;S.preDo=()=>{PHYS.events.push({t:'glass',x:ex,y:ey});S.fx.sting=.3;};}
 if(ev=='silence'){calm=4;window.AUD&&(AUD.duck=4);}}
function chaseStart(){if(S.chase||S.flags.chased)return;S.flags.chased=1;S.chase={t:22};calm=0;SFX.roar();shake(.8);S.fx.sting=1;say('They heard you. RUN! Reach a safe room.',2.5);
 for(let i=0;i<2;i++)S.en.push(Z(S.room,i?16:144,i?128:16,{t:'runner',burst:1,chaser:1}));}
function chaseUpdate(dt){const C=S.chase;if(!C)return;C.t-=dt;if(RM()[S.room].safe||C.t<=0){S.chase=null;for(const e of S.en)if(e.chaser)e.hp=0;say(C.t<=0?'The footsteps fade. You lost them.':'Door shut. They scratch, then go quiet.',2);}}
// ---- safe zones / camps
const CP=()=>CAMP.C[S.ch];const campRoom=()=>RM().findIndex(r=>r.safe);
function campNear(){const c=CP();if(!c||S.room!=campRoom())return 0;return dist(S.p,{x:c.fire[0],y:c.fire[1]})<20;}
function campSetup(){const c=CP(),cr=campRoom(),K=S.camp;K.on=1;K.k1=S.kills;K.age=0;K.away=0;for(const d of Object.keys(RM()[cr].d))K.bars[d]=0;
 S.npcs.forEach((n,i)=>{if(n.li>0||n.r==cr){n.r=cr;const a=i*2.1+.6;n.x=c.fire[0]+Math.cos(a)*24;n.y=Math.min(124,c.fire[1]+Math.sin(a)*16);n.camp=1;}});
 SFX.heal();calm=3;const met=S.npcs.filter(n=>n.camp);
 const sc=[[ 'hero',c.kind=='campfire'?'Dry wood. A match. The first warm thing in days.':'I hang the lantern. The dark backs off a step.','wide','swell']];
 met.forEach((n,i)=>sc.push(['npc'+S.npcs.indexOf(n),n.lines[0],'npc'+S.npcs.indexOf(n),null]));
 sc.push(['hero',met.length?'We are not alone. For tonight, this is home.':'Nobody yet. But a light draws the living too.','hero',null]);
 S.sq.push({s:sc});}
function campMenu(){const K=S.camp,c=CP(),inv=S.p.inv,sc=inv.scrap||0,R=c.req,rn=S.npcs[R.who];
 const o=[],cb=[];const add=(t,f)=>{o.push(t);cb.push(f);};
 add('REST & SAVE',()=>{S.p.hp=Math.max(S.p.hp,3);S.saves++;save();SFX.type();say('Warm hands. Account recorded.',2);});
 add('CRAFT AMMO (2 scrap)',()=>{if(sc<2)return say('Need 2 scrap. Zombies drop it.',1.5);inv.scrap-=2;inv.ammo+=6;SFX.click();say('+6 rounds, hand-packed.',1.5);reopen();});
 add('BREW HERB (3 scrap)',()=>{if(sc<3)return say('Need 3 scrap.',1.5);inv.scrap-=3;inv.herb=(inv.herb||0)+1;SFX.heal();say('+1 herb tonic.',1.5);reopen();});
 add('BARRICADES (1 scrap each)',()=>{let n=0;for(const d in K.bars)if(K.bars[d]<3&&(inv.scrap||0)>0){inv.scrap--;K.bars[d]=3;n++;}SFX.door();shake(.2);say(n?n+' barricade(s) built/repaired.':'Need scrap, or all are solid.',1.6);reopen();});
 if(S.npcs.some(n=>n.camp))add('TRADE: 1 herb -> 8 ammo',()=>{if(!(inv.herb>0))return say('"No herbs, no deal."',1.5);inv.herb--;inv.ammo+=8;SFX.pick();say('"Pleasure."',1.2);reopen();});
 if(rn&&rn.camp&&K.req<2)add(K.req?'REQUEST: '+(R.kills?'KILLS '+Math.min(S.kills-K.k0,R.kills)+'/'+R.kills:'GIVE '+R.need.n+' '+R.need.k.toUpperCase()):'ASK '+rn.name,()=>reqStep());
 add('LEAVE',null);dialog={q:(c.kind=='campfire'?'CAMPFIRE':'LANTERN HUB')+'  scrap '+sc,o,i:0,cb};}
function reopen(){setTimeout(()=>{if(mode=='play'&&!dialog)campMenu();},50);}
function reqStep(){const K=S.camp,R=CP().req,n=S.npcs[R.who],w=npcWho(n);
 if(!K.req){K.req=1;K.k0=S.kills;say(R.text,3.5,w);return;}
 const ok=R.kills?S.kills-K.k0>=R.kills:(S.p.inv[R.need.k]||0)>=R.need.n;
 if(!ok)return say('"Not yet."',1.5,w);if(R.need)S.p.inv[R.need.k]-=R.need.n;K.req=2;S.p.inv[R.reward.k]=(S.p.inv[R.reward.k]||0)+R.reward.n;SFX.heal();say(R.done,3.5,w);}
// siege tuning: only after you have left camp and come back, camp is >=40s old, boss still alive, and the chapter is 'hot'
function siegeReady(){const K=S.camp;if(!K.on||!K.away||(K.age||0)<40||S.en.some(e=>e.big&&e.hp<=0))return 0;return S.flags.midDown||S.flags.chased||S.kills-(K.k1||0)>=4+(S.ch>>1);}
function campTick(dt){const K=S.camp;if(!K||!K.on)return;K.age=(K.age||0)+dt;const cr=campRoom();if(S.room!=cr)K.away=1;
 if(K.pend>0&&mode=='play'&&!dialog&&!S.cine&&!S.mem){if(S.room!=cr){K.pend=0;return;}if(S.p.hp<=1)return;K.pend-=dt;if(K.pend<=0){K.pend=0;siegeStart();}}}
function siegeStart(){const K=S.camp;if(K.siege||S.flags.sieged)return;S.flags.sieged=1;K.siege={w:0,t:3,end:0};calm=0;S.pre=2.5;S.fx.sting=1;SFX.roar();shake(.6);
 const n=S.npcs.find(n=>n.camp);say(n?'"They followed the light! Hold the doors!"':'They followed the light. Hold the doors!',3,n?npcWho(n):null);}
function siegeUpdate(dt){const K=S.camp,G=K.siege;if(!G)return;const cr=campRoom();if(S.room!=cr){return;}G.t-=dt;
 if(G.t<=0&&G.w<3){G.w++;G.t=15;const ds=Object.keys(RM()[cr].d),D=CAMP.D;const mx=VAR.MIX[S.ch];for(let i=0;i<1+G.w+(S.ch>=3?1:0);i++){const d=ds[i%ds.length];S.en.push(Z(cr,D[d][0],D[d][1],{t:mx[(i+G.w)%mx.length],burst:1,sd:d,siege:1,i:i+G.w*3}));}SFX.roar();say('WAVE '+G.w+'/3',1.4);}
 if(G.w>=3&&G.t<=0&&!S.en.some(e=>e.siege&&e.hp>0)){K.siege=null;S.p.inv.scrap=(S.p.inv.scrap||0)+3;SFX.heal();calm=4;say('They pull back. The fire holds. +3 scrap',3);}}
function campBye(){const c=CP();if(!c||!S.camp.on)return;const sc=[['hero','Time to move. The fire won\'t last, and neither will this place.','wide','silence']];
 S.npcs.forEach((n,i)=>{if(n.camp)sc.push(['npc'+i,c.bye[i%c.bye.length],'npc'+i,i==0?'swell':null]);});sc.push(['hero','I don\'t look back. If I look back, I stay.','hero',null]);S.sq.unshift({s:sc});}
function lockTarget(){const p=S.p;let best=null,bd=110;for(const e of S.en)if(e.r==S.room&&e.hp>0&&e.spared==null){const d=dist(p,e);if(d<bd){bd=d;best=e;}}return best;}
function fire(crit){const p=S.p;if(p.cool>0)return;p.cool=.45;
 if(p.inv.ammo<=0){SFX.click();say('*click* Out of rounds. Use the knife (B).');return;}
 p.inv.ammo--;p.flash=.08;haptic(crit?70:35);
 const t=p.lock>=0?S.en[p.lock]:null;let tx,ty;
 PHYS.casing(p.x,p.y,p.dir);
 const hp_=t&&t.hp>0&&clear(p,t)?PHYS.ray(p.x,p.y,t.x,t.y):null;
 if(t&&t.hp>0&&clear(p,t)&&!(hp_&&hp_.d<dist(p,t)-4)){tx=t.x;ty=t.y;damage(t,crit?6:2,crit,Math.atan2(t.y-p.y,t.x-p.x));PHYS.debris(tx,ty,8,3,'#7a2030',40,'chip');}
 else if(hp_){tx=hp_.p.x;ty=hp_.p.y;PHYS.hit(hp_.p,crit?3:2);}
 else{const v={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}[p.dir];tx=p.x;ty=p.y;for(let i=0;i<120;i+=2){tx+=v[0]*2;ty+=v[1]*2;if(solid(S.room,Math.floor(tx/T),Math.floor(ty/T)))break;}const ph=PHYS.ray(p.x,p.y,tx,ty);if(ph){tx=ph.p.x;ty=ph.p.y;PHYS.hit(ph.p,2);}else{PHYS.debris(tx,ty,8,5,'#8a8078',50,'chip');window.AUD&&AUD.fx('ric',tx,ty);}}
 crit?SFX.crit():SFX.shot();shake(crit?.5:.2);S.shots.push({x1:p.x,y1:p.y,x2:tx,y2:ty,t:.06});}
function clear(a,b){for(let i=0;i<=1;i+=.05)if(solid(S.room,Math.floor((a.x+(b.x-a.x)*i)/T),Math.floor((a.y+(b.y-a.y)*i)/T)))return 0;return 1;}
function knife(){const p=S.p;p.cool=.35;SFX.slash();const h={x:p.x+{l:-10,r:10,u:0,d:0}[p.dir],y:p.y+{u:-10,d:10,l:0,r:0}[p.dir]};
 for(const e of S.en)if(e.r==S.room&&e.hp>0&&e.spared==null&&box(h,6,e,e.big||e.mb!=null?8:6))damage(e,e.t=='crawler'?2:1,0,Math.atan2(e.y-p.y,e.x-p.x),1);PHYS.point(h.x,h.y,6);}
function damage(e,n,crit,a,kn){const fx=S.fx,B=CH.boss;
 if(e.armor>0&&!crit&&!kn){e.armor--;e.fl=.1;SFX.click();PHYS.debris(e.x,e.y,6,4,'#d0d0d0',50,'chip');say(e.armor?'CLANG - armored! Knife or aim for gold.':'ARMOR CRACKED!',.8);return;}
 e.hp-=n;e.fl=.15;e.x+=Math.cos(a)*5;e.y+=Math.sin(a)*5;blood(e.x,e.y,crit?24:8);fx.stop=crit?.09:.04;
 if(crit){fx.slow=.6;fx.punch=1;say('CRITICAL!',.8);}
 if(e.big&&e.ph==1&&e.hp<=e.max/2){e.ph=2;SFX.roar();shake(1);fx.sting=1;say(B.p2,2.5,BP());PHYS.rubble(8);S.flags.steam=1;if(B.mech=='whiteout')S.flags.whiteout=1;memory('p2',B.memP2);}
 if(e.big&&B.ph3&&e.ph==2&&e.hp<=e.max/4){e.ph=3;SFX.roar();shake(1);fx.sting=1;say(B.p3,2.5,BP());PHYS.rubble(10);memory('p3',B.memP3);}
 if(e.mb!=null&&e.ph==1&&e.hp<=e.max/2){e.ph=2;SFX.roar();shake(1);fx.sting=1;say(MB(e).p2,2.5,{boss:MB(e).art});PHYS.rubble(6);}
 if(e.big&&B.mech=='final'&&e.hp<=4){e.hp=4;e.spared=0;e.charge=0;say('She stops. Swaying. A: PLAY THE VOICEMAIL',5);fx.slow=1;return;}
 if(e.hp<=0){SFX.groan(0,.4);fx.slow=Math.max(fx.slow,.5);fx.punch=1;blood(e.x,e.y,30);
  if(e.big){cine('finisher',3,{x:e.x,y:e.y});fx.slow=2;S.p.inv0=4;say('FINISHER',1.5);}
  if(e.mb!=null){const m=MB(e);cine('finisher',2.4,{x:e.x,y:e.y,mid:1});fx.slow=1.6;S.p.inv0=3;say('FINISHER - '+m.fin,3,{boss:m.art});S.flags.midDown=1;const dr=m.drop;S.items.push({r:S.room,x:e.x,y:e.y,k:dr.k,n:dr.n});}
  if(!e.big&&e.mb==null){S.kills++;if(Math.random()<.55){S.p.inv.scrap=(S.p.inv.scrap||0)+1;}}if(e.t=='bloater')pop(e);if(e.t=='frozen')spit(e,0,6,Math.PI/3,45,'ice');}}
function playTape(e){if(!(S.p.inv.tape&&S.p.inv.player)){say('You need the TAPE and the TAPE PLAYER. She is waiting.',3);return;}
 SFX.tape();e.hp=0;cine('finisher',5,{x:e.x,y:e.y,tape:1});S.p.inv0=9;say('"Minh, it\'s Mom. Tell your sister to come home for dinner."',5,'linh');}
function grabUpdate(dt){const G=S.grab,p=S.p;G.t+=dt;S.fx.danger=1;
 if(hit('A')||hit('u')||hit('d')||hit('l')||hit('r')||hit('swipe'))G.m+=.12;G.m=Math.max(0,G.m-dt*.25);
 if(G.t%0.8<dt){p.hp-=.5;SFX.hurt();haptic(60);blood(p.x,p.y,4,2);}
 if(hit('B')&&!S.flags.knifeUsed){S.flags.knifeUsed=1;S.grab=null;damage(G.e,3,1,0);say('KNIFE COUNTER! (recharges at save rooms)',1.5);p.inv0=1;return;}
 if(G.m>=1){S.grab=null;p.inv0=1;const a=Math.atan2(G.e.y-p.y,G.e.x-p.x);G.e.x+=Math.cos(a)*14;G.e.y+=Math.sin(a)*14;SFX.slash();shake(.3);say('Broke free!',1);}
 if(p.hp<=0){S.grab=null;mode='over';song='';cine('death',3);}}
function pickup(it){const p=S.p;it.got=1;SFX.pick();queueScene('item:'+it.k);if(CH.exit&&CH.exit.needs&&it.k==CH.exit.needs[0]&&!RM()[S.room].safe)setTimeout(()=>{if(mode=='play'||mode=='scene')chaseStart();},4000);
 if(it.k=='ammo'){p.inv.ammo+=it.n;say('Found handgun rounds x'+it.n+'.');return;}
 if(it.k=='herb'){p.inv.herb++;say('Found a healing herb.');return;}
 p.inv[it.k]=1;say('Found: '+it.name+(it.read?'. (ITEMS to read)':'.'),2.5);if(it.mem)memory('i'+it.k,it.mem);}
function scares(){const p=S.p,fx=S.fx;
 for(const [i,s] of CH.scares.entries()){const key='sc'+i;if(S.room!=s.r||S.flags[key])continue;if(CFG.scare==0&&i%2)continue;
  if(s.type=='window'&&p.inv[s.after]){S.flags[key]=1;burst(s);SFX.glass();blood(s.x,s.y,14,4);}
  if(s.type=='calm'){if(!S.flags[key+'t']){S.flags[key+'t']=S.time+3.5;calm=4;}else if(S.time>S.flags[key+'t']){S.flags[key]=1;burst(s);SFX.door();}}}
 function burst(s){S.en.push(Z(S.room,s.x,s.y,{burst:1}));SFX.sting();shake(1);fx.sting=1;haptic(150);cine('scare',.8,{x:s.x,y:s.y});}}
function genTry(){const gen=CH.gen,i=S.p.inv;if(S.power){say('The generator hums.');return;}
 if(gen.needs.every(k=>i[k])){S.power=1;i.power=1;SFX.heal();shake(.3);say(gen.msg,3);}else say('The generator needs two FUSES.',2.5);}
function gateTry(){const ex=CH.exit,i=S.p.inv;if(!ex)return;
 if(!CH.boss.noReq&&!S.flags.bossDown){const b=S.en.find(e=>e.big);if(b&&b.r==S.room){say('Not while '+CH.boss.name+' stands.',2);return;}}
 if(ex.needs.every(k=>i[k])&&(CH.boss.noReq||S.flags.bossDown)){say(ex.done,2);finish();return;}
 say(ex.needs.every(k=>i[k])?'Something still guards this place...':ex.locked,3);SFX.click();}
function finish(){campBye();const L=S.sq.length;queueScene('end',win);if(S.sq.length==L&&L)S.sq[L-1].then=win;if(!S.sq.length&&mode!='scene')win();}
function win(){if(CH.final||CH.secret){CFG.secret=1;}mode='win';introT=0;song=CH.final?'memory':'safe';SFX.heal();cine('outro',CH.final?16:10);CFG.unlocked=Math.max(CFG.unlocked,Math.min(7,S.ch+2));saveCfg();localStorage.removeItem('lq_save_'+S.ch);}
function move(o,dx,dy,rad){const ok=(x,y)=>![[-1,-1],[1,-1],[-1,1],[1,1]].some(([a,b])=>solid(S.room,Math.floor((x+a*rad)/T),Math.floor((y+b*rad)/T)));
 if(ok(o.x+dx,o.y))o.x+=dx;if(ok(o.x,o.y+dy))o.y+=dy;}
function go(to,side){if(to=='exit'){S.p.y=Math.max(S.p.y,10);S.p.y=side=='N'?12:H-10;gateTry();return;}S.room=to;SFX.door();haptic(20);const p=S.p;
 if(side=='N'){p.y=H-20;p.x=80}if(side=='S'){p.y=20;p.x=80}if(side=='W'){p.x=W-20;p.y=72}if(side=='E'){p.x=20;p.y=72}
 for(const e of S.en)if(e.r==to&&dist(e,p)<40&&!e.big){e.x=W-e.x;e.y=H-e.y;}
 PHYS.room(S,CH);if(RM()[to].safe)S.flags.knifeUsed=0;S.fx.blood=[];cine('enter',1);say(RM()[to].n,1.5);
 const b=S.en.find(e=>e.big&&e.r==to&&e.hp>0);if(b&&!S.flags.bossIntro){S.flags.bossIntro=1;calm=2;window.AUD&&(AUD.duck=2);S.pre=1.8;cine('bossintro',2.2,{x:b.x,y:b.y});say(CH.boss.name,2.2,BP());setTimeout(()=>SFX.roar(),1700);queueScene('boss');}
 const mb=S.en.find(e=>e.mb!=null&&e.r==to&&e.hp>0);if(mb&&!S.flags.midIntro){S.flags.midIntro=1;calm=2;cine('bossintro',2,{x:mb.x,y:mb.y});say(MB(mb).name,2,{boss:MB(mb).art});setTimeout(()=>SFX.roar(),1200);queueScene('mid');}
 S.npcs.forEach((n,i)=>{if(n.r==to&&!n.camp)queueScene('npc'+i);});queueScene('room:'+to);
 if(S.camp.on&&to==campRoom()&&!S.flags.sieged&&siegeReady())S.camp.pend=2.5;}
const invList=()=>{const i=S.p.inv,l=['ammo','herb'];if(i.scrap)l.push('scrap');for(const it of S.items)if(i[it.k]&&!l.includes(it.k))l.push(it.k);return l;};
// ---------- pixel font (original 3x5) ----------
const FONT={A:[2,5,7,5,5],B:[6,5,6,5,6],C:[3,4,4,4,3],D:[6,5,5,5,6],E:[7,4,6,4,7],F:[7,4,6,4,4],G:[3,4,5,5,3],H:[5,5,7,5,5],I:[7,2,2,2,7],J:[1,1,1,5,2],K:[5,5,6,5,5],L:[4,4,4,4,7],M:[5,7,7,5,5],N:[6,5,5,5,5],O:[2,5,5,5,2],P:[6,5,6,4,4],Q:[2,5,5,6,3],R:[6,5,6,5,5],S:[3,4,2,1,6],T:[7,2,2,2,2],U:[5,5,5,5,7],V:[5,5,5,5,2],W:[5,5,7,7,5],X:[5,5,2,5,5],Y:[5,5,2,2,2],Z:[7,1,2,4,7],
 0:[7,5,5,5,7],1:[2,6,2,2,7],2:[6,1,2,4,7],3:[6,1,2,1,6],4:[5,5,7,1,1],5:[7,4,6,1,6],6:[3,4,7,5,7],7:[7,1,1,2,2],8:[7,5,7,5,7],9:[7,5,7,1,6],
 '.':[0,0,0,0,2],',':[0,0,0,2,4],'!':[2,2,2,0,2],'?':[6,1,2,0,2],"'":[2,2,0,0,0],'"':[5,5,0,0,0],'-':[0,0,7,0,0],':':[0,2,0,2,0],'(':[1,2,2,2,1],')':[4,2,2,2,4],'/':[1,1,2,4,4],'>':[4,2,1,2,4],'<':[1,2,4,2,1],'+':[0,2,7,2,0],'*':[5,2,5,0,0],'&':[2,5,2,5,3],'#':[5,7,5,7,5]};
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
function tw_(s){return norm(s).length*4;}
function rect(c,x,y,w,h){g.fillStyle=typeof c=='number'?P[c]:c;g.fillRect(x|0,y|0,w,h);}
function txt(s,x,y,c=4,ctr){s=norm(s);if(ctr)x-=s.length*2;x|=0;y|=0;g.fillStyle=typeof c=='number'?P[c]:c;
 for(let i=0;i<s.length;i++){const gl=FONT[s[i]];if(!gl)continue;for(let r=0;r<5;r++){const b=gl[r];if(b&4)g.fillRect(x+i*4,y+r,1,1);if(b&2)g.fillRect(x+i*4+1,y+r,1,1);if(b&1)g.fillRect(x+i*4+2,y+r,1,1);}}}
function wrap(s,x,y,c=4,w=38){const ws=String(s).split(' ');let l='',yy=y;for(const t of ws){if((l+t).length>w){txt(l,x,yy,c);l='';yy+=7}l+=t+' ';}txt(l,x,yy,c);}
const SP={
 hero:['..444...','.4774...','.4444...','..22....','.2222...','2.22.2..','..88....','.8..8...'],
 zom:['..66....','.6006...','.6666...','.5555...','65555.6.','..55....','.5..5...','.5..5...'],
 big:['...2222.....','..222222....','..203302....','..222222....','.22222222...','2222222222..','2.222222.2..','2.222222.2..','..222222....','..22..22....','..22..22....','.222..222...'],
 herb:['...6....','..666...','.66566..','..656...','...5....','..777...','..777...','........'],
 ammo:['........','.9.9.9..','.9.9.9..','.7.7.7..','.7.7.7..','.77777..','........','........'],
 moon:['..444...','.44.....','.4......','.4......','.44.....','..444...','........','........'],
 sun:['.9.9.9..','..999...','.99999..','..999...','.9.9.9..','........','........','........'],
 key:['..99....','.9..9...','..99....','...9....','...99...','...9....','...99...','........'],
 letter:['........','44444444','4.4444.4','44.44.44','444..444','44444444','........','........'],
 tw:['........','.888888.','.844448.','11111111','18484841','18888881','11111111','........'],
 gen:['.888888.','81111118','81999918','81111118','88888888','8.8..8.8','........','........'],
};
const sprOf=k=>SP[k]?k:'key';
function spr(n,x,y,fl,tint){const s=SP[sprOf(n)];const ox=x-s[0].length/2|0,oy=y-s.length/2|0;
 for(let j=0;j<s.length;j++)for(let i=0;i<s[j].length;i++){const c=s[j][i];if(c!='.'){g.fillStyle=tint?P[4]:P[+c];g.fillRect(fl?ox+s[j].length-1-i:ox+i,oy+j,1,1);}}}
function drawRoom(){const r=RM()[S.room];
 for(let y=0;y<9;y++)for(let x=0;x<10;x++){if(solid(S.room,x,y)){rect(1,x*T,y*T,T,T);rect(0,x*T,y*T+T-3,T,3);}else{rect(0,x*T,y*T,T,T);g.globalAlpha=.35;rect(8,x*T,y*T,T,T);g.globalAlpha=1;}}
 for(const b of r.blk||[]){rect(7,b[0]*T+1,b[1]*T+2,14,12);}if(S.room==CH.tw.r)spr('tw',CH.tw.x,CH.tw.y);}
const R3=()=>window.R3D&&R3D.ok;
function overlay(a,c='15,15,27'){g.fillStyle=`rgba(${c},${a})`;g.fillRect(0,0,W,H);}
function typeLines(L,t,y0=6,c=4,sp=9){const n=Math.floor(t*30);let k=0;L.forEach((l,i)=>{const s=l.slice(0,Math.max(0,n-k));k+=l.length;if(s.length&&s.length<l.length&&ac&&Math.random()<.25)SFX.type();txt(s,6,y0+i*sp,c)});return n>=k;}
function memScreen(lines,t){overlay(.55,'240,190,120');for(let i=0;i<40;i++){g.fillStyle='rgba(255,240,200,.3)';g.fillRect(Math.random()*W,Math.random()*H,1,1);}
 txt('- MEMORY -',80,30,7,1);g.globalAlpha=.85;portrait('linh',56,44,48);g.globalAlpha=1;lines.forEach((l,i)=>{if(t>i*.5)txt(l,80,104+i*10,l=='...'?7:0,1);});}
function draw(){g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,HW,HH);const W=HW,H=HH;const r3=R3();const g3=document.getElementById('g3'),v=document.getElementById('vig');
 if(g3)g3.style.filter='';
 if(mode=='title'){r3?overlay(.35):rect(0,0,0,W,H);txt('THE LONG QUIET',80,40,3,1);txt('ACCOUNTS FROM THE OUTBREAK',80,50,4,1);portrait('linh',30,70,46);portrait('minh',84,70,46);
  TITLE_MENU().forEach((m,i)=>txt((menuI==i?'> ':'  ')+m,80,150+i*11,i==1&&!localStorage.getItem('lq_last')?1:menuI==i?9:4,1));txt('(C) PHANTASTIC.VANGUARD',80,270,8,1);return;}
 if(mode=='select'){rect(0,0,0,W,H);txt('CHAPTERS',80,4,9,1);CHS.forEach((c,i)=>{const lk=i==7?!CFG.secret:i>=CFG.unlocked,y=14+i*31;if(!lk)portrait(ART.heroOf(i,0),4,y,26);txt((menuI==i?'>':' ')+(i==7?'X':i+1)+' '+(lk?'????????':c.title),34,y+4,lk?1:menuI==i?9:4);if(!lk){txt((hasSave(i)?'SAVED - ':'')+c.place,38,y+12,8);if(i<7)txt('OUTFIT '+VAR.OUTFITS[(CFG.outfit||{})[i]||0],38,y+19,menuI==i?6:1);}});txt('A PLAY  B BACK  < > OUTFIT',80,272,8,1);return;}
 if(mode=='intro'){const md=CH.memOpen.length*.55+1.5;
  if(introT<md){if(g3)g3.style.filter='sepia(.9) saturate(1.6) brightness(1.25) blur(.6px)';memScreen(CH.memOpen,introT);return;}
  r3?overlay(.62):rect(0,0,0,W,H);const t=introT-md;
  portrait(HERO(),56,8,48);typeLines(['CHAPTER '+CH.id+': '+CH.title,CH.place,'ACCOUNT OF '+CH.who,'',...CH.intro,'','A: BEGIN'],t,64,4,10);return;}
 if(mode=='over'){overlay(r3?.6:1,'122,32,48');txt('YOU DIED',80,110,4,1);txt('[ACCOUNT INCOMPLETE]',80,126,0,1);txt('A: TITLE',80,170,4,1);return;}
 if(mode=='win'){overlay(r3?.6:1);const L=CH.outro;if(CH.final){portrait('linh',30,6,44);portrait('minh',86,6,44);}else portrait(HERO(),56,6,48);typeLines(L,introT,62,4,11);if(CH.final&&introT>9){if(g3)g3.style.filter='sepia(.6) brightness(1.1)';}
  if(introT>4)txt(CH.final?'THANK YOU FOR LISTENING':'NEXT: CHAPTER '+(CH.id+1),80,256,3,1);txt('A: CONTINUE',80,268,8,1);return;}
 const p=S.p,fx=S.fx;
 if(!r3){const sh=fx.shake*3;g.setTransform(1,0,0,1,(Math.random()-.5)*sh,(Math.random()-.5)*sh);drawRoom();
  for(const it of S.items)if(it.r==S.room&&!it.got)spr(it.k,it.x,it.y);
  for(const e of S.en)if(e.r==S.room&&e.hp>0)spr(e.big?CH.boss.spr:'zom',e.x,e.y,e.x>p.x,e.fl>0);
  if(!(p.inv0>0&&Math.floor(p.inv0*10)%2))spr('hero',p.x,p.y,p.dir=='l');
  for(const b of fx.blood)rect(b.c,b.x,b.y-b.z,1,1);
  for(const s of S.shots){g.strokeStyle=P[9];g.beginPath();g.moveTo(s.x1,s.y1);g.lineTo(s.x2,s.y2);g.stroke();}
  g.setTransform(1,0,0,1,0,0);}
 for(const s of S.shots)s.t-=1/60;S.shots=S.shots.filter(s=>s.t>0);
 if(p.aim>=0&&p.lock>=0){const e=S.en[p.lock],q=r3?R3D.project(e.x,e.y):{x:e.x,y:e.y};const k=Math.max(2,10-p.aim*14),gold=p.aim>.45&&p.aim<.75;g.strokeStyle=gold?P[9]:P[4];g.lineWidth=1;g.strokeRect((q.x-k|0)+.5,(q.y-k-4|0)+.5,k*2,k*2);if(gold)txt('!',q.x+k+1,q.y-k-8,9);}
 if(S.cine&&(S.cine.type=='finisher'||S.cine.type=='bossintro')){rect(0,0,0,W,28);rect(0,0,H-28,W,28);}
 if(mode=='scene'&&S.scene){drawScene();return;}
 for(const q of S.proj){const v=r3?R3D.project(q.x,q.y):q;rect(q.k=='ice'?'#c0e8ff':'#9ad040',v.x-2,v.y-6,4,4);rect(q.k=='ice'?'#ffffff':'#d0f070',v.x-1,v.y-5,2,2);}
 for(const n of S.npcs)if(n.r==S.room&&dist(n,p)<18&&!S.msgT){const v=r3?R3D.project(n.x,n.y):n;txt('A: TALK',v.x,v.y-38,9,1);}
 if(S.mem){if(g3)g3.style.filter='sepia(.9) saturate(1.6) brightness(1.2) blur(.6px)';memScreen(S.mem.l,99);return;}
 // HUD
 rect(0,0,0,W,9);const cond=p.hp>=4?['FINE',6]:p.hp>=2?['CAUTION',9]:['DANGER',3];txt(cond[0],2,2,cond[1]);
 const bw=Math.round(fx.beat*2);rect(cond[1],34-bw,4-bw/2,2+bw,2+bw);
 txt('AMMO '+p.inv.ammo,62,2,4);txt('HERB '+p.inv.herb,118,2,6);
 let hy=10;
 if(CH.mech=='tide'){const m=Math.max(0,S.tide);txt('TIDE '+Math.floor(m/60)+':'+String(Math.floor(m%60)).padStart(2,'0'),2,hy,m<60?3:4);hy+=7;}
 if(CH.mech=='cold'){txt('HEAT',2,hy,4);rect(1,20,hy+1,40,3);rect(S.heat<.3?3:9,20,hy+1,40*S.heat,3);hy+=7;}
 if(CH.mech=='dark'&&!S.power){txt('NO POWER',2,hy,3);hy+=7;}
 if(CH.mech=='sound'){txt('NOISE',2,hy,4);rect(1,24,hy+1,30,3);rect(S.noise>.5?3:6,24,hy+1,30*S.noise,3);hy+=7;}
 const b=S.en.find(e=>(e.big||e.mb!=null)&&e.r==S.room&&e.hp>0);if(b){txt(b.mb!=null?MB(b).name:CH.boss.name,80,hy+1,3,1);rect(1,30,hy+8,100,3);rect(3,30,hy+8,100*Math.max(0,b.hp)/b.max,3);hy+=12;}
 if(S.camp.siege){const G=S.camp.siege;txt('SIEGE  WAVE '+G.w+'/3  '+Math.max(0,G.t).toFixed(0),80,hy+1,3,1);hy+=8;}
 if(S.camp.on&&S.room==campRoom()){const B=S.camp.bars;txt('BARRICADES '+Object.keys(B).map(d=>d+':'+'#'.repeat(B[d])+'-'.repeat(3-B[d])).join(' '),80,hy+1,4,1);hy+=8;}
 if(campNear()&&!dialog&&mode=='play'){const c=CP(),v=r3?R3D.project(c.fire[0],c.fire[1]):{x:c.fire[0],y:c.fire[1]};txt(S.camp.on?'A: CAMP':'A: MAKE CAMP',v.x,v.y-24,9,1);}
 if(S.chase){const c=S.chase.t;txt('RUN! '+c.toFixed(1),80,hy+1,Math.floor(c*4)%2?3:4,1);hy+=8;}
 if(S.grab){rect(0,20,90,120,34);txt('GRABBED! MASH A / SWIPE',80,94,3,1);rect(1,30,106,100,6);rect(9,30,106,100*Math.min(1,S.grab.m),6);if(!S.flags.knifeUsed)txt('B: KNIFE COUNTER',80,116,4,1);}
 if(S.msgT>0){const pp=S.msgP;rect(0,0,H-30,W,30);rect(8,0,H-30,W,1);if(pp){portrait(pp,2,H-56,26);wrap(S.msg,3,H-27,4,38);}else wrap(S.msg,3,H-27);}
 if(dialog){const dh=24+dialog.o.length*10,dy=Math.min(110,H-dh-80);rect(0,10,dy,140,dh);rect(8,10,dy,140,1);txt(dialog.q,14,dy+4,4);dialog.o.forEach((o,i)=>txt((dialog.i==i?'> ':'  ')+o,24,dy+18+i*10,dialog.i==i?9:4));}
 if(mode=='inv'){rect(0,8,14,144,150);portrait(HERO(),110,20,36);rect(8,8,14,144,1);txt('ITEMS',80,18,9,1);
  const nm=k=>k=='ammo'?'ROUNDS X'+p.inv.ammo:k=='herb'?'HEALING HERB X'+p.inv.herb:(S.items.find(i=>i.k==k)||{}).name||k;
  invList().forEach((k,i)=>{spr(k,20,32+i*11);txt((menuI==i?'>':' ')+nm(k),28,30+i*11,menuI==i?4:8)});txt('HOLD A AIM, RELEASE IN GOLD',12,138,8);txt('B+MOVE DODGE  B KNIFE',12,145,8);txt('A USE/READ  B CLOSE',12,152,8);}
 if(v){const red=p.hp<=2?.55:fx.danger*.25;v.style.background=`radial-gradient(ellipse at center,transparent ${45-red*25}%,rgba(${Math.round(90*red+10)},0,0,${.6+red*.35}) 100%)`;}
 if(g3)g3.style.filter=`saturate(${p.hp<=2?.25:1-fx.danger*.4}) ${fx.sting>0?'contrast(1.4)':''}`;}
let last=performance.now();
function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;try{update(dt);}catch(e){console.error(e);}if(hit('Q')&&window.R3D){R3D.toggle();CFG.hd=R3D.q;saveCfg();}if(window.AUD)AUD.tick(dt,mode,S,CH);
 if(R3())R3D.frame(dt,mode,S,CH||CHS[0]);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
ART.of=CFG.outfit||{};
window.__hm={go,campSetup,campMenu,siegeStart,campBye,siegeReady,get dialog(){return dialog},queueScene,chaseStart,SP,P,solid,CFG,W,H,CHS,get CH(){return CH},get S(){return S},get mode(){return mode},set mode(v){mode=v},startChapter,newGame,win,K,pr,
 jump(ch,room,x,y){startChapter(ch);mode='play';S.cine=null;S.room=room;S.p.x=x;S.p.y=y;}};
