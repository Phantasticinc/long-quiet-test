// Native 3D character builder: skinned humanoids (~800-1500 tris), 17-bone skeleton,
// per-character face/costume atlas (128px), procedural animation layer.
import {THREE,psx,G} from './gfx.js';

const B=['hips','spine','chest','neck','head','shL','uaL','faL','hL','shR','uaR','faR','hR','thL','shinL','ftL','thR','shinR','ftR'];
const BI=Object.fromEntries(B.map((b,i)=>[b,i]));
const PARENT={spine:'hips',chest:'spine',neck:'chest',head:'neck',shL:'chest',uaL:'shL',faL:'uaL',hL:'faL',shR:'chest',uaR:'shR',faR:'uaR',hR:'faR',thL:'hips',shinL:'thL',ftL:'shinL',thR:'hips',shinR:'thR',ftR:'shinR'};
function joints(b){ // bind-pose joint world positions (feet at y=0, facing +z)
  const w=b.w||1;
  return {hips:[0,.95,0],spine:[0,1.08,0],chest:[0,1.27,0],neck:[0,1.47,0],head:[0,1.55,0],
    shL:[.07*w,1.42,0],uaL:[.2*w,1.41,0],faL:[.23*w,1.13,0],hL:[.25*w,.89,.01],
    shR:[-.07*w,1.42,0],uaR:[-.2*w,1.41,0],faR:[-.23*w,1.13,0],hR:[-.25*w,.89,.01],
    thL:[.1*w,.92,0],shinL:[.105*w,.5,0],ftL:[.11*w,.08,0],thR:[-.1*w,.92,0],shinR:[-.105*w,.5,0],ftR:[-.11*w,.08,0]};
}
const UV={cloth:[.52,.02,.96,.46],face:[0,.5,.5,1],skin:[.52,.52,.6,.6],flat:[.7,.52,.72,.54],skinTex:[.62,.52,.68,.58],hair:[.52,.72,.96,.98],metal:[.02,.02,.46,.46]};

// ---- geometry helpers: return {pos[],nrm[],uv[],idx[]} chunks ----
function tube(p0,p1,r0,r1,seg,rings,opt={}){
  const a=new THREE.Vector3(...p0),b=new THREE.Vector3(...p1),dir=b.clone().sub(a),len=dir.length();dir.normalize();
  const up=Math.abs(dir.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
  const ux=new THREE.Vector3().crossVectors(dir,up).normalize(),uz=new THREE.Vector3().crossVectors(ux,dir).normalize();
  const pos=[],nrm=[],uv=[],idx=[],sx=opt.sx||1,sz=opt.sz||1;
  for(let j=0;j<=rings;j++){const t=j/rings,r=r0+(r1-r0)*t+(opt.bulge?Math.sin(t*Math.PI)*opt.bulge:0);
    const c=a.clone().addScaledVector(dir,len*t);
    for(let i=0;i<=seg;i++){const th=i/seg*Math.PI*2,cx=Math.cos(th),cz=Math.sin(th);
      const n=ux.clone().multiplyScalar(cx*sx).addScaledVector(uz,cz*sz);
      pos.push(c.x+n.x*r,c.y+n.y*r,c.z+n.z*r); n.normalize(); nrm.push(n.x,n.y,n.z); uv.push(i/seg,t);}}
  for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const k=j*(seg+1)+i;idx.push(k,k+seg+1,k+1,k+1,k+seg+1,k+seg+2);}
  if(opt.cap!==false){ // end caps (fan)
    for(const [ring,flip,pt] of [[0,1,a],[rings,0,b]]){const ci=pos.length/3;pos.push(pt.x,pt.y,pt.z);const dn=dir.clone().multiplyScalar(flip?-1:1);nrm.push(dn.x,dn.y,dn.z);uv.push(.5,.5);
      for(let i=0;i<seg;i++){const k=ring*(seg+1)+i;flip?idx.push(ci,k,k+1):idx.push(ci,k+1,k);}}}
  return {pos,nrm,uv,idx};
}
function geoChunk(geo,m){geo=geo.toNonIndexed?geo:geo;if(m)geo.applyMatrix4(m);const g=geo.index?geo:geo;
  return {pos:[...g.attributes.position.array],nrm:[...g.attributes.normal.array],uv:[...g.attributes.uv.array],idx:g.index?[...g.index.array]:[...Array(g.attributes.position.count).keys()]};}
function box(c,s,rot){const g=new THREE.BoxGeometry(s[0],s[1],s[2]);const m=new THREE.Matrix4();m.compose(new THREE.Vector3(...c),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot||[0,0,0]))),new THREE.Vector3(1,1,1));return geoChunk(g,m);}
function ball(c,r,ws=8,hs=6,sc){const g=new THREE.SphereGeometry(r,ws,hs);const m=new THREE.Matrix4().compose(new THREE.Vector3(...c),new THREE.Quaternion(),new THREE.Vector3(...(sc||[1,1,1])));return geoChunk(g,m);}
function cone(c,r,h,seg=8,rot){const g=new THREE.ConeGeometry(r,h,seg,1);const m=new THREE.Matrix4().compose(new THREE.Vector3(...c),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot||[0,0,0]))),new THREE.Vector3(1,1,1));return geoChunk(g,m);}
function cyl(c,r0,r1,h,seg=8,rot,open){const g=new THREE.CylinderGeometry(r0,r1,h,seg,1,!!open);const m=new THREE.Matrix4().compose(new THREE.Vector3(...c),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot||[0,0,0]))),new THREE.Vector3(1,1,1));return geoChunk(g,m);}

class Builder{
  constructor(){this.P=[];this.N=[];this.U=[];this.C=[];this.I=[];this.SI=[];this.SW=[];}
  add(ch,bone,col,reg='cloth',blend){
    const base=this.P.length/3,c=new THREE.Color(col),r=reg==='raw'?[0,0,1,1]:(UV[reg]||UV.cloth),b=BI[bone],pb=blend?BI[blend.bone]:b;
    for(let i=0;i<ch.pos.length/3;i++){
      this.P.push(ch.pos[i*3],ch.pos[i*3+1],ch.pos[i*3+2]);this.N.push(ch.nrm[i*3],ch.nrm[i*3+1],ch.nrm[i*3+2]);
      this.U.push(r[0]+(r[2]-r[0])*(ch.uv[i*2]%1.0001),r[1]+(r[3]-r[1])*(ch.uv[i*2+1]%1.0001));this.C.push(c.r,c.g,c.b);
      let w=0; if(blend){const y=ch.pos[i*3+1];w=y>blend.y?Math.min(.5,(y-blend.y)/blend.d*.5):0;}
      this.SI.push(b,pb,0,0);this.SW.push(1-w,w,0,0);}
    for(const k of ch.idx)this.I.push(base+k);
  }
  head(c,r,reg){ // face-mapped head: front hemisphere maps to face atlas
    const g=new THREE.SphereGeometry(r,12,10);const p=g.attributes.position,uv=g.attributes.uv,col=[];
    const F=UV.face;
    for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      y*=1.12; if(y<-r*.3){x*=.85;z*=.92;} if(z<0)z*=1.05; // jaw taper, skull depth
      p.setXYZ(i,x+c[0],y+c[1],z+c[2]);
      if(z>-r*.1){uv.setXY(i,F[0]+(F[2]-F[0])*(.5+x/(r*2.1)),F[1]+(F[3]-F[1])*(.5+y/(r*2.5)));}
      else uv.setXY(i,UV.skinTex[0]+.02,UV.skinTex[1]+.02);}
    g.computeVertexNormals();return geoChunk(g);
  }
  build(J,mat){
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.N,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(this.U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(this.C,3));
    g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(this.SI,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(this.SW,4));
    g.setIndex(this.I);
    const bones=B.map(n=>{const b=new THREE.Bone();b.name=n;return b;});
    B.forEach((n,i)=>{const j=J[n];if(PARENT[n]){const pj=J[PARENT[n]];bones[i].position.set(j[0]-pj[0],j[1]-pj[1],j[2]-pj[2]);bones[BI[PARENT[n]]].add(bones[i]);}else bones[i].position.set(...j);});
    const mesh=new THREE.SkinnedMesh(g,mat);mesh.add(bones[0]);mesh.bind(new THREE.Skeleton(bones));
    mesh.castShadow=true;mesh.frustumCulled=false;mesh.userData.tris=this.I.length/3;return mesh;
  }
}

// ---- face / atlas texture ----
function atlas(d){
  const S=128,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
  // cloth noise region (bottom-right in uv => canvas top-left flipped: uv y up, canvas y down)
  const reg=(r)=>[r[0]*S,(1-r[3])*S,(r[2]-r[0])*S,(r[3]-r[1])*S];
  let R=d.seed||7;const rnd=()=>{R=(R*16807)%2147483647;return R/2147483647;};
  g.fillStyle='#fff';g.fillRect(0,0,S,S);
  let [x,y,w,h]=reg(UV.cloth);for(let i=0;i<900;i++){const v=200+rnd()*55|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x+rnd()*w,y+rnd()*h,2,2);}
  g.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<6;i++){g.beginPath();g.moveTo(x,y+i*h/6);g.lineTo(x+w,y+i*h/6);g.stroke();}
  [x,y,w,h]=reg(UV.hair);for(let i=0;i<140;i++){g.fillStyle=`rgba(0,0,0,${.1+rnd()*.3})`;g.fillRect(x+rnd()*w,y+rnd()*h,1,4+rnd()*6);}
  [x,y,w,h]=reg(UV.metal);g.fillStyle='#ddd';g.fillRect(x,y,w,h);for(let i=0;i<8;i++){g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x,y+i*8,w,1);}
  [x,y,w,h]=reg(UV.skinTex);g.fillStyle=d.skin;g.fillRect(x,y,w,h);
  // face
  [x,y,w,h]=reg(UV.face);const sk=d.skin,f=d.face||{};
  g.fillStyle=sk;g.fillRect(x,y,w,h);
  const sh=(a)=>`rgba(0,0,0,${a})`;
  g.fillStyle=sh(.12);g.fillRect(x,y+h*.78,w,h*.22);g.fillRect(x,y,w*.08,h);g.fillRect(x+w*.92,y,w*.08,h);
  const cx=x+w/2,ey=y+h*.44;
  if(d.zombie){g.fillStyle='rgba(60,80,40,.35)';for(let i=0;i<20;i++)g.fillRect(x+rnd()*w,y+rnd()*h,3+rnd()*5,2+rnd()*4);}
  // brows
  g.fillStyle=f.brow||d.hairCol||'#222';const bt=f.angry?2:0;
  g.fillRect(cx-17,ey-9+bt,11,3);g.fillRect(cx+6,ey-9+bt,11,3);
  if(f.angry){g.fillRect(cx-8,ey-7,3,2);g.fillRect(cx+5,ey-7,3,2);}
  // eyes
  const eyeW=f.narrow?8:9,eyeH=f.narrow?3:5;
  for(const s of[-1,1]){const ex=cx+s*11-eyeW/2;
    if(f.blind){g.fillStyle='#ccc8b8';g.fillRect(ex,ey-1,eyeW,eyeH);continue;}
    g.fillStyle=d.zombie?'#d8d0a0':'#f2eee6';g.fillRect(ex,ey-2,eyeW,eyeH);
    g.fillStyle=d.zombie?(f.eye||'#c02010'):(f.eye||'#2a1a10');g.fillRect(ex+eyeW/2-2,ey-2,4,eyeH);
    if(!d.zombie){g.fillStyle='#000';g.fillRect(ex+eyeW/2-1,ey-1,2,2);g.fillStyle='#fff';g.fillRect(ex+eyeW/2,ey-2,1,1);}
    g.fillStyle=sh(.25);g.fillRect(ex,ey-3,eyeW,1);}
  if(f.glasses){g.strokeStyle='#111';g.lineWidth=1.5;g.strokeRect(cx-17,ey-5,13,10);g.strokeRect(cx+4,ey-5,13,10);g.beginPath();g.moveTo(cx-4,ey-1);g.lineTo(cx+4,ey-1);g.stroke();}
  // nose
  g.fillStyle=sh(.22);g.fillRect(cx-1,ey+2,3,9);g.fillRect(cx-4,ey+10,8,2);
  // mouth
  const my=y+h*.72;
  if(f.mouth==='open'||d.zombie){g.fillStyle='#2a0806';g.fillRect(cx-7,my-2,14,f.mouth==='scream'?10:5);g.fillStyle='#d8d0b0';g.fillRect(cx-6,my-2,12,1);}
  else{g.fillStyle=f.lip||'#7a3a34';g.fillRect(cx-7,my,14,2);if(f.smile){g.fillRect(cx-8,my-1,2,2);g.fillRect(cx+6,my-1,2,2);}}
  if(f.mouth==='scream'){g.fillStyle='#1a0302';g.fillRect(cx-8,my-4,16,14);}
  if(f.beard){g.fillStyle=f.beard;g.globalAlpha=.75;g.fillRect(x+w*.12,y+h*.66,w*.76,h*.3);g.globalAlpha=1;g.fillStyle=sk;g.fillRect(cx-7,my-1,14,4);g.fillStyle='#5a2a24';g.fillRect(cx-6,my,12,2);}
  if(f.age==='elder'){g.fillStyle=sh(.18);g.fillRect(cx-19,ey+5,8,1);g.fillRect(cx+11,ey+5,8,1);g.fillRect(cx-12,my-4,1,7);g.fillRect(cx+11,my-4,1,7);g.fillRect(cx-10,y+h*.18,20,1);}
  if(f.scar){g.fillStyle='#8a3a3a';g.fillRect(cx+12,ey-12,2,22);}
  if(f.freckles){g.fillStyle=sh(.2);for(let i=0;i<10;i++)g.fillRect(cx-16+rnd()*32,ey+5+rnd()*6,1,1);}
  if(f.blush){g.fillStyle='rgba(200,80,80,.18)';g.fillRect(cx-20,ey+6,8,5);g.fillRect(cx+12,ey+6,8,5);}
  if(f.mask){g.fillStyle=f.mask;g.fillRect(x+w*.14,y+h*.6,w*.72,h*.32);g.fillStyle=sh(.15);g.fillRect(x+w*.14,y+h*.68,w*.72,1);g.fillRect(x+w*.14,y+h*.78,w*.72,1);}
  if(d.blood){g.fillStyle='rgba(110,10,10,.8)';for(let i=0;i<5;i++)g.fillRect(cx-14+rnd()*28,my-2+rnd()*12,2+rnd()*3,4+rnd()*10);}
  // hair fringe
  if(d.hair&&d.hair!=='bald'){g.fillStyle=d.hairCol;const fr=d.hair==='bangs'?h*.3:d.hair==='long'||d.hair==='bun'?h*.18:h*.14;
    g.fillRect(x,y,w,fr);g.fillRect(x,y,w*.1,h*.5);g.fillRect(x+w*.9,y,w*.1,h*.5);if(d.hair==='side'){g.fillRect(x,y,w*.6,h*.24);}}
  const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;t.flipY=true;return t;
}

// ---- costume/extras library (original designs) ----
const EX={
  satchel(b,d,J){b.add(box([-.05,1.0,.0],[.36,.03,.24],[0,0,.9]),'chest','#5a3a22');b.add(box([.2,.92,.04],[.08,.22,.26]),'hips','#6a4428');b.add(box([.25,.95,.1],[.02,.08,.1]),'hips','#c8a040','flat');},
  patches(b,d){b.add(box([0,1.33,.155],[.12,.06,.012]),'chest','#d8c040','flat');b.add(box([.21,1.32,0],[.012,.07,.07]),'uaL','#c03030','flat');b.add(box([-.21,1.32,0],[.012,.07,.07]),'uaR','#3060c0','flat');},
  cap(b,d){b.add(cyl([0,1.79,0],.125,.13,.08,10),'head',d.hatCol||'#304060');b.add(box([0,1.76,.14],[.2,.015,.1]),'head',d.hatCol||'#304060');},
  nonla(b,d){b.add(cone([0,1.84,0],.32,.18,14),'head','#d8c690');b.add(tube([.1,1.62,.08],[0,1.75,0],.006,.006,3,1),'head','#ddd','flat');b.add(tube([-.1,1.62,.08],[0,1.75,0],.006,.006,3,1),'head','#ddd','flat');},
  scrubCap(b,d){b.add(ball([0,1.72,-.01],.125,10,5,[1,.75,1.05]),'head','#3a7a8a');},
  stetho(b){b.add(tube([.08,1.45,.08],[.05,1.25,.15],.008,.008,4,2),'chest','#222','flat');b.add(tube([-.08,1.45,.08],[-.05,1.25,.15],.008,.008,4,2),'chest','#222','flat');b.add(ball([0,1.2,.16],.025,6,4),'chest','#bbb','metal');},
  badge(b,d){b.add(box([-.09,1.32,.15],[.06,.08,.01]),'chest','#eee','flat');},
  sheepskin(b,d){b.add(tube([0,1.5,0],[0,1.42,0],.2,.24,12,1),'chest','#e8dcc0','hair');b.add(tube([.2,1.05,0],[.2,1.13,0],.07,.07,8,1,{cap:false}),'faL','#e8dcc0','hair');b.add(tube([-.2,1.05,0],[-.2,1.13,0],.07,.07,8,1,{cap:false}),'faR','#e8dcc0','hair');},
  furhat(b,d){b.add(cyl([0,1.78,0],.15,.14,.14,10),'head',d.hatCol||'#5a4030','hair');b.add(box([.13,1.66,0],[.04,.12,.12]),'head',d.hatCol||'#5a4030','hair');b.add(box([-.13,1.66,0],[.04,.12,.12]),'head',d.hatCol||'#5a4030','hair');},
  hivis(b,d){b.add(tube([0,1.42,0],[0,1.0,0],.172,.165,12,2,{cap:false,sz:.8}),'chest','#d8f020');for(const y of[1.1,1.22])b.add(tube([0,y,0],[0,y-.03,0],.176,.176,12,1,{cap:false,sz:.8}),'chest','#e0e0e0','metal');},
  hardhat(b,d){b.add(ball([0,1.74,0],.135,10,5,[1,.7,1.1]),'head','#e8d020');b.add(cyl([0,1.72,0],.16,.16,.015,12),'head','#e8d020');},
  parka(b,d){b.add(tube([0,1.6,-.06],[0,1.48,-.02],.16,.15,12,1,{cap:false}),'neck','#2a3a50','hair');b.add(tube([0,1.62,-.02],[0,1.58,-.02],.17,.17,12,1,{cap:false}),'neck','#c8b898','hair');},
  headphones(b){b.add(tube([.13,1.66,0],[-.13,1.66,0],.012,.012,4,4,{bulge:.08}),'head','#222','flat');b.add(cyl([.135,1.64,0],.04,.04,.03,8,[0,0,Math.PI/2]),'head','#333');b.add(cyl([-.135,1.64,0],.04,.04,.03,8,[0,0,Math.PI/2]),'head','#333');},
  trench(b,d){for(const s of[1,-1])b.add(tube([s*.1,.95,0],[s*.13,.5,0],.13,.15,8,2,{cap:false,sz:.9}),s>0?'thL':'thR',d.topCol);b.add(tube([0,1.46,0],[0,1.4,0],.2,.19,10,1,{cap:false}),'chest',d.topCol);},
  recorder(b){b.add(box([.27,.84,.05],[.04,.1,.07]),'hL','#222','metal');},
  apron(b,d){b.add(box([0,.85,.14],[.3,.5,.02]),'hips',d.apron||'#ddd');},
  scarf(b,d){b.add(tube([0,1.5,0],[0,1.44,0],.11,.12,10,1,{cap:false}),'neck',d.scarf||'#8a2a2a');},
  // zombie / boss pieces
  rags(b,d){b.add(box([.08,.8,.12],[.1,.2,.01],[0,0,.3]),'hips',d.topCol);b.add(box([-.12,1.0,.14],[.08,.14,.01],[0,0,-.4]),'spine',d.topCol);},
  armor(b,d){b.add(box([0,1.27,.13],[.32,.34,.06]),'chest','#2a2e34','metal');b.add(box([0,1.27,-.13],[.3,.32,.05]),'chest','#2a2e34','metal');b.add(box([.22,1.4,0],[.12,.07,.16]),'uaL','#2a2e34','metal');b.add(box([-.22,1.4,0],[.12,.07,.16]),'uaR','#2a2e34','metal');b.add(box([.1,.5,.08],[.11,.14,.05]),'shinL','#2a2e34','metal');b.add(box([-.1,.5,.08],[.11,.14,.05]),'shinR','#2a2e34','metal');},
  helmet(b){b.add(ball([0,1.72,0],.145,10,6,[1,.9,1.05]),'head','#24282c','metal');b.add(box([0,1.65,.13],[.22,.1,.03]),'head','#6a8aa0','metal');},
  belly(b,d){b.add(ball([0,1.08,.07],.27,12,8,[1,1.05,1.0]),'spine',d.skin2||d.skin);for(let i=0;i<4;i++)b.add(ball([(i%2?.1:-.12),1.0+i*.06,.3-i*.02],.05+i*.01,6,4),'spine','#8a9a40');},
  ice(b){for(const [bn,c] of [['uaL',[.22,1.3,.05]],['uaR',[-.22,1.25,.03]],['chest',[.08,1.38,.14]],['head',[.08,1.78,0]],['thL',[.12,.75,.07]]])b.add(cone(c,.035,.12,5,[.3,0,.4]),bn,'#d8f0ff','metal');},
  weed(b){for(let i=0;i<6;i++){const x=(i%3-1)*.12,z=i<3?.15:-.15;b.add(tube([x,1.3-i*.03,z],[x*1.2,.9-i*.05,z*1.1],.012,.006,3,2),'chest','#3a5a2a','hair');}},
  throat(b,d){b.add(ball([0,1.48,.06],.09,8,6,[1,.8,1]),'neck',d.skin2||'#9aa060');},
  jaw(b,d){b.add(box([0,1.57,.06],[.12,.08,.09],[.5,0,0]),'head',d.skin);},
  ribs(b){for(let i=0;i<3;i++)b.add(box([0,1.18+i*.06,.155],[.18,.012,.02]),'chest','#d8d0b0','flat');},
  pipe(b){b.add(tube([.25,.85,.05],[.3,.85,.7],.04,.04,6,1),'hR','#6a5040','metal');},
  net(b){for(let i=0;i<5;i++){b.add(tube([-.3,1.6-i*.2,.2],[.3,1.4-i*.2,.22],.01,.01,3,3,{bulge:.05}),'chest','#a09060','hair');b.add(tube([-.25+i*.12,1.7,.21],[-.2+i*.12,.6,.22],.01,.01,3,3),'chest','#a09060','hair');}
    b.add(ball([.3,1.1,.2],.08,8,6),'spine','#d04020');b.add(ball([-.28,.9,.18],.07,8,6),'hips','#e0d0b0');},
  gown(b,d){b.add(tube([0,1.42,0],[0,.4,0],.19,.3,12,3,{cap:false,sz:.85}),'chest',d.gown||'#7a9a8a');},
  scalpels(b){b.add(cone([.27,.62,.1],.02,.32,4,[Math.PI,0,0]),'hL','#d0d8e0','metal');b.add(cone([-.27,.62,.1],.02,.32,4,[Math.PI,0,0]),'hR','#d0d8e0','metal');},
  fur(b){for(let i=0;i<8;i++){const a=i/8*Math.PI*2;b.add(cone([Math.cos(a)*.18,1.4,Math.sin(a)*.14-.04],.05,.18,4,[Math.sin(a)*.5-.4,0,-Math.cos(a)*.6]),'chest','#c8d0d8','hair');}},
  ears(b){b.add(box([.18,1.7,0],[.06,.22,.16],[0,0,-.5]),'head','#8a7a6a');b.add(box([-.18,1.7,0],[.06,.22,.16],[0,0,.5]),'head','#8a7a6a');},
  longarms(b,d){b.add(tube([.25,.89,.01],[.27,.55,.05],.035,.02,6,2),'hL',d.skin);b.add(tube([-.25,.89,.01],[-.27,.55,.05],.035,.02,6,2),'hR',d.skin);for(const s of[1,-1])for(let i=0;i<3;i++)b.add(cone([s*(.25+i*.02),.5,.04+i*.02],.01,.08,3,[Math.PI,0,0]),s>0?'hL':'hR','#e0d8c0','flat');},
  heads(b,d){b.add(ball([.2,1.55,-.05],.1,10,8),'chest',d.skin);b.add(ball([-.2,1.5,-.03],.09,10,8),'chest',d.skin);b.add(ball([0,1.3,.18],.08,10,8),'chest',d.skin);for(const c of[[.22,1.56,.05],[-.18,1.51,.05],[0,1.3,.26]])b.add(box(c,[.04,.025,.01]),'chest','#200','flat');},
  capthat(b){b.add(cyl([0,1.79,0],.13,.135,.07,10),'head','#e8e8e0');b.add(box([0,1.75,.14],[.2,.015,.1]),'head','#111');b.add(box([0,1.8,.13],[.06,.03,.01]),'head','#d0a030','flat');},
  chain(b){for(let i=0;i<8;i++)b.add(box([-.25,.85-i*.1,.02],[.04,.06,.02],[0,i%2?Math.PI/2:0,0]),'hR','#555','metal');b.add(box([-.25,.05,.02],[.25,.08,.04]),'hR','#444','metal');},
  visor(b){b.add(box([0,1.66,.14],[.22,.14,.02]),'head','#88a8c0','metal');b.add(box([0,1.74,0],[.27,.06,.28]),'head','#2a2e34','metal');b.add(box([.1,1.3,.155],[.06,.09,.01]),'chest','#fff','flat');},
  hood(b,d){b.add(ball([0,1.7,-.03],.16,10,6,[1,1.1,1.1]),'head',d.hood||'#6a5a48','hair');b.add(tube([0,1.6,0],[0,1.5,0],.2,.22,12,1,{cap:false}),'neck','#d8d0c0','hair');},
  snares(b){for(let i=0;i<3;i++)b.add(tube([-.15+i*.15,1.0,.16],[-.1+i*.15,.75,.18],.008,.008,3,3,{bulge:.03}),'hips','#aaa','metal');},
  lantern(b){b.add(cyl([-.27,.7,.05],.06,.06,.14,6),'hR','#e0a040','flat');b.add(tube([-.27,.88,.05],[-.27,.78,.05],.006,.006,3,1),'hR','#333');},
  condcap(b){b.add(cyl([0,1.78,0],.13,.12,.08,10),'head','#1a2a4a');b.add(box([0,1.74,.13],[.2,.015,.08]),'head','#111');},
  nursecap(b){b.add(box([0,1.8,.02],[.18,.07,.12]),'head','#e8e8e0');b.add(box([0,1.81,.085],[.04,.04,.01]),'head','#c02020','flat');},
  sacs(b){for(let i=0;i<6;i++)b.add(ball([Math.sin(i)*.2,1.0+i*.08,(i%2?-.18:.17)],.07+.02*(i%3),7,5),'chest','#a0a850');},
  void(b){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;b.add(tube([Math.cos(a)*.15,1.4,Math.sin(a)*.1],[Math.cos(a)*.6,1.8+Math.sin(i*2)*.3,Math.sin(a)*.4],.04,.01,5,3),'chest','#1a1a22','hair');}b.add(ball([0,1.68,.12],.03,6,4),'head','#f0f0ff','flat');},
  truckerCap(b,d){b.add(cyl([0,1.78,0],.125,.13,.07,10),'head','#7a2a2a');b.add(box([0,1.75,.14],[.2,.015,.1]),'head','#7a2a2a');},
  dogtag(b){b.add(box([0,1.36,.16],[.03,.04,.01]),'chest','#ccc','metal');},
};

// Main build. d: {skin,hairCol,hair,topCol,botCol,shoeCol,build:{h,w,bulk},face:{},extras:[],zombie,top:'jacket'|'tshirt'|'scrubs'|'coat'|'dress',seed}
// Geometry key: identifies a body/costume shape so a Blender-refined GLB can replace it.
export function geoKey(d){const b=d.build||{};return [d.top,d.hair,d.female?1:0,(d.extras||[]).join('+'),b.w||1,b.bulk||1,d.belt?1:0,d.sleeve||'',d.gloves?1:0].join('|');}
export const GLB={map:new Map()};
// AI-art characters: Blender GLBs built from AI model sheets (tools/art). key -> {geo,map,joints}
export const ART=new Map();
const ZART={walker:'walker',crawler:'walker',runner:'screamer',bloater:'bloater',screamer:'screamer'};
export function artKey(d){return d.art||(d.zombie&&!d.art&&d.art!==null?ZART[d.ztype]:null)||null;}
function buildArt(d,a){const bd=d.build||{},J=a.joints;
  const g=a.geo.clone();const map=a.jn.map(n=>Math.max(0,B.indexOf(n)));const si=g.attributes.skinIndex;for(let i=0;i<si.array.length;i++)si.array[i]=map[si.array[i]];
  const mat=psx(new THREE.MeshLambertMaterial({map:a.map}));
  const bones=B.map(n=>{const b=new THREE.Bone();b.name=n;return b;});
  B.forEach((n,i)=>{const j=J[n];if(PARENT[n]){const pj=J[PARENT[n]];bones[i].position.set(j[0]-pj[0],j[1]-pj[1],j[2]-pj[2]);bones[BI[PARENT[n]]].add(bones[i]);}else bones[i].position.set(...j);});
  const m=new THREE.SkinnedMesh(g,mat);m.add(bones[0]);m.bind(new THREE.Skeleton(bones));m.castShadow=true;m.frustumCulled=false;m.userData.tris=(g.index?g.index.count:g.attributes.position.count)/3;m.userData.art=1;
  const root=new THREE.Group();root.add(m);m.scale.setScalar((bd.h||1)*1.05);
  const ang=s=>{const u=J['ua'+s],h=J['h'+s];return -Math.atan2(h[0]-u[0],-(h[1]-u[1]));};
  root.userData={mesh:m,bones:Object.fromEntries(bones.map(x=>[x.name,x])),tris:m.userData.tris,def:d,mat,hy:J.hips[1],armL:ang('L'),armR:ang('R'),art:artKey(d)};
  root.userData.base=Object.fromEntries(bones.map(x=>[x.name,x.quaternion.clone()]));return root;}
export function buildChar(d){
  {const a=ART.get(artKey(d));if(a)return buildArt(d,a);}
  const bd=d.build||{},w=bd.w||1,bulk=bd.bulk||1,J=joints(bd),b=new Builder();
  const top=d.topCol||'#555',bot=d.botCol||'#334',sk=d.skin||'#c8a080',shoe=d.shoeCol||'#222',sl=d.sleeve||(d.top==='tshirt'||d.top==='scrubs'?'short':'long');
  // pelvis & torso (lathe-like tubes)
  b.add(tube([0,.84,0],[0,1.0,0],.15*w*bulk,.15*w*bulk,10,1,{sz:.75}),'hips',bot);
  b.add(tube([0,1.0,0],[0,1.2,0],.15*w*bulk,.16*w*bulk,10,2,{sz:.72,bulge:.01*bulk,cap:false}),'spine',top,'cloth',{bone:'hips',y:1.08,d:.1});
  b.add(tube([0,1.18,0],[0,1.45,0],.165*w*bulk,.17*w,10,3,{sz:.68,bulge:.015,cap:true}),'chest',top,'cloth',{bone:'spine',y:1.25,d:.1});
  if(d.female)b.add(tube([0,1.27,.03],[0,1.36,.03],.13*w,.12*w,10,1,{sz:.75,bulge:.025,cap:false}),'chest',top);
  b.add(tube([0,1.44,0],[0,1.58,0],.055,.05,8,1,{cap:false}),'neck',d.collarCol&&false||sk,'skin');
  b.add(b.head([0,1.68,.005],.115),'head','#ffffff','raw');
  // hair
  const hc=d.hairCol||'#1a1410';
  if(d.hair&&d.hair!=='bald'){
    b.add(ball([0,1.705,-.015],.124,10,6,[1.02,.95,1.05]),'head',hc,'hair');
    if(d.hair==='long')b.add(tube([0,1.66,-.06],[0,1.28,-.1],.12,.09,8,2,{sz:.6,cap:false}),'head',hc,'hair');
    if(d.hair==='bun')b.add(ball([0,1.77,-.11],.06,8,6),'head',hc,'hair');
    if(d.hair==='spiky')for(let i=0;i<6;i++)b.add(cone([Math.cos(i)*.07,1.8,Math.sin(i)*.07-.02],.04,.09,4,[Math.sin(i)*.4,0,Math.cos(i)*.4]),'head',hc,'hair');
    if(d.hair==='tail')b.add(tube([0,1.7,-.12],[0,1.45,-.16],.035,.02,6,2),'head',hc,'hair');
  }
  // ears + nose
  for(const s of[1,-1])b.add(ball([s*.115,1.67,0],.025,5,4,[.5,1,.8]),'head',sk,'skin');
  b.add(cone([0,1.66,.12],.022,.05,4,[Math.PI/2,0,0]),'head',sk,'skin');
  // arms
  for(const s of['L','R']){const sg=s==='L'?1:-1;
    b.add(ball([sg*.19*w,1.41,0],.065*bulk,8,5),'ua'+s,top);
    b.add(tube(J['ua'+s],J['fa'+s],.055*bulk,.047*bulk,8,2),'ua'+s,sl==='short'?sk:(d.sleeveCol||top),sl==='short'?'skin':'cloth',{bone:'chest',y:1.36,d:.06});
    if(sl==='short')b.add(tube(J['ua'+s],[J['ua'+s][0]+sg*.01,1.3,0],.064*bulk,.06*bulk,8,1,{cap:false}),'ua'+s,top);
    b.add(tube(J['fa'+s],J['h'+s],.046*bulk,.036,8,2),'fa'+s,(sl==='long'?(d.sleeveCol||top):sk),sl==='long'?'cloth':'skin',{bone:'ua'+s,y:1.1,d:.05});
    if(sl==='long')b.add(tube([J['h'+s][0],.93,.01],[J['h'+s][0],.9,.01],.045,.045,8,1,{cap:false}),'fa'+s,d.cuff||'#333');
    // hand: palm + thumb + finger block
    b.add(box([J['h'+s][0],.84,.01],[.035,.09,.07]),'h'+s,d.gloves||sk,'skin');
    b.add(box([J['h'+s][0]-sg*.005,.86,.05],[.025,.05,.022],[-.3,0,0]),'h'+s,d.gloves||sk,'skin');
  }
  // legs
  for(const s of['L','R']){
    const longCoat=d.top==='coat'||d.top==='dress';
    b.add(tube(J['th'+s],J['shin'+s],.085*bulk,.062*bulk,8,2,{bulge:.01}),'th'+s,d.top==='dress'?sk:bot,d.top==='dress'?'skin':'cloth',{bone:'hips',y:.86,d:.06});
    b.add(tube(J['shin'+s],[J['ft'+s][0],.13,0],.06*bulk,.045,8,2,{bulge:.008}),'shin'+s,d.top==='dress'?sk:bot,d.top==='dress'?'skin':'cloth',{bone:'th'+s,y:.47,d:.05});
    // boot
    b.add(tube([J['ft'+s][0],.17,0],[J['ft'+s][0],.05,.01],.05,.052,8,1),'ft'+s,shoe);
    b.add(box([J['ft'+s][0],.035,.06],[.09,.07,.2]),'ft'+s,shoe);
    if(longCoat&&s==='L'){} // coat skirt handled in extras
  }
  if(d.top==='jacket'||d.top==='coat'){b.add(box([0,1.3,.122],[.02,.3,.02]),'chest',d.trim||'#222','flat');b.add(tube([0,1.45,0],[0,1.5,0],.1,.09,10,1,{cap:false}),'chest',top);}
  if(d.top==='coat')for(const s of['L','R'])b.add(tube([s==='L'?.09:-.09,.98,0],[s==='L'?.13:-.13,.55,-.01],.12,.14,8,2,{cap:false,sz:.95}),'th'+s,top);
  if(d.top==='dress')b.add(tube([0,1.0,0],[0,.55,0],.17,.27,10,2,{cap:false,sz:.85}),'hips',top);
  if(d.belt)b.add(tube([0,.99,0],[0,.95,0],.155*w*bulk,.155*w*bulk,10,1,{sz:.76,cap:false}),'hips',d.belt);
  for(const e of d.extras||[])EX[e]&&EX[e](b,d,J);
  const map=atlas(d);
  const mat=psx(new THREE.MeshLambertMaterial({map,vertexColors:true}));
  const m=b.build(J,mat);
  const rk=GLB.map.get(geoKey(d));if(rk)swapGeo(m,rk);
  const root=new THREE.Group();root.add(m);m.scale.setScalar(bd.h||1);root.userData={mesh:m,bones:Object.fromEntries(m.skeleton.bones.map(x=>[x.name,x])),tris:m.userData.tris,def:d,mat};
  root.userData.base=Object.fromEntries(m.skeleton.bones.map(x=>[x.name,x.quaternion.clone()]));
  return root;
}

// ---- procedural animation (writes bone rotations each frame) ----
const _e=new THREE.Euler();
function R(b,x,y,z){b.rotation.set(x||0,y||0,z||0);}
export function animate(c,st,t,amt=1){
  const B=c.userData.bones; if(!B)return; const s=st.state||'idle',ph=st.ph||0;
  for(const k in B)if(k!=='hips')B[k].rotation.set(0,0,0);
  const HY=c.userData.hy||.95,hk=HY/.95;B.hips.position.y=HY;B.hips.rotation.set(0,0,0);
  const sn=Math.sin,br=sn(t*2)*.03;
  R(B.uaL,0,0,.08);R(B.uaR,0,0,-.08);
  if(s==='idle'){R(B.chest,br,0,0);R(B.head,-br,sn(t*.7)*.15,0);R(B.faL,-.15);R(B.faR,-.15);}
  else if(s==='walk'||s==='run'){const k=s==='run'?1.3:.75;
    R(B.thL,sn(ph)*.6*k);R(B.thR,-sn(ph)*.6*k);R(B.shinL,Math.max(0,-sn(ph+1.2))*1.0*k);R(B.shinR,Math.max(0,sn(ph+1.2))*1.0*k);
    R(B.uaL,-sn(ph)*.5*k,0,.08);R(B.uaR,sn(ph)*.5*k,0,-.08);R(B.faL,-.3-(s==='run'?.9:0));R(B.faR,-.3-(s==='run'?.9:0));
    R(B.spine,s==='run'?.25:.05,sn(ph)*.1,0);B.hips.position.y=HY+Math.abs(sn(ph))*.03*k;R(B.ftL,-Math.max(0,sn(ph))*.3);R(B.ftR,Math.max(0,sn(ph))*-.3);}
  if(st.aim){R(B.uaR,-1.45,0,-.15);R(B.faR,-.05);R(B.uaL,-1.3,0,.45);R(B.faL,-.5,0,0);R(B.chest,0,.15,0);R(B.head,.05,-.1,0);
    if(st.recoil>0){B.uaR.rotation.x-=st.recoil*.5;B.uaL.rotation.x-=st.recoil*.4;}}
  if(s==='shamble'){R(B.thL,sn(ph)*.35);R(B.thR,-sn(ph)*.35);R(B.shinL,Math.max(0,-sn(ph))*.6);R(B.shinR,Math.max(0,sn(ph))*.6);
    R(B.uaL,-1.2+sn(ph*.5)*.15,0,.15);R(B.uaR,-1.1-sn(ph*.5)*.15,0,-.1);R(B.faL,-.2);R(B.faR,-.4);R(B.spine,.2,sn(ph)*.12,sn(ph*.5)*.1);R(B.head,.2,0,.3+sn(t)*.1);B.hips.position.y=HY-.01+Math.abs(sn(ph))*.02;}
  if(s==='sprint'){R(B.thL,sn(ph)*.9);R(B.thR,-sn(ph)*.9);R(B.shinL,Math.max(0,-sn(ph+1))*1.3);R(B.shinR,Math.max(0,sn(ph+1))*1.3);
    R(B.uaL,-.6-sn(ph)*.6,0,.4);R(B.uaR,-.6+sn(ph)*.6,0,-.4);R(B.spine,.5);R(B.head,-.3,0,sn(t*9)*.2);}
  if(s==='crawl'){B.hips.position.y=.25*hk;R(B.hips,1.45);R(B.head,-1.1,sn(t*3)*.2,0);R(B.uaL,-2.6+sn(ph)*.5,0,.2);R(B.uaR,-2.6-sn(ph)*.5,0,-.2);R(B.thL,.1,0,.1);R(B.thR,.1,0,-.1);R(B.shinL,.6);R(B.shinR,.3);}
  if(s==='attack'){const a=Math.min(1,st.at||0);R(B.uaL,-1.6-a*.4,0,.1);R(B.uaR,-1.6-a*.4,0,-.1);R(B.spine,.3+a*.3);R(B.head,.3);}
  if(s==='hit'){R(B.spine,-.35);R(B.head,-.4);R(B.uaL,.3,0,.4);R(B.uaR,.3,0,-.4);}
  if(s==='dead'){R(B.spine,.1,0,.2);R(B.head,.2,.6,.4);R(B.uaL,-.3,0,1.2);R(B.uaR,-.1,0,-1.4);R(B.faL,-.4);R(B.thL,-.2,0,.15);R(B.thR,.1,0,-.2);R(B.shinR,.5);}
  if(s==='talk'){R(B.chest,br);R(B.head,sn(t*3)*.06,sn(t*1.3)*.1,0);R(B.uaR,-.3+sn(t*2)*.15,0,-.15);R(B.faR,-.9);R(B.faL,-.15);}
  if(s==='sit'){B.hips.position.y=.5*hk;R(B.thL,-1.5);R(B.thR,-1.5);R(B.shinL,1.5);R(B.shinR,1.5);R(B.uaL,-.4,0,.1);R(B.uaR,-.4,0,-.1);R(B.faL,-.9);R(B.faR,-.9);R(B.head,.25+br);}
  if(s==='heal'){R(B.uaL,-1.0,0,-.3);R(B.faL,-1.2);R(B.uaR,-1.0,0,.3);R(B.faR,-1.2);R(B.head,.4);}
  if(s==='scream'){R(B.spine,-.3);R(B.head,-.6,sn(t*30)*.05,0);R(B.uaL,-.3,0,1.0);R(B.uaR,-.3,0,-1.0);}
  if(s==='spit'){R(B.spine,-.2+(st.at||0)*.6);R(B.head,-.3+(st.at||0)*.5);R(B.uaL,0,0,.3);R(B.uaR,0,0,-.3);}
  if(st.hunch){B.spine.rotation.x+=st.hunch;B.head.rotation.x-=st.hunch*.6;}
  if(st.limp){B.hips.rotation.z+=sn(ph)*.08;B.shinR.rotation.x+=.2;}
  if(c.userData.armL!==undefined){B.uaL.rotation.z+=c.userData.armL;B.uaR.rotation.z+=c.userData.armR;}
}

// Render a portrait (head close-up) to a 2D canvas using the main renderer.
export function portrait(renderer,c,size=96){
  const sc=new THREE.Scene();sc.background=new THREE.Color('#14141c');
  sc.add(new THREE.AmbientLight('#8890a0',1.2));const k=new THREE.DirectionalLight('#ffe8c8',2.2);k.position.set(1,1.5,2);sc.add(k);
  const r=new THREE.DirectionalLight('#6080ff',1);r.position.set(-2,.5,-1);sc.add(r);
  const p=c.parent,pos=c.position.clone(),rot=c.rotation.clone();sc.add(c);c.position.set(0,0,0);c.rotation.set(0,0,0);animate(c,{state:'idle'},0);
  c.updateMatrixWorld(true);const hb=c.userData.bones.head,hp=new THREE.Vector3();hb.getWorldPosition(hp);hp.y+=.12*(c.userData.def.build?.h||1);
  const cam=new THREE.PerspectiveCamera(28,1,.05,10);cam.position.set(hp.x+.12,hp.y+.02,hp.z+.75*(c.userData.def.build?.h||1));cam.lookAt(hp.x,hp.y,hp.z);
  const rt=new THREE.WebGLRenderTarget(size,size);renderer.setRenderTarget(rt);renderer.render(sc,cam);
  const px=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(rt,0,0,size,size,px);renderer.setRenderTarget(null);rt.dispose();
  const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d'),id=g.createImageData(size,size);
  for(let y=0;y<size;y++)id.data.set(px.subarray((size-1-y)*size*4,(size-y)*size*4),y*size*4);g.putImageData(id,0,0);
  if(p)p.add(c);else sc.remove(c);c.position.copy(pos);c.rotation.copy(rot);return cv;
}

// Replace procedural geometry with Blender-refined geometry (same bind pose + bone names).
function swapGeo(m,src){const g=src.clone();const names=m.skeleton.bones.map(b=>b.name);
  if(src.userData.jointNames){const map=src.userData.jointNames.map(n=>Math.max(0,names.indexOf(n)));const si=g.attributes.skinIndex;for(let i=0;i<si.array.length;i++)si.array[i]=map[si.array[i]];si.needsUpdate=true;}
  if(!g.attributes.color){const c=new Float32Array(g.attributes.position.count*3).fill(1);g.setAttribute('color',new THREE.BufferAttribute(c,3));}
  m.geometry.dispose();m.geometry=g;m.userData.tris=(g.index?g.index.count:g.attributes.position.count)/3;m.userData.glb=1;}
