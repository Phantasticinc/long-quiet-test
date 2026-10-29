// Procedural 32-bit era character art (original). Sprite sheets + portraits built at runtime.
// Costumes: layered, job/city details. Wear 0-3 adds blood, rips, bandages.
'use strict';
(function(){
const FW=48,FH=88,NF=8; // frames: 0 idle,1-4 walk,5 attack,6 hurt,7 down
const CAST={
 linh:{skin:'#e0b090',hair:'#1a1418',hs:'pony',top:'#c84a30',top2:'#7a2a1a',ts:'courier',pants:'#2a3448',acc:'satchel',eye:'#2a1a10',lip:'#a05050'},
 minh:{skin:'#d8a888',hair:'#141014',hs:'short',top:'#5a6a50',top2:'#38402e',ts:'trench',pants:'#3a3028',acc:'press',eye:'#2a1a10',lip:'#905048'},
 huong:{skin:'#c89070',hair:'#201814',hs:'nonla',top:'#3a6a90',top2:'#204a60',ts:'coverall',pants:'#2a5878',acc:'wrench',eye:'#2a1a10',lip:'#904848'},
 adaeze:{skin:'#6a4028',hair:'#100c0c',hs:'wrap',hairC2:'#c8a040',top:'#80b8c0',top2:'#4a8890',ts:'scrubs',pants:'#4a8890',acc:'stetho',eye:'#180c08',lip:'#6a3028'},
 yerlan:{skin:'#c89878',hair:'#2a2018',hs:'hat',hairC2:'#5a3a2a',top:'#7a5434',top2:'#4a3020',ts:'sheepskin',pants:'#2a2a30',acc:'beard',eye:'#1a1008',lip:'#8a5040'},
 jiwoo:{skin:'#e8c0a0',hair:'#181418',hs:'bob',top:'#e8b020',top2:'#906010',ts:'hivis',pants:'#30343c',acc:'helmet',eye:'#20140c',lip:'#b05860'},
 tomas:{skin:'#d8a080',hair:'#3a2418',hs:'curly',top:'#3a5a48',top2:'#26402e',ts:'parka',pants:'#3a3a48',acc:'phones',eye:'#2a1a10',lip:'#a05048'},
 courier:{skin:'#a8b0a0',hair:'#1a1418',hs:'pony',top:'#7a3a2a',top2:'#4a2018',ts:'courier',pants:'#22283a',acc:'satchel',eye:'#e8e0a0',lip:'#605858',dead:1,wear:3},
};
// alternate outfits: palette swaps over the same costume parts
const OUT=[null,{top:'#6a6a3a',top2:'#3e3e22',pants:'#4a4030'},{top:'#2a2a34',top2:'#18181e',pants:'#141418'}];
const ZOMBIE=['#8a9a80','#7a8a90','#9a9080','#a0a8b0','#8a8a9a','#90887a','#8a9a80','#8a8a90'];
const BOSS=[{body:'#8a7a78',sk:'#a8987a',f:'swollen'},{body:'#4a7a60',sk:'#7ab090',f:'nets'},{body:'#c8d8d0',sk:'#a8a0a0',f:'surgeon'},
 {body:'#d0d8e8',sk:'#9aa0a8',f:'fur'},{body:'#7a7088',sk:'#b0a8b8',f:'listener'},{body:'#6a4a78',sk:'#a890a8',f:'choir'},null,
 {body:'#16141c',sk:'#e8e4dc',f:'first'},{body:'#2e4656',sk:'#7a9a98',f:'captain'},{body:'#c0c8c8',sk:'#9aa0a0',f:'orderly'},
 {body:'#7a5a3c',sk:'#b8d0e0',f:'trapper'},{body:'#262c44',sk:'#a0a0a8',f:'conductor'},{body:'#9a8a60',sk:'#c0b070',f:'matron'}];
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x];}
const sh=(hex,k)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<1?v*k:v+(255-v)*(k-1))));return'#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');};
const mix=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);return'#'+[16,8,0].map(s=>Math.round((A>>s&255)*(1-t)+(B>>s&255)*t).toString(16).padStart(2,'0')).join('');};
function R(x,c,a,b,w,h){x.fillStyle=c;x.fillRect(a|0,b|0,w|0,h|0);}
function E(x,c,cx,cy,rx,ry){x.fillStyle=c;for(let j=-ry;j<=ry;j++){const w=Math.round(rx*Math.sqrt(1-(j/ry)**2));x.fillRect(cx-w|0,cy+j|0,w*2+1,1);}}
function rng(s){return()=>(s=(s*16807+11)%2147483647)/2147483647;}
// one humanoid frame
function human(x,ox,d,f,zom){const cx=ox+24;let bob=0,la=0,ra=0,ll=0,rl=0,lean=(d.lean2||0),arm=0;
 if(f>=1&&f<=4){const s=[0,1,0,-1][f-1];la=s*4;ra=-s*4;ll=s*3;rl=-s*3;bob=Math.abs(s)?1:0;}
 if(f==5){arm=1;lean+=2;} if(f==6){lean-=3;bob=1;} if(zom){la=ra=0;arm=d.zarm||2;}
 const skin=zom?zom:d.skin,top=d.top,t2=d.top2,pn=d.pants;const y0=6+bob+(d.short||0);const ts=d.ts,wr=d.wear||0;
 if(f==7){E(x,'rgba(0,0,0,.35)',cx,84,18,3);R(x,pn,cx-18,78,14,6);R(x,top,cx-6,76,16,8);E(x,skin,cx+15,79,5,4);E(x,d.hair||'#222',cx+17,77,4,3);if(zom||wr)E(x,'#5a1010',cx,84,10,2);return;}
 E(x,'rgba(0,0,0,.35)',cx,85,12,3);
 // legs + boots
 const lh=22-(d.short||0);R(x,sh(pn,.8),cx-7+ll,52+y0,6,lh);R(x,pn,cx+1+rl,52+y0,6,lh);
 const boot=ts=='sheepskin'||ts=='hivis'?'#3a2a1a':ts=='scrubs'?'#e0e0e0':'#1a1414';R(x,boot,cx-8+ll,72+y0,8,4);R(x,boot,cx+1+rl,72+y0,8,4);
 if(ts=='coverall'){R(x,top,cx-7+ll,52+y0,6,lh);R(x,sh(top,.8),cx+1+rl,52+y0,6,lh);}
 // torso
 R(x,t2,cx-10+lean,30+y0,20,24);R(x,top,cx-9+lean,30+y0,15,24);
 const L=cx+lean,Y=y0;
 switch(ts){
  case 'jacket':R(x,'#e8d8b0',L-1,32+Y,1,20);R(x,sh(top,1.25),L-9,31+Y,4,6);break;
  case 'courier':R(x,'#e8d8b0',L-1,32+Y,1,20);R(x,'#d8d8c8',L-9,44+Y,18,2);R(x,'#3a6aa0',L-8,34+Y,4,4);R(x,'#e0c040',L+4,34+Y,3,3);R(x,'#f0f0f0',L+5,35+Y,1,1);R(x,sh(top,.7),L-10,52+Y,20,3);break;
  case 'trench':R(x,t2,L-10,50+Y,20,12);R(x,sh(top,1.2),L-2,30+Y,2,30);R(x,sh(top,.7),L-10,40+Y,20,2);R(x,'#d8d0c0',L-4,30+Y,8,3);break;
  case 'coverall':R(x,sh(top,.8),L-9,40+Y,18,1);R(x,'#202020',L-9,44+Y,18,2);R(x,'#3a3a3a',L-6,36+Y,5,4);R(x,'#202018',L+2,48+Y,4,3);R(x,'#202018',L-7,40+Y,2,2);break;
  case 'scrubs':R(x,sh(top,1.2),L-4,30+Y,8,4);R(x,sh(top,.8),L-8,42+Y,5,4);R(x,'#f0f0f0',L-9,30+Y,18,2);break;
  case 'sheepskin':R(x,'#e8dcc0',L-11,29+Y,22,5);R(x,'#e8dcc0',L-1,34+Y,3,22);R(x,sh(top,.75),L-10,42+Y,20,2);R(x,'#3a2818',L-10,50+Y,20,3);R(x,'#c0a040',L-1,50+Y,3,3);break;
  case 'hivis':R(x,'#e8e8d0',L-9,40+Y,18,2);R(x,'#e8e8d0',L-9,46+Y,18,2);R(x,'#3a4048',L-10,30+Y,3,24);R(x,'#3a4048',L+7,30+Y,3,24);R(x,'#4a3a20',L-10,52+Y,20,4);R(x,'#808080',L+4,52+Y,2,6);R(x,'#c03020',L-6,52+Y,3,5);break;
  case 'parka':R(x,'#c8b890',L-11,26+Y,22,5);R(x,sh(top,.75),L-9,42+Y,6,6);R(x,sh(top,.75),L+3,42+Y,6,6);R(x,'#202020',L-1,31+Y,1,24);R(x,sh(top,1.3),L+6,32+Y,2,6);break;
  case 'vest':R(x,'#e8e8d0',L-9,40+Y,18,2);R(x,'#e8e8d0',L-9,46+Y,18,2);break;
  case 'hoodie':R(x,t2,L-9,42+Y,18,6);R(x,'#e0e0e0',L-2,32+Y,1,8);R(x,'#e0e0e0',L+2,32+Y,1,8);break;
  case 'overall':R(x,'#d8d0b8',L-9,30+Y,18,8);R(x,top,L-6,30+Y,3,10);R(x,top,L+3,30+Y,3,10);break;
  case 'suit':R(x,'#e0e0e0',L-3,30+Y,6,14);R(x,'#802020',L-1,31+Y,2,12);R(x,sh(top,1.3),L-5,30+Y,2,16);R(x,sh(top,1.3),L+3,30+Y,2,16);break;
  case 'raincoat':R(x,top,L-11,50+Y,22,10);R(x,sh(top,1.25),L-9,30+Y,3,28);R(x,'#202020',L-1,32+Y,2,2);R(x,'#202020',L-1,40+Y,2,2);break;
  case 'gown':R(x,top,L-10,50+Y,20,10);for(let i=0;i<4;i++)R(x,sh(top,.8),L-8+i*5,34+Y+(i%2)*8,2,2);break;
  case 'guard':R(x,'#202830',L-10,30+Y,20,22);R(x,'#c0c0c0',L+3,34+Y,4,4);R(x,'#202020',L-10,52+Y,20,3);break;
 }
 // wear: rips, blood, bandages
 if(wr>=1){R(x,'#4a1010',L+2,36+Y,3,3);R(x,sh(pn,.55),cx+2+rl,60+Y,4,3);}
 if(wr>=2){R(x,'#6a1414',L-7,46+Y,5,4);R(x,sh(top,.5),L-9,38+Y,3,5);}
 if(wr>=3){R(x,'#5a0c0c',L-2,50+Y,6,3);R(x,sh(pn,.5),cx-6+ll,64+Y,4,4);}
 if(zom){const cnt=d.gore||6;for(let i=0;i<cnt;i++)R(x,'#5a1a1a',cx-8+((i*7)%16),34+y0+((i*11)%18),2,3);R(x,skin,cx-3,48+y0,6,5);}
 // arms
 const ac=sh(top,.85),sl=ts=='scrubs'||ts=='gown'?skin:ac;
 if(arm==1){R(x,ac,cx+8+lean,32+y0,16,6);R(x,'#202024',cx+22+lean,30+y0,8,4);R(x,skin,cx+20+lean,33+y0,4,4);R(x,ac,cx-13+lean,32+y0,5,18);}
 else if(arm==2){R(x,ac,cx-14,32+y0,6,6);R(x,ac,cx+8,32+y0,6,6);R(x,skin,cx-14,36+y0,6,14);R(x,skin,cx+8,36+y0,6,12);}
 else if(arm==3){R(x,skin,cx-15,8+y0,5,26);R(x,skin,cx+10,8+y0,5,26);R(x,ac,cx-15,26+y0,5,8);R(x,ac,cx+10,26+y0,5,8);}
 else{R(x,ac,cx-14+lean,32+y0+la/2,5,20);R(x,ac,cx+9+lean,32+y0+ra/2,5,20);if(ts=='scrubs'||ts=='gown'){R(x,skin,cx-14+lean,38+y0+la/2,5,14);R(x,skin,cx+9+lean,38+y0+ra/2,5,14);}R(x,skin,cx-14+lean,51+y0+la/2,5,5);R(x,skin,cx+9+lean,51+y0+ra/2,5,5);
  if(ts=='sheepskin'||ts=='parka'){R(x,'#e8dcc0',cx-14+lean,49+y0+la/2,5,2);R(x,'#e8dcc0',cx+9+lean,49+y0+ra/2,5,2);}
  if(ts=='coverall'){R(x,skin,cx-14+lean,44+y0+la/2,5,8);R(x,skin,cx+9+lean,44+y0+ra/2,5,8);}}
 if(wr>=2&&arm==0)R(x,'#e8e4d8',cx-14+lean,42+y0+la/2,5,3);
 // head
 const hx=cx+lean,hy=18+y0;R(x,sh(skin,.85),hx-3,hy+9,6,5);E(x,skin,hx,hy,9,11);E(x,sh(skin,.85),hx+5,hy+2,3,8);
 const ey=zom?(d.zeye||'#e8e0a0'):d.eye;R(x,'#f0f0f0',hx-6,hy,4,3);R(x,'#f0f0f0',hx+2,hy,4,3);R(x,ey,hx-5,hy,2,3);R(x,ey,hx+3,hy,2,3);
 R(x,sh(d.hair||'#333',1.1),hx-7,hy-3,5,1);R(x,sh(d.hair||'#333',1.1),hx+2,hy-3,5,1);R(x,sh(skin,.75),hx-1,hy+3,2,3);
 if(d.zmouth)E(x,'#100406',hx,hy+8,4,5);else R(x,zom?'#401818':d.lip,hx-3,hy+7,6,1+(f==6||zom?1:0));
 if(d.age=='elder'){R(x,sh(skin,.8),hx-6,hy+4,3,1);R(x,sh(skin,.8),hx+3,hy+4,3,1);}
 hair(x,d,hx,hy,zom&&!d.zhs);
 const A=d.acc;
 if(A=='glasses'||A=='press'){R(x,'#202020',hx-7,hy-1,14,1);x.strokeStyle='#202020';x.strokeRect(hx-6.5,hy-.5,5,4);x.strokeRect(hx+1.5,hy-.5,5,4);}
 if(A=='press'&&arm==0){R(x,'#c03030',L-3,30+y0,1,10);R(x,'#f0f0e0',L-5,40+y0,6,5);R(x,'#2a2a2a',cx+9+lean,54+y0+ra/2,5,7);R(x,'#c02020',cx+11+lean,55+y0+ra/2,1,1);}
 if(A=='bag'||A=='satchel'){for(let i=0;i<20;i++)R(x,'#4a3020',L+8-i,30+y0+i,2,2);R(x,'#5a3a22',L-14,44+y0,10,11);R(x,'#3a2414',L-14,44+y0,10,3);if(A=='satchel'){R(x,'#c0a040',L-10,48+y0,2,2);R(x,'#e8e8e0',L-13,51+y0,3,2);}}
 if(A=='scarf')R(x,'#c8a030',hx-8,hy+11,16,4);
 if(A=='lanyard'){R(x,'#c03030',L-3,30+y0,1,10);R(x,'#f0f0f0',L-5,40+y0,5,6);}
 if(A=='stetho'){R(x,'#2a6040',L-3,30+y0,1,10);R(x,'#c03030',L+3,30+y0,1,10);R(x,'#f0f0f0',L+1,40+y0,5,6);R(x,'#1a1a1a',hx-8,hy+11,2,8);R(x,'#1a1a1a',hx+6,hy+11,2,8);E(x,'#a0a0a8',hx-7,hy+20,2,2);}
 if(A=='beard'){R(x,d.hair,hx-7,hy+4,14,7);R(x,d.lip,hx-3,hy+7,6,1);}
 if(A=='helmet'){E(x,'#f0c020',hx,hy-7,10,5);R(x,'#f0c020',hx-11,hy-4,22,2);R(x,'#ffffa0',hx-2,hy-10,4,3);R(x,'#e04020',hx+4,hy-9,4,2);}
 if(A=='headset'||A=='phones'){R(x,'#202020',hx-10,hy-1,3,6);R(x,'#202020',hx+7,hy-1,3,6);R(x,'#202020',hx-9,hy-12,18,2);if(A=='phones'){R(x,'#c02040',hx-10,hy+1,3,2);R(x,'#202020',hx+8,hy+5,1,14);}}
 if(A=='wrench'&&arm==0){R(x,'#a0a0a8',cx+10+lean,55+y0+ra/2,3,9);R(x,'#a0a0a8',cx+9+lean,63+y0+ra/2,5,2);}
 if(A=='cap'){R(x,'#f0f0f0',hx-7,hy-12,14,4);R(x,'#c03030',hx-1,hy-12,2,3);}
 if(A=='sou'){E(x,'#e0c020',hx,hy-8,11,5);R(x,'#e0c020',hx-13,hy-4,26,3);}
 if(A=='furhat'){E(x,'#6a4a30',hx,hy-8,11,6);R(x,'#c8b088',hx-12,hy-5,24,4);}
 if(A=='cane'&&arm==0){R(x,'#6a4a2a',cx+12+lean,50+y0,2,26);}
 if(A=='bandana'){R(x,'#a02828',hx-10,hy-6,20,3);}
 if(wr>=2)R(x,'#e8e4d8',hx-9,hy-5,18,2);
 if(wr>=3){R(x,'#8a1a1a',hx+5,hy-4,3,2);}
 if(f==6){R(x,'#c02020',hx+4,hy+2,2,2);} if(d.dead){R(x,'#4a1010',hx-6,hy+9,3,6);}
}
function hair(x,d,hx,hy,zom){const h=d.hair||'#3a3030',h2=sh(h,1.35);
 const top=()=>{E(x,h,hx,hy-6,10,6);R(x,h2,hx-5,hy-10,4,1);};
 switch(zom?'zom':d.hs){
  case 'pony':top();R(x,h,hx-10,hy-6,3,10);R(x,h,hx+8,hy-4,3,12);R(x,h,hx+9,hy+6,4,14);break;
  case 'short':top();R(x,h,hx-10,hy-6,2,7);R(x,h,hx+8,hy-6,2,7);break;
  case 'bun':top();E(x,h,hx,hy-15,5,4);R(x,'#c8a030',hx-5,hy-15,10,1);break;
  case 'nonla':top();R(x,h,hx-10,hy-6,2,8);for(let j=0;j<11;j++)R(x,j%3?'#d8c890':'#b8a870',hx-1-j*1.4,hy-22+j,3+j*2.8,1);R(x,'#a03020',hx-9,hy-13,18,1);R(x,'#8a7a5a',hx-8,hy-11,1,14);R(x,'#8a7a5a',hx+7,hy-11,1,14);break;
  case 'wrap':E(x,d.hairC2,hx,hy-8,11,7);R(x,sh(d.hairC2,.7),hx-9,hy-6,18,2);E(x,d.hairC2,hx+6,hy-14,4,3);break;
  case 'hat':E(x,d.hairC2,hx,hy-8,11,6);R(x,'#e0d8c8',hx-12,hy-4,24,4);R(x,d.hairC2,hx-12,hy-2,4,10);R(x,d.hairC2,hx+8,hy-2,4,10);break;
  case 'bob':top();R(x,h,hx-11,hy-6,4,14);R(x,h,hx+7,hy-6,4,14);R(x,h,hx-8,hy-9,16,4);break;
  case 'curly':for(let i=0;i<9;i++)E(x,i%2?h:h2,hx-8+i*2,hy-8+(i%3),3,3);break;
  case 'long':top();R(x,h,hx-11,hy-6,4,22);R(x,h,hx+7,hy-6,4,22);break;
  case 'bald':R(x,sh(d.skin||'#c09070',1.1),hx-4,hy-9,6,2);break;
  case 'afro':E(x,h,hx,hy-7,13,9);E(x,h2,hx-4,hy-12,3,2);break;
  case 'zom':E(x,'#3a3430',hx-2,hy-7,8,4);R(x,'#3a3430',hx+4,hy-4,3,8);break;}}
// ---- zombies: 9 types x city skins
const SK={house:{top:'#5a4a3a',ts:'jacket',pants:'#2a2a30'},civ:{top:'#4a5a7a',ts:'hoodie',pants:'#3a3a40'},market:{top:'#a04a3a',ts:'overall',pants:'#4a4030'},
 fisher:{top:'#d0b020',ts:'raincoat',pants:'#2a3a48',acc:'sou'},nurse:{top:'#c8a0b0',ts:'scrubs',pants:'#c8a0b0',acc:'cap'},patient:{top:'#b8c8d0',ts:'gown',pants:'#b8c8d0'},
 guard:{top:'#2a3040',ts:'guard',pants:'#20242c'},herder:{top:'#6a4a30',ts:'sheepskin',pants:'#2a2a30',acc:'furhat'},trucker:{top:'#7a3a2a',ts:'jacket',pants:'#2a3040',acc:'bandana'},
 commuter:{top:'#2e2e3a',ts:'suit',pants:'#22222a'},worker:{top:'#e0a020',ts:'hivis',pants:'#30343c',acc:'helmet'}};
const TONES=['#e8c0a0','#d8a888','#c89070','#a87050','#7a4a30','#5a3420'];
function zdef(type,skin,seed){const s=SK[skin]||SK.civ,r=rng(seed*31+7);const tone=TONES[(r()*6)|0];
 let z=mix(tone,'#7a8a70',.55);const d={...s,top2:sh(s.top,.6),lip:'#401818',hair:['#3a3430','#1a1418','#6a5040','#a0a098'][(r()*4)|0],wear:2,eye:'#e8e0a0'};
 switch(type){
  case 'runner':d.lean2=3;d.zeye='#ff4040';d.wear=3;break;
  case 'bloater':z=mix(z,'#a8a070',.4);break;
  case 'riot':d.top='#24282e';d.top2='#14161a';d.ts='guard';d.pants='#1a1c20';break;
  case 'screamer':d.zarm=3;d.zmouth=1;d.hs='long';d.zhs=1;d.hair='#2a2420';break;
  case 'spitter':z=mix(z,'#7ab040',.3);d.zmouth=1;break;
  case 'drowned':z=mix(z,'#6a90a0',.5);d.hs='long';d.zhs=1;d.hair='#1a2420';d.zeye='#c0e0e0';break;
  case 'frozen':z=mix(z,'#c8e0f0',.6);d.zeye='#a0e0ff';break;}
 return{d,z};}
function zombie(x,ox,type,skin,seed,f){const {d,z}=zdef(type,skin,seed);const cx=ox+24;
 if(type=='crawler'){const s=f>=1&&f<=4?[0,2,0,-2][f-1]:0;
  if(f==7){E(x,'#5a1010',cx,84,14,2);}
  E(x,'rgba(0,0,0,.35)',cx,85,20,3);R(x,d.pants,cx+4,74,16,6);R(x,d.top,cx-10,70,18,10);R(x,'#5a1a1a',cx-4,72,3,3);
  R(x,z,cx-22,72+s,12,4);R(x,z,cx-20,78-s,10,3);E(x,z,cx-12,66,8,8);R(x,'#e8e0a0',cx-16,64,3,2);R(x,'#e8e0a0',cx-11,64,3,2);R(x,'#300808',cx-15,70,6,2);
  R(x,'#3a3430',cx-12,58,8,4);R(x,'#5a1a1a',cx+18,76,4,4);if(f==6)R(x,'#c02020',cx-12,64,4,4);return;}
 human(x,ox,d,f,z);if(f==7)return;
 const y0=6+(f>=1&&f<=4&&[0,1,0,1][f-1]?1:0),L=cx+(d.lean2||0)+(f==5?2:f==6?-3:0),hx=L,hy=18+y0;
 if(type=='bloater'){E(x,sh(z,.9),L,46+y0,15,13);E(x,z,L-2,44+y0,12,10);for(let i=0;i<6;i++)E(x,'#b0a050',L-9+(i*7)%18,38+y0+(i*5)%16,2,2);R(x,'#5a1a1a',L-3,50+y0,6,1);}
 if(type=='riot'){E(x,'#1a1c22',hx,hy-4,11,9);R(x,'#506070',hx-9,hy-2,18,7);R(x,'#9ab0c0',hx-7,hy-1,6,2);R(x,'#2a2e36',L-11,32+y0,22,6);R(x,'#2a2e36',L-10,40+y0,20,3);
  R(x,'#303844',cx-22,30+y0,6,30);R(x,'#7a90a0',cx-21,34+y0,4,4);R(x,'#c0c0c0',cx-21,46+y0,4,1);}
 if(type=='screamer'){R(x,'#200606',hx-3,hy+9,6,3);}
 if(type=='spitter'){E(x,'#8ac040',hx,hy+13,6,4);E(x,'#a0d050',hx-2,hy+12,2,2);R(x,'#9ad040',hx-1,hy+13,2,8);}
 if(type=='drowned'){for(let i=0;i<5;i++)R(x,'#2a5a3a',L-8+i*4,32+y0+(i%2)*6,2,10);R(x,'#5a8090',L-6,58+y0,1,3);R(x,'#5a8090',L+5,62+y0,1,3);E(x,'#6a8a70',L+6,40+y0,2,2);}
 if(type=='frozen'){for(let i=0;i<6;i++)R(x,'#e8f4ff',L-9+(i*5)%18,30+y0+(i*7)%22,3,2);R(x,'#d0ecff',cx-14,50+y0,2,6);R(x,'#d0ecff',cx+10,48+y0,2,8);R(x,'#d0ecff',hx-1,hy+11,2,5);E(x,'#f0f8ff',hx,hy-8,8,3);}
 if(type=='runner'){R(x,'#3a1010',L-8,32+y0,16,2);}}
// ---- bosses
function boss(x,ox,b,f){const cx=ox+48,y=(f>=1&&f<=4?[0,2,0,2][f-1]:0)+(f==6?3:0);const B=b.body,K=b.sk;
 if(f==7){E(x,'rgba(0,0,0,.35)',cx,108,40,5);E(x,B,cx,100,40,10);E(x,K,cx+36,98,10,8);return;}
 E(x,'rgba(0,0,0,.4)',cx,109,30,5);
 const tall=b.f=='first'||b.f=='conductor';
 if(tall){R(x,sh(B,.7),cx-12,74+y,8,34);R(x,sh(B,.7),cx+4,74+y,8,34);E(x,sh(B,.8),cx,54+y,20,30);E(x,B,cx-2,52+y,16,26);}
 else{R(x,sh(B,.7),cx-20,80+y,14,28);R(x,sh(B,.7),cx+6,80+y,14,28);E(x,sh(B,.8),cx,58+y,32,30);E(x,B,cx-4,56+y,26,26);}
 const ar=f==5?-14:0,aw=tall?8:14,ax=tall?30:42,al=tall?60:44;
 R(x,K,cx-ax,40+y+ar,aw,al);R(x,K,cx+ax-aw,40+y-ar,aw,al);R(x,sh(K,.6),cx-ax,36+al+y+ar,aw,8);R(x,sh(K,.6),cx+ax-aw,36+al+y-ar,aw,8);
 if(b.f!='first'){E(x,K,cx,26+y,14,14);R(x,'#ffe070',cx-8,24+y,5,4);R(x,'#ffe070',cx+3,24+y,5,4);R(x,'#300808',cx-7,32+y,14,5);for(let i=0;i<5;i++)R(x,'#e0d8c0',cx-6+i*3,32+y,1,2);}
 switch(b.f){
  case 'swollen':for(let i=0;i<8;i++)E(x,'#b08070',cx-18+(i*13)%36,44+y+(i*7)%30,4,3);R(x,'#5a4a3a',cx-24,70+y,48,6);break;
  case 'nets':x.strokeStyle='#c8b888';for(let i=0;i<8;i++){x.beginPath();x.moveTo(cx-32+i*8,30+y);x.lineTo(cx-16+i*8,90+y);x.stroke();x.beginPath();x.moveTo(cx-32,40+y+i*7);x.lineTo(cx+32,34+y+i*7);x.stroke();}break;
  case 'surgeon':R(x,'#80b0a8',cx-14,22+y,28,10);R(x,'#d0e8e0',cx-20,60+y,40,30);R(x,'#c0c0d0',cx+36,30+y-ar,4,20);R(x,'#8a2020',cx-10,64+y,20,10);break;
  case 'fur':for(let i=0;i<30;i++)R(x,i%2?'#ffffff':'#a8b0c0',cx-30+(i*17)%60,30+y+(i*11)%50,2,5);break;
  case 'listener':R(x,K,cx-20,10+y,6,20);R(x,K,cx+14,10+y,6,20);R(x,'#100810',cx-8,24+y,16,4);E(x,'#200810',cx,34+y,8,6);break;
  case 'choir':for(let i=0;i<5;i++)E(x,'#c0a8b8',cx-28+i*14,46+y+(i%2)*14,5,6);R(x,'#e8e0d0',cx-14,40+y,28,4);break;
  case 'first':E(x,K,cx,22+y,11,15);for(let i=0;i<7;i++)R(x,'#200808',cx-7+(i*5)%14,14+y+(i*3)%16,2,2);R(x,'#ff3030',cx-3,24+y,2,2);
   for(let i=0;i<6;i++)R(x,'#2a2632',cx-26+i*10,60+y+(i%2)*4,3,40);break;
  case 'captain':R(x,'#141418',cx-16,8+y,32,8);R(x,'#e8e8e0',cx-12,6+y,24,4);R(x,'#c0a040',cx-3,10+y,6,3);R(x,'#141418',cx-20,14+y,40,3);
   for(let i=0;i<10;i++)R(x,'#7a7a80',cx-30+i*6,46+y+i*3,4,3);E(x,'#c0b8a0',cx-14,70+y,3,3);E(x,'#c0b8a0',cx+10,52+y,3,3);R(x,'#c0a040',cx-20,44+y,3,3);R(x,'#c0a040',cx-20,52+y,3,3);break;
  case 'orderly':E(x,'#1a1c22',cx,20+y,16,12);R(x,'#506070',cx-12,22+y,24,8);R(x,'#9ab0c0',cx-10,23+y,8,2);R(x,'#2a2e36',cx-28,44+y,56,8);R(x,'#d03030',cx-3,58+y,6,14);R(x,'#d03030',cx-7,62+y,14,6);
   R(x,'#606870',cx-46,30+y,6,60);R(x,'#909aa0',cx-46,30+y,30,4);break;
  case 'trapper':E(x,'#5a3a24',cx,14+y,16,10);R(x,'#c8b088',cx-18,18+y,36,5);for(let i=0;i<7;i++){R(x,'#d0ecff',cx-30+i*10,26+y-i%2*6,3,12);}
   R(x,'#e8dcc0',cx-34,40+y,68,6);for(let i=0;i<6;i++)R(x,'#8a8a90',cx+28,70+y+i*5,6,2);E(x,'#6a6a70',cx+32,102+y,8,4);break;
  case 'conductor':R(x,'#141828',cx-14,8+y,28,8);R(x,'#c0a040',cx-14,14+y,28,2);R(x,'#141828',cx-18,16+y,36,3);for(let i=0;i<4;i++)R(x,'#c0a040',cx-2,40+y+i*8,4,3);
   R(x,'#3a3a40',cx+24,94+y-ar,8,2);R(x,'#ffd060',cx+22,96+y-ar,12,10);R(x,'#fff0a0',cx+25,98+y-ar,6,6);break;
  case 'matron':R(x,'#e8e0d0',cx-20,50+y,40,40);R(x,'#c0b8a8',cx-20,50+y,40,3);for(let i=0;i<7;i++)E(x,'#8ac040',cx-26+(i*13)%52,34+y+(i*9)%40,5,5);R(x,'#e8e0d0',cx-14,10+y,28,6);break;}
 if(f==6)R(x,'#c02020',cx-6,50+y,12,12);}
// ---- NPCs (civilians): seeded palette + part combos, age
function npcDef(seed,age){const r=rng(seed*977+13);const p=a=>a[(r()*a.length)|0];
 const tops=['#a04a3a','#3a6a90','#6a8a3a','#8a5a8a','#c8a040','#4a4a5a','#d07050','#3a7a7a'];
 const d={skin:p(TONES),hair:age=='elder'?p(['#d0d0d0','#a8a8a8','#e8e8e8']):p(['#141014','#3a2418','#7a5030','#c8a060','#a03020']),
  hs:age=='elder'?p(['short','bun','bald','long']):p(['short','pony','bob','curly','long','afro','bun']),top:p(tops),ts:p(['jacket','hoodie','overall','coat','raincoat','suit','parka']),
  pants:p(['#2a3448','#3a3028','#30343c','#4a4030','#2a2a30']),acc:age=='elder'?p(['cane','glasses','scarf','none']):p(['none','scarf','glasses','bandana','cap','none']),eye:'#20140c',lip:'#a05050',age};
 if(d.ts=='coat')d.ts='trench';d.top2=sh(d.top,.6);return d;}
function defOf(id){let [base,rest]=String(id).split('#');let o=0,w=0;if(rest){const q=rest.split('@');o=+q[0]||0;w=+q[1]||0;}
 if(base.startsWith('npc:')){const q=base.split(':');return npcDef(+q[1],q[2]);}
 const d={...CAST[base]};if(OUT[o])Object.assign(d,OUT[o]);if(w)d.wear=w;return d;}
function sheet(kind,id){const big=kind=='boss';const fw=big?96:FW,fh=big?112:FH;const[c,x]=cvs(fw*NF,fh);
 for(let f=0;f<NF;f++){if(big)boss(x,f*fw,BOSS[id],f);
  else if(kind=='zom'){const q=String(id).split(':');if(q.length<2){human(x,f*FW,{skin:ZOMBIE[id],top:'#5a4a3a',top2:'#2a2420',ts:'jacket',pants:'#2a2a30',lip:'#401818',hair:'#3a3430'},f,ZOMBIE[id]);}else zombie(x,f*FW,q[0],q[1],+q[2]||0,f);}
  else{const d=defOf(id);human(x,f*FW,d,f,d.dead?d.skin:0);}}
 return{c,fw,fh,nf:NF};}
function portrait(id,boss_){const[c,x]=cvs(96,96);x.fillStyle='#14121c';x.fillRect(0,0,96,96);
 const g=x.createRadialGradient(48,40,8,48,48,70);g.addColorStop(0,'rgba(200,150,90,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,96,96);
 if(boss_!=null){const s=sheet('boss',boss_);x.drawImage(s.c,0,0,96,112,-24,6,144,168);}
 else{const s=sheet(String(id).startsWith('z:')?'zom':'hero',String(id).replace(/^z:/,''));x.drawImage(s.c,0,0,48,88,-24,-14,144,264);}
 x.strokeStyle='#5a4a6a';x.lineWidth=2;x.strokeRect(1,1,94,94);return c;}
const cache={};
const HEROES=['linh','huong','adaeze','yerlan','jiwoo','tomas','minh','minh'];
window.ART={CAST,FW,FH,NF,BOSS,OUT,SK,of:{},wear:0,
 sheet(kind,id){const k=kind+id;return cache[k]||(cache[k]=sheet(kind,id));},
 portrait(id,b){const k='p'+id+b;return cache[k]||(cache[k]=portrait(id,b));},
 base:ch=>HEROES[ch],
 heroOf(ch,w){const o=ART.of[ch]||0;const ww=w==null?ART.wear:w;return HEROES[ch]+(o||ww?'#'+o+'@'+ww:'');}};
})();
