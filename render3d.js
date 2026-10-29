// 2.5D "HD-2D" renderer: low-poly 3D rooms, pixel textures, billboard sprites, dynamic lights,
// low-res render target upscaled nearest-neighbor. Reads game state only; never mutates gameplay.
import * as THREE from './lib/three.module.min.js';
import {makeChar,animChar} from './chars3d.js';
const G=window.__hm,{SP,P,solid,W,H}=G;
const cv=document.getElementById('g3');
let renderer;try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance'});}catch(e){console.warn('WebGL off, 2D fallback');}
const R3D=window.R3D={ok:!!renderer,q:G.CFG.hd??1};
if(renderer){
renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),fogC=new THREE.Color('#0f0f1b');scene.background=fogC;scene.fog=new THREE.Fog(fogC,6,15);
const VW=320,VH=568,cam=new THREE.PerspectiveCamera(50,VW/VH,.1,60);
const TIERS=[[320,568,0],[320,568,1],[480,852,1]];
const amb=new THREE.HemisphereLight('#6b6a8a','#1a0f14',.35);scene.add(amb);
const flash=new THREE.SpotLight('#ffe9b0',28,9,.55,.6,1.6);flash.castShadow=true;flash.shadow.mapSize.set(256,256);flash.shadow.bias=-.002;scene.add(flash,flash.target);
const keyL=new THREE.SpotLight('#ffc890',0,8,.5,.7,1.2),rimL=new THREE.DirectionalLight('#6080ff',0);scene.add(keyL,keyL.target,rimL,rimL.target);
const M3=()=>R3D.q>0&&G.CFG.models!==0,FACE={d:0,u:Math.PI,r:Math.PI/2,l:-Math.PI/2};let lastCut=-1,cutNow=0;R3D.tris=0;
const muzzle=new THREE.PointLight('#ffcc66',0,6,2);scene.add(muzzle);
let rt=null,post=null;
function quality(){const q=R3D.q=Math.min(2,R3D.q|0),[w,h,sh]=TIERS[q];renderer.setSize(w,h,false);rt&&rt.dispose();rt=new THREE.WebGLRenderTarget(w,h,{magFilter:THREE.NearestFilter,minFilter:THREE.NearestFilter});if(post)post.material.uniforms.res.value.set(w,h);
 renderer.shadowMap.enabled=!!sh;flash.shadow.mapSize.set(q==2?512:256,q==2?512:256);if(flash.shadow.map){flash.shadow.map.dispose();flash.shadow.map=null;}
 scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});renderer.shadowMap.type=THREE.PCFSoftShadowMap;flash.castShadow=!!sh;built=-1;}
const QN=['LOW','MED','HIGH'];R3D.toggle=()=>{R3D.q=(R3D.q+1)%3;quality();const b=document.getElementById('Q');if(b)b.textContent=QN[R3D.q];};
// PS1-style vertex snapping (wobble) for all lit materials
const SNAP={value:new THREE.Vector2(160,284)};const wob=G.CFG.ps1!==0;
function ps1(m){if(!wob)return m;m.onBeforeCompile=s=>{s.uniforms.snap=SNAP;s.vertexShader='uniform vec2 snap;\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n gl_Position.xy=floor(gl_Position.xy/gl_Position.w*snap+.5)/snap*gl_Position.w;');};return m;}
// 15-bit color + ordered dither post pass (32-bit era look)
post=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:{tex:{value:null},res:{value:new THREE.Vector2(320,568)},dith:{value:wob?1:0}},
 vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:'uniform sampler2D tex;uniform vec2 res;uniform float dith;varying vec2 v;float b(vec2 p){int x=int(mod(p.x,4.)),y=int(mod(p.y,4.));int i=x+y*4;float m[16];m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;for(int k=0;k<16;k++)if(k==i)return m[k]/16.-.5;return 0.;}void main(){vec4 c=texture2D(tex,v);c.rgb=pow(c.rgb,vec3(1./2.2));c.rgb+=dith*b(v*res)/31.;c.rgb=floor(c.rgb*31.+.5)/31.;gl_FragColor=vec4(c.rgb,1.);}',depthTest:false}));
const postScene=new THREE.Scene(),postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);postScene.add(post);
// pixel textures (procedural, original)
function pix(fn,n=16,detail=1){const c=document.createElement('canvas');const up=detail&&n==16?2:1;c.width=c.height=n*up;const x=c.getContext('2d');x.imageSmoothingEnabled=false;if(up>1){const s=document.createElement('canvas');s.width=s.height=n;fn(s.getContext('2d'),n);x.drawImage(s,0,0,n*2,n*2);const d=x.getImageData(0,0,n*2,n*2),a=d.data;for(let i=0;i<a.length;i+=4){const k=(rnd(i*.37+n)-.5)*22+((i/4)%(n*2)==0?-10:0);a[i]+=k;a[i+1]+=k;a[i+2]+=k;}x.putImageData(d,0,0);}else fn(x,n);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const rnd=(i)=>((Math.sin(i*91.7)*43758.5)%1+1)%1;
const TEX={wall:pix((x,n)=>{x.fillStyle='#3a2e3f';x.fillRect(0,0,n,n);x.fillStyle='#2a2030';for(let r=0;r<4;r++){x.fillRect(0,r*4+3,n,1);x.fillRect((r%2)*8+((r*5)%3),r*4,1,3);}for(let i=0;i<10;i++){x.fillStyle=rnd(i)>.5?'#4a3c50':'#30263a';x.fillRect(rnd(i+3)*n|0,rnd(i+7)*n|0,1,1);}}),
 wood:pix((x,n)=>{x.fillStyle='#5a3e28';x.fillRect(0,0,n,n);x.fillStyle='#4a321f';for(let i=0;i<4;i++)x.fillRect(0,i*4,n,1);for(let i=0;i<12;i++){x.fillStyle='#6a4a30';x.fillRect(rnd(i)*n|0,rnd(i+1)*n|0,2,1);}}),
 tile:pix((x,n)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#7a2030':'#4a1420';x.fillRect(i*8,j*8,8,8);}x.fillStyle='#2a0c14';x.fillRect(0,7,n,1);x.fillRect(7,0,1,n);}),
 stone:pix((x,n)=>{x.fillStyle='#2b2a33';x.fillRect(0,0,n,n);for(let i=0;i<20;i++){x.fillStyle=rnd(i)>.5?'#3a3944':'#1f1e26';x.fillRect(rnd(i+2)*n|0,rnd(i+5)*n|0,2,1);}}),
 moss:pix((x,n)=>{x.fillStyle='#2e3a1f';x.fillRect(0,0,n,n);for(let i=0;i<20;i++){x.fillStyle=rnd(i)>.5?'#3d4d28':'#222b16';x.fillRect(rnd(i+2)*n|0,rnd(i+5)*n|0,1,2);}}),
 carpet:pix((x,n)=>{x.fillStyle='#3a2a50';x.fillRect(0,0,n,n);x.fillStyle='#5a4a6a';x.fillRect(2,2,12,1);x.fillRect(2,13,12,1);x.fillStyle='#d8a040';x.fillRect(7,7,2,2);}),
 planks:pix((x,n)=>{x.fillStyle='#6a5a48';x.fillRect(0,0,n,n);x.fillStyle='#3a3028';for(let i=0;i<4;i++)x.fillRect(i*4+3,0,1,n);for(let i=0;i<8;i++){x.fillStyle='#7a6a54';x.fillRect(rnd(i)*n|0,rnd(i+1)*n|0,1,2);}}),
 metal:pix((x,n)=>{x.fillStyle='#4a5058';x.fillRect(0,0,n,n);x.fillStyle='#5a6068';for(let i=0;i<n;i+=4)for(let j=(i/4%2)*2;j<n;j+=4)x.fillRect(j,i,1,1);x.fillStyle='#30343a';x.fillRect(0,15,n,1);}),
 snow:pix((x,n)=>{x.fillStyle='#d8e0ea';x.fillRect(0,0,n,n);for(let i=0;i<14;i++){x.fillStyle=rnd(i)>.5?'#c0cad8':'#eef2f8';x.fillRect(rnd(i+2)*n|0,rnd(i+5)*n|0,2,1);}}),
 concrete:pix((x,n)=>{x.fillStyle='#55565c';x.fillRect(0,0,n,n);for(let i=0;i<18;i++){x.fillStyle=rnd(i)>.5?'#606168':'#45464c';x.fillRect(rnd(i+2)*n|0,rnd(i+5)*n|0,1,1);}x.fillStyle='#d8a040';x.fillRect(0,0,n,1);}),
 clinic:pix((x,n)=>{x.fillStyle='#a8b8b0';x.fillRect(0,0,n,n);x.fillStyle='#8a9a92';x.fillRect(0,7,n,1);x.fillRect(7,0,1,n);x.fillStyle='#6a5050';x.fillRect(rnd(3)*n|0,rnd(4)*n|0,2,1);}),
 hull:pix((x,n)=>{x.fillStyle='#2a5a6a';x.fillRect(0,0,n,n);x.fillStyle='#1a3a48';for(let i=0;i<4;i++)x.fillRect(0,i*4,n,1);x.fillStyle='#8a4a30';x.fillRect(rnd(1)*n|0,rnd(2)*n|0,3,2);}),
 ice:pix((x,n)=>{x.fillStyle='#8aa0b8';x.fillRect(0,0,n,n);x.fillStyle='#b8cce0';for(let i=0;i<6;i++)x.fillRect(rnd(i)*n|0,rnd(i+9)*n|0,3,1);x.fillStyle='#6a8098';x.fillRect(0,12,n,1);}),
 stonewall:pix((x,n)=>{x.fillStyle='#6a6458';x.fillRect(0,0,n,n);x.fillStyle='#4a453c';x.fillRect(0,5,n,1);x.fillRect(0,11,n,1);x.fillRect(5,0,1,5);x.fillRect(11,6,1,5);x.fillRect(3,12,1,4);x.fillStyle='#e8e0d0';x.fillRect(8,2,2,1);}),
 crate:pix((x,n)=>{x.fillStyle='#8a6a40';x.fillRect(0,0,n,n);x.fillStyle='#5a4428';x.strokeStyle='#5a4428';x.strokeRect(.5,.5,n-1,n-1);x.fillRect(0,7,n,2);x.fillStyle='#d8a040';x.fillRect(2,2,1,1);})};
const WALLS={brick:TEX.wall,hull:TEX.hull,clinic:TEX.clinic,ice:TEX.ice,concrete:TEX.concrete,stonewall:TEX.stonewall};
const sprTex={};function spriteTex(n,flip,white){n=sprOf(n);const k=n+flip+white;if(sprTex[k])return sprTex[k];const s=SP[n];return sprTex[k]=pix((x)=>{for(let j=0;j<s.length;j++)for(let i=0;i<s[j].length;i++){const c=s[j][i];if(c!='.'){x.fillStyle=white?'#fff':P[+c];x.fillRect(flip?s[j].length-1-i:i,j,1,1);}}},s.length);}
const sprOf=k=>SP[k]?k:'key';
function sheetTex(kind,id){const s=ART.sheet(kind,id);const t=new THREE.CanvasTexture(s.c);t.magFilter=t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.repeat.set(1/s.nf,1);return{t,s};}
function actorSprite(kind,id,h){const {t,s}=sheetTex(kind,id);const m=new THREE.SpriteMaterial({map:t,transparent:true,alphaTest:.5,fog:true});const sp=new THREE.Sprite(m);sp.scale.set(h*s.fw/s.fh,h,1);sp.center.set(.5,.03);sp.userData={t,nf:s.nf,last:{}};return sp;}
function setFrame(sp,f,flip){const t=sp.userData.t,n=sp.userData.nf;t.repeat.x=(flip?-1:1)/n;t.offset.x=(flip?f+1:f)/n;}
function animFrame(o,key,moving,attack,hurt,dead){if(dead)return 7;if(hurt)return 6;if(attack)return 5;if(moving)return 1+Math.floor(t*8+(o.x||0))%4;return 0;}const sprMat=(n)=>new THREE.SpriteMaterial({map:spriteTex(n,0,0),transparent:true,alphaTest:.5,fog:true});
function billboard(n,h){n=sprOf(n);const sp=new THREE.Sprite(sprMat(n));const s=SP[n].length/8;sp.scale.set(h*s,h*s,1);sp.center.set(.5,0);return sp;}
// camp: fire / lantern hub + barricades (built in-room, lit warm)
function campDraw(S,CH,ri){const K=S.camp,C=window.CAMP&&CAMP.C[S.ch];if(!K||!C)return;const cr=CH.rooms.findIndex(r=>r.safe);let cg=room.userData.camp;
 if(!K.on||ri!==cr){if(cg)cg.visible=false;return;}
 if(!cg){cg=room.userData.camp=new THREE.Group();room.add(cg);const[fx,fy]=C.fire;const L=new THREE.PointLight(C.kind=='campfire'?'#ff9040':'#ffd080',6,7,1.4);L.position.set(fx/16,.6,fy/16);cg.add(L);cg.userData.L=L;
  const lm=c=>ps1(new THREE.MeshLambertMaterial({color:c,flatShading:true})),em=c=>new THREE.MeshBasicMaterial({color:c});
  if(C.kind=='campfire'){for(let i=0;i<4;i++){const lg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.6,5),lm('#5a3a20'));lg.rotation.z=Math.PI/2;lg.rotation.y=i*Math.PI/4;lg.position.set(fx/16,.06,fy/16);cg.add(lg);}
   for(let i=0;i<3;i++){const fl=new THREE.Mesh(new THREE.ConeGeometry(.12-i*.03,.4+i*.1,5),em(['#ff6020','#ffa030','#ffe080'][i]));fl.position.set(fx/16,.2+i*.05,fy/16);cg.add(fl);cg.userData['f'+i]=fl;}
   for(let i=0;i<8;i++){const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.07,0),lm('#6a6a70'));st.position.set(fx/16+Math.cos(i*.785)*.32,.04,fy/16+Math.sin(i*.785)*.32);cg.add(st);}}
  else{const po=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.3,5),lm('#3a3a3a'));po.position.set(fx/16,.65,fy/16);cg.add(po);const ln=new THREE.Mesh(new THREE.BoxGeometry(.16,.22,.16),em('#ffd890'));ln.position.set(fx/16,1.2,fy/16);cg.add(ln);cg.userData.f0=ln;
   const cr2=new THREE.Mesh(new THREE.BoxGeometry(.5,.3,.4),lm('#6a5038'));cr2.position.set(fx/16+.5,.15,fy/16+.2);cg.add(cr2);}
  const D=CAMP.D;cg.userData.bars={};for(const d of Object.keys(K.bars)){const bg=new THREE.Group();const[bx,by]=D[d];const hz=d=='N'||d=='S';
   for(let i=0;i<3;i++){const pl=new THREE.Mesh(new THREE.BoxGeometry(hz?1.5:.12,.14,hz?.12:1.5),lm(['#8a6a40','#7a5a34','#6a4c2c'][i]));pl.position.set(0,.2+i*.28,0);pl.rotation[hz?'z':'x']=(i-1)*.12;pl.castShadow=true;bg.add(pl);}
   bg.position.set(bx/16+(d=='E'?.35:d=='W'?-.35:0),0,by/16+(d=='S'?.35:d=='N'?-.35:0));cg.add(bg);cg.userData.bars[d]=bg;}}
 cg.visible=true;const L=cg.userData.L;L.intensity=5+Math.sin(t*9)*1.2+Math.random()*.8;for(let i=0;i<3;i++){const f=cg.userData['f'+i];if(f)f.scale.y=1+Math.sin(t*12+i*2)*.15;}
 for(const d in cg.userData.bars){const bg=cg.userData.bars[d],hp=K.bars[d]|0;bg.children.forEach((c,i)=>c.visible=i<hp);}}
// room build
let room=new THREE.Group(),built=-1,lamps=[],actors=new Map(),items=new Map();scene.add(room);
const wallGeo=new THREE.BoxGeometry(1,1.4,1),wallMat=ps1(new THREE.MeshLambertMaterial({map:TEX.wall})),floorMats={},crateMat=new THREE.MeshLambertMaterial({map:TEX.crate});
let curCH=null,beam=null;
function build(ri,S,CH){scene.remove(room);room=new THREE.Group();scene.add(room);lamps=[];actors.clear();items.clear();const r=CH.rooms[ri],th=CH.theme;
 fogC.set(th.fog);scene.fog.near=th.weather=='snow'?4:6;scene.fog.far=th.weather=='snow'?12:15;amb.color.set(th.amb);amb.intensity=th.ambI;
 wallMat.map=WALLS[th.wall]||TEX.wall;wallMat.needsUpdate=true;
 const ft=(TEX[r.f]||TEX.stone).clone();ft.needsUpdate=true;ft.repeat.set(10,9);const floor=new THREE.Mesh(new THREE.PlaneGeometry(10,9),ps1(new THREE.MeshLambertMaterial({map:ft})));floor.rotation.x=-Math.PI/2;floor.position.set(5,0,4.5);floor.receiveShadow=true;room.add(floor);
 for(let y=0;y<9;y++)for(let x=0;x<10;x++){const isBlk=r.blk&&r.blk.some(b=>b[0]==x&&b[1]==y);if(!solid(ri,x,y))continue;
  const m=new THREE.Mesh(isBlk?new THREE.BoxGeometry(.9,.7,.9):wallGeo,isBlk?crateMat:wallMat);m.position.set(x+.5,isBlk?.35:.7,y+.5);m.castShadow=m.receiveShadow=true;
  if(!isBlk&&y==8)m.scale.y=.25,m.position.y=.17; // low front walls so the 3/4 camera sees in
  room.add(m);}
 for(const [x,y] of r.lamps||[]){const l=new THREE.PointLight(th.lamp,5,5,1.5);l.position.set(x+.5,1.3,y+.5);room.add(l);lamps.push(l);
  const bulb=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshBasicMaterial({color:'#ffd080'}));bulb.position.copy(l.position);room.add(bulb);}
 for(const [x,y] of r.win||[]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.8,.6),new THREE.MeshBasicMaterial({color:'#4a6a9a'}));w.position.set(x+.02,.9,y+.5);w.rotation.y=-Math.PI/2;room.add(w);}
 for(const [side,z] of [['S',8.9],['N',.1]])if(r.d[side]==='exit'){const door=new THREE.Mesh(new THREE.BoxGeometry(2,1.3,.2),new THREE.MeshLambertMaterial({color:'#5a3e28',emissive:'#3a1a08'}));door.position.set(5,.65,z);room.add(door);}
 if(ri==CH.tw.r){const t=billboard('tw',.6);t.position.set(CH.tw.x/16,.7,CH.tw.y/16);room.add(t);}
 if(CH.gen&&ri==CH.gen.r){const t=billboard('gen',.8);t.position.set(CH.gen.x/16,0,CH.gen.y/16);room.add(t);}
 if(th.beam&&ri==CH.rooms.length-1){beam=new THREE.SpotLight('#fff8d0',40,14,.25,.4,1);beam.position.set(5,3,4.5);room.add(beam,beam.target);}else beam=null;
 built=ri;curCH=CH;}
let hero=billboard('hero',.75),heroCh=-1;scene.add(hero);const prevP={x:0,y:0};
const bloodGeo=new THREE.BufferGeometry(),bloodPos=new Float32Array(120*3);bloodGeo.setAttribute('position',new THREE.BufferAttribute(bloodPos,3));
const bloodPts=new THREE.Points(bloodGeo,new THREE.PointsMaterial({color:'#c24040',size:2,sizeAttenuation:false}));scene.add(bloodPts);
const tracer=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:'#d8a040'}));scene.add(tracer);
const WN=300,wGeo=new THREE.BufferGeometry(),wPos=new Float32Array(WN*3);for(let i=0;i<WN;i++){wPos[i*3]=Math.random()*12-1;wPos[i*3+1]=Math.random()*5;wPos[i*3+2]=Math.random()*11-1;}
wGeo.setAttribute('position',new THREE.BufferAttribute(wPos,3));const wMat=new THREE.PointsMaterial({color:'#9ab0d0',size:1,sizeAttenuation:false,transparent:true,opacity:.7});const weather=new THREE.Points(wGeo,wMat);scene.add(weather);
function weatherTick(dt,w){weather.visible=w&&w!='none';if(!weather.visible)return;const fall={rain:6,storm:9,snow:.8,ash:.4,drip:3}[w]||1,drift={storm:2,snow:.5,ash:.3}[w]||0;
 wMat.color.set({snow:'#ffffff',ash:'#c08070',drip:'#80a0c0'}[w]||'#9ab0d0');wMat.size=w=='snow'?2:1;
 const n=w=='drip'?60:WN;wGeo.setDrawRange(0,n);for(let i=0;i<n;i++){wPos[i*3+1]-=fall*dt;wPos[i*3]+=drift*dt*Math.sin(t+i);if(wPos[i*3+1]<0){wPos[i*3+1]=5;wPos[i*3]=Math.random()*12-1;wPos[i*3+2]=Math.random()*11-1;}}wGeo.attributes.position.needsUpdate=true;}
let lightning=0;
// physics visuals
const PROPG={crate:new THREE.BoxGeometry(.6,.6,.6),barrel:new THREE.CylinderGeometry(.3,.3,.7,8),bottle:new THREE.CylinderGeometry(.06,.08,.3,6),glass:new THREE.BoxGeometry(.4,.5,.04)};
const PROPM={crate:ps1(new THREE.MeshLambertMaterial({map:TEX.crate})),barrel:ps1(new THREE.MeshLambertMaterial({color:'#a03a20'})),bottle:new THREE.MeshLambertMaterial({color:'#3a8a4a',transparent:true,opacity:.85}),glass:new THREE.MeshLambertMaterial({color:'#b8d8f0',transparent:true,opacity:.5})};
const propMeshes=new Map();
const BODYN=140,bodies=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),BODYN);bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(bodies);
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_s=new THREE.Vector3(),_p=new THREE.Vector3(),_c=new THREE.Color();
function physDraw(){const PH=window.PHYS;if(!PH)return;const seen=new Set();
 for(const p of PH.props){let m=propMeshes.get(p);if(!m){m=new THREE.Mesh(PROPG[p.k],PROPM[p.k]);m.castShadow=true;scene.add(m);propMeshes.set(p,m);}seen.add(p);
  const h={crate:.3,barrel:.35,bottle:.15,glass:.25}[p.k];m.position.set(p.x/16,h,p.y/16);m.rotation.y=p.rot;}
 for(const [p,m] of propMeshes)if(!seen.has(p)){scene.remove(m);propMeshes.delete(p);}
 const B=PH.bodies,n=Math.min(B.length,BODYN);for(let i=0;i<n;i++){const b=B[i];const sz={plank:[.25,.05,.08],shard:[.06,.02,.06],chip:[.04,.04,.04],casing:[.05,.03,.03],spark:[.05,.05,.05],rock:[.3,.25,.3]}[b.kind]||[.05,.05,.05];
  _s.set(...sz);_e.set(b.rot,b.rot*.7,0);_q.setFromEuler(_e);_p.set(b.x/16,b.z/16+sz[1]/2,b.y/16);_m.compose(_p,_q,_s);bodies.setMatrixAt(i,_m);bodies.setColorAt(i,_c.set(b.col));}
 bodies.count=n;bodies.instanceMatrix.needsUpdate=true;if(bodies.instanceColor)bodies.instanceColor.needsUpdate=true;}
const steam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.6,1.6,6,1,true),new THREE.MeshBasicMaterial({color:'#bbbbcc',transparent:true,opacity:.25,depthWrite:false}));steam.position.set(3.5,.8,1.2);scene.add(steam);
const camPos=new THREE.Vector3(5,7,10),camLook=new THREE.Vector3(5,0,4.5),tmp=new THREE.Vector3();let t=0;
const dirV={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
R3D.frame=(dt,mode,S,CH)=>{t+=dt;
 const ri=S&&mode!='title'&&mode!='select'?S.room:0;if(CH&&!CH.rooms[ri])return;if(built!==ri||curCH!==CH)build(ri,S,CH);
 const pw=!S||mode=='title'||S.power?1:0,th=CH.theme;
 for(const [i,l] of lamps.entries())l.intensity=pw*(4+Math.sin(t*13+i*3)*.6+(Math.random()<.02?-3.5:0));
 if(S&&S.flags&&S.flags.strobeOn&&mode=='play')for(const l of lamps)l.intensity=0;
 if(S&&S.flick>0)for(const [i,l] of lamps.entries())l.intensity*=(Math.sin(t*37+i)>.2||Math.random()<.1)?.08:1;
 weatherTick(dt,th.weather);if(th.weather=='storm'){lightning-=dt;if(lightning<-4-Math.random()*6)lightning=.15;amb.intensity=th.ambI+(lightning>0?2.5:0);}
 if(beam){beam.target.position.set(5+Math.cos(t*.8)*6,0,4.5+Math.sin(t*.8)*6);}
 if(S&&S.flags&&S.flags.whiteout){scene.fog.near=1;scene.fog.far=6;fogC.set('#c8d0dc');}
 let goalPos,goalLook;
 if(!S||mode=='title'||mode=='select'){goalLook=new THREE.Vector3(5,0,4.5);goalPos=new THREE.Vector3(5+Math.sin(t*.2)*7,4.5,4.5+Math.cos(t*.2)*7);hero.visible=false;}
 else{if(curCH){const hk=ART.heroOf(curCH.id-1);const hk2=hk+(M3()?'M':'S');if(heroCh!==hk2){scene.remove(hero);hero=M3()?makeChar('hero',hk,1.35,ps1):actorSprite('hero',hk,1.35);scene.add(hero);heroCh=hk2;}}const p=S.p,px=p.x/16,pz=p.y/16,fx=S.fx;hero.visible=!(p.inv0>0&&Math.floor(p.inv0*10)%2)&&mode!='over'||mode=='over';
  const mv=Math.hypot(p.x-prevP.x,p.y-prevP.y)>.05;prevP.x=p.x;prevP.y=p.y;if(p.dir=='l')hero.userData.fl=1;if(p.dir=='r')hero.userData.fl=0;
  if(hero.userData.t)setFrame(hero,animFrame(p,'p',mv,p.aim>=0||p.flash>0||p.cool>.2&&!mv,p.inv0>.8||!!S.grab,mode=='over'),hero.userData.fl);hero.position.set(px,0,pz);if(hero.material)hero.material.rotation=0;
  if(hero.isGroup)animChar(hero,{t,mv,run:mv&&!!S.chase,aim:p.aim>=0||p.flash>0,atk:p.cool>.2&&!(p.aim>=0)&&!mv,hurt:p.inv0>.8&&!S.grab,grab:!!S.grab,dead:mode=='over',face:mode=='scene'?Math.atan2(cam.position.x-px,cam.position.z-pz):FACE[p.dir]},dt);
  const d=dirV[p.dir];flash.position.set(px,.9,pz);flash.target.position.set(px+d[0]*4,0,pz+d[1]*4);
  muzzle.position.set(px+d[0]*.4,.6,pz+d[1]*.4);muzzle.intensity=p.flash>0?12:0;
  // actors
  const seen=new Set();for(const e of S.en){if(e.r!==ri||(e.hp<=0&&!((e.big||e.mb!=null)&&S.cine&&S.cine.type=='finisher')&&!(actors.get(e)&&actors.get(e).isGroup&&(e._dd=(e._dd||0)+dt)<1.4)))continue;seen.add(e);let a=actors.get(e);if(!a){const B=CH.boss;a=e.big?(CH.final?(M3()?makeChar('hero','courier',1.35*B.scale/1.2,ps1):actorSprite('hero','courier',1.35*B.scale/1.2)):M3()?makeChar('boss',B.mech=='secret'?7:CH.id-1,1.55*B.scale,ps1):actorSprite('boss',B.mech=='secret'?7:CH.id-1,1.25*B.scale)):e.mb!=null?(M3()?makeChar('boss',VAR.MID[e.mb].art,1.6,ps1):actorSprite('boss',VAR.MID[e.mb].art,1.5)):M3()?makeChar('zom',e.sk||'walker:house:1',e.t=='bloater'||e.t=='riot'?1.45:1.35,ps1):actorSprite('zom',e.sk||'walker:house:1',e.t=='crawler'?.8:e.t=='bloater'||e.t=='riot'?1.4:1.3);if(e.big&&!CH.final&&a.material)a.material.color.set(B.tint);room.add(a);actors.set(e,a);e._px=e.x;e._py=e.y;}
   const emv=Math.hypot(e.x-e._px,e.y-e._py)>.02;e._px=e.x;e._py=e.y;if(a.isGroup){animChar(a,{t,mv:emv,seed:e.x*.37,atk:e.charge>0||e.scr&&e.cd>2||(e.big||e.mb!=null)&&e.cd>2.3,rage:e.ph>=2,hurt:e.fl>0,dead:e.hp<=0&&!(S.cine&&S.cine.tape),face:Math.atan2(p.x-e.x,p.y-e.y)},dt);a.position.set(e.x/16,0,e.y/16);continue;}setFrame(a,animFrame(e,'e',emv,e.charge>0||(e.big&&e.cd>2.5),e.fl>0,e.hp<=0&&!(S.cine&&S.cine.tape)),e.x>p.x);if(e.fl>0)a.material.color.set('#ff8080');else if(!e.big||CH.final)a.material.color.set('#ffffff');if(e.spared!=null)a.material.rotation=Math.sin(t*2)*.15;a.position.set(e.x/16,0,e.y/16);a.position.y=Math.abs(Math.sin(t*4+e.x))*.03;
   if(e.big&&e.ph==2&&!CH.final)a.material.color.set('#ff9090');if(e.big&&e.ph==3)a.material.color.set('#c070ff');if(e.mb!=null&&e.ph==2&&e.fl<=0)a.material.color.set('#ffb0a0');if(e.t=='screamer'&&!e.scr)a.position.y+=Math.sin(t*20)*.01;}
  for(const n of S.npcs||[]){if(n.r!==ri)continue;seen.add(n);let a=actors.get(n);if(!a){const nk='npc:'+n.seed+':'+(n.age||'adult');a=M3()?makeChar('npc',nk,n.age=='old'?1.28:1.35,ps1):actorSprite('hero',nk,n.age=='kid'?.95:n.age=='old'?1.25:1.35);room.add(a);actors.set(n,a);}if(a.isGroup)animChar(a,{t,seed:n.seed,face:Math.atan2(p.x-n.x,p.y-n.y)},dt);else setFrame(a,0,n.x>p.x);a.position.set(n.x/16,Math.sin(t*2+n.seed)*.01,n.y/16);}
  if(S.ghost){seen.add(S.ghost);let a=actors.get(S.ghost);if(!a){a=actorSprite('hero','npc:666:adult',1.5);a.material.color.set('#000000');a.material.opacity=.85;room.add(a);actors.set(S.ghost,a);}a.material.opacity=Math.min(.85,S.ghost.t);setFrame(a,0,S.ghost.x<80);a.position.set(S.ghost.x/16,0,S.ghost.y/16);}
  campDraw(S,CH,ri);
  for(const [e,a] of actors)if(!seen.has(e)){room.remove(a);actors.delete(e);}
  for(const it of S.items){let m=items.get(it);if(it.r!==ri)continue;if(!m&&!it.got){m=billboard(it.k,.45);room.add(m);items.set(it,m);}if(m){m.visible=!it.got;m.position.set(it.x/16,.15+Math.sin(t*3)*.05,it.y/16);}}
  const bl=fx.blood;bloodGeo.setDrawRange(0,bl.length);bl.forEach((b,i)=>{bloodPos[i*3]=b.x/16;bloodPos[i*3+1]=b.z/16+.05;bloodPos[i*3+2]=b.y/16;});bloodGeo.attributes.position.needsUpdate=true;
  const s=S.shots[0];tracer.visible=!!s;if(s){tracer.geometry.setFromPoints([new THREE.Vector3(s.x1/16,.55,s.y1/16),new THREE.Vector3(s.x2/16,.55,s.y2/16)]);}
  physDraw();
  steam.visible=CH.id==1&&ri==5&&!!S.flags.steam;steam.scale.y=1+Math.sin(t*20)*.1;
  // camera: 3/4 follow, with punch-in during aim/crits/grabs
  const punch=fx.punch+(p.aim>=0?.35:0)+(S.grab?.6:0)+fx.danger*.15;
  goalLook=new THREE.Vector3(Math.min(Math.max(px,2.6),7.4),.4,Math.min(Math.max(pz,2),7));
  goalPos=goalLook.clone().add(new THREE.Vector3(0,5.4-punch*2,4.8-punch*1.6));
  const c=S.cine;if(c){const k=1-c.t/c.max;
   if(c.type=='intro'){goalLook=new THREE.Vector3(5,.5,4.5);goalPos=new THREE.Vector3(5+Math.sin(k*2.5)*6,2+k*3,4.5+Math.cos(k*2.5)*6);}            // orbit
   if(c.type=='enter'){goalPos=goalPos.clone().add(new THREE.Vector3(0,3*(1-k),2*(1-k)));}                                                         // zoom-in
   if(c.type=='finisher'){const ex=c.x/16,ez=c.y/16;goalLook=new THREE.Vector3(ex,.5,ez);goalPos=new THREE.Vector3(ex+Math.cos(k*3)*2.2,.9+k*.6,ez+Math.sin(k*3)*2.2);} // low orbit
   if(c.type=='bossintro'){goalLook=new THREE.Vector3(c.x/16,.6,c.y/16);goalPos=goalLook.clone().add(new THREE.Vector3(Math.sin(k*1.5)*2,1.2+k*2,2.5-k));}
   if(c.scene&&S.scene){const i=S.scene.i,fx2=c.x/16,fz=c.y/16,tt=Math.min(6,S.scene.t),v=(i+S.scene.s.length)%3,sh=S.scene.s[Math.min(i,S.scene.s.length-1)];
    if(sh&&sh[2]=='wide'){goalLook=new THREE.Vector3(fx2,.5,fz);goalPos=new THREE.Vector3(fx2+1.5-tt*.1,4.2,fz+3.6);}
    else if(v==0){goalLook=new THREE.Vector3(fx2,1.08,fz);goalPos=new THREE.Vector3(fx2+.35,1.18,fz+1.45-tt*.06);}          // close-up, slow push
    else if(v==1){goalLook=new THREE.Vector3(fx2,.95,fz);goalPos=new THREE.Vector3(fx2-1.25,.3,fz+1.3);}                    // low dramatic angle
    else{goalLook=new THREE.Vector3(fx2,.8,fz);goalPos=new THREE.Vector3(fx2+1.6-tt*.08,1.6,fz+1.9);}                      // three-quarter
    if(i!==lastCut){lastCut=i;cutNow=1;}}
   if(!c.scene)lastCut=-1;
   if(c.type=='scare'){goalLook=new THREE.Vector3(c.x/16,.6,c.y/16);goalPos=goalLook.clone().add(new THREE.Vector3(0,2.2,2.6));}               // snap punch
   if(c.type=='outro'){const ex=CH.exit||{x:80,y:40};goalLook=new THREE.Vector3(ex.x/16,.6,ex.y/16);goalPos=new THREE.Vector3(ex.x/16+Math.sin(k*2)*3,1+k*6,ex.y/16+(ex.y<72?3:-2.5)-k*2);}                                            // dolly up/back
   if(c.type=='death'){goalLook=new THREE.Vector3(px,0,pz);goalPos=new THREE.Vector3(px,2+k*5,pz+.3);}}                                          // crane up
  }
 const snap=S&&S.cine&&S.cine.type=='scare'?.5:.12;camPos.lerp(goalPos,Math.min(1,snap*60*dt));camLook.lerp(goalLook,Math.min(1,.15*60*dt));if(cutNow){camPos.copy(goalPos);camLook.copy(goalLook);cutNow=0;}
 const dram=S&&(mode=='scene'||S.cine&&(S.cine.type=='finisher'||S.cine.type=='bossintro'));keyL.intensity=dram?22:0;rimL.intensity=dram?1.6:0;
 if(dram){keyL.position.set(camLook.x+1.6,2.2,camLook.z+.6);keyL.target.position.copy(camLook);rimL.position.set(camLook.x-1,2,camLook.z-3);rimL.target.position.copy(camLook);}
 cam.position.copy(camPos);if(S){const sh=S.fx.shake*.25;cam.position.x+=(Math.random()-.5)*sh;cam.position.y+=(Math.random()-.5)*sh;}
 cam.lookAt(camLook);if(R3D.q>=0&&post){renderer.setRenderTarget(rt);renderer.render(scene,cam);renderer.setRenderTarget(null);post.material.uniforms.tex.value=rt.texture;renderer.render(postScene,postCam);}else renderer.render(scene,cam);};
R3D.project=(x,y)=>{tmp.set(x/16,.7,y/16).project(cam);return{x:(tmp.x+1)/2*160,y:(1-tmp.y)/2*284};};
quality();const b=document.getElementById('Q');if(b)b.textContent=QN[R3D.q];
}
