// Loads Blender-refined assets (Draco GLB) and registers them for the runtime.
import {THREE,G,smoothTex,smoothNormals} from './gfx.js';
import {GLTFLoader} from '../lib/addons/GLTFLoader.js';
import {DRACOLoader} from '../lib/addons/DRACOLoader.js';
import {GLB,ART} from './chars.js';
const dl=new DRACOLoader();dl.setDecoderPath('lib/draco/');const gl=new GLTFLoader();gl.setDRACOLoader(dl);
let MAN=null;const loaded=new Set();export const PROPS=new Map();
export async function manifest(){if(MAN)return MAN;try{MAN=await (await fetch('assets/manifest.json')).json();}catch(e){MAN={chars:[],props:[]};}return MAN;}
export function useBlender(){return G.tier!=='low'&&localStorage.getItem('lq32.blender')!=='0';}
let AM=null;
// Loads AI-art character GLBs (assets/art). keys: Set of art keys. Old procedural GLBs are no longer used.
export async function loadArt(keys){if(!AM){try{AM=await (await fetch('assets/art/chars.json')).json();}catch(e){AM={};}}
  const lod=G.tier==='low'?'med':'high';
  await Promise.all([...keys].filter(k=>k&&AM[k]&&!ART.has(k)).map(async k=>{try{const g=await gl.loadAsync(AM[k][lod]);let sm=null;g.scene.traverse(o=>{if(o.isSkinnedMesh&&!sm)sm=o;});
    if(!sm)return;const map=smoothTex(sm.material.map);map.colorSpace=THREE.SRGBColorSpace;smoothNormals(sm.geometry);
    ART.set(k,{geo:sm.geometry,map,jn:sm.skeleton.bones.map(b=>b.name),joints:AM[k].joints});}catch(e){console.warn('art',k,e);}}));}
export async function loadChars(keys){return 0;}
async function _oldLoadChars(keys){const m=await manifest();if(!useBlender())return 0;const lod=G.tier==='high'?'high':'med';
  const want=m.chars.filter(c=>keys.has(c.key)&&!loaded.has(c.key+lod)&&c.lods&&c.lods[lod]);
  await Promise.all(want.map(async c=>{try{const g=await gl.loadAsync('assets/chars/'+c.lods[lod].file);let sm=null;g.scene.traverse(o=>{if((o.isSkinnedMesh||o.isMesh)&&!sm)sm=o;});
    if(!sm)return;const geo=sm.geometry;if(sm.isSkinnedMesh)geo.userData.jointNames=sm.skeleton.bones.map(b=>b.name);loaded.add(c.key+lod);GLB.map.set(c.key,geo);}catch(e){console.warn('glb',c.file,e);}}));
  return want.length;}
// AI-art prop GLBs (tools/art/build_prop.py). Stored as {geo,map}; world.js/scenic.js instance them.
export const PROPNAMES=['table','pillar','vase','chair','longtable','shelf','desk','piano','boiler','barrel','crate','fountain','garden_tree','hedge','bench','lamppost'];
export async function loadProps(){const lod=G.tier==='low'?'med':'high';
  await Promise.all(PROPNAMES.filter(n=>!PROPS.has(n)).map(async n=>{try{const g=await gl.loadAsync('assets/props/'+n+'_'+lod+'.glb');let m=null;g.scene.traverse(o=>{if(o.isMesh&&!m)m=o;});
    const map=m.material.map;if(map){smoothTex(map);map.colorSpace=THREE.SRGBColorSpace;}smoothNormals(m.geometry);
    m.geometry.computeBoundingBox();PROPS.set(n,{geo:m.geometry,map});}catch(e){console.warn('prop',n,e);}}));}
async function _oldLoadProps(){const m=await manifest();if(!useBlender())return;await Promise.all((m.props||[]).filter(p=>!PROPS.has(p.name)).map(async p=>{try{const g=await gl.loadAsync('assets/props/'+p.file);PROPS.set(p.name,g.scene);}catch(e){console.warn('prop',p.file,e);}}));}
const ALIAS={streetlamp:'lamppost',blossom_tree:'garden_tree'};
export function prop(name){const s=PROPS.get(ALIAS[name]||name);return s?new THREE.Mesh(s.geo.clone(),new THREE.MeshLambertMaterial({map:s.map})):null;}
