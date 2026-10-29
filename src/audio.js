// Synthesized score + SFX. WebAudio: pads, strings, piano, bass, drums, choir.
// Adaptive layers (calm/tension/combat/safe/boss), heartbeat, 3D positional SFX, per-city ambience.
export const A={ctx:null,on:true,vol:.8,layers:{},intensity:0,mode:'calm'};
let C,M,MUS,SFX,AMB,REV,noiseBuf;
const KEYS=[57,50,52,45,53,55,48,40]; // root midi per chapter (A, D, E, A, F, G, C, E-low)
const mtof=m=>440*Math.pow(2,(m-69)/12);
export function initAudio(){
  if(C)return C.resume();
  C=A.ctx=new (window.AudioContext||window.webkitAudioContext)();
  // Chain: buses -> glue compressor -> master volume -> brickwall-style limiter -> soft safety clip -> out
  const comp=C.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.25;
  M=C.createGain();M.gain.value=A.vol*.8;comp.connect(M);
  const lim=C.createDynamicsCompressor();lim.threshold.value=-6;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.12;M.connect(lim);
  const sh=C.createWaveShaper();const cv=new Float32Array(2049);for(let i=0;i<2049;i++){const x=i/1024-1;cv[i]=Math.tanh(x*1.2)/Math.tanh(1.2);}sh.curve=cv;sh.oversample='4x';
  const out=C.createGain();out.gain.value=.9;lim.connect(sh);sh.connect(out);out.connect(C.destination);
  A.an=C.createAnalyser();A.an.fftSize=2048;out.connect(A.an);
  MUS=C.createGain();MUS.gain.value=.4;MUS.connect(comp);SFX=C.createGain();SFX.gain.value=.55;SFX.connect(comp);AMB=C.createGain();AMB.gain.value=.22;AMB.connect(comp);
  REV=C.createConvolver();const L=C.sampleRate*2.6,ir=C.createBuffer(2,L,C.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,2.6);}
  REV.buffer=ir;const rg=C.createGain();rg.gain.value=.5;REV.connect(rg);rg.connect(comp);
  noiseBuf=C.createBuffer(1,C.sampleRate*2,C.sampleRate);const nd=noiseBuf.getChannelData(0);let b0=0,b1=0,b2=0,pk=0;
  for(let i=0;i<nd.length;i++){const w=Math.random()*2-1;b0=.99765*b0+w*.099046;b1=.963*b1+w*.2965164;b2=.57*b2+w*1.0526913;nd[i]=b0+b1+b2+w*.1848;pk=Math.max(pk,Math.abs(nd[i]));}
  for(let i=0;i<nd.length;i++)nd[i]/=pk;const xf=Math.floor(C.sampleRate*.05);for(let i=0;i<xf;i++){const a=i/xf;nd[i]=nd[i]*a+nd[nd.length-xf+i]*(1-a);} // seamless loop
  for(const k of['calm','tension','combat','safe','boss','memory'])A.layers[k]=mk(k);
  setInterval(tick,50);
}
function mk(name){const g=C.createGain();g.gain.value=0;g.connect(MUS);const s=C.createGain();s.gain.value=.35;g.connect(s);s.connect(REV);return g;}
function env(g,t,a,d,s,r,peak=1,len=1){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(peak*s,t+a,d);g.gain.setTargetAtTime(0,t+len,r);}
// --- instruments ---
function pad(out,m,t,len,vel=.12,bright=900){for(const det of[-7,7,0]){const o=C.createOscillator();o.type=det?'sawtooth':'triangle';o.frequency.value=mtof(m);o.detune.value=det;
  const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=bright;f.Q.value=.7;const g=C.createGain();env(g,t,len*.35,1,.8,.6,vel/2,len);
  o.connect(f);f.connect(g);g.connect(out);o.start(t);o.stop(t+len+3);}}
function strings(out,m,t,len,vel=.08,trem=0){const o=C.createOscillator();o.type='sawtooth';o.frequency.value=mtof(m);
  const l=C.createOscillator();l.frequency.value=trem||5.2;const lg=C.createGain();lg.gain.value=trem?0:6;l.connect(lg);lg.connect(o.detune);
  const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=1800;const g=C.createGain();env(g,t,trem?.05:.4,1,.9,.4,vel,len);
  if(trem){const tg=C.createGain();tg.gain.value=.5;const tl=C.createOscillator();tl.frequency.value=trem;const tll=C.createGain();tll.gain.value=.5;tl.connect(tll);tll.connect(tg.gain);o.connect(f);f.connect(tg);tg.connect(g);tl.start(t);tl.stop(t+len+2);}
  else{o.connect(f);f.connect(g);}g.connect(out);o.start(t);l.start(t);o.stop(t+len+2);l.stop(t+len+2);}
function piano(out,m,t,vel=.18){for(const [h,a] of[[1,1],[2,.35],[3,.12],[4.02,.05]]){const o=C.createOscillator();o.type='sine';o.frequency.value=mtof(m)*h;
  const g=C.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel*a,t+.005);g.gain.exponentialRampToValueAtTime(.0003,t+2.2/h+.4);g.gain.linearRampToValueAtTime(0,t+2.9);o.connect(g);g.connect(out);o.start(t);o.stop(t+3);}}
function bass(out,m,t,len,vel=.22){const o=C.createOscillator();o.type='triangle';o.frequency.value=mtof(m);const o2=C.createOscillator();o2.type='square';o2.frequency.value=mtof(m);
  const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=380;const g=C.createGain();env(g,t,.01,.2,.6,.08,vel,len);const g2=C.createGain();g2.gain.value=.25;
  o.connect(g);o2.connect(g2);g2.connect(f);f.connect(g);g.connect(out);o.start(t);o2.start(t);o.stop(t+len+1);o2.stop(t+len+1);}
function noise(out,t,len,type,freq,vel,q=1){const s=C.createBufferSource();s.buffer=noiseBuf;const f=C.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
  const g=C.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.004);g.gain.exponentialRampToValueAtTime(.0005,t+len);g.gain.linearRampToValueAtTime(0,t+len+.03);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random());s.stop(t+len+.06);return s;}
function kick(out,t,v=.7){const o=C.createOscillator();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(38,t+.18);const g=C.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+.4);g.gain.linearRampToValueAtTime(0,t+.43);o.connect(g);g.connect(out);o.start(t);o.stop(t+.45);}
function snare(out,t,v=.35){noise(out,t,.18,'bandpass',1800,v,.8);const o=C.createOscillator();o.type='triangle';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(120,t+.08);const g=C.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.6,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+.12);o.connect(g);g.connect(out);o.start(t);o.stop(t+.15);}
function hat(out,t,v=.08){noise(out,t,.05,'highpass',7000,v);}
function choir(out,m,t,len,vel=.06){for(const f0 of[1,1.005,.995]){const o=C.createOscillator();o.type='sawtooth';o.frequency.value=mtof(m)*f0;
  const f1=C.createBiquadFilter();f1.type='bandpass';f1.frequency.value=700;f1.Q.value=4;const f2=C.createBiquadFilter();f2.type='bandpass';f2.frequency.value=1150;f2.Q.value=5;
  const g=C.createGain();env(g,t,len*.4,1,.9,.6,vel,len);o.connect(f1);o.connect(f2);f1.connect(g);f2.connect(g);g.connect(out);o.start(t);o.stop(t+len+3);}}
// --- sequencer ---
let next=0,step=0,ch=0;
const PROG=[[0,-4,-2,-5],[0,3,-4,-2],[0,-2,-4,-5]]; // minor-ish progressions (semitone offsets of chord root)
function chord(r,minor=true){return[r,r+(minor?3:4),r+7,r+12];}
function tick(){
  if(!C||!A.on)return; const now=C.currentTime; if(next<now)next=now+.05;
  const bpm=A.mode==='combat'||A.mode==='boss'?118:A.mode==='tension'?84:68,sd=60/bpm/4;
  while(next<now+.25){sched(step,next,sd);next+=sd;step++;}
}
function sched(s,t,sd){
  const root=KEYS[ch%8],bar=Math.floor(s/16),beat=s%16,P=PROG[ch%3],cr=root+P[bar%4],L=A.layers;
  const safe=A.mode==='safe',on=k=>((A.tg||{})[k]||0)>0||(A.layers[k].gain.value>.02);
  if(beat===0){if(on('calm'))pad(L.calm,cr-12,t,sd*16,.1,700);if(on('safe'))chord(cr,!safe).forEach(n=>pad(L.safe,n,t,sd*16,.05,1200));}
  if(on('calm')){if(beat%4===0&&Math.random()<.55){const sc=[0,3,5,7,10,12,15];piano(L.calm,root+12+sc[(s*7+bar)%sc.length],t,.08+Math.random()*.06);}}
  if(on('safe')){if(safe&&beat%2===0){const sc=[0,4,7,12,16];piano(L.safe,cr+12+sc[(s/2+bar)%5|0],t,.09);}}
  if(on('tension')){if(beat===0)strings(L.tension,cr,t,sd*16,.05,0);}
  if(on('tension')){if(beat%8===0)strings(L.tension,cr+(beat?13:12),t,sd*8,.03,9);}
  if(on('tension')){if(beat%2===0)bass(L.tension,cr-24,t,sd,.12);}
  // combat drums + ostinato
  if(on('combat')){if(beat%4===0)kick(L.combat,t,.6);if(beat===4||beat===12)snare(L.combat,t,.3);if(beat%2===1)hat(L.combat,t,.05);}
  if(on('combat')){bass(L.combat,cr-24+(beat%3===0?0:beat%3===1?7:12),t,sd*.9,.14);}
  if(on('combat')){if(beat%4===2)strings(L.combat,cr+12+(beat%8?3:0),t,sd*2,.04,0);}
  // boss: choir + timpani-ish
  if(on('boss')){if(beat===0)chord(cr,true).slice(0,3).forEach(n=>choir(L.boss,n,t,sd*16,.05));}
  if(on('boss')){if(beat%4===0)kick(L.boss,t,.9);if(beat===14||beat===15)snare(L.boss,t,.25);}
  // memory: music box
  if(on('memory')){if(beat%2===0){const sc=[0,4,7,11,12,7,4,2];piano(L.memory,root+24+sc[(s/2)%8|0],t,.06);}}
}
export function setChapter(i){ch=i;}
export function setMode(mode){A.mode=mode;if(!C)return;const t=C.currentTime;
  const tg={calm:{calm:1},tension:{calm:.5,tension:1},combat:{tension:.6,combat:1},safe:{safe:1},boss:{combat:1,boss:1,tension:.4},memory:{memory:1},silence:{}}[mode]||{};
  A.tg=tg;for(const k in A.layers)A.layers[k].gain.setTargetAtTime(tg[k]||0,t,mode==='silence'?.3:1.2);}
export function sting(kind){if(!C)return;const t=C.currentTime+.02,o=SFX;
  if(kind==='scare'){for(const m of[37,38,49,50])strings(o,m,t,.9,.12,14);noise(o,t,1,'bandpass',600,.4);}
  if(kind==='swell'){for(const m of chord(KEYS[ch%8],false))strings(REV,m,t,3,.06);}
  if(kind==='item'){piano(o,84,t,.2);piano(o,91,t+.08,.18);}
  if(kind==='save'){[72,76,79,84].forEach((m,i)=>piano(REV,m,t+i*.15,.15));}
  if(kind==='mem'){noise(o,t,.6,'bandpass',2000,.1,1);piano(REV,96,t,.12);}
  if(kind==='static'){noise(o,t,.8,'bandpass',1500,.15,.8);}
  if(kind==='boss'){kick(o,t,1);for(const m of[28,29,40])strings(o,m,t,2,.15,0);}
  if(kind==='win'){[60,64,67,72,76].forEach((m,i)=>piano(REV,m,t+i*.12,.16));}
}
// --- SFX (3D) ---
export function listener(cam){if(!C)return;const L=C.listener,p=cam.position,f=new cam.position.constructor(0,0,-1).applyQuaternion(cam.quaternion);
  if(L.positionX){L.positionX.value=p.x;L.positionY.value=p.y;L.positionZ.value=p.z;L.forwardX.value=f.x;L.forwardY.value=f.y;L.forwardZ.value=f.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}else{L.setPosition(p.x,p.y,p.z);L.setOrientation(f.x,f.y,f.z,0,1,0);}}
function out3(pos){if(!pos)return SFX;const p=C.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=2;p.rolloffFactor=1.2;p.positionX.value=pos.x;p.positionY.value=pos.y||1;p.positionZ.value=pos.z;p.connect(SFX);return p;}
export function sfx(name,pos,v=1){if(!C||!A.on)return;const t=C.currentTime,o=out3(pos);
  switch(name){
   case 'shot':noise(o,t,.25,'lowpass',1800,.6*v);kick(o,t,.5*v);noise(REV,t,.4,'bandpass',900,.15*v);break;
   case 'shotgun':noise(o,t,.45,'lowpass',1300,.7*v);kick(o,t,.8*v);noise(REV,t,.6,'bandpass',600,.25*v);break;
   case 'click':noise(o,t,.04,'bandpass',2500,.12,1);break;
   case 'step':noise(o,t,.08,'lowpass',350+Math.random()*200,.12*v);break;
   case 'hit':noise(o,t,.12,'bandpass',300,.6*v);break;
   case 'groan':{const s=C.createOscillator();s.type='sawtooth';const b=70+Math.random()*50;s.frequency.setValueAtTime(b,t);s.frequency.linearRampToValueAtTime(b*.7,t+1.1);const f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=420;f.Q.value=3;const g=C.createGain();env(g,t,.15,.5,.6,.3,.25*v,.9);s.connect(f);f.connect(g);g.connect(o);s.start(t);s.stop(t+1.8);break;}
   case 'scream':{const s=C.createOscillator();s.type='sawtooth';s.frequency.setValueAtTime(600,t);s.frequency.linearRampToValueAtTime(1300,t+.4);s.frequency.linearRampToValueAtTime(500,t+1.2);const g=C.createGain();env(g,t,.05,.4,.7,.2,.18*v,1);s.connect(g);g.connect(o);s.start(t);s.stop(t+1.6);noise(o,t,1.2,'bandpass',2000,.3*v,2);break;}
   case 'hurt':noise(o,t,.2,'bandpass',800,.5);{const s=C.createOscillator();s.frequency.setValueAtTime(300,t);s.frequency.exponentialRampToValueAtTime(120,t+.2);const g=C.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.25,t+.005);g.gain.exponentialRampToValueAtTime(.0005,t+.25);s.connect(g);g.connect(o);s.start(t);s.stop(t+.3);}break;
   case 'break':noise(o,t,.5,'bandpass',1400,.7*v,.6);noise(o,t+.05,.3,'highpass',3000,.4*v);break;
   case 'glass':for(let i=0;i<6;i++)noise(o,t+i*.03,.15,'bandpass',2500+Math.random()*2000,.2,6);break;
   case 'door':noise(o,t,.6,'lowpass',300,.5);noise(o,t+.4,.2,'bandpass',900,.3);break;
   case 'pickup':piano(o,88,t,.15);break;
   case 'heal':[76,79,83].forEach((m,i)=>piano(o,m,t+i*.07,.12));break;
   case 'splat':noise(o,t,.3,'lowpass',700,.6*v);break;
   case 'roar':{for(const b of[55,58,82]){const s=C.createOscillator();s.type='sawtooth';s.frequency.setValueAtTime(b,t);s.frequency.linearRampToValueAtTime(b*.6,t+1.5);const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=600;const g=C.createGain();env(g,t,.1,.6,.7,.4,.3*v,1.3);s.connect(f);f.connect(g);g.connect(o);s.start(t);s.stop(t+2.2);}noise(o,t,1.4,'lowpass',400,.5*v);break;}
   case 'thud':kick(o,t,.9*v);noise(o,t,.3,'lowpass',200,.5*v);break;
   case 'radio':noise(o,t,.4,'bandpass',1500,.12,1);break;
   case 'type':{const s=C.createOscillator();s.type='sine';s.frequency.value=1400+Math.random()*200;const g=C.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.025,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+.04);s.connect(g);g.connect(SFX);s.start(t);s.stop(t+.06);break;}
   case 'heart':kick(SFX,t,.55*v);kick(SFX,t+.16,.35*v);break;
   case 'ui':piano(SFX,79,t,.07);break;
  }
}
// --- ambience ---
let ambNodes=[],ambBus=null;
export function ambience(kind){if(!C)return;const t=C.currentTime;
  if(ambBus){const old=ambBus,nodes=ambNodes;old.gain.setTargetAtTime(0,t,.25);setTimeout(()=>{nodes.forEach(n=>{try{n.stop()}catch(e){}});old.disconnect();},1500);}
  ambNodes=[];ambBus=C.createGain();ambBus.gain.setValueAtTime(0,t);ambBus.gain.setTargetAtTime(1,t,.4);ambBus.connect(AMB);const AB=ambBus;
  const loop=(type,freq,v,q=1,lfo=0)=>{const s=C.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=C.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=C.createGain();g.gain.value=v;
    if(lfo){const l=C.createOscillator();l.frequency.value=lfo;const lg=C.createGain();lg.gain.value=v*.8;l.connect(lg);lg.connect(g.gain);l.start();ambNodes.push(l);}
    const sm=C.createBiquadFilter();sm.type='lowpass';sm.frequency.value=5000;s.connect(f);f.connect(sm);sm.connect(g);g.connect(AB);s.start(t,Math.random()*1.5);ambNodes.push(s);};
  const hum=(f0,v)=>{const o=C.createOscillator();o.frequency.value=f0;const g=C.createGain();g.gain.value=v*.6;o.connect(g);g.connect(AB);o.start();ambNodes.push(o);};
  ({rain:()=>{loop('bandpass',1800,.18,.5);loop('lowpass',400,.2);},sea:()=>{loop('lowpass',500,.4,1,.12);loop('bandpass',2500,.04,.5);},
    hum:()=>{hum(60,.05);hum(120,.025);loop('bandpass',1200,.03,3);},wind:()=>{loop('bandpass',500,.5,2,.07);loop('bandpass',3000,.03,.5);},
    tunnel:()=>{loop('lowpass',120,.5);hum(48,.04);},chapel:()=>{loop('lowpass',300,.2,1,.05);loop('bandpass',900,.04,6);},
    road:()=>{loop('bandpass',300,.3,1,.04);hum(55,.02);},void:()=>{hum(41,.08);hum(41.7,.06);loop('lowpass',90,.4);},
    camp:()=>{loop('bandpass',3000,.06,1,3.5);loop('lowpass',200,.1);}}[kind]||(()=>{}))();
}
export function setVol(v){A.vol=v;if(M)M.gain.setTargetAtTime(v*.8,C.currentTime,.05);}
