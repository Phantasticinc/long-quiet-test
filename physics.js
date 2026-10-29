// Lightweight custom physics (original): props, breakables, debris, casings, rubble. Units = game px; z = height.
'use strict';
(function(){
const CAP=[40,80,140],T=16;
const P=window.PHYS={props:[],bodies:[],events:[],tier:1,
 cap(){return CAP[this.tier]||80;},
 room(S,CH){this.props=[];this.bodies=[];const r=CH.rooms[S.room];if(r.safe)return;
  let seed=CH.id*97+S.room*13;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const kinds={1:['crate','bottle','glass'],2:['crate','barrel','bottle'],3:['bottle','glass','crate'],4:['crate','barrel','glass'],5:['barrel','crate','glass'],6:['bottle','crate','glass'],7:['crate','bottle','barrel']}[CH.id];
  const n=3+Math.floor(rnd()*3);
  for(let i=0;i<n*4&&this.props.length<n;i++){const tx=1+Math.floor(rnd()*8),ty=1+Math.floor(rnd()*7);
   if(window.__hm.solid(S.room,tx,ty)||(tx==4||tx==5)&&(ty==1||ty==7)||ty==4&&(tx==1||tx==8))continue;
   const k=kinds[Math.floor(rnd()*3)];this.props.push({k,x:tx*T+4+rnd()*8,y:ty*T+4+rnd()*8,z:0,vx:0,vy:0,rot:rnd()*6,hp:k=='crate'?2:1,r:k=='crate'?5:k=='barrel'?5:2});}},
 add(b){if(this.bodies.length>=this.cap())this.bodies.shift();this.bodies.push(b);},
 debris(x,y,z,n,col,spd=60,kind='chip'){n=Math.ceil(n*[.5,1,1.6][this.tier]);for(let i=0;i<n;i++){const a=Math.random()*6.28,s=spd*(.3+Math.random());
  this.add({kind,x,y,z,vx:Math.cos(a)*s,vy:Math.sin(a)*s,vz:30+Math.random()*spd,rot:0,vr:(Math.random()-.5)*20,col,ttl:2.5+Math.random()*2});}},
 casing(x,y,dir){const s=dir=='l'?1:-1;this.add({kind:'casing',x,y,z:10,vx:s*25+Math.random()*10,vy:-10+Math.random()*10,vz:45,rot:0,vr:30,col:'#e0b040',ttl:6,clink:1});},
 rubble(n){for(let i=0;i<n;i++)this.add({kind:'rock',x:20+Math.random()*120,y:24+Math.random()*96,z:90+Math.random()*40,vx:0,vy:0,vz:0,rot:Math.random()*6,vr:(Math.random()-.5)*6,col:'#6a6058',ttl:5,big:1});},
 break_(p){const i=this.props.indexOf(p);if(i<0)return;this.props.splice(i,1);
  const col={crate:'#8a6a40',bottle:'#4a8a50',glass:'#a8c8e0',barrel:'#a03a20'}[p.k];this.debris(p.x,p.y,6,p.k=='crate'?10:8,col,p.k=='glass'?80:55,p.k=='crate'?'plank':'shard');
  this.events.push({t:p.k=='barrel'?'boom':p.k=='crate'?'wood':'glass',x:p.x,y:p.y});
  if(p.k=='barrel'){this.debris(p.x,p.y,4,14,'#ffb040',110,'spark');this.events.push({t:'explode',x:p.x,y:p.y,r:30});}},
 // first prop hit along a segment (before maxD); returns prop or null
 ray(x1,y1,x2,y2){let best=null,bd=1e9;const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1;
  for(const p of this.props){const t=((p.x-x1)*dx+(p.y-y1)*dy)/(L*L);if(t<0||t>1)continue;const d=Math.hypot(x1+dx*t-p.x,y1+dy*t-p.y);if(d<p.r+2&&t*L<bd){bd=t*L;best=p;}}
  return best?{p:best,d:bd}:null;},
 hit(p,n=1){p.hp-=n;p.vx+=(Math.random()-.5)*30;p.vy+=(Math.random()-.5)*30;if(p.hp<=0)this.break_(p);else this.events.push({t:'knock',x:p.x,y:p.y});},
 point(x,y,r){for(const p of [...this.props])if(Math.hypot(p.x-x,p.y-y)<r+p.r)this.hit(p);},
 step(dt,S,solid){const ri=S.room,ok=(x,y)=>!solid(ri,Math.floor(x/T),Math.floor(y/T));
  // movers push props
  const movers=[S.p,...S.en.filter(e=>e.r==ri&&e.hp>0)];
  for(const p of this.props){for(const m of movers){const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy),R=p.r+(m.big?8:5);if(d<R&&d>0){const push=(R-d);p.vx+=dx/d*push*12;p.vy+=dy/d*push*12;if(m.big&&push>2&&p.k!='barrel')this.hit(p,1);}}
   const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;if(ok(nx,p.y))p.x=nx;else{p.vx*=-.4;}if(ok(p.x,ny))p.y=ny;else{p.vy*=-.4;}p.rot+=(Math.abs(p.vx)+Math.abs(p.vy))*dt*.05;const f=Math.pow(.02,dt);p.vx*=f;p.vy*=f;}
  for(const b of this.bodies){b.ttl-=dt;b.vz-=220*dt;b.z+=b.vz*dt;
   const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;if(ok(nx,b.y))b.x=nx;else b.vx*=-.5;if(ok(b.x,ny))b.y=ny;else b.vy*=-.5;b.rot+=b.vr*dt;
   if(b.z<=0){if(b.vz<-40){if(b.clink)this.events.push({t:'clink',x:b.x,y:b.y});if(b.big)this.events.push({t:'rock',x:b.x,y:b.y});}b.z=0;b.vz=-b.vz*.35;if(b.vz<8)b.vz=0;b.vx*=.6;b.vy*=.6;b.vr*=.6;}}
  this.bodies=this.bodies.filter(b=>b.ttl>0);}
};})();
