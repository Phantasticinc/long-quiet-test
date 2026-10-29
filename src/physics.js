// Physics (cannon-es, bundled locally): static room colliders, breakable props -> debris, ragdoll-lite corpses, gore chunks.
import * as CANNON from '../lib/cannon-es.js';
import {THREE,lam,tex,G} from './gfx.js';
export class Phys{
  constructor(scene){this.scene=scene;this.w=new CANNON.World({gravity:new CANNON.Vec3(0,-9.8,0)});this.w.allowSleep=true;
    this.w.broadphase=new CANNON.SAPBroadphase(this.w);this.dyn=[];this.statics=[];
    this.mat=new CANNON.Material('m');this.w.addContactMaterial(new CANNON.ContactMaterial(this.mat,this.mat,{friction:.5,restitution:.15}));
    this.player=new CANNON.Body({mass:0,type:CANNON.Body.KINEMATIC,shape:new CANNON.Cylinder(.35,.35,1.6,8),material:this.mat});this.w.addBody(this.player);}
  loadRoom(room){
    for(const b of this.statics)this.w.removeBody(b);this.statics=[];this.clearDyn();
    const ground=new CANNON.Body({mass:0,shape:new CANNON.Plane(),material:this.mat});ground.quaternion.setFromEuler(-Math.PI/2,0,0);this.w.addBody(ground);this.statics.push(ground);
    for(const bx of room.boxes){const b=new CANNON.Body({mass:0,shape:new CANNON.Box(new CANNON.Vec3(bx.hx,(bx.h||1)/2,bx.hz)),material:this.mat});b.position.set(bx.x,(bx.h||1)/2,bx.z);this.w.addBody(b);this.statics.push(b);bx.body=b;}
  }
  removeStatic(bx){if(bx.body){this.w.removeBody(bx.body);this.statics=this.statics.filter(b=>b!==bx.body);bx.body=null;}}
  clearDyn(){for(const d of this.dyn){this.w.removeBody(d.b);this.scene.remove(d.m);d.m.geometry?.dispose?.();}this.dyn=[];}
  add(mesh,shape,mass,pos,vel,life=8,ang){const b=new CANNON.Body({mass,shape,material:this.mat,linearDamping:.1,angularDamping:.2});b.position.set(pos.x,pos.y,pos.z);
    if(vel)b.velocity.set(vel.x,vel.y,vel.z);if(ang)b.angularVelocity.set(ang.x,ang.y,ang.z);b.sleepSpeedLimit=.2;this.w.addBody(b);mesh.position.copy(pos);this.scene.add(mesh);
    const d={b,m:mesh,life,t:0};this.dyn.push(d);
    while(this.dyn.length>G.T.debris*2){const o=this.dyn.shift();this.w.removeBody(o.b);this.scene.remove(o.m);}
    return d;}
  // Shatter a prop group into physical debris chunks
  shatter(ent,dir){const bb=new THREE.Box3().setFromObject(ent.grp),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
    const mat=ent.grp.children[0]?.material;const n=Math.min(G.T.debris,ent.type==='vase'?6:9);
    for(let i=0;i<n;i++){const s=new THREE.Vector3(sz.x*(.2+Math.random()*.25),sz.y*(.15+Math.random()*.2),sz.z*(.2+Math.random()*.25));
      const m=new THREE.Mesh(new THREE.BoxGeometry(s.x,s.y,s.z),lam({map:mat?.map,color:mat?.color||'#fff'}));
      const p=c.clone().add(new THREE.Vector3((Math.random()-.5)*sz.x*.6,(Math.random()-.3)*sz.y*.6,(Math.random()-.5)*sz.z*.6));
      const v=new THREE.Vector3((Math.random()-.5)*3+dir.x*3,2+Math.random()*3,(Math.random()-.5)*3+dir.z*3);
      this.add(m,new CANNON.Box(new CANNON.Vec3(s.x/2,s.y/2,s.z/2)),.3,p,v,10,new THREE.Vector3(Math.random()*8,Math.random()*8,Math.random()*8));}
    this.scene.remove(ent.grp);this.removeStatic(ent);}
  gore(pos,dir,n=5,col='#5a0a08'){for(let i=0;i<Math.min(n,G.T.debris/3|0+2);i++){const s=.05+Math.random()*.07;const m=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),lam({color:col}));
    this.add(m,new CANNON.Box(new CANNON.Vec3(s/2,s/2,s/2)),.05,pos.clone(),new THREE.Vector3(dir.x*2+(Math.random()-.5)*3,1.5+Math.random()*2.5,dir.z*2+(Math.random()-.5)*3),4);}}
  // Ragdoll-lite: torso body + head sphere joined by a cone-twist; skinned mesh rides the torso.
  ragdoll(char,pos,dir,force=4){
    const torso=new CANNON.Body({mass:30,shape:new CANNON.Box(new CANNON.Vec3(.2,.45,.14)),material:this.mat,angularDamping:.4,linearDamping:.2});
    torso.position.set(pos.x,.95,pos.z);torso.quaternion.setFromEuler(0,char.rotation.y,0);
    torso.velocity.set(dir.x*force,1.2,dir.z*force);torso.angularVelocity.set(dir.z*force*1.2,0,-dir.x*force*1.2);this.w.addBody(torso);
    const head=new CANNON.Body({mass:5,shape:new CANNON.Sphere(.12),material:this.mat});head.position.set(pos.x,1.6,pos.z);head.velocity.copy(torso.velocity);this.w.addBody(head);
    const j=new CANNON.ConeTwistConstraint(torso,head,{pivotA:new CANNON.Vec3(0,.5,0),pivotB:new CANNON.Vec3(0,-.12,0),axisA:CANNON.Vec3.UNIT_Y,axisB:CANNON.Vec3.UNIT_Y,angle:.6,twistAngle:.4});this.w.addConstraint(j);
    const rd={torso,head,j,char,t:0};(this.rags||(this.rags=[])).push(rd);
    while(this.rags.length>8){const o=this.rags.shift();this.dropRag(o,true);}return rd;}
  dropRag(o,removeMesh){this.w.removeConstraint(o.j);this.w.removeBody(o.torso);this.w.removeBody(o.head);if(removeMesh)this.scene.remove(o.char);}
  clearRags(){for(const o of this.rags||[])this.dropRag(o,true);this.rags=[];}
  step(dt,ppos){this.player.position.set(ppos.x,.8,ppos.z);this.w.step(1/60,dt,3);
    for(let i=this.dyn.length-1;i>=0;i--){const d=this.dyn[i];d.t+=dt;d.m.position.copy(d.b.position);d.m.quaternion.copy(d.b.quaternion);
      if(d.t>d.life){this.w.removeBody(d.b);this.scene.remove(d.m);this.dyn.splice(i,1);}}
    for(const r of this.rags||[]){r.t+=dt;const c=r.char,q=r.torso.quaternion;c.quaternion.set(q.x,q.y,q.z,q.w);
      const off=new THREE.Vector3(0,-.95*(c.userData.def.build?.h||1),0).applyQuaternion(c.quaternion);c.position.set(r.torso.position.x+off.x,r.torso.position.y+off.y,r.torso.position.z+off.z);
      const hb=c.userData.bones.head;if(hb){hb.rotation.x=Math.sin(r.t*3)*.1*Math.max(0,1-r.t);}}
  }
}
export {CANNON};
