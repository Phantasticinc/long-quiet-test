// UI layer: floating analog thumbstick (left half), action buttons (right), HUD, dialog, cards, memory flashes.
export const IN={x:0,y:0,mag:0,fire:false,act:false,heal:false,wpn:false,_fire:0,_act:0,_heal:0,_wpn:0,tap:0,touch:false};
const $=(h)=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild;};
export function haptic(p){try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}}
export const UI={};
export function initUI(){
  const root=document.getElementById('ui');UI.root=root;
  root.innerHTML=`<div class="lb t"></div><div class="lb b"></div>
  <div class="hud" id="hud"><div><div class="room" id="room"></div><div class="inv" id="keys" style="text-align:left;margin-top:4px"></div></div>
   <div class="cond"><canvas id="ecg" width="110" height="34"></canvas><b id="condt">FINE</b><div class="inv" id="inv"></div></div></div>
  <div class="top-btns" id="tbtns"><button class="sbtn" id="bcam">CAM</button><button class="sbtn" id="bmenu">||</button></div>
  <div class="stickzone" id="sz"><div class="stick" id="stick"><div class="dz"></div><div class="knob" id="knob"></div></div></div>
  <div class="btns" id="btns"><div class="btn b-fire" data-k="fire">FIRE</div><div class="btn b-act" data-k="act">ACT</div><div class="btn b-heal" data-k="heal">HEAL</div><div class="btn b-wpn" data-k="wpn">SWAP</div></div>
  <div class="fade" id="fade"></div>`;
  UI.hud=root.querySelector('#hud');UI.fade=root.querySelector('#fade');UI.ecg=root.querySelector('#ecg');
  // --- floating analog stick ---
  const sz=root.querySelector('#sz'),st=root.querySelector('#stick'),kn=root.querySelector('#knob');
  const R=58,DZ=.18,RUN=.72;let sid=null,ox=0,oy=0,lastZone=0;
  const move=(cx,cy)=>{let dx=cx-ox,dy=cy-oy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}
    kn.style.transform=`translate(${dx}px,${dy}px)`;let m=Math.min(1,d/R);
    if(m<DZ){IN.x=IN.y=IN.mag=0;}else{const k=(m-DZ)/(1-DZ);IN.x=dx/Math.max(d,1)*k;IN.y=dy/Math.max(d,1)*k;IN.mag=k;}
    const zone=m<DZ?0:m<RUN?1:2;if(zone!==lastZone){haptic(zone===2?14:6);lastZone=zone;}st.classList.toggle('run',zone===2);};
  sz.addEventListener('touchstart',e=>{IN.touch=true;if(sid!==null)return;const t=e.changedTouches[0];sid=t.identifier;ox=t.clientX;oy=t.clientY;
    st.style.left=ox+'px';st.style.top=(oy-sz.getBoundingClientRect().top)+'px';st.style.display='block';move(ox,oy);haptic(5);e.preventDefault();},{passive:false});
  sz.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===sid)move(t.clientX,t.clientY);e.preventDefault();},{passive:false});
  const end=e=>{for(const t of e.changedTouches)if(t.identifier===sid){sid=null;st.style.display='none';IN.x=IN.y=IN.mag=0;lastZone=0;kn.style.transform='';}};
  sz.addEventListener('touchend',end);sz.addEventListener('touchcancel',end);
  // mouse fallback for stick (desktop testing)
  let md=false;sz.addEventListener('mousedown',e=>{md=true;ox=e.clientX;oy=e.clientY;st.style.left=ox+'px';st.style.top=(oy-sz.getBoundingClientRect().top)+'px';st.style.display='block';move(ox,oy);});
  addEventListener('mousemove',e=>{if(md)move(e.clientX,e.clientY);});addEventListener('mouseup',()=>{if(md){md=false;st.style.display='none';IN.x=IN.y=IN.mag=0;kn.style.transform='';}});
  // buttons
  for(const b of root.querySelectorAll('.btn')){const k=b.dataset.k;
    const dn=e=>{IN[k]=true;IN['_'+k]=1;b.classList.add('on');haptic(k==='fire'?12:8);e.preventDefault();},up=e=>{IN[k]=false;b.classList.remove('on');e.preventDefault();};
    b.addEventListener('touchstart',dn,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('mousedown',dn);b.addEventListener('mouseup',up);b.addEventListener('mouseleave',()=>{IN[k]=false;b.classList.remove('on');});}
  // keyboard
  const keys={};const kmap={KeyJ:'fire',Space:'fire',KeyK:'act',Enter:'act',KeyE:'act',KeyH:'heal',KeyQ:'wpn'};
  addEventListener('keydown',e=>{if(keys[e.code])return;keys[e.code]=1;const k=kmap[e.code];if(k){IN[k]=true;IN['_'+k]=1;}kb();IN.tap=1;});
  addEventListener('keyup',e=>{keys[e.code]=0;const k=kmap[e.code];if(k)IN[k]=false;kb();});
  const kb=()=>{if(sid!==null||md)return;let x=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),y=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
    const d=Math.hypot(x,y);const m=d?(keys.ShiftLeft||keys.ShiftRight?1:.55):0;IN.x=d?x/d*m:0;IN.y=d?y/d*m:0;IN.mag=m;};
  root.addEventListener('pointerdown',()=>{IN.tap=1;});
  const isTouch='ontouchstart'in window;if(!isTouch)root.querySelector('#btns').style.opacity=.55;
}
export function consume(k){const v=IN['_'+k];IN['_'+k]=0;return v;}
export function show(id,on){const e=UI.root.querySelector('#'+id);if(e)e.style.display=on?'':'none';}
export function controls(on){for(const id of['sz','btns','tbtns','hud'])show(id,on);}
export function cine(on){UI.root.classList.toggle('cine',!!on);}
export function setRoom(t){UI.root.querySelector('#room').textContent=t;}
export function setInv(p){UI.root.querySelector('#inv').innerHTML=`${p.wpn==='shotgun'?'SHOTGUN':'PISTOL'} <b>${p.wpn==='shotgun'?p.shells:p.ammo}</b> &nbsp; HERB <b>${p.herbs}</b>${p.scrap?` &nbsp; SCRAP <b>${p.scrap}</b>`:''}`;
  UI.root.querySelector('#keys').textContent=[...p.keys].map(k=>KEYNAMES[k]||k.toUpperCase()).join(' · ');}
const KEYNAMES={moon:'MOON CREST',sun:'SUN CREST',plug:'DRAIN PLUG',fuel:'FUEL CAN',fuse:'FUSE A',fuse2:'FUSE B',power:'POWER',chains:'SNOW CHAINS',diesel:'DIESEL',card:'KEYCARD',breaker:'BREAKER',antenna:'ANTENNA',battery:'BATTERY',tape:'TAPE',player:'TAPE PLAYER'};
export {KEYNAMES};
let ecgT=0;export function drawECG(hp,dt){const c=UI.ecg,g=c.getContext('2d');ecgT+=dt;const col=hp>60?'#6ad07a':hp>30?'#e0c040':'#e04030';
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,110,34);const x=(ecgT*60)%110;g.fillStyle='#000';g.fillRect(x,0,8,34);
  const ph=(ecgT*(hp>30?1.2:2))%1;const y=17-(ph<.08?Math.sin(ph/.08*Math.PI)*13:ph<.14?-Math.sin((ph-.08)/.06*Math.PI)*5:0);g.fillStyle=col;g.fillRect(x,y,2,2);
  const t=UI.root.querySelector('#condt');t.textContent=hp>60?'FINE':hp>30?'CAUTION':'DANGER';t.style.color=col;}
// dialog with typewriter. returns promise resolved on tap after full text
export function say(name,text,port,opts={}){return new Promise(res=>{
  const d=$(`<div class="dlg ${port?'':'noport'}"><div class="nm"></div><div class="tx"></div><div class="more">▼</div></div>`);
  if(port){const c=document.createElement('canvas');c.width=c.height=port.width;c.getContext('2d').drawImage(port,0,0);d.prepend(c);}
  d.querySelector('.nm').textContent=name||'';UI.root.appendChild(d);const tx=d.querySelector('.tx');let i=0,done=false;IN.tap=0;
  const iv=setInterval(()=>{i+=2;tx.textContent=text.slice(0,i);opts.onType&&i%6===0&&opts.onType();if(i>=text.length){clearInterval(iv);done=true;}},22);
  const t0=performance.now();
  const chk=setInterval(()=>{if(IN.tap||consume('act')||consume('fire')||(opts.auto&&performance.now()-t0>opts.auto)){IN.tap=0;if(!done){clearInterval(iv);tx.textContent=text;done=true;}else if(performance.now()-t0>300){clearInterval(chk);d.remove();res();}}},50);
});}
export function card(html,cls=''){const d=$(`<div class="card ${cls}">${html}</div>`);UI.root.appendChild(d);return d;}
export async function typeCard(lines,opts={}){const d=card(`${opts.head||''}<div class="tl"></div><div class="tap">TAP</div>`,opts.cls);const tl=d.querySelector('.tl');
  for(const ln of lines){const p=document.createElement('p');tl.appendChild(p);for(let i=1;i<=ln.length;i++){p.textContent=ln.slice(0,i);if(i%2===0)opts.onType&&opts.onType();await wait(opts.speed||28);if(IN.tap&&!opts.noskip){p.textContent=ln;break;}}IN.tap=0;await wait(opts.gap||250);}
  await tapWait(opts.auto);d.remove();}
export function wait(ms){return new Promise(r=>setTimeout(r,ms));}
export function tapWait(auto){return new Promise(res=>{IN.tap=0;consume('act');consume('fire');const t0=performance.now();const iv=setInterval(()=>{if(IN.tap||consume('act')||consume('fire')||(auto&&performance.now()-t0>auto)){IN.tap=0;clearInterval(iv);res();}},50);});}
let toastT;export function toast(t,ms=2600){let e=UI.root.querySelector('.toast');if(!e){e=$('<div class="toast"></div>');UI.root.appendChild(e);}e.textContent=t;e.style.display='';clearTimeout(toastT);toastT=setTimeout(()=>e.style.display='none',ms);}
export function prompt(t){let e=UI.root.querySelector('.prompt');if(!t){if(e)e.remove();return;}if(!e){e=$('<div class="prompt"></div>');UI.root.appendChild(e);}e.textContent=t;}
export async function fade(on,ms=350){UI.fade.style.transition=`opacity ${ms}ms`;UI.fade.style.opacity=on?1:0;await wait(ms);}
export function bossBar(name,f){let e=UI.root.querySelector('.boss');if(name===null){if(e)e.remove();return;}if(!e){e=$('<div class="boss"><div class="n"></div><div class="bar"><i></i></div></div>');UI.root.appendChild(e);}
  e.querySelector('.n').textContent=name;e.querySelector('i').style.width=Math.max(0,f*100)+'%';}
export function choice(opts){return new Promise(res=>{const d=$('<div class="choice"></div>');for(const [k,label] of opts){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{d.remove();res(k);};d.appendChild(b);}UI.root.appendChild(d);});}
export function menu(title,sub,items){return new Promise(res=>{const d=card(`<h2>${sub||''}</h2><h1>${title}</h1><div class="menu"></div>`);d.classList.add("mcard");const m=d.querySelector('.menu');
  for(const [k,label] of items){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{d.remove();res(k);};m.appendChild(b);}});}
