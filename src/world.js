// Environment builder: modeled 3D rooms/streets per city, PS1 textures, baked vertex lighting + dynamic lights, fog.
import {THREE,lam,tex,G} from './gfx.js';
import {PROPS} from './assets.js';
export const RW=10,RD=8,RH=3.2;
export const KITS=[
 {wall:'wallpaper',wall2:'brick',ceil:'ceiling',fog:'#0e0d16',fogD:.075,amb:'#3a3850',lamp:'#ffb060',amb2:'rain',out:['GALLERY'],weather:'rain',sky:'#0b0b14'},
 {wall:'tin',wall2:'planks',ceil:'tin',fog:'#122028',fogD:.06,amb:'#304858',lamp:'#ffc070',amb2:'sea',out:['PIER A','PIER END','FUEL DOCK','FISH MARKET'],weather:'rain',sky:'#0d1a22',water:1},
 {wall:'hosp',wall2:'hosp',ceil:'ceiling',fog:'#0c1412',fogD:.07,amb:'#3a5048',lamp:'#c8f0ff',amb2:'hum',out:['GENERATOR'],weather:'none',sky:'#000'},
 {wall:'planks',wall2:'rust',ceil:'planks',fog:'#9aa4b4',fogD:.07,amb:'#7080a0',lamp:'#ffd090',amb2:'wind',out:['STALLED CONVOY','THE PASS','SUMMIT','FUEL DEPOT'],weather:'snow',sky:'#8a94a4',ground:'snow'},
 {wall:'subway',wall2:'concrete',ceil:'concrete',fog:'#0a0c0c',fogD:.08,amb:'#304038',lamp:'#d0ffe0',amb2:'tunnel',out:['FLOOD GATE'],weather:'drip',sky:'#000'},
 {wall:'azulejo',wall2:'stone',ceil:'wood',fog:'#141a26',fogD:.06,amb:'#3a4460',lamp:'#ffb870',amb2:'chapel',out:['HARBOR STEPS','LAMP ROOM','LIGHTHOUSE BASE'],weather:'rain',sky:'#121826'},
 {wall:'plaster',wall2:'brick',ceil:'ceiling',fog:'#1a1420',fogD:.05,amb:'#4a3a50',lamp:'#ff9a50',amb2:'road',out:['GAS STATION','ROUTE 9','THE BRIDGE','TRUCK STOP'],weather:'none',sky:'#2a1a28',ground:'asphalt'},
 {wall:'rock',wall2:'stone',ceil:'rock',fog:'#050508',fogD:.1,amb:'#2a2030',lamp:'#a080ff',amb2:'void',out:['AFTER'],weather:'ash',sky:'#000'},
];
const FLOOR={tile:'tile',wood:'wood',stone:'stone',carpet:'carpet',moss:'moss'};
// prop recipes: list of [shape,size,offset,tex,color] ; shape b=box c=cyl
const P={
 table:[['b',[1.6,.08,.9],[0,.75,0],'wood'],['b',[.08,.75,.08],[-.7,.37,-.38],'wood'],['b',[.08,.75,.08],[.7,.37,-.38],'wood'],['b',[.08,.75,.08],[-.7,.37,.38],'wood'],['b',[.08,.75,.08],[.7,.37,.38],'wood']],
 longtable:[['b',[3.2,.08,1],[0,.75,0],'wood'],['b',[.1,.75,.8],[-1.4,.37,0],'wood'],['b',[.1,.75,.8],[1.4,.37,0],'wood'],['c',[.05,.25],[0,.9,0],null,'#d8c890'],['c',[.05,.2],[.8,.88,.1],null,'#d8c890']],
 chair:[['b',[.45,.06,.45],[0,.45,0],'wood'],['b',[.45,.5,.06],[0,.72,-.2],'wood'],['b',[.05,.45,.05],[-.18,.22,-.18],'wood'],['b',[.05,.45,.05],[.18,.22,.18],'wood'],['b',[.05,.45,.05],[-.18,.22,.18],'wood'],['b',[.05,.45,.05],[.18,.22,-.18],'wood']],
 shelf:[['b',[1.8,2.2,.45],[0,1.1,0],'wood','#7a5a3a'],['b',[1.7,.04,.4],[0,.6,.03],'cloth','#6a3a2a'],['b',[1.7,.35,.36],[0,1.0,.05],'cloth','#5a4a6a'],['b',[1.7,.35,.36],[0,1.5,.05],'cloth','#6a5a3a'],['b',[1.6,.35,.36],[0,1.95,.05],'cloth','#3a4a5a']],
 crate:[['b',[.8,.8,.8],[0,.4,0],'planks','#a08060']],
 barrel:[['c',[.32,.95],[0,.47,0],'rust','#7a5a40']],
 bed:[['b',[1,.45,2],[0,.3,0],'metal'],['b',[.95,.15,1.9],[0,.6,0],'cloth','#d8d8d0'],['b',[.95,.6,.06],[0,.75,-.98],'metal']],
 desk:[['b',[1.4,.08,.7],[0,.75,0],'wood'],['b',[.5,.72,.65],[-.42,.36,0],'wood'],['b',[.4,.3,.3],[.3,.94,-.1],'metal','#3a3a3a']],
 counter:[['b',[3,1,.7],[0,.5,0],'wood','#8a6a4a'],['b',[3.1,.06,.8],[0,1.02,0],'metal','#aaa']],
 locker:[['b',[1.2,1.9,.5],[0,.95,0],'metal','#5a7080']],
 pew:[['b',[2.6,.08,.5],[0,.45,0],'wood'],['b',[2.6,.6,.08],[0,.75,-.22],'wood'],['b',[.08,.45,.45],[-1.2,.22,0],'wood'],['b',[.08,.45,.45],[1.2,.22,0],'wood']],
 pillar:[['c',[.3,3.2],[0,1.6,0],'stone']],
 car:[['b',[1.8,.7,4],[0,.55,0],'metal','#6a2a2a'],['b',[1.6,.6,2],[0,1.15,-.2],'metal','#4a3a3a'],['c',[.33,.25],[.85,.33,1.3],null,'#111',[0,0,1.57]],['c',[.33,.25],[-.85,.33,1.3],null,'#111',[0,0,1.57]],['c',[.33,.25],[.85,.33,-1.3],null,'#111',[0,0,1.57]],['c',[.33,.25],[-.85,.33,-1.3],null,'#111',[0,0,1.57]],['b',[1.4,.4,.05],[0,1.15,.81],'cloth','#203040']],
 truck:[['b',[2.3,1.2,2],[0,1.1,2.2],'metal','#3a5a3a'],['b',[2.4,2.4,5],[0,1.6,-1.4],'tin','#8a8a80'],['c',[.45,.3],[1.1,.45,2.2],null,'#111',[0,0,1.57]],['c',[.45,.3],[-1.1,.45,2.2],null,'#111',[0,0,1.57]],['c',[.45,.3],[1.1,.45,-2.5],null,'#111',[0,0,1.57]],['c',[.45,.3],[-1.1,.45,-2.5],null,'#111',[0,0,1.57]]],
 boat:[['b',[1.6,.7,4.2],[0,.35,0],'planks','#2a4a7a'],['b',[1.2,.6,1],[0,1,-.8],'planks','#d8d8d0']],
 boiler:[['c',[.7,2.2],[0,1.1,0],'rust','#5a4a3a'],['c',[.12,2],[.8,1.9,0],'metal',null,[0,0,1.2]]],
 generator:[['b',[2,1.3,1.1],[0,.65,0],'metal','#5a6a4a'],['c',[.2,.6],[.6,1.6,0],'metal']],
 rocks:[['b',[1.4,1,1.2],[0,.5,0],'rock',null,[.2,.5,.1]],['b',[.8,.6,.8],[.8,.3,.5],'rock',null,[.4,.2,.3]]],
 bench:[['b',[1.6,.08,.45],[0,.45,0],'wood'],['b',[.08,.45,.4],[-.7,.22,0],'metal'],['b',[.08,.45,.4],[.7,.22,0],'metal']],
 pump:[['b',[.6,1.6,.5],[0,.8,0],'metal','#a03030'],['b',[.5,.3,.05],[0,1.3,.26],'cloth','#ddd']],
 stall:[['b',[2,.9,.8],[0,.45,0],'planks'],['b',[2.2,.05,1.2],[0,2.1,0],'cloth','#a04030'],['c',[.04,2.1],[-1,1.05,.5],'metal'],['c',[.04,2.1],[1,1.05,.5],'metal'],['b',[.4,.2,.3],[-.4,1,0],'cloth','#8a9aa0'],['b',[.4,.2,.3],[.4,1,0],'cloth','#a0b0b0']],
 gurney:[['b',[.7,.08,1.9],[0,.85,0],'metal'],['b',[.68,.1,1.8],[0,.93,0],'cloth','#c0d0c8'],['c',[.03,.8],[-.3,.42,.85],'metal'],['c',[.03,.8],[.3,.42,-.85],'metal'],['c',[.03,.8],[-.3,.42,-.85],'metal'],['c',[.03,.8],[.3,.42,.85],'metal']],
 console:[['b',[1.8,1,.7],[0,.5,0],'metal','#3a4a5a'],['b',[1.7,.5,.1],[0,1.3,-.3],'metal','#1a2a2a']],
 altar:[['b',[2,1.1,.9],[0,.55,0],'stone','#ccc'],['c',[.04,.4],[-.6,1.3,0],null,'#e8d8a0'],['c',[.04,.4],[.6,1.3,0],null,'#e8d8a0']],
 booth:[['b',[1.8,.5,.6],[0,.25,-.6],'cloth','#a02a2a'],['b',[1.8,.9,.15],[0,.7,-.85],'cloth','#a02a2a'],['b',[1.4,.06,.7],[0,.75,.1],'metal','#ddd'],['c',[.05,.75],[0,.37,.1],'metal']],
 lamppost:[['c',[.07,3.4],[0,1.7,0],'metal','#222'],['b',[.3,.3,.3],[0,3.4,0],null,'#ffe0a0']],
 train:[['b',[2.8,2.8,9],[0,1.6,0],'metal','#8a9aa0'],['b',[2.82,.5,8.6],[0,1.9,0],'cloth','#203040'],['b',[2.84,.25,9],[0,.9,0],'cloth','#2a7a4a']],
 vase:[['c',[.18,.6],[0,.3,0],'cloth','#7a8ab0']],
 fence:[['b',[.06,1.1,.06],[0,.55,0],'metal'],['b',[3,.06,.06],[0,1,0],'metal'],['b',[3,.06,.06],[0,.5,0],'metal']],
 nets:[['b',[1.2,.4,1],[0,.2,0],'cloth','#8a7a50'],['c',[.15,.15],[.4,.5,.2],null,'#d04020']],
 tank:[['c',[.9,3],[0,1.5,0],'metal','#8a8a70']],
 shelfs:[['b',[2,2,.5],[0,1,0],'metal','#6a6a6a'],['b',[.3,.3,.3],[-.5,1.2,0],'planks'],['b',[.3,.3,.3],[.4,.5,0],'planks'],['b',[.3,.3,.3],[.2,1.65,0],'planks']],
 piano:[['b',[1.5,1.2,.6],[0,.6,0],'wood','#2a1a14'],['b',[1.3,.04,.2],[0,.85,.38],'cloth','#eee']],
};
const BREAK=new Set(['crate','vase','chair','barrel']);
// room keyword -> prop list [type, slot('w' wall,'f' floor,'c' center), count]
const ROOMP=[
 [/FOYER/,[['pillar','f',2],['table','w',1],['vase','w',2],['chair','w',1]]],[/DINING/,[['longtable','c',1],['chair','f',4],['shelf','w',1]]],
 [/LIBRARY/,[['shelf','w',4],['desk','f',1],['chair','f',1]]],[/GALLERY/,[['vase','f',3],['pillar','f',2],['piano','w',1]]],
 [/STUDY/,[['desk','w',1],['shelf','w',2],['chair','f',1]]],[/CELLAR/,[['boiler','w',1],['barrel','f',3],['crate','f',3]]],
 [/MARKET/,[['stall','f',3],['crate','f',3],['barrel','f',1]]],[/PIER/,[['crate','f',3],['barrel','f',2],['nets','f',1],['boat','w',1]]],
 [/SHED/,[['nets','f',2],['crate','f',2],['boat','c',1],['shelfs','w',1]]],[/OFFICE/,[['desk','f',2],['locker','w',2],['console','w',1],['chair','f',1]]],
 [/FUEL|DEPOT/,[['tank','w',2],['barrel','f',4],['pump','f',1]]],[/WARD/,[['bed','w',4],['gurney','f',1]]],[/CORRIDOR/,[['gurney','w',2],['bench','w',1],['crate','f',1]]],
 [/SUPPLY|STOREROOM/,[['shelfs','w',3],['crate','f',3]]],[/GENERATOR/,[['generator','c',1],['barrel','f',2],['locker','w',1]]],[/THEATRE/,[['bed','c',1],['gurney','f',1],['shelfs','w',1],['lamppost','f',1]]],
 [/CONVOY/,[['truck','f',1],['car','f',1],['barrel','f',2]]],[/CAFE|DINER/,[['booth','w',3],['counter','w',1],['chair','f',2]]],[/PASS|SUMMIT/,[['rocks','f',3],['car','f',1],['fence','w',1]]],
 [/PLATFORM/,[['train','w',1],['bench','f',2],['pillar','f',2]]],[/TICKET/,[['console','w',2],['bench','f',1],['pillar','f',2]]],[/TUNNEL/,[['pillar','w',3],['crate','f',2],['barrel','f',1]]],
 [/SIGNAL/,[['console','w',2],['locker','w',2],['chair','f',1]]],[/FLOOD/,[['boiler','w',2],['barrel','f',2]]],[/STEPS/,[['lamppost','f',2],['crate','f',2],['barrel','f',1]]],
 [/CHAPEL/,[['pew','f',4],['altar','w',1]]],[/SHOP/,[['counter','w',1],['crate','f',3],['shelfs','w',1]]],[/LIGHTHOUSE|LAMP ROOM/,[['pillar','c',1],['crate','f',2],['barrel','f',1]]],
 [/GAS/,[['pump','f',2],['car','f',1],['crate','f',1]]],[/ROUTE|BRIDGE/,[['car','f',2],['fence','w',2],['barrel','f',1]]],[/TRUCK STOP/,[['truck','f',1],['barrel','f',2],['bench','w',1]]],
 [/AFTER|STAIRS|BELOW/,[['pillar','f',3],['rocks','f',2]]],
];
function hash(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))%100003;return h;}
const DIRV={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};

export function buildRoom(ci,ri,room,opts={}){
  const K=KITS[ci],g=new THREE.Group(),name=room.n,out=K.out.includes(name)||opts.outdoor;
  const statics=[],boxes=[],breakables=[],lamps=[],doors={};
  const seed=hash(name+ci);let R=seed;const rnd=()=>{R=(R*16807)%2147483647;return R/2147483647;};
  const addM=(geo,t,col,pos,rot,rep,collide=true,brk)=>{
    const tx=t?tex(t):null;if(tx&&rep){geo.attributes.uv.array.forEach((v,i,a)=>{a[i]=v*rep[i%2];});}
    const m=new THREE.Mesh(geo,lam({map:tx,color:col||'#ffffff',vertexColors:true}));m.position.set(...pos);if(rot)m.rotation.set(...rot);
    m.receiveShadow=true;m.castShadow=!!brk||false;g.add(m);statics.push(m);return m;};
  // floor / ceiling
  const fl=out?(K.ground||FLOOR[room.floor]||'concrete'):(FLOOR[room.floor]||'concrete');
  const W=out?RW+6:RW,D=out?RD+6:RD;
  const floor=addM(new THREE.PlaneGeometry(W,D,8,6),fl,null,[0,0,0],[-Math.PI/2,0,0],[W/2.5,D/2.5]);
  if(!out)addM(new THREE.PlaneGeometry(RW,RD,4,4),K.ceil,'#888',[0,RH,0],[Math.PI/2,0,0],[RW/3,RD/3]);
  if(K.water&&out){const w=new THREE.Mesh(new THREE.PlaneGeometry(60,60),lam({map:tex('water'),color:'#6a8a9a'}));w.rotation.x=-Math.PI/2;w.position.y=-.6;w.material.map.repeat.set(12,12);g.add(w);g.userData.water=w;
    floor.material.map=tex('planks');}
  // walls with door gaps
  const wh=out?1.1:RH, wt=out?(K.water?'planks':'concrete'):K.wall;
  for(const side of['N','S','E','W']){
    const horiz=side==='N'||side==='S',len=horiz?RW:RD,sx=DIRV[side][0],sz=DIRV[side][1];
    const cx=sx*RW/2,cz=sz*RD/2,dr=room.d[side];
    const segs=dr!==undefined?[[-len/2,-.8],[.8,len/2]]:[[-len/2,len/2]];
    for(const [a,b] of segs){const L=b-a,mid=(a+b)/2;
      if(out&&K.water&&dr===undefined&&side!=='S'){} // open water edge: low rail only
      const geo=new THREE.BoxGeometry(horiz?L:.2,wh,horiz?.2:L,Math.max(1,L|0),2,1);
      const m=addM(geo,wt,null,[horiz?mid:cx,wh/2,horiz?cz:mid],null,[L/2.2,wh/2.2]);
      boxes.push({x:horiz?mid:cx,z:horiz?cz:mid,hx:horiz?L/2:.15,hz:horiz?.15:L/2,h:wh});
      if(!out){const tr=addM(new THREE.BoxGeometry(horiz?L:.24,.18,horiz?.24:L),'wood','#5a3a2a',[horiz?mid:cx,.09,horiz?cz:mid],null,[L,1]);}
    }
    if(dr!==undefined){ // door frame + door panel
      const fx=horiz?0:cx,fz=horiz?cz:0;
      if(!out){addM(new THREE.BoxGeometry(horiz?1.9:.3,.3,horiz?.3:1.9),'wood','#4a2a1a',[fx,2.35,fz]);
        addM(new THREE.BoxGeometry(horiz?1.6:.1,2.2,horiz?.1:1.6),dr==='exit'?'metal':'wood',dr==='exit'?'#6a6a6a':'#6a4a30',[fx,1.1,fz]);
        if(wh>2.5)addM(new THREE.BoxGeometry(horiz?1.6:.22,RH-2.5,horiz?.22:1.6),wt,null,[fx,2.5+(RH-2.5)/2,fz]);}
      else addM(new THREE.BoxGeometry(horiz?1.6:.1,.1,horiz?.1:1.6),'metal','#c0a040',[fx,.05,fz]);
      boxes.push({x:fx,z:fz,hx:horiz?.8:.15,hz:horiz?.15:.8,h:2,door:side});
      doors[side]={to:dr,x:fx-sx*.9,z:fz-sz*.9,side};
    }
  }
  // outdoor backdrop: buildings/silhouettes beyond walls
  if(out){for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=12+rnd()*6,h=3+rnd()*7;
    addM(new THREE.BoxGeometry(3+rnd()*3,h,3),K.water?'tin':ci===3?'snow':'brick','#888',[Math.cos(a)*r,h/2,Math.sin(a)*r],[0,a,0],[2,h/2],false);}}
  // props
  const spec=(ROOMP.find(([re])=>re.test(name))||[0,[['crate','f',2],['barrel','f',1]]])[1];
  const taken=[];const free=(x,z,r)=>{if(Math.abs(x)<1.1&&Math.abs(z)>RD/2-2.2)return false;if(Math.abs(z)<1.1&&Math.abs(x)>RW/2-2.2)return false;
    if(Math.hypot(x,z)<1.3)return false;return!taken.some(t=>Math.hypot(t[0]-x,t[1]-z)<t[2]+r);};
  const propList=[];
  for(const [type,slot,count] of spec)for(let k=0;k<count;k++){
    let x=0,z=0,ry=0,ok=false;const rad=type==='train'?4:type==='truck'||type==='car'||type==='longtable'||type==='boat'?2:type==='counter'||type==='shelf'||type==='shelfs'||type==='pew'?1.3:.6;
    for(let tries=0;tries<40&&!ok;tries++){
      if(slot==='c'){x=0;z=(tries?rnd()*2-1:0)+(tries>5?2:0);ry=0;}
      else if(slot==='w'){const s=['N','S','E','W'][(rnd()*4)|0];if(s==='N'||s==='S'){x=(rnd()-.5)*(RW-2.5);z=DIRV[s][1]*(RD/2-.45-(type==='train'?1.2:0)-(type==='boat'||type==='truck'?1.2:0));ry=s==='N'?0:Math.PI;}else{z=(rnd()-.5)*(RD-2.5);x=DIRV[s][0]*(RW/2-.45-(type==='train'?1.2:0));ry=s==='W'?Math.PI/2:-Math.PI/2;}}
      else{x=(rnd()-.5)*(RW-2.4);z=(rnd()-.5)*(RD-2.4);ry=((rnd()*4)|0)*Math.PI/2+(rnd()-.5)*.4;}
      ok=free(x,z,rad*.6);if(slot==='c'&&type==='longtable')ok=true;}
    if(!ok)continue;taken.push([x,z,rad*.6]);propList.push({type,x,z,ry});
  }
  if(opts.extraProps)propList.push(...opts.extraProps);
  for(const p of propList){
    const grp=new THREE.Group();grp.position.set(p.x,0,p.z);grp.rotation.y=p.ry||0;
    const bb=new THREE.Box3();
    const AP=PROPS.get(p.type);
    if(AP){const m=new THREE.Mesh(AP.geo.clone(),lam({map:AP.map,vertexColors:true}));m.castShadow=m.receiveShadow=true;grp.add(m);statics.push(m);}
    else for(const [sh,sz,off,t,col,rot] of P[p.type]){
      const geo=sh==='b'?new THREE.BoxGeometry(...sz):new THREE.CylinderGeometry(sz[0],sz[0],sz[1],8);
      const m=new THREE.Mesh(geo,lam({map:t?tex(t):null,color:col||'#ffffff',vertexColors:true}));m.position.set(...off);if(rot)m.rotation.set(...rot);
      m.castShadow=true;m.receiveShadow=true;grp.add(m);statics.push(m);}
    g.add(grp);grp.updateMatrixWorld(true);bb.setFromObject(grp);
    const ent={x:(bb.min.x+bb.max.x)/2,z:(bb.min.z+bb.max.z)/2,hx:(bb.max.x-bb.min.x)/2,hz:(bb.max.z-bb.min.z)/2,h:bb.max.y,grp,type:p.type};
    if(BREAK.has(p.type)){ent.breakable=true;ent.hp=p.type==='barrel'?3:1;breakables.push(ent);}
    if(p.type!=='lamppost'||true)boxes.push(ent);
    if(p.type==='lamppost')lamps.push({x:p.x,y:3.2,z:p.z,col:K.lamp,r:7});
  }
  // lamps: ceiling fixtures
  const nl=out?1:(name.length%2)+1;
  for(let i=0;i<nl;i++){const x=nl===1?0:(i?2.5:-2.5),z=nl===1?-.5:0;
    if(!out){const f=new THREE.Mesh(new THREE.CylinderGeometry(.25,.35,.2,8),lam({color:'#ffeedd',emissive:K.lamp,emissiveIntensity:.8}));f.position.set(x,RH-.15,z);g.add(f);
      const cord=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.3,4),lam({color:'#111'}));cord.position.set(x,RH-.02,z);g.add(cord);lamps.push({x,y:RH-.4,z,col:K.lamp,r:8,fix:f});}
    else lamps.push({x:x+2,y:3.5,z:z-1,col:K.lamp,r:9});}
  bake(statics,lamps,K,out);
  return {group:g,boxes,breakables,lamps,doors,out,kit:K,statics,name,ci,ri};
}
// Baked lighting: per-vertex light from room lamps + hemisphere ambient + floor-contact AO.
export function bake(meshes,lamps,K,out){
  const amb=new THREE.Color(K.amb),v=new THREE.Vector3(),n=new THREE.Vector3(),c=new THREE.Color(),nm=new THREE.Matrix3();
  const lc=lamps.map(l=>({p:new THREE.Vector3(l.x,l.y,l.z),c:new THREE.Color(l.col),r:l.r}));
  for(const m of meshes){m.updateMatrixWorld(true);const geo=m.geometry,P=geo.attributes.position,N=geo.attributes.normal,col=new Float32Array(P.count*3);nm.getNormalMatrix(m.matrixWorld);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);n.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();
      c.copy(amb).multiplyScalar(.55+.25*n.y);
      for(const l of lc){const d=l.p.clone().sub(v),dist=d.length();d.normalize();const ndl=Math.max(0,n.dot(d))*.8+.2;const att=Math.max(0,1-dist/l.r);c.r+=l.c.r*ndl*att*att*1.6;c.g+=l.c.g*ndl*att*att*1.6;c.b+=l.c.b*ndl*att*att*1.6;}
      const ao=Math.min(1,.55+v.y*.6)*(out?1:Math.min(1,.6+.4*Math.min(RW/2-Math.abs(v.x),RD/2-Math.abs(v.z))));c.multiplyScalar(ao);
      col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));}
}
// Interview set: where Minh records accounts (used by cutscenes)
export function interviewSet(){const g=new THREE.Group();
  const f=new THREE.Mesh(new THREE.PlaneGeometry(6,6),lam({map:tex('wood'),vertexColors:false}));f.rotation.x=-Math.PI/2;g.add(f);
  const w=new THREE.Mesh(new THREE.BoxGeometry(6,3,.2),lam({map:tex('plaster')}));w.position.set(0,1.5,-1.6);g.add(w);
  const t=new THREE.Mesh(new THREE.BoxGeometry(1.4,.06,.8),lam({map:tex('wood')}));t.position.set(0,.75,0);g.add(t);
  const rec=new THREE.Mesh(new THREE.BoxGeometry(.3,.08,.18),lam({color:'#222'}));rec.position.set(.3,.82,.1);g.add(rec);
  const lamp=new THREE.PointLight('#ffb070',6,6,1.5);lamp.position.set(-.5,1.6,.4);g.add(lamp);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.06,6,4),new THREE.MeshBasicMaterial({color:'#ffd8a0'}));bulb.position.copy(lamp.position);g.add(bulb);
  return g;}
