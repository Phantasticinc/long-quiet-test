// Procedural low-poly skinned characters (PS1-era style, original designs).
// Rigid-segment skinning on a 14-bone skeleton, vertex-colored flat shading + pixel face textures.
import * as THREE from './lib/three.module.min.js';
// ---------- palettes
const TONES=['#f0c8a0','#e0b08a','#c89068','#a06a48','#7a4a30','#5a3424'];
const HP={ // base, alt FIELD, alt NIGHT  (top colors), pants, skin, hair, extras
 linh:{top:['#c8402a','#5a6a3a','#2a2c34'],pants:'#2a2a3a',skin:'#e0b08a',hair:'#1a1418',kind:'courier',acc:'#6a4a2a',patch:'#e8c040'},
 huong:{top:['#3a5a8a','#5a6a3a','#2a3040'],pants:null,skin:'#c89068',hair:'#1a1418',kind:'coverall',acc:'#d8c88a'},
 adaeze:{top:['#5ab0b0','#5a7a5a','#2a3a48'],pants:null,skin:'#6a4430',hair:'#1a1210',kind:'scrubs',acc:'#d0a040'},
 yerlan:{top:['#8a6a48','#6a6a40','#3a3028'],pants:'#3a3028',skin:'#c89068',hair:'#2a2018',kind:'sheepskin',acc:'#e8dcc0'},
 jiwoo:{top:['#e8d020','#9aa040','#d06a20'],pants:'#3a3a48',skin:'#e0b08a',hair:'#141418',kind:'hivis',acc:'#f0c020'},
 tomas:{top:['#3a6a4a','#6a6a3a','#2a2a38'],pants:'#30303a',skin:'#f0c8a0',hair:'#6a4a2a',kind:'parka',acc:'#202020'},
 minh:{top:['#7a6a50','#5a6a3a','#2a2a2a'],pants:'#2a2a30',skin:'#e0b08a',hair:'#141418',kind:'trench',acc:'#e8e0d0'},
 courier:{top:['#6a3a2a','#6a3a2a','#6a3a2a'],pants:'#2a2a3a',skin:'#9aa088',hair:'#1a1418',kind:'courier',acc:'#4a3a2a',patch:'#8a8040',zomb:1}};
const ZP={walker:'#5a4a3a',runner:'#7a3a30',crawler:'#4a4a40',bloater:'#8a7a50',riot:'#2a2e38',screamer:'#5a3a5a',spitter:'#4a6a3a',drowned:'#2a4a50',frozen:'#8aa0b8'};
const SKN={house:'#5a4a3a',civ:'#3a4a6a',market:'#8a3a30',fisher:'#d0b030',nurse:'#e0a0b0',patient:'#a8c0c8',guard:'#2a2a38',herder:'#7a5a3a',trucker:'#8a2a2a',commuter:'#2a2a2a',worker:'#e0a020'};
const rnd=s=>{s=Math.sin(s*127.1+311.7)*43758.5453;return s-Math.floor(s);};
// ---------- skeleton (rest pose, height 1.0)
const BONES=[['root',-1,[0,0,0]],['hips',0,[0,.5,0]],['spine',1,[0,.11,0]],['chest',2,[0,.13,0]],['neck',3,[0,.05,0]],['head',4,[0,.04,0]],
 ['lsh',3,[.115,.0,0]],['lel',6,[0,-.17,0]],['rsh',3,[-.115,.0,0]],['rel',8,[0,-.17,0]],['lhip',1,[.06,0,0]],['lkn',10,[0,-.24,0]],['rhip',1,[-.06,0,0]],['rkn',12,[0,-.24,0]]];
const BW={};(()=>{const w=[];BONES.forEach(([n,p,o],i)=>{w[i]=p<0?o.slice():[w[p][0]+o[0],w[p][1]+o[1],w[p][2]+o[2]];BW[n]={i,w:w[i]};});})();
// ---------- geometry builder
class GB{constructor(){this.p=[];this.c=[];this.uv=[];this.si=[];this.g=[];this.mat=[];}
 tri(a,b,c,col,bone,uvs,m){const P=this.p;for(const v of [a,b,c])P.push(...v);for(let i=0;i<3;i++){this.c.push(col.r,col.g,col.b);this.si.push(bone,0,0,0);this.mat.push(m|0);}this.uv.push(...(uvs||[0,0,0,0,0,0]));}
 quad(a,b,c,d,col,bone,face,m){const uv=face?[[0,0],[1,0],[1,1],[0,1]]:null;this.tri(a,b,c,col,bone,uv?[...uv[0],...uv[1],...uv[2]]:null,m);this.tri(a,c,d,col,bone,uv?[...uv[0],...uv[2],...uv[3]]:null,m);}
 // tapered box: center cx,cy,cz; size bottom (w0,d0) top (w1,d1), height h
 box(bone,c,w0,d0,h,col,{w1=w0,d1=d0,face=0,shade=1,oz=0}={}){col=new THREE.Color(col);const[x,y,z]=c,y0=y-h/2,y1=y+h/2;
  const B=[[x-w0/2,y0,z-d0/2],[x+w0/2,y0,z-d0/2],[x+w0/2,y0,z+d0/2],[x-w0/2,y0,z+d0/2]],T=[[x-w1/2,y1,z-d1/2+oz],[x+w1/2,y1,z-d1/2+oz],[x+w1/2,y1,z+d1/2+oz],[x-w1/2,y1,z+d1/2+oz]];
  const dk=col.clone().multiplyScalar(.82);
  this.quad(B[3],B[2],T[2],T[3],col,bone,face,face?1:0); // front (+z)
  this.quad(B[1],B[0],T[0],T[1],dk,bone);this.quad(B[2],B[1],T[1],T[2],dk,bone);this.quad(B[0],B[3],T[3],T[0],dk,bone);
  this.quad(T[3],T[2],T[1],T[0],col,bone);this.quad(B[0],B[1],B[2],B[3],dk,bone);}
 // n-sided prism between two points along y (limb)
 limb(bone,top,len,r0,r1,col,n=6){col=new THREE.Color(col);const[x,y,z]=top;const ring=(yy,r)=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2+Math.PI/n;return[x+Math.cos(a)*r,yy,z+Math.sin(a)*r];});
  const A=ring(y,r0),B=ring(y-len,r1);for(let i=0;i<n;i++){const j=(i+1)%n;const sh=col.clone().multiplyScalar(.78+.22*Math.max(0,Math.sin(i/n*6.28+1.2)));this.quad(B[j],B[i],A[i],A[j],sh,bone);}
  for(let i=1;i<n-1;i++){this.tri(A[0],A[i+1],A[i],col,bone);this.tri(B[0],B[i],B[i+1],col,bone);}}
 cone(bone,base,r,h,col,n=8){col=new THREE.Color(col);const[x,y,z]=base;const tip=[x,y+h,z];for(let i=0;i<n;i++){const a=i/n*6.283,b=(i+1)/n*6.283;const p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r];
  this.tri(q,p,tip,col.clone().multiplyScalar(.75+.25*Math.max(0,Math.cos(a-1))),bone);this.tri(p,q,[x,y,z],col.clone().multiplyScalar(.6),bone);}}
 build(){const g=new THREE.BufferGeometry();const n=this.p.length/3;
  // sort by material into 2 groups
  const ord=[...Array(n/3).keys()].sort((a,b)=>this.mat[a*3]-this.mat[b*3]);const re=(arr,k)=>{const o=[];for(const t of ord)for(let v=0;v<3;v++)for(let i=0;i<k;i++)o.push(arr[(t*3+v)*k+i]);return o;};
  g.setAttribute('position',new THREE.Float32BufferAttribute(re(this.p,3),3));g.setAttribute('color',new THREE.Float32BufferAttribute(re(this.c,3),3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(re(this.uv,2),2));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(re(this.si,4),4));
  const sw=[];for(let i=0;i<n;i++)sw.push(1,0,0,0);g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));
  const m0=ord.filter(t=>this.mat[t*3]==0).length;g.addGroup(0,m0*3,0);g.addGroup(m0*3,(n/3-m0)*3,1);g.computeVertexNormals();g.userData.tris=n/3;return g;}}
const BP=[{f:'swollen',body:'#8a7a78',sk:'#a8987a',fat:1.9},{f:'nets',body:'#4a7a60',sk:'#7ab090',fat:1.2,eye:'#c0ffd0'},{f:'surgeon',body:'#c8d8d0',sk:'#a8a0a0',fat:1.05},
 {f:'fur',body:'#d0d8e8',sk:'#9aa0a8',fat:1.35,eye:'#a0e0ff'},{f:'listener',body:'#7a7088',sk:'#b0a8b8',fat:.9,eye:'#1a1418'},{f:'choir',body:'#6a4a78',sk:'#a890a8',fat:1.4,eye:'#ff60ff'},null,
 {f:'first',body:'#16141c',sk:'#e8e4dc',fat:.95,eye:'#ffffff'},{f:'captain',body:'#2e4656',sk:'#7a9a98',fat:1.15},{f:'orderly',body:'#c0c8c8',sk:'#9aa0a0',fat:1.3},
 {f:'trapper',body:'#7a5a3c',sk:'#b8d0e0',fat:1.2},{f:'conductor',body:'#262c44',sk:'#a0a0a8',fat:1.05},{f:'matron',body:'#9a8a60',sk:'#c0b070',fat:1.25}];
// ---------- face textures (32x32 pixel art)
function faceTex(o){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');const f=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
 f(o.skin,0,0,32,32);if(o.hair){f(o.hair,0,0,32,o.bald?3:9);if(o.long){f(o.hair,0,0,4,30);f(o.hair,28,0,4,30);}else{f(o.hair,0,0,3,14);f(o.hair,29,0,3,14);}}
 if(o.zomb){f('#20181a',6,11,8,6);f('#20181a',18,11,8,6);f(o.eye||'#e8e040',9,13,3,2);f(o.eye||'#e8e040',21,13,3,2);f('#3a0c0c',10,22,12,5);f('#e8e0c0',11,22,2,2);f('#e8e0c0',15,22,2,2);f('#e8e0c0',19,22,2,2);f('#7a1010',4,24,3,6);}
 else{const sk=new THREE.Color(o.skin).multiplyScalar(.7).getStyle();f(o.hair||sk,7,10,7,2);f(o.hair||sk,18,10,7,2);f('#f0f0f0',8,13,5,3);f('#f0f0f0',19,13,5,3);f('#2a1a10',10,13,3,3);f('#2a1a10',21,13,3,3);
  f(sk,15,15,2,6);f('#8a3a3a',12,24,8,2);if(o.beard){f(o.hair,6,21,20,11);f('#8a3a3a',12,23,8,2);}if(o.old){f(sk,7,8,7,1);f(sk,18,8,7,1);f(sk,9,27,14,1);}}
 if(o.mask)f('#d8d0c8',6,18,20,10);if(o.blood){f('#7a1010',22,4,3,9);f('#7a1010',5,20,2,8);}
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;}
// ---------- spec from key
function spec(kind,key){
 if(kind=='hero'){const [base,rest='0@0']=String(key).split('#');const [o,w]=rest.split('@').map(Number);const h=HP[base]||HP.minh;
  return{...h,name:base,top:h.top[o||0],wear:w|0,face:{skin:h.skin,hair:h.hair,long:base=='linh'||base=='adaeze',beard:base=='yerlan',zomb:h.zomb,blood:(w|0)>=2||h.zomb}};}
 if(kind=='npc'){const [,seed,age]=String(key).split(':');const s=+seed;const skin=TONES[Math.floor(rnd(s)*6)],hair=age=='old'?'#d0d0d0':['#141418','#4a3020','#8a6a3a','#2a1a10','#a03020'][Math.floor(rnd(s+3)*5)];
  return{kind:'npc',name:'npc',top:new THREE.Color().setHSL(rnd(s+1),.35,.38).getStyle(),pants:new THREE.Color().setHSL(rnd(s+2),.2,.22).getStyle(),skin,hair,age,
   face:{skin,hair,long:rnd(s+5)>.5,beard:age!='kid'&&rnd(s+6)>.8,old:age=='old'}};}
 if(kind=='boss'){const P=BP[+key]||BP[0];return{kind:'boss',f:P.f,name:'boss',top:P.body,pants:new THREE.Color(P.body).multiplyScalar(.55).getStyle(),skin:P.sk,hair:P.hair||null,wear:3,fat:P.fat||1,acc:P.acc,
  face:{skin:P.sk,hair:P.hair,zomb:1,eye:P.eye,mask:P.f=='surgeon',blood:1,bald:1}};}
 // zombie 'type:skin:seed'
 const [t,sk,seed]=String(key).split(':');const s=+seed||1;const skin=t=='frozen'?'#b8c8d8':t=='drowned'?'#7a9a90':['#9aa088','#8a9878','#a0a090','#88907a'][Math.floor(rnd(s)*4)];
 return{kind:'zom',ztype:t,name:'z',top:t=='riot'?'#2a2e38':SKN[sk]||ZP[t],pants:new THREE.Color(ZP[t]).multiplyScalar(.6).getStyle(),skin,hair:rnd(s+2)>.4?'#2a2018':null,wear:3,
  face:{skin,hair:null,zomb:1,eye:t=='frozen'?'#a0e0ff':t=='screamer'?'#ff3030':null,blood:1}};}
// ---------- mesh build
const cache={};
function geom(kind,key){const ck=kind+key;if(cache[ck])return cache[ck];const S=spec(kind,key),G=new GB(),b=n=>BW[n].i,W=n=>BW[n].w;
 const top=S.top,pants=S.pants||top,skin=S.skin,k=S.kind,z=S.ztype,bf=S.f,fat=S.fat>1?S.fat:z=='bloater'?1.7:k=='sheepskin'||k=='parka'?1.18:1,kid=S.age=='kid';
 const dark=new THREE.Color(top).multiplyScalar(.6).getStyle(),shoe='#1a1614';
 // legs
 for(const s of ['l','r']){const hp=W(s+'hip'),kn=W(s+'kn');G.limb(b(s+'hip'),[hp[0],hp[1],0],.24,.045*fat**.5,.04,pants);G.limb(b(s+'kn'),[kn[0],kn[1],0],.22,.04,.034,pants);
  G.box(b(s+'kn'),[kn[0],.03,.02],.07,.12,.05,shoe);if(k=='hivis'||k=='coverall')G.box(b(s+'kn'),[kn[0],.08,0],.08,.08,.02,dark);}
 // pelvis + torso
 G.box(b('hips'),[0,.52,0],.17*fat,.11*fat,.1,pants);
 G.box(b('spine'),[0,.66,0],.19*fat,.12*fat,.17,top,{w1:.21*fat,d1:.13*fat});
 G.box(b('chest'),[0,.77,0],.22*Math.max(1,fat*.9),.13*fat,.1,top,{w1:.25,d1:.12});
 // costume layers
 const acc=S.acc||dark;
 if(k=='trench'||k=='sheepskin'){G.box(b('hips'),[0,.44,0],.2*fat,.13*fat,.2,top,{w1:.19*fat,d1:.125*fat});G.box(b('chest'),[0,.83,.0],.24,.14,.04,acc);}
 if(k=='parka'){G.box(b('head'),[0,.89,-.02],.17,.17,.14,top);G.box(b('chest'),[0,.83,0],.24,.15,.04,'#d8d0c0');}
 if(k=='courier'){G.box(b('chest'),[.06,.78,.068],.04,.03,.005,S.patch);G.box(b('chest'),[-.07,.74,.068],.03,.03,.005,'#ffffff');
  G.box(b('hips'),[.12,.53,.02],.07,.05,.09,acc);G.box(b('chest'),[0,.69,.07],.03,.005,.3,acc);G.box(b('spine'),[0,.6,.066],.2,.005,.01,'#d0d0d0');}
 if(k=='hivis'){G.box(b('spine'),[0,.66,0],.205*fat,.13,.025,'#e0e0e0');G.box(b('chest'),[0,.78,0],.235,.135,.025,'#e0e0e0');G.box(b('hips'),[0,.5,0],.19,.12,.03,'#4a3a2a');G.box(b('hips'),[.09,.48,.04],.04,.03,.06,'#8a8a8a');}
 if(k=='scrubs'){G.box(b('chest'),[.05,.74,.067],.05,.004,.04,'#ffffff');G.limb(b('chest'),[0,.81,.07],.08,.008,.008,'#202020',4);G.box(b('chest'),[-.03,.66,.07],.03,.004,.045,'#e0e0f0');}
 if(k=='coverall'){G.box(b('chest'),[0,.74,.067],.08,.004,.06,dark);G.box(b('hips'),[-.1,.5,.03],.03,.03,.12,'#8a8a90');}
 // arms
 for(const s of ['l','r']){const sh=W(s+'sh'),el=W(s+'el'),sl=k=='scrubs'||kid?skin:top,arm=fat>1.5?.06:.042;G.box(b(s+'sh'),[sh[0],sh[1]+.01,0],.07,.08,.05,top);
  G.limb(b(s+'sh'),[sh[0],sh[1],0],.17,arm,arm*.9,k=='scrubs'?top:sl);if(k=='scrubs')G.limb(b(s+'sh'),[sh[0],sh[1]-.07,0],.1,.034,.03,skin);
  G.limb(b(s+'el'),[el[0],el[1],0],.15,arm*.85,.032,k=='scrubs'?skin:top);G.box(b(s+'el'),[el[0],el[1]-.17,0],.045,.04,.06,z?S.skin:k=='hivis'?'#d06a20':skin);
  if(S.wear>=3&&s=='l'&&!z)G.box(b(s+'el'),[el[0],el[1]-.06,0],.075,.075,.035,'#e8e0d0');}
 // head
 const hd=W('head');G.limb(b('neck'),[0,W('neck')[1]+.02,0],.06,.03,.032,skin);
 G.box(b('head'),[0,hd[1]+.07,0],.13,.13,.15,skin,{face:1,w1:.125,d1:.125});
 if(S.hair&&k!='hivis')G.box(b('head'),[0,hd[1]+.15,-.01],.14,.14,.035,S.hair);if(S.face.long)G.box(b('head'),[0,hd[1]+.06,-.07],.14,.03,.15,S.hair);
 if(k=='coverall')G.cone(b('head'),[0,hd[1]+.14,0],.17,.1,acc,10);
 if(k=='hivis'){G.box(b('head'),[0,hd[1]+.155,0],.15,.15,.05,acc,{w1:.12,d1:.12});G.box(b('head'),[0,hd[1]+.135,.04],.16,.1,.01,acc);}
 if(k=='sheepskin'){G.box(b('head'),[0,hd[1]+.17,0],.16,.16,.07,'#5a4030',{w1:.15,d1:.15});}
 if(k=='parka'||k=='scrubs'&&false){}
 if(k=='parka'){G.box(b('head'),[.075,hd[1]+.07,0],.03,.06,.06,acc);G.box(b('head'),[-.075,hd[1]+.07,0],.03,.06,.06,acc);G.box(b('head'),[0,hd[1]+.155,0],.15,.02,.02,acc);}
 if(k=='scrubs')G.box(b('head'),[0,hd[1]+.155,0],.15,.15,.05,acc);
 if(k=='trench')G.box(b('chest'),[.06,.8,.07],.035,.004,.025,acc);
 // zombie variants
 if(z=='riot'){G.box(b('head'),[0,hd[1]+.1,0],.16,.16,.12,'#1a1e28');G.box(b('head'),[0,hd[1]+.08,.075],.12,.01,.05,'#6a8aa0');G.box(b('lel'),[W('lel')[0]+.04,W('lel')[1]-.06,.04],.03,.16,.28,'#3a4048');G.box(b('chest'),[0,.76,0],.26,.15,.14,'#1a1e28');}
 if(z=='bloater'){for(let i=0;i<5;i++)G.box(b('spine'),[(rnd(i)-.5)*.3,.6+rnd(i+1)*.15,.1],.06,.04,.06,'#b0a060');}
 if(z=='frozen'){for(let i=0;i<6;i++)G.cone(b(i<3?'chest':'lsh'),[(rnd(i)-.5)*.22,.8+rnd(i+2)*.04,(rnd(i+4)-.5)*.1],.025,.09,'#d0f0ff',4);}
 if(z=='drowned'){for(let i=0;i<4;i++)G.box(b('chest'),[(rnd(i)-.5)*.2,.68,.07],.02,.004,.18,'#2a5a3a');}
 if(z=='spitter')G.box(b('head'),[0,hd[1]+.02,.07],.06,.02,.04,'#8ad040');
 if(z=='screamer')G.box(b('head'),[0,hd[1]+.02,.068],.07,.01,.06,'#200808');
 // ---- bosses (original designs)
 const R=(n,a=0)=>rnd(n+a*7.1);
 if(bf=='swollen'){for(let i=0;i<9;i++)G.box(b(i<5?'spine':'chest'),[(R(i)-.5)*.42,.58+R(i,1)*.25,.12+R(i,2)*.05],.07,.06,.07,i%2?'#c0a860':'#8a5040');}
 if(bf=='nets'){for(let i=0;i<6;i++){G.box(b('chest'),[-.15+i*.06,.7,.08],.006,.004,.3,'#3a3020');G.box(b('spine'),[0,.55+i*.05,.09],.3,.004,.006,'#3a3020');}G.cone(b('rel'),[W('rel')[0],W('rel')[1]-.22,0],.03,.12,'#8a8a90',4);G.box(b('chest'),[0,.86,-.08],.2,.05,.1,'#2a4a3a');}
 if(bf=='surgeon'){G.box(b('hips'),[0,.38,0],.24,.15,.3,top,{w1:.2,d1:.12});for(const s2 of['l','r'])G.cone(b(s2+'el'),[W(s2+'el')[0],W(s2+'el')[1]-.3,0],.025,.28,'#d8e0e8',4);G.box(b('head'),[0,hd[1]+.155,0],.15,.15,.05,'#7aa090');}
 if(bf=='fur'){for(let i=0;i<10;i++)G.cone(b(i<5?'chest':'spine'),[(R(i)-.5)*.24,.62+R(i,1)*.22,-.08],.04,.12,i%2?'#e8eef4':'#b0b8c0',4);for(const s2 of['l','r'])for(let j=0;j<3;j++)G.cone(b(s2+'el'),[W(s2+'el')[0]+(j-1)*.02,W(s2+'el')[1]-.22,.02],.01,.07,'#2a2a2a',3);}
 if(bf=='listener'){for(const sx of[-1,1]){G.box(b('head'),[sx*.11,hd[1]+.1,0],.08,.16,.03,skin);G.box(b('head'),[sx*.13,hd[1]+.13,0],.06,.1,.02,'#8a5a6a');}G.box(b('head'),[0,hd[1]+.09,.078],.11,.05,.01,'#1a1418');}
 if(bf=='choir'){for(const sx of[-1,1]){G.box(b(sx<0?'lsh':'rsh'),[sx*.16,.98,0],.1,.1,.11,skin,{w1:.09,d1:.09});G.box(b(sx<0?'lsh':'rsh'),[sx*.16,.97,.056],.05,.02,.005,'#200808');}G.box(b('hips'),[0,.36,0],.28,.2,.34,top,{w1:.22,d1:.14});}
 if(bf=='first'){for(let i=0;i<7;i++)G.cone(b('head'),[(i-3)*.022,hd[1]+.16,-.01],.012,.1+(i%2)*.06,'#0a0a10',3);G.box(b('hips'),[0,.36,0],.3,.2,.36,top,{w1:.2,d1:.12});G.box(b('chest'),[0,.86,-.02],.34,.16,.04,top);}
 if(bf=='captain'){G.box(b('head'),[0,hd[1]+.155,0],.16,.16,.035,'#14202a');G.box(b('head'),[0,hd[1]+.14,.07],.14,.07,.01,'#14202a');G.box(b('chest'),[0,.76,.066],.02,.004,.16,'#c0a040');G.box(b('hips'),[0,.42,0],.21,.14,.2,top);}
 if(bf=='orderly'){for(let i=0;i<3;i++)G.box(b('spine'),[0,.56+i*.09,0],.215*fat,.135*fat,.02,'#5a4a3a');G.box(b('head'),[0,hd[1]+.06,.075],.1,.004,.06,'#e0e0e0');}
 if(bf=='trapper'){G.box(b('head'),[0,hd[1]+.17,0],.17,.17,.08,'#6a4a2a');G.box(b('lel'),[W('lel')[0],W('lel')[1]-.2,0],.12,.12,.03,'#5a5a5a');for(let j=0;j<4;j++)G.cone(b('lel'),[W('lel')[0]-.045+j*.03,W('lel')[1]-.14,0],.008,.04,'#9a9a9a',3);}
 if(bf=='conductor'){G.box(b('head'),[0,hd[1]+.16,0],.15,.15,.05,'#161a2c');G.box(b('head'),[0,hd[1]+.14,.07],.14,.05,.008,'#0a0a10');G.box(b('hips'),[0,.4,0],.22,.15,.24,top);for(let i=0;i<3;i++)G.box(b('chest'),[.04,.8-i*.05,.067],.012,.004,.012,'#c0a040');}
 if(bf=='matron'){G.box(b('spine'),[0,.6,.07],.18,.004,.3,'#e8e0c8');G.box(b('hips'),[0,.4,0],.24,.16,.25,'#5a4a3a');G.box(b('head'),[0,hd[1]+.12,-.08],.08,.08,.06,'#7a7068');}
 if(S.wear>=1&&!z){G.box(b('spine'),[-.05,.62,.07],.04,.004,.05,'#5a1010');}if(S.wear>=2||z){G.box(b('chest'),[.07,.73,.068],.05,.004,.06,'#6a0e0e');G.box(b('lkn'),[.06,.15,.04],.05,.004,.06,'#6a0e0e');}
 const g=G.build();g.userData.face=faceTex(S.face);g.userData.spec=S;return cache[ck]=g;}
const MAT={};
export function makeChar(kind,key,h,ps1){const g=geom(kind,key);const ck=kind+key;
 const mats=MAT[ck]||(MAT[ck]=[ps1(new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})),ps1(new THREE.MeshLambertMaterial({map:g.userData.face}))]);
 const bones=BONES.map(([n,p,o])=>{const B=new THREE.Bone();B.name=n;B.position.set(...o);return B;});BONES.forEach(([n,p],i)=>{if(p>=0)bones[p].add(bones[i]);});
 const m=new THREE.SkinnedMesh(g,mats);m.add(bones[0]);m.updateMatrixWorld(true);m.bind(new THREE.Skeleton(bones));m.castShadow=true;m.frustumCulled=false;
 const root=new THREE.Group();const S=g.userData.spec;const sc=h*(S.age=='kid'?.68:1);root.add(m);root.scale.setScalar(sc);
 const B={};bones.forEach(x=>B[x.name]=x);root.userData={B,S,mesh:m,die:0,tris:g.userData.tris,mats};return root;}
// ---------- animation: state = {mv, run, aim, hurt, dead, grab, t, face}
export function animChar(o,st,dt){const {B,S}=o.userData,t=st.t,z=S.ztype;const r=(b,x=0,y=0,zz=0)=>B[b].rotation.set(x,y,zz);
 for(const k in B)B[k].rotation.set(0,0,0);B.hips.position.y=.5;o.userData.mesh.position.set(0,0,0);o.userData.mesh.rotation.set(0,0,0);
 const ph=t*(st.run?11:z=='runner'?10:z?4.5:7.5)+(st.seed||0),A=st.mv?(st.run||z=='runner'?1:.55):0,sn=Math.sin(ph);
 if(st.mv){r('lhip',-sn*A);r('rhip',sn*A);r('lkn',Math.max(0,sn)*A*1.3);r('rkn',Math.max(0,-sn)*A*1.3);r('lsh',sn*A*.8);r('rsh',-sn*A*.8);r('lel',-.3);r('rel',-.3);B.hips.position.y=.5+Math.abs(Math.cos(ph))*.02;if(st.run)r('spine',.25);}
 else{r('chest',Math.sin(t*2)*.03);r('lsh',0,0,.08);r('rsh',0,0,-.08);}
 if(z&&z!='crawler'){B.lsh.rotation.x=-1.3+Math.sin(t*3+(st.seed||0))*.15;B.rsh.rotation.x=-1.2+Math.cos(t*3)*.15;B.head.rotation.z=.3;B.spine.rotation.x=.2;B.chest.rotation.z=Math.sin(ph*.5)*.12;
  if(z=='screamer'&&st.atk){B.head.rotation.x=-.7;B.lsh.rotation.z=1.2;B.rsh.rotation.z=-1.2;B.lsh.rotation.x=0;B.rsh.rotation.x=0;}
  if(z=='spitter'&&st.atk)B.neck.rotation.x=.6;if(z=='bloater')B.spine.rotation.x=-.1;}
 if(z=='crawler'){o.userData.mesh.rotation.x=1.35;o.userData.mesh.position.set(0,.1,-.35);B.lsh.rotation.x=-2.6+Math.sin(ph)*.6;B.rsh.rotation.x=-2.6-Math.sin(ph)*.6;B.head.rotation.x=-1.0;B.lhip.rotation.x=.1;B.rhip.rotation.x=.2;B.lkn.rotation.x=.3;}
 if(st.aim){r('lsh',-1.5,.25);r('rsh',-1.5,-.35);r('lel',0);r('rel',0);B.chest.rotation.y=.1;}
 if(st.atk&&!z){r('rsh',-2.2);r('rel',-.6);B.chest.rotation.y=-.4;}
 if(st.grab){r('lsh',-1.6,.4);r('rsh',-1.6,-.4);B.spine.rotation.x=-.25;}
 if(S.kind=='boss'){const f=S.f,w=Math.sin(t*1.7+(st.seed||0));B.lsh.rotation.z=.35+w*.08;B.rsh.rotation.z=-.35-w*.08;B.spine.rotation.x=.15;B.head.rotation.x=.1+w*.05;
  if(f=='fur'){B.spine.rotation.x=.55;B.chest.rotation.x=.2;B.head.rotation.x=-.5;B.lsh.rotation.x=-.9;B.rsh.rotation.x=-.9;}
  if(f=='listener'){B.head.rotation.z=Math.sin(t*.8)*.4;B.neck.rotation.x=.3;}
  if(f=='first'){B.lsh.rotation.z=1.1+w*.1;B.rsh.rotation.z=-1.1-w*.1;o.userData.mesh.position.y=.06+Math.sin(t*2)*.04;}
  if(f=='choir'){B.chest.rotation.y=Math.sin(t*1.3)*.25;B.head.rotation.x=-.4;}
  if(f=='surgeon'){B.lel.rotation.x=-.8;B.rel.rotation.x=-.8;B.lsh.rotation.x=-.5;B.rsh.rotation.x=-.5;}
  if(st.atk){const k=Math.sin(t*14);B.lsh.rotation.x=-2.4+k*.6;B.rsh.rotation.x=-2.4-k*.6;B.spine.rotation.x=.4;B.chest.rotation.y=k*.3;}
  if(st.rage){B.chest.rotation.z=Math.sin(t*30)*.04;B.head.rotation.y=Math.sin(t*23)*.15;}}
 if(st.hurt){B.spine.rotation.x=-.35;B.head.rotation.x=-.4;B.lsh.rotation.z=.6;B.rsh.rotation.z=-.6;}
 o.userData.die=st.dead?Math.min(1,o.userData.die+dt*2.2):0;const d=o.userData.die;if(d>0){const e=d*d;o.userData.mesh.rotation.x=-e*1.5;o.userData.mesh.position.y=e*.06;B.lkn.rotation.x=d*.6;B.lsh.rotation.z=d*1.2;B.rsh.rotation.z=-d*1.4;B.head.rotation.y=d*.7;}
 if(S.age=='old')B.spine.rotation.x+=.22;
 if(st.face!=null)o.rotation.y+=((st.face-o.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI)*Math.min(1,dt*12);}
export const CHAR_INFO={BONES:BONES.length};
