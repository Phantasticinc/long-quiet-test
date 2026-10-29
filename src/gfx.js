// Renderer: smooth pipeline at device pixel ratio (capped per tier) with MSAA render target,
// linear/mipmapped/anisotropic textures, light post pass (vignette, effects). Adaptive render scale.
import * as THREE from '../lib/three.module.min.js';
export {THREE};

export const TIERS={
  // pr = max device-pixel-ratio, msaa = render-target samples. Smooth (non-PS1) pipeline.
  low:{pr:1,msaa:0,dither:0,shadows:0,lights:2,tex:256,debris:12},
  med:{pr:1.5,msaa:4,dither:0,shadows:0,lights:4,tex:256,debris:24},
  high:{pr:2,msaa:4,dither:0,shadows:1,lights:6,tex:256,debris:40},
};
export const G={tier:'med',T:TIERS.med,snapOn:false,affineOn:false,aniso:4,uniforms:{uSnap:{value:new THREE.Vector2(160,120)},uSnapOn:{value:1}}};

export function pickTier(){
  const q=new URLSearchParams(location.search).get('q');
  if(q&&TIERS[q])return q;
  const saved=localStorage.getItem('lq32.tier'); if(saved&&TIERS[saved])return saved;
  const mem=navigator.deviceMemory||4, cores=navigator.hardwareConcurrency||4;
  return (mem<=2||cores<=2)?'low':(mem>=8&&cores>=8?'high':'med');
}

// Patch any built-in material into a "PSX" material.
export function psx(mat,opt={}){
  mat.onBeforeCompile=(sh)=>{
    sh.uniforms.uSnap=G.uniforms.uSnap; sh.uniforms.uSnapOn=G.uniforms.uSnapOn;
    sh.vertexShader='uniform vec2 uSnap; uniform float uSnapOn;\n'+sh.vertexShader.replace('#include <project_vertex>',
`#include <project_vertex>
if(uSnapOn>0.5){ vec4 sp=gl_Position; sp.xyz/=sp.w; sp.xy=floor(sp.xy*uSnap+0.5)/uSnap; sp.xyz*=sp.w; gl_Position=sp; }`);
    if(G.affineOn&&!opt.noAffine){ // PS1 affine texture warp: interpolate uv*w and w, divide per-fragment
      sh.vertexShader=sh.vertexShader.replace('void main() {','varying vec3 vAff;\nvoid main() {').replace('#include <fog_vertex>','#include <fog_vertex>\n#ifdef USE_MAP\nvAff=vec3(vMapUv*gl_Position.w,gl_Position.w);\n#endif');
      sh.fragmentShader=sh.fragmentShader.replace('void main() {','varying vec3 vAff;\nvoid main() {').replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','texture2D( map, vAff.xy/vAff.z )'));
    }
  };
  mat.customProgramCacheKey=()=>'psx'+(G.affineOn&&!opt.noAffine?1:0);
  return mat;
}
export function lam(o={}){ return psx(new THREE.MeshLambertMaterial(o),o.__o||{}); }

export class Renderer{
  constructor(canvas){
    this.canvas=canvas;
    this.r=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
    this.r.setPixelRatio(1); this.r.outputColorSpace=THREE.SRGBColorSpace; this.r.shadowMap.type=THREE.PCFSoftShadowMap;
    G.aniso=Math.min(8,this.r.capabilities.getMaxAnisotropy());
    this.rt=new THREE.WebGLRenderTarget(320,240,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true,samples:4});
    this.scale=1;this._ft=[];
    this.post=new THREE.ShaderMaterial({uniforms:{t:{value:this.rt.texture},res:{value:new THREE.Vector2(320,240)},dith:{value:1},
      sepia:{value:0},flash:{value:0},vig:{value:.35},noise:{value:0},time:{value:0},red:{value:0}},
      vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:`uniform sampler2D t;uniform vec2 res;uniform float dith,sepia,flash,vig,noise,time,red;varying vec2 v;
float b4(vec2 p){int x=int(mod(p.x,4.)),y=int(mod(p.y,4.));int i=x+y*4;
 float m[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);return m[i]/16.-.5;}
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
void main(){vec2 px=floor(v*res);vec3 c=pow(max(texture2D(t,v).rgb,0.),vec3(1./2.2));
 if(sepia>0.){float l=dot(c,vec3(.3,.59,.11));c=mix(c,vec3(l*1.15+.06,l*.95+.03,l*.7),sepia);}
 c+=noise*(h(px)-.5)*.06;
 float d=length(v-.5);c*=1.-vig*d*d*1.4;
 c=mix(c,vec3(.55,0.,0.),red*(.3+d));
 c+=flash;
 if(dith>0.){c+=b4(px)/31.;c=floor(c*31.+.5)/31.;}
 gl_FragColor=vec4(clamp(c,0.,1.),1.);}`});
    this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.post);
    this.pscene=new THREE.Scene(); this.pscene.add(this.quad);
    this.pcam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.setTier(pickTier());
    addEventListener('resize',()=>this.resize());
  }
  setTier(t){ G.tier=t; G.T=TIERS[t]; localStorage.setItem('lq32.tier',t); this.r.shadowMap.enabled=!!G.T.shadows; this.resize(); }
  resize(){
    const w=innerWidth,h=innerHeight; this.r.setSize(w,h,false);
    this.canvas.style.width=w+'px'; this.canvas.style.height=h+'px';
    const pr=Math.min(devicePixelRatio||1,G.T.pr)*this.scale, iw=Math.round(w*pr), ih=Math.round(h*pr);
    this.rt.samples=G.T.msaa; this.rt.setSize(iw,ih); this.post.uniforms.res.value.set(iw,ih);
    G.uniforms.uSnap.value.set(iw/2,ih/2); this.aspect=w/h;
    if(this.cam){this.cam.aspect=this.aspect;this.cam.updateProjectionMatrix();}
  }
  // adaptive quality: if frames average >36ms (~<28fps) for 2s, drop render scale (down to 0.6x)
  perf(now){const f=this._ft;if(this._last)f.push(now-this._last);this._last=now;if(f.length>=60){const a=f.reduce((x,y)=>x+y)/f.length;f.length=0;
    if(a>36&&this.scale>.6){this.scale=Math.max(.6,this.scale-.15);this.resize();}}}
  render(scene,cam,t){this.perf(performance.now());
    this.cam=cam; if(cam.aspect!==this.aspect){cam.aspect=this.aspect;cam.updateProjectionMatrix();}
    G.uniforms.uSnapOn.value=G.snapOn?1:0;
    this.post.uniforms.time.value=t%10; this.post.uniforms.dith.value=G.T.dither;
    this.r.setRenderTarget(this.rt); this.r.render(scene,cam);
    this.r.setRenderTarget(null); this.r.render(this.pscene,this.pcam);
  }
}

// ---------- procedural textures (original, 128/256px, nearest-filtered) ----------
const texCache={};
function rng(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
const AITEX=new Set(['wallpaper','brick','ceiling','tile','wood','stone','carpet','moss','plaster','metal','cloth','grass']);
const _tl=new THREE.TextureLoader();
export function tex(kind,tint){
  const key=kind+(tint||''); if(texCache[key])return texCache[key];
  if(AITEX.has(kind)){const t=_tl.load('assets/tex/'+kind+'.jpg');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=G.aniso;t.colorSpace=THREE.SRGBColorSpace;return texCache[key]=t;}
  const S=G.T.tex, c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d'); const R=rng(kind.length*977+S);
  const f=(col)=>{g.fillStyle=col;}; const n=(a)=>{const d=g.getImageData(0,0,S,S);for(let i=0;i<d.data.length;i+=4){const v=(R()-.5)*a;d.data[i]+=v;d.data[i+1]+=v;d.data[i+2]+=v;}g.putImageData(d,0,0);};
  const u=S/128;
  const K={
   brick(){f('#5a2a22');g.fillRect(0,0,S,S);for(let y=0;y<8;y++)for(let x=-1;x<5;x++){f(`hsl(${8+R()*10},${35+R()*15}%,${22+R()*12}%)`);g.fillRect((x*32+(y%2)*16+1)*u,(y*16+1)*u,30*u,14*u);}n(30);},
   plaster(){f('#7d7466');g.fillRect(0,0,S,S);n(26);f('rgba(40,30,20,.25)');for(let i=0;i<6;i++)g.fillRect(R()*S,R()*S*.2+S*.8,2*u,R()*30*u);},
   wallpaper(){f('#4a3a4e');g.fillRect(0,0,S,S);for(let x=0;x<8;x++){f('#5c4860');g.fillRect(x*16*u,0,6*u,S);}f('#6b5a3c');for(let y=0;y<8;y++)for(let x=0;x<8;x++){g.beginPath();g.arc((x*16+11)*u,(y*16+8)*u,2.5*u,0,7);g.fill();}f('#2e2420');g.fillRect(0,S*.78,S,S*.22);n(22);},
   wood(){f('#5b3b22');g.fillRect(0,0,S,S);for(let y=0;y<8;y++){f(`hsl(25,${40+R()*10}%,${18+R()*10}%)`);g.fillRect(0,y*16*u,S,15*u);f('rgba(0,0,0,.35)');g.fillRect(R()*S,y*16*u,1*u,16*u);}n(18);},
   tile(){f('#c9c2b0');g.fillRect(0,0,S,S);for(let y=0;y<4;y++)for(let x=0;x<4;x++){f((x+y)%2?'#2a2a30':'#bdb6a4');g.fillRect(x*32*u,y*32*u,31*u,31*u);}n(24);},
   stone(){f('#4c4a48');g.fillRect(0,0,S,S);for(let i=0;i<30;i++){f(`hsl(30,6%,${22+R()*16}%)`);g.fillRect(R()*S,R()*S,(10+R()*30)*u,(8+R()*20)*u);}n(30);},
   carpet(){f('#5a1820');g.fillRect(0,0,S,S);f('#8a6a2a');g.fillRect(8*u,8*u,S-16*u,4*u);g.fillRect(8*u,S-12*u,S-16*u,4*u);n(20);},
   moss(){f('#2f3a26');g.fillRect(0,0,S,S);n(40);},
   concrete(){f('#6a6a68');g.fillRect(0,0,S,S);n(28);f('rgba(0,0,0,.3)');g.fillRect(0,S/2,S,1*u);g.fillRect(S/2,0,1*u,S);},
   asphalt(){f('#2c2c2e');g.fillRect(0,0,S,S);n(36);f('#b8a24a');g.fillRect(S/2-2*u,0,4*u,S*.45);},
   planks(){f('#4a3a2a');g.fillRect(0,0,S,S);for(let x=0;x<8;x++){f(`hsl(28,${20+R()*15}%,${16+R()*10}%)`);g.fillRect(x*16*u,0,14*u,S);}n(26);},
   metal(){f('#55595e');g.fillRect(0,0,S,S);n(16);f('#3a3d40');for(let y=0;y<4;y++)g.fillRect(0,y*32*u,S,2*u);f('#7a7e84');for(let i=0;i<16;i++)g.fillRect((i%4)*32*u+4*u,Math.floor(i/4)*32*u+6*u,2*u,2*u);},
   rust(){f('#5e3a24');g.fillRect(0,0,S,S);n(50);f('rgba(30,40,50,.4)');g.fillRect(0,0,S,S*.4);},
   hosp(){f('#a8b4ae');g.fillRect(0,0,S,S);f('#5d7a70');g.fillRect(0,S*.6,S,S*.4);f('#3a4a44');g.fillRect(0,S*.6,S,2*u);n(16);},
   linoleum(){f('#7a8a80');g.fillRect(0,0,S,S);for(let y=0;y<4;y++)for(let x=0;x<4;x++){f((x+y)%2?'#6f7f76':'#83938a');g.fillRect(x*32*u,y*32*u,32*u,32*u);}n(14);},
   snow(){f('#c8d0dc');g.fillRect(0,0,S,S);n(14);},
   ice(){f('#8aa0b8');g.fillRect(0,0,S,S);n(20);f('rgba(255,255,255,.3)');for(let i=0;i<6;i++)g.fillRect(R()*S,R()*S,R()*40*u,1*u);},
   subway(){f('#d8d4c4');g.fillRect(0,0,S,S);for(let y=0;y<16;y++)for(let x=0;x<8;x++){f(`hsl(45,10%,${76+R()*8}%)`);g.fillRect(x*16*u,y*8*u,15*u,7*u);}f('#2a6a4a');g.fillRect(0,S*.45,S,10*u);n(10);},
   azulejo(){f('#e8e4d8');g.fillRect(0,0,S,S);g.strokeStyle='#2a4aa0';g.lineWidth=2*u;for(let y=0;y<4;y++)for(let x=0;x<4;x++){const cx=(x*32+16)*u,cy=(y*32+16)*u;g.beginPath();g.arc(cx,cy,9*u,0,7);g.stroke();g.strokeRect(cx-15*u,cy-15*u,30*u,30*u);}n(14);},
   tin(){f('#6a6e72');g.fillRect(0,0,S,S);for(let x=0;x<16;x++){f(x%2?'#5a5e62':'#787c80');g.fillRect(x*8*u,0,8*u,S);}f('rgba(110,60,30,.4)');g.fillRect(0,S*.7,S,S*.3);n(20);},
   water(){f('#123040');g.fillRect(0,0,S,S);n(20);f('rgba(140,190,210,.25)');for(let i=0;i<20;i++)g.fillRect(R()*S,R()*S,R()*20*u,1*u);},
   dirt(){f('#3e3226');g.fillRect(0,0,S,S);n(40);},
   ceiling(){f('#3a3634');g.fillRect(0,0,S,S);n(16);f('rgba(0,0,0,.4)');for(let i=0;i<4;i++)g.fillRect(i*32*u,0,1*u,S);},
   rock(){f('#3a3836');g.fillRect(0,0,S,S);n(50);},
   cloth(){f('#888');g.fillRect(0,0,S,S);n(30);},
  };
  (K[kind]||K.concrete)();
  if(tint){g.globalCompositeOperation='multiply';f(tint);g.fillRect(0,0,S,S);g.globalCompositeOperation='source-over';}
  const t=new THREE.CanvasTexture(c); t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=G.aniso;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; texCache[key]=t; return t;
}
export function clearTex(){for(const k in texCache){texCache[k].dispose();delete texCache[k];}}

// Smooth texture filtering for loaded maps.
export function smoothTex(t){if(!t)return t;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=G.aniso;t.needsUpdate=true;return t;}
// Smooth vertex normals across split vertices (position-welded), keeps UV seams.
export function smoothNormals(geo){const P=geo.attributes.position;geo.computeVertexNormals();const N=geo.attributes.normal,acc=new Map(),k=i=>`${P.getX(i).toFixed(4)},${P.getY(i).toFixed(4)},${P.getZ(i).toFixed(4)}`;
  for(let i=0;i<P.count;i++){const key=k(i);let a=acc.get(key);if(!a)acc.set(key,a=[0,0,0]);a[0]+=N.getX(i);a[1]+=N.getY(i);a[2]+=N.getZ(i);}
  for(let i=0;i<P.count;i++){const a=acc.get(k(i)),l=Math.hypot(...a)||1;N.setXYZ(i,a[0]/l,a[1]/l,a[2]/l);}N.needsUpdate=true;return geo;}
