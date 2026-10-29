// Original synthesized audio: per-city ambient beds, adaptive 4-layer music, positional SFX, surface footsteps.
'use strict';
(function(){
let ac,out,amb,mus,L={},nb,sched=0,beat=0,curCh=-1,stepT=0,lastP=null,ambNodes=[],ambT=0;
const A=window.AUD={on:false};
function init(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
 out=ac.createGain();out.gain.value=.5;out.connect(ac.destination);amb=ac.createGain();amb.gain.value=.5;amb.connect(out);mus=ac.createGain();mus.gain.value=.35;mus.connect(out);
 for(const k of ['explore','tension','combat','boss']){L[k]=ac.createGain();L[k].gain.value=0;L[k].connect(mus);}
 const n=ac.sampleRate*2;nb=ac.createBuffer(1,n,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
 ac.listener.positionX&&(ac.listener.positionZ.value=0);A.on=true;}
for(const ev of ['pointerdown','keydown'])addEventListener(ev,()=>{init();ac&&ac.state=='suspended'&&ac.resume();});
// ---------- primitives ----------
function noiseSrc(loop=true){const s=ac.createBufferSource();s.buffer=nb;s.loop=loop;return s;}
function filt(type,f,q=1){const b=ac.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b;}
function env(node,t,a,peak,d){node.gain.setValueAtTime(0,t);node.gain.linearRampToValueAtTime(peak,t+a);node.gain.exponentialRampToValueAtTime(.001,t+a+d);}
function note(dest,f,t,d,type='triangle',v=.2,det=0){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;o.detune.value=det;env(g,t,.01,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
function hit(dest,t,d,f,type='bandpass',v=.3,q=1){const s=noiseSrc(false),g=ac.createGain();env(g,t,.002,v,d);s.connect(filt(type,f,q)).connect(g).connect(dest);s.start(t,Math.random()*1.5);s.stop(t+d+.05);}
function panner(x,y,P){const p=ac.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=1;p.rolloffFactor=1.2;
 const dx=(x-P.x)/16,dz=(y-P.y)/16;if(p.positionX){p.positionX.value=dx;p.positionY.value=0;p.positionZ.value=dz;}else p.setPosition(dx,0,dz);p.connect(out);return p;}
// ---------- ambient beds per city ----------
function clearAmb(){for(const n of ambNodes){try{n.stop();}catch(e){}}ambNodes=[];}
function bed(f,type,v,lfo=0,lfoF=.1){const s=noiseSrc(),fl=filt(type,f,.7),g=ac.createGain();g.gain.value=v;s.connect(fl).connect(g).connect(amb);s.start(0,Math.random()*1.5);ambNodes.push(s);
 if(lfo){const o=ac.createOscillator(),og=ac.createGain();o.frequency.value=lfoF;og.gain.value=lfo;o.connect(og).connect(g.gain);o.start();ambNodes.push(o);}}
function hum(f,v){const o=ac.createOscillator(),g=ac.createGain();o.type='sawtooth';o.frequency.value=f;g.gain.value=v;o.connect(filt('lowpass',300)).connect(g).connect(amb);o.start();ambNodes.push(o);}
const AMB={1:()=>{bed(2500,'highpass',.12);bed(400,'lowpass',.08,.04,.07);},             // Harlan Falls: rain + storm rumble
 2:()=>{bed(500,'lowpass',.18,.15,.12);bed(3000,'highpass',.05);},                         // Da Nang harbor: swell + spray
 3:()=>{hum(60,.05);hum(120,.02);bed(6000,'highpass',.015);},                              // Lagos hospital: mains hum + fluorescent buzz
 4:()=>{bed(700,'bandpass',.22,.18,.09);bed(1800,'bandpass',.06,.05,.23);},                // Altai: wind
 5:()=>{bed(120,'lowpass',.25,.12,.05);bed(3000,'highpass',.02);},                         // Seoul subway: rumble + drip hiss
 6:()=>{bed(450,'lowpass',.2,.17,.1);bed(1200,'bandpass',.05,.04,.31);},                   // Lisbon sea
 7:()=>{bed(2500,'highpass',.08);bed(600,'bandpass',.1,.08,.08);}};                        // Route 9: rain + wind
function ambEvents(ch,dt){ambT-=dt;if(ambT>0)return;ambT=2+Math.random()*5;const t=ac.currentTime;
 const P={x:0,y:0},x=(Math.random()-.5)*200,y=(Math.random()-.5)*200;const p=panner(x,y,P);
 if(ch==1){hit(p,t,1.5,90,'lowpass',.5);} // distant thunder
 if(ch==2){note(p,140+Math.random()*30,t,.6,'triangle',.08);note(p,120,t+.4,.8,'triangle',.06);} // hull creak
 if(ch==3){note(amb,988,t,.12,'sine',.05);note(amb,988,t+.5,.12,'sine',.05);} // monitor beeps
 if(ch==4){note(p,1400,t,.8,'sine',.02,600);}
 if(ch==5){if(Math.random()<.3){hit(p,t,3,70,'lowpass',.6);}else note(p,2200,t,.05,'sine',.08);} // train / drip
 if(ch==6){for(let i=0;i<3;i++)note(p,1600-i*200,t+i*.12,.15,'sine',.06,-300);}  // gulls
 if(ch==7){hit(p,t,.8,200,'lowpass',.2);}}
// ---------- adaptive music: 4 layers, per-chapter key/tempo ----------
const KEYS=[[0,3,5,7,10],[0,2,3,7,8],[0,1,5,7,8],[0,3,5,6,10],[0,2,3,7,10],[0,3,5,7,8],[0,2,4,7,9]];
const ROOT=[110,98,104,92,116,87,131],BPM=[72,80,92,64,96,76,60];
function seq(ch,t){const k=KEYS[ch-1],r=ROOT[ch-1],st=beat%16,q=n=>r*Math.pow(2,(k[((n%5)+5)%5]+12*Math.floor(n/5))/12);
 // explore: pad + sparse melody
 if(st%8==0)[0,2,4].forEach(i=>note(L.explore,q(i),t,2.4,'triangle',.06,i*4));
 if(st%4==2&&Math.random()<.6)note(L.explore,q(5+Math.floor(Math.random()*5))*2,t,.8,'sine',.06);
 // tension: pulse bass + clock tick
 if(st%2==0)note(L.tension,q(0)/2,t,.25,'square',.08);hit(L.tension,t,.03,6000,'highpass',.05);
 if(st==12)note(L.tension,q(1)/2*1.06,t,.6,'sawtooth',.06);
 // combat: drums + arp
 if(st%4==0)note(L.combat,60,t,.2,'sine',.5);if(st%8==4)hit(L.combat,t,.12,1800,'bandpass',.35);hit(L.combat,t,.03,8000,'highpass',.06);
 note(L.combat,q([0,2,4,7][st%4]),t,.12,'square',.05);
 // boss: low saw stabs + bells
 if(st%4==0||st%4==3)note(L.boss,q(0)/2,t,.3,'sawtooth',.12,7);if(st%8==0)note(L.boss,q(-1)/2,t,.5,'sawtooth',.1);if(st%16==8)note(L.boss,q(9)*2,t,1.2,'sine',.08);if(st%2==1)hit(L.boss,t,.06,3000,'bandpass',.15);}
function mix(state){const T=ac.currentTime;for(const k in L)L[k].gain.setTargetAtTime(state[k]||0,T,.6);}
// ---------- footsteps per surface ----------
function footstep(f,x,y,P,v=1){const t=ac.currentTime,d=out;
 switch(f){case 'wood':case 'planks':note(d,90+Math.random()*20,t,.08,'triangle',.25*v);hit(d,t,.05,900,'bandpass',.12*v);if(f=='planks'&&Math.random()<.2)note(d,220,t+.05,.3,'sawtooth',.03,30);break;
  case 'tile':case 'clinic':hit(d,t,.04,3200,'bandpass',.25*v,3);if(f=='clinic'&&Math.random()<.15)note(d,1800,t,.08,'sine',.04);break;
  case 'metal':note(d,320+Math.random()*80,t,.18,'square',.05*v);hit(d,t,.04,2500,'bandpass',.2*v,5);break;
  case 'snow':hit(d,t,.18,1800,'highpass',.3*v);break;
  case 'carpet':case 'moss':hit(d,t,.07,500,'lowpass',.2*v);break;
  default:hit(d,t,.06,1400,'bandpass',.28*v,1.5);}}
// ---------- public API ----------
A.fx=(kind,x,y)=>{if(!ac||!S_)return;const p=panner(x,y,S_.p),t=ac.currentTime;
 if(kind=='glass')for(let i=0;i<7;i++)note(p,2000+Math.random()*3000,t+i*.02,.12,'square',.08);
 if(kind=='wood'){hit(p,t,.25,400,'lowpass',.6);note(p,110,t,.2,'triangle',.3);}
 if(kind=='knock')note(p,180,t,.1,'triangle',.25);
 if(kind=='boom'||kind=='explode'){hit(p,t,1.2,120,'lowpass',1);hit(p,t,.4,2000,'bandpass',.4);}
 if(kind=='clink')note(p,3000+Math.random()*800,t,.08,'sine',.08);
 if(kind=='rock')hit(p,t,.35,250,'lowpass',.5);
 if(kind=='ric')note(p,2400,t,.18,'sine',.06,-900);};
let S_=null;
A.tick=(dt,mode,S,CH)=>{if(!ac)return;S_=S;const ch=CH?CH.id:1;
 if(mode=='play'&&ch!==curCh){clearAmb();AMB[ch]();curCh=ch;}if(mode=='title'&&curCh!==-1){clearAmb();curCh=-1;}
 amb.gain.setTargetAtTime(mode=='play'?.5:mode=='intro'?.25:0,ac.currentTime,.5);
 if(mode!='play'){mix({});return;}
 ambEvents(ch,dt);
 const boss=S.en.find(e=>e.big&&e.r==S.room&&e.hp>0),dz=S.fx.danger,safe=CH.rooms[S.room].safe;
 mix(boss?{tension:.4,boss:1,combat:.6}:safe?{explore:.8}:{explore:1-dz,tension:Math.min(1,dz*1.6),combat:dz>.6||S.grab?1:0});
 const spb=60/BPM[ch-1]/4;while(sched<ac.currentTime+.2){if(sched<ac.currentTime)sched=ac.currentTime+.02;seq(ch,sched);sched+=spb*(boss?.7:1);beat++;}
 // footsteps
 const p=S.p;if(!lastP)lastP={x:p.x,y:p.y};const mv=Math.hypot(p.x-lastP.x,p.y-lastP.y);lastP={x:p.x,y:p.y};stepT-=mv;
 if(stepT<=0&&mv>0){stepT=p.dodge>0?6:11;footstep(CH.rooms[S.room].f,p.x,p.y,p);}
 // positional zombie shuffles
 for(const e of S.en){if(e.r!==S.room||e.hp<=0)continue;e._st=(e._st||Math.random())-dt;if(e._st<=0){e._st=e.big?.5:.8;const pn=panner(e.x,e.y,p);hit(pn,ac.currentTime,e.big?.2:.1,e.big?200:600,'lowpass',e.big?.5:.15);}}};
})();
