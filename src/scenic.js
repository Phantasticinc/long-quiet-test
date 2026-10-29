// Scenic layer: skies, vistas, water, light shafts, particles, warm safe rooms.
// Beauty-vs-dread pacing: each chapter has calm vista rooms; safe rooms glow warm.
import {THREE,tex} from './gfx.js';
import {prop} from './assets.js';
const C=c=>new THREE.Color(c);
// per chapter: vista rooms + look
export const VISTA=[
 {rooms:['GALLERY'],name:'Hollowmere gardens, golden hour',pano:'assets/tex/sky_garden.jpg',ground:'grass',props:[['fountain',0,-9,1],['garden_tree',-8,-10,1.2],['garden_tree',9,-11,1.1],['garden_tree',-13,-3,1.3],['hedge',-4,-7,1],['hedge',4,-7,1],['bench',3,-8.5,1],['streetlamp',-6.5,-6,1],['blossom_tree',12,2,1]],top:'#3a5a8a',mid:'#e8a060',hor:'#ffd890',sun:'#fff0c0',sd:[.6,.18,-.78],sil:'trees',fx:'fireflies',shafts:1,fog:'#c89a70'},
 {rooms:['PIER A','PIER END','FUEL DOCK','FISH MARKET'],name:'Da Nang harbor sunset',props:[['basket_boat',-4,-9,1],['basket_boat',3,-12,1],['basket_boat',8,-8,.9],['fishing_boat',-9,-14,1.2],['fishing_boat',12,-18,1.2],['lantern',-3,-5.2,1,2.4],['lantern',0,-5.2,1,2.6],['lantern',3,-5.2,1,2.4],['streetlamp',-6,4.5,1]],top:'#2a2858',mid:'#d0607a',hor:'#ffa050',sun:'#ffd080',sd:[0,.08,-1],sil:'hillsCity',water:'#2a3050',lanterns:1,fx:'lanternmotes',fog:'#8a5060'},
 {rooms:['GENERATOR'],name:'Lagos lagoon at dusk',props:[['palm_tree',-8,-8,1.2],['palm_tree',9,-9,1.1],['palm_tree',-12,2,1.3],['bus_shelter',7,6,1],['streetlamp',-6,-6,1]],top:'#1e2a5a',mid:'#c8607a',hor:'#ffb060',sun:'#ffe0a0',sd:[-.7,.12,-.7],sil:'skyline',water:'#30304a',fx:'fireflies',fog:'#7a5060'},
 {rooms:['STALLED CONVOY','THE PASS','SUMMIT','FUEL DEPOT'],name:'Altai peaks under stars',props:[['pine_snow',-8,-8,1.2],['pine_snow',-11,-4,1],['pine_snow',9,-9,1.4],['pine_snow',13,-2,1.1],['yurt',-16,-16,1],['pine_snow',4,-13,1.3]],top:'#050a1e',mid:'#16264a',hor:'#4a5a80',sun:'#d0e0ff',sd:[-.4,.35,-.8],moon:1,stars:1,sil:'peaks',fx:'snow',fog:'#2a3450'},
 {rooms:['FLOOD GATE'],name:'Seoul skyline at dawn',props:[['blossom_tree',-7,-7,1.1],['blossom_tree',8,-8,1],['bench',-4,-6.5,1],['streetlamp',6,-6,1],['bus_shelter',-9,4,1]],top:'#3a4a7a',mid:'#e09aa8',hor:'#ffd0a0',sun:'#fff0d0',sd:[.8,.06,-.6],sil:'skyline',water:'#506080',fx:'petals',shafts:1,fog:'#b08a98'},
 {rooms:['HARBOR STEPS','LAMP ROOM','LIGHTHOUSE BASE'],name:'Lisbon coast from the lighthouse',props:[['lighthouse',-18,-6,1],['bench',4,-6,1],['streetlamp',-6,-6,1],['fishing_boat',8,-14,1.2],['basket_boat',-5,-12,.8]],top:'#1a3a6a',mid:'#f08a60',hor:'#ffc880',sun:'#fff0b0',sd:[-1,.1,-.2],sil:'cliffs',water:'#2a4a70',fx:'gulls',shafts:1,fog:'#a07a78'},
 {rooms:['GAS STATION','ROUTE 9','THE BRIDGE','TRUCK STOP'],name:'Route 9 at sundown',props:[['gas_pump',-7,-6,1],['gas_pump',-5.5,-6,1],['car_wreck',8,-8,1],['car_wreck',-12,4,1],['streetlamp',6,6,1],['palm_tree',12,-12,1]],top:'#24184a',mid:'#c04a6a',hor:'#ff9a40',sun:'#ffd070',sd:[0,.05,-1],sil:'mesa',fx:'motes',fog:'#704050'},
 {rooms:['AFTER'],name:'Hollowmere, the morning after',props:[['blossom_tree',-7,-8,1.2],['blossom_tree',8,-9,1.1],['fountain',0,-10,1],['bench',3,-7,1],['hedge',-4,-7,1],['garden_tree',-12,-2,1.2]],top:'#5a80b0',mid:'#f0c0a0',hor:'#fff0d0',sun:'#ffffff',sd:[.5,.3,-.8],sil:'trees',fx:'petals',shafts:1,fog:'#d0b8a8'},
];
export function vistaFor(ch,name){const v=VISTA[ch];return v&&v.rooms.includes(name)?v:null;}
function skyDome(v){const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{top:{value:C(v.top)},mid:{value:C(v.mid)},hor:{value:C(v.hor)},sun:{value:C(v.sun)},sd:{value:new THREE.Vector3(...v.sd).normalize()},stars:{value:v.stars?1:0},moon:{value:v.moon?1:0},t:{value:0}},
  vertexShader:`varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 top,mid,hor,sun,sd;uniform float stars,moon,t;varying vec3 vd;
  float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
  void main(){float y=vd.y;vec3 c=y>0.?mix(mix(hor,mid,smoothstep(0.,.18,y)),top,smoothstep(.15,.7,y)):mix(hor,hor*.35,smoothstep(0.,-.25,y));
   float s=max(dot(vd,sd),0.);float disc=moon>.5?smoothstep(.9992,.9996,s):smoothstep(.9975,.999,s);
   c+=sun*(pow(s,8.)*.45+pow(s,60.)*.6)*(1.-moon*.7)+sun*disc*1.5;
   if(stars>.5&&y>0.){vec3 q=floor(vd*260.);float st=step(.9965,h(q));c+=vec3(st)*(.6+.4*sin(t*3.+h(q+1.)*40.))*smoothstep(0.,.2,y);
     c+=vec3(.25,.3,.5)*.18*exp(-pow((vd.x*.8+vd.y-.6)*4.,2.))*smoothstep(0.,.3,y);} // faint galaxy band
   gl_FragColor=vec4(c,1.);}`});
  const d=new THREE.Mesh(new THREE.SphereGeometry(70,32,16),m);d.renderOrder=-10;return d;}
function silhouette(v,rnd){const g=new THREE.Group(),hor=C(v.hor),dark=C(v.top).multiplyScalar(.35).lerp(C('#000'),.4);
  const ring=(R,amp,base,seg,col,jag)=>{const pos=[],cols=[];const N=seg;let hs=[];for(let i=0;i<=N;i++)hs.push(base+amp*(jag(i/N)));
    for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2;const p=(a,y)=>[Math.cos(a)*R,y,Math.sin(a)*R];
      const q=[p(a0,-2),p(a1,-2),p(a1,hs[i+1]),p(a0,-2),p(a1,hs[i+1]),p(a0,hs[i])];for(const x of q){pos.push(...x);const k=Math.max(0,Math.min(1,(x[1]+2)/(base+amp+2)));const cc=col.clone().lerp(hor,.25*(1-k));cols.push(cc.r,cc.g,cc.b);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,side:THREE.DoubleSide}));g.add(m);};
  const noise=(f,o)=>x=>{let s=0;for(let k=1;k<5;k++)s+=Math.sin(x*Math.PI*2*f*k+o*k)/k;return .5+.35*s;};
  const far=C(v.mid).lerp(C(v.top),.5).multiplyScalar(.55),near=dark;
  if(v.sil==='peaks'){ring(55,16,2,180,C('#7a88b0'),x=>Math.pow(noise(3,1)(x),1.6));ring(45,9,0,140,C('#1a2238'),x=>Math.abs(noise(5,2)(x)));
    // snow caps: second brighter ring slightly in front of far peaks' upper parts
    }
  else if(v.sil==='cliffs'){ring(50,6,-1,90,C('#3a3040'),x=>{const a=x*Math.PI*2;return Math.cos(a)>.3?1.2*noise(4,3)(x):0;});}
  else if(v.sil==='mesa'){ring(55,7,0,120,far,x=>noise(2,5)(x)>.55?1:.25);ring(42,3,-.5,80,near,x=>noise(6,1)(x)*.6);}
  else if(v.sil==='trees'){ring(48,5,0,90,far,noise(2,4));ring(38,4,0,260,near,x=>.5+.5*Math.abs(Math.sin(x*300))*noise(7,2)(x));}
  else if(v.sil==='hillsCity'){ring(55,8,0,90,far,noise(2,6));g.add(skyline(42,rnd,near,.5));}
  else if(v.sil==='skyline'){ring(58,4,0,60,far,noise(3,2));g.add(skyline(44,rnd,near,1));}
  return g;}
function windowsTex(rnd){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,64,64);
  for(let i=0;i<8;i++)for(let j=0;j<16;j++)if(rnd()<.18){x.fillStyle=rnd()<.7?'#ffcc70':'#a0d0ff';x.fillRect(i*8+2,j*4+1,4,2);}
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function skyline(R,rnd,col,dens){const g=new THREE.Group(),wt=windowsTex(rnd);const n=(120*dens)|0;
  for(let i=0;i<n;i++){const a=rnd()*Math.PI*2;if(Math.sin(a)>.2&&dens<1)continue;const h=2+rnd()*rnd()*14,w=1+rnd()*2.2;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshBasicMaterial({color:col,map:wt,fog:false}));
    m.material=new THREE.MeshBasicMaterial({color:'#ffffff',map:wt,fog:false,transparent:false});m.material.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`vec4 tc=texture2D(map,vMapUv);diffuseColor.rgb=mix(vec3(${col.r.toFixed(3)},${col.g.toFixed(3)},${col.b.toFixed(3)}),tc.rgb,step(.2,tc.r+tc.b));`);};
    const uv=m.geometry.attributes.uv.array;for(let k=0;k<uv.length;k+=2){uv[k]*=w/2;uv[k+1]*=h/4;}
    m.position.set(Math.cos(a)*(R+rnd()*8),h/2-1,Math.sin(a)*(R+rnd()*8));m.lookAt(0,h/2-1,0);g.add(m);
    if(h>12&&rnd()<.5){const l=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,.25),new THREE.MeshBasicMaterial({color:'#ff3030',fog:false}));l.position.copy(m.position);l.position.y=h-.8;l.userData.blink=rnd()*6;g.add(l);}}
  return g;}
function water(v){const m=new THREE.ShaderMaterial({fog:false,transparent:false,uniforms:{t:{value:0},col:{value:C(v.water)},hor:{value:C(v.hor)},sun:{value:C(v.sun)},sd:{value:new THREE.Vector3(...v.sd).normalize()},top:{value:C(v.mid)}},
  vertexShader:`varying vec3 wp;void main(){vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`uniform float t;uniform vec3 col,hor,sun,sd,top;varying vec3 wp;
   void main(){vec3 v=normalize(wp-cameraPosition);float w=sin(wp.x*1.7+t*1.3)*.5+sin(wp.z*2.3-t*1.1)*.5+sin((wp.x+wp.z)*4.1+t*2.)*.25;
    vec3 n=normalize(vec3(w*.06,1.,cos(wp.x*2.1-t)*.05));vec3 r=reflect(v,n);float fres=pow(1.-max(-v.y,0.),3.);
    vec3 sky=mix(hor,top,smoothstep(0.,.4,r.y));float s=pow(max(dot(r,sd),0.),180.)*2.5+pow(max(dot(r,sd),0.),12.)*.35;
    vec3 c=mix(col,sky,.35+.5*fres)+sun*s;float d=length(wp.xz);c=mix(c,hor,smoothstep(20.,65.,d)*.8);gl_FragColor=vec4(c,1.);}`});
  const p=new THREE.Mesh(new THREE.CircleGeometry(68,48),m);p.rotation.x=-Math.PI/2;p.position.y=-.55;return p;}
function lanterns(rnd,tier){const g=new THREE.Group(),n=tier==='low'?18:40;const cols=['#ff9040','#ffb050','#ff6040','#ffd070'];
  for(let i=0;i<n;i++){const a=rnd()*Math.PI*1.4+Math.PI*1.3,r=9+rnd()*26;const c=cols[i%4];
    const l=new THREE.Mesh(new THREE.BoxGeometry(.28,.22,.28),new THREE.MeshBasicMaterial({color:c,fog:false}));l.position.set(Math.cos(a)*r,-.4,Math.sin(a)*r);
    const refl=new THREE.Mesh(new THREE.PlaneGeometry(.18,1.6),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    refl.rotation.x=-Math.PI/2;refl.position.set(0,-.14,.8);l.add(refl);l.userData.ph=rnd()*6;g.add(l);}
  return g;}
function shafts(v,rnd,count){const g=new THREE.Group();const cv=document.createElement('canvas');cv.width=8;cv.height=64;const x=cv.getContext('2d');const gr=x.createLinearGradient(0,0,0,64);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#0000');x.fillStyle=gr;x.fillRect(0,0,8,64);
  const t=new THREE.CanvasTexture(cv);const sd=new THREE.Vector3(...v.sd).normalize();
  for(let i=0;i<count;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.6+rnd()*1.2,9),new THREE.MeshBasicMaterial({map:t,color:v.sun,transparent:true,opacity:.11,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    m.position.set((rnd()-.5)*8,3.5,(rnd()-.5)*6);m.lookAt(m.position.clone().add(new THREE.Vector3(-sd.z,0,sd.x)));m.rotateZ(-(Math.PI/2-Math.asin(Math.min(.9,sd.y+.35)))*Math.sign(sd.x||1)*.6);m.userData.ph=rnd()*6;g.add(m);}
  return g;}
const PK={fireflies:{c:'#d8ff70',s:.07,n:120},snow:{c:'#ffffff',s:.07,n:700},petals:{c:'#ffb8c8',s:.08,n:220},lanternmotes:{c:'#ffb060',s:.06,n:140},gulls:{c:'#fff8f0',s:.05,n:160},motes:{c:'#ffe0b0',s:.04,n:200},dust:{c:'#ffd8a0',s:.035,n:160}};
function particles(kind,tier,box){const k=PK[kind];if(!k)return null;const n=tier==='low'?k.n>>1:k.n;const g=new THREE.BufferGeometry(),a=new Float32Array(n*3),ph=new Float32Array(n);
  for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*box[0];a[i*3+1]=Math.random()*box[1];a[i*3+2]=(Math.random()-.5)*box[2];ph[i]=Math.random()*6.28;}
  g.setAttribute('position',new THREE.BufferAttribute(a,3));const m=new THREE.PointsMaterial({color:k.c,size:k.s,transparent:true,opacity:.9,blending:kind==='snow'||kind==='petals'||kind==='gulls'?THREE.NormalBlending:THREE.AdditiveBlending,depthWrite:false});
  const p=new THREE.Points(g,m);p.userData={kind,ph,box};return p;}
function stepParticles(p,dt,t){const a=p.geometry.attributes.position.array,{kind,ph,box}=p.userData;
  for(let i=0;i<ph.length;i++){const j=i*3;
    if(kind==='snow'){a[j+1]-=dt*(.5+(ph[i]%1));a[j]+=Math.sin(t+ph[i])*dt*.3;}
    else if(kind==='petals'){a[j+1]-=dt*.35;a[j]+=dt*(.4+Math.sin(t*1.5+ph[i])*.4);a[j+2]+=Math.cos(t+ph[i])*dt*.2;}
    else if(kind==='gulls'){a[j+1]+=Math.sin(t*.7+ph[i])*dt*.1;a[j]+=dt*.15;}
    else{a[j]+=Math.sin(t*.8+ph[i])*dt*.25;a[j+1]+=Math.cos(t*.6+ph[i]*1.3)*dt*.15;a[j+2]+=Math.sin(t*.5+ph[i]*2.)*dt*.2;}
    if(a[j+1]<0)a[j+1]+=box[1];if(a[j+1]>box[1])a[j+1]-=box[1];if(a[j]>box[0]/2)a[j]-=box[0];if(a[j]<-box[0]/2)a[j]+=box[0];}
  p.geometry.attributes.position.needsUpdate=true;
  if(kind==='fireflies'||kind==='lanternmotes')p.material.opacity=.6+.4*Math.sin(t*2.3);}
// Apply to a freshly built room scene. Returns {vista, update(dt,t)} or null.
export function applyScenic(scene,ch,room,rd,tier,hemi){
  const v=vistaFor(ch,rd.n);let R=(ch*977+rd.n.length*131)%2147483647||7;const rnd=()=>{R=(R*16807)%2147483647;return R/2147483647;};
  const ups=[],parts=[];const add=o=>{scene.add(o);return o;};
  if(v){room.group.children.forEach(o=>{if(o.isMesh&&o.geometry.type!=='PlaneGeometry'&&(Math.abs(o.position.x)>6.5||Math.abs(o.position.z)>5.5))o.visible=false;});
    scene.background=C(v.hor);scene.fog=new THREE.FogExp2(v.fog,.035);
    if(v.pano){ // AI-painted panorama on a cylinder (no procedural sky/silhouette)
      const pt=new THREE.TextureLoader().load(v.pano);pt.colorSpace=THREE.SRGBColorSpace;pt.wrapS=THREE.RepeatWrapping;
      const cyl=add(new THREE.Mesh(new THREE.CylinderGeometry(40,40,40,32,1,true),new THREE.MeshBasicMaterial({map:pt,side:THREE.BackSide,fog:false,depthWrite:false})));cyl.position.y=12;cyl.renderOrder=-1;
      if(v.ground){const gt=tex(v.ground).clone();gt.needsUpdate=true;gt.repeat.set(20,20);const gr=add(new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshLambertMaterial({map:gt})));gr.rotation.x=-Math.PI/2;gr.position.y=.005;room.group.children.forEach(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'&&Math.abs(o.rotation.x+Math.PI/2)<.01)o.visible=false;if(o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.height<1.5&&o.geometry.parameters.height>.5){o.material=new THREE.MeshLambertMaterial({map:tex('stone'),color:'#d8ccb8'});}});scene.fog.density=.018;}
    }else{
    const dome=add(skyDome(v));ups.push((dt,t)=>{dome.material.uniforms.t.value=t;});
    const sil=add(silhouette(v,rnd));ups.push((dt,t)=>sil.traverse(o=>{if(o.userData.blink!==undefined)o.visible=Math.sin(t*2+o.userData.blink)>.3;}));}
    if(v.water){const w=add(water(v));ups.push((dt,t)=>{w.material.uniforms.t.value=t;});if(room.group.userData.water)room.group.userData.water.visible=false;}
    if(v.lanterns){const L=add(lanterns(rnd,tier));ups.push((dt,t)=>L.children.forEach(l=>{l.position.y=-.42+Math.sin(t*1.2+l.userData.ph)*.04;l.position.x+=Math.sin(t*.2+l.userData.ph)*dt*.05;}));}
    for(const [n,x,z,sc,y] of v.props||[]){const o=prop(n);if(!o)continue;o.traverse(m=>{if(m.isMesh){const mp=m.material.map;m.material=new THREE.MeshBasicMaterial({map:mp,fog:true});if(mp){mp.magFilter=THREE.LinearFilter;}}});
      o.position.set(x,y||0,z);o.scale.setScalar(sc);o.rotation.y=(x*7+z*3)%6.28;scene.add(o);if(n==='lantern')ups.push((dt,t)=>{o.rotation.z=Math.sin(t*1.3+x)*.08;});}
    const sun=new THREE.DirectionalLight(v.sun,v.moon?.5:1.3);sun.position.set(...v.sd).multiplyScalar(20);add(sun);
    if(hemi){hemi.color.set(v.mid);hemi.groundColor.set(C(v.hor).multiplyScalar(.4));hemi.intensity=v.moon?.7:1.0;}
    if(v.shafts&&tier!=='low'){const s=add(shafts(v,rnd,7));ups.push((dt,t)=>s.children.forEach(m=>m.material.opacity=.07+.05*Math.sin(t*.5+m.userData.ph)));}
    const p=particles(v.fx,tier,[18,6,16]);if(p){add(p);parts.push(p);}
  }else if(rd.safe){ // warm sanctuary: amber key light, window glow, dust motes, light shafts
    const warm=new THREE.PointLight('#ffb060',2.2,9,1.6);warm.position.set(-1.5,2.2,-1);add(warm);ups.push((dt,t)=>{warm.intensity=2+Math.sin(t*7)*.15+Math.sin(t*13)*.1;});
    if(hemi){hemi.color.set('#ffc890');hemi.groundColor.set('#402010');hemi.intensity=.75;}
    const vs=VISTA[ch];const win=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),new THREE.ShaderMaterial({fog:false,uniforms:{a:{value:C(vs.hor)},b:{value:C(vs.mid)}},vertexShader:`varying vec2 u;void main(){u=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform vec3 a,b;varying vec2 u;void main(){vec3 c=mix(a,b,u.y);float f=step(.04,abs(u.x-.5))*step(.05,abs(u.y-.5))*step(.03,u.x)*step(u.x,.97)*step(.04,u.y)*step(u.y,.96);gl_FragColor=vec4(mix(vec3(.08,.05,.03),c,f),1.);}`}));
    win.position.set(0,1.9,-3.88);add(win);
    if(tier!=='low'){const s=shafts({...vs,sd:[0,.6,1]},rnd,4);s.position.set(0,-.6,-1.5);s.scale.set(.5,.45,.5);s.children.forEach(m=>m.material.opacity=.08);add(s);ups.push((dt,t)=>s.children.forEach(m=>m.material.opacity=.06+.03*Math.sin(t*.4+m.userData.ph)));}
    const p=particles('dust',tier,[9,3,7]);if(p){add(p);parts.push(p);}
  }else return null;
  return {vista:v,update(dt,t){for(const u of ups)u(dt,t);for(const p of parts)stepParticles(p,dt,t);}};}
