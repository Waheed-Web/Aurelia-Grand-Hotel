/* =====================================================================
   Aurelia Grand Hotel — "A Guest's Sketchbook" hero.
   Each plate is a real photograph of the hotel, cropped to a shared
   spread ratio and given a soft ink-wash tint so the set reads as one
   consistent journal. The leaf that turns is a real curved surface: a
   chain of nested strips whose tangent sweeps through an arc, so the
   page bends the way paper bends instead of pivoting like a flat door.
   ===================================================================== */
const Q=new URLSearchParams(location.search);
/* Pexels crops locked to the book's own spread ratio (1760:1240) so the
   background-size math below lines up perfectly with every plate. */
const PAGES=[
  {file:'https://images.pexels.com/photos/695193/pexels-photo-695193.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'The Façade',           place:'Harbourview Avenue'},
  {file:'https://images.pexels.com/photos/34672504/pexels-photo-34672504.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'Deluxe King Room',     place:'Third Floor'},
  {file:'https://images.pexels.com/photos/18285946/pexels-photo-18285946.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'Executive Suite',      place:'Skyline Wing'},
  {file:'https://images.pexels.com/photos/5677269/pexels-photo-5677269.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'Grand Terrace Suite',  place:'Rooftop'},
  {file:'https://images.pexels.com/photos/18161061/pexels-photo-18161061.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'Family Suite',         place:'Garden Wing'},
  {file:'https://images.pexels.com/photos/11159530/pexels-photo-11159530.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'Spa & Wellness',       place:'Level 3'},
  {file:'https://images.pexels.com/photos/1428053/pexels-photo-1428053.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'Skyline Rooftop Bar',  place:'Level 12'},
  {file:'https://images.pexels.com/photos/4906510/pexels-photo-4906510.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'Garden Café',          place:'Courtyard'},
  {file:'https://images.pexels.com/photos/57980/pexels-photo-57980.jpeg?auto=compress&cs=tinysrgb&w=1400&h=986&fit=crop',
    title:'The Grand Ballroom',   place:'Grand Hall'}
];
PAGES.forEach(p=>p.url=p.file);
const M=PAGES.length, LAND=6;

const wrap=document.getElementById('sbWrap');
const stage=document.getElementById('sbStage');
const sb3d=document.getElementById('sb3d');
const book=document.getElementById('sbBook');
const capBox=document.getElementById('sbCaptions');
const hint=document.getElementById('sbHint');
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------ the turning leaf */
const N=18;            /* strips — enough for a smooth curve          */
const SPAN=0.449;      /* gutter → outer page edge, as a fraction     */
const BETA=0.60;       /* peak curl of the arc, radians              */
let idx=0, turn=null;  /* turn = {dir, from, to, t}                   */
let strips=[];         /* the chain, kept for per-frame lighting       */

function el(t,c){const e=document.createElement(t);if(c)e.className=c;return e}
function imgEl(i,side){
  const im=new Image();im.className='sb-half-img '+side;
  im.draggable=false;im.alt='';im.src=PAGES[i].url;return im;
}

function halfEl(pos,i){
  const d=el('div','sb-half '+pos);
  d.appendChild(imgEl(i,pos));
  d.appendChild(el('div','gutter-shade '+pos));
  return d;
}
/* build the strip chain once per turn; background offsets are pure
   geometry, so they never need touching again while it animates */
function buildCurl(dir,from,to){
  strips=[];
  const c=el('div','curl '+dir);
  c.style.setProperty('--n',N);
  c.style.setProperty('--span',SPAN);
  let host=c;
  for(let i=0;i<N;i++){
    const s=el('div','strip');
    s.style.setProperty('--i',i);
    const gut='calc(var(--bw) * 0.5)';
    const sw='calc(var(--bw) * '+SPAN+' / '+N+')';
    const A='calc(-1 * ('+gut+' + '+i+' * '+sw+'))';         /* faces the from-page  */
    const B='calc('+(i+1)+' * '+sw+' - '+gut+')';            /* faces the to-page    */
    const f=el('div','face front'), b=el('div','face back');
    const dress=(e,url,px)=>{
      e.style.backgroundImage='url('+url+')';
      e.style.backgroundPositionX=px;
    };
    dress(f,PAGES[from].url, dir==='next'?A:B);
    dress(b,PAGES[to].url,   dir==='next'?B:A);
    f.appendChild(el('div','sh'));f.appendChild(el('div','gl'));
    b.appendChild(el('div','sh'));b.appendChild(el('div','gl'));
    s.appendChild(f);s.appendChild(b);
    if(i===N-1)s.classList.add('edge');
    host.appendChild(s);host=s;
    strips.push(s);
  }
  return c;
}
function applyTurn(t){
  const th=Math.PI*t;                       /* how far the leaf has swung */
  const beta=BETA*Math.sin(Math.PI*t);      /* it is flat at both ends    */
  const D=180/Math.PI;
  const tt=th+beta, td=2*beta/N;
  sb3d.style.setProperty('--tt',(tt*D).toFixed(2)+'deg');
  sb3d.style.setProperty('--td',(td*D).toFixed(3)+'deg');
  sb3d.style.setProperty('--shade',Math.sin(Math.PI*t).toFixed(3));
  fadeCaption(t);
  for(let i=0;i<strips.length;i++){
    const l1=Math.abs(Math.cos(tt-i*td));        /* facing at this strip's near edge */
    const l2=Math.abs(Math.cos(tt-(i+1)*td));    /* ...and at its far edge           */
    const st=strips[i].style;
    st.setProperty('--lit',l1.toFixed(3));
    st.setProperty('--a1',((1-l1)*.62).toFixed(3));
    st.setProperty('--a2',((1-l2)*.62).toFixed(3));
  }
}
function paint(){
  book.textContent='';
  if(!turn){
    const f=el('div','sb-full');
    const im=new Image();im.src=PAGES[idx].url;im.alt=PAGES[idx].title;
    im.draggable=false;
    f.appendChild(im);book.appendChild(f);
    sb3d.style.setProperty('--shade','0');
  }else{
    const next=turn.dir==='next';
    book.appendChild(halfEl('left', next?turn.from:turn.to));
    book.appendChild(halfEl('right',next?turn.to:turn.from));
    book.appendChild(buildCurl(turn.dir,turn.from,turn.to));
    applyTurn(turn.t);
  }
  const a=el('button','sb-zone sb-prev'),b=el('button','sb-zone sb-next');
  a.setAttribute('aria-label','previous page');b.setAttribute('aria-label','next page');
  book.appendChild(a);book.appendChild(b);
  layout();
  caption();
  marks();
  if(typeof syncZoomLayer==='function')syncZoomLayer();
  if(typeof placeLoupe==='function')placeLoupe();
}
function captionMarkup(p){return '<span class="title">'+p.title+'</span> <span class="place">— '+p.place+'</span>'}
function caption(){
  capBox.textContent='';
  capOut=capIn=null;
  if(turn){
    capOut=el('p','sb-caption live');capOut.innerHTML=captionMarkup(PAGES[turn.from]);capBox.appendChild(capOut);
    capIn=el('p','sb-caption live');capIn.innerHTML=captionMarkup(PAGES[turn.to]);capBox.appendChild(capIn);
    fadeCaption(turn.t);
  }else{
    const p=el('p','sb-caption');p.innerHTML=captionMarkup(PAGES[idx]);capBox.appendChild(p);
  }
}
let capOut=null,capIn=null;
function fadeCaption(t){
  if(!capOut||!capIn)return;
  /* the old title is gone before the new one arrives, so they never
     sit on top of each other mid-drag */
  const out=1-Math.max(0,Math.min(1,(t-0.10)/0.28));
  const inn=Math.max(0,Math.min(1,(t-0.56)/0.30));
  capOut.style.opacity=out.toFixed(3);
  capIn.style.opacity=inn.toFixed(3);
}
function layout(){
  sb3d.style.setProperty('--bw',book.clientWidth+'px');
}
addEventListener('resize',layout);

/* ------------------------------------------------------ spring loop */
let spring=null;
function animateTo(target,onDone,stiff,damp){
  spring={kind:'spring',v:0,target:target,done:onDone,k:stiff||150,c:damp||22};
  kick();
}
/* the riffle wants a fixed tempo, not a spring settling time */
function tweenTo(target,dur,onDone){
  spring={kind:'tween',from:turn?turn.t:0,target:target,dur:dur,e:0,done:onDone};
  kick();
}
let raf=null,last=0;
function tick(now){
  raf=null;
  const dt=Math.min(0.032,(now-last)/1000||0.016);last=now;
  if(spring&&turn){
    const s=spring;
    if(s.kind==='tween'){
      s.e+=dt;
      const k=Math.min(1,s.e/s.dur);
      turn.t=s.from+(s.target-s.from)*k;
      applyTurn(turn.t);
      if(k>=1){spring=null;const d=s.done;d&&d();}
    }else{
      const x=turn.t-s.target;
      s.v+= (-s.k*x - s.c*s.v)*dt;
      turn.t+=s.v*dt;
      if(Math.abs(turn.t-s.target)<0.002&&Math.abs(s.v)<0.02){
        turn.t=s.target;spring=null;
        applyTurn(turn.t);
        const d=s.done;d&&d();
      }else applyTurn(turn.t);
    }
  }
  viewSpring();
  const lmoved=loupeEase();
  /* kick() may already have queued the next frame from a done-callback */
  if((spring||viewActive||lmoved)&&raf===null) raf=requestAnimationFrame(tick);
}
function kick(){ if(raf===null){last=performance.now();raf=requestAnimationFrame(tick);} }

/* ------------------------------------------- tilt + zoom of the book */
const TILT_X=4.5, TILT_Y=7;      /* degrees — deliberately restrained   */
const ZOOM_MIN=0.9, ZOOM_MAX=1.5;
const view={rx:0,ry:0,z:1, trx:0,try_:0,tz:1};
let viewActive=false;
let lastZ=1;
function applyView(){
  sb3d.style.setProperty('--rx',view.rx.toFixed(2)+'deg');
  sb3d.style.setProperty('--ry',view.ry.toFixed(2)+'deg');
  sb3d.style.setProperty('--zoom',view.z.toFixed(3));
  /* the glass stays put, but the page under it has moved */
  if(view.z!==lastZ){lastZ=view.z;if(typeof placeLoupe==='function')placeLoupe();}
}
function viewSpring(){
  const e=0.14;
  let moved=false;
  for(const [k,t] of [['rx','trx'],['ry','try_'],['z','tz']]){
    const d=view[t]-view[k];
    if(Math.abs(d)>0.0006){view[k]+=d*e;moved=true;}
    else view[k]=view[t];
  }
  if(moved)applyView();
  viewActive=moved;
  return moved;
}
function setView(rx,ry,z){
  view.trx=Math.max(-TILT_X,Math.min(TILT_X,rx));
  view.try_=Math.max(-TILT_Y,Math.min(TILT_Y,ry));
  view.tz=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,z));
  viewActive=true;kick();
  if(typeof syncZoom==='function')syncZoom();
}
/* the book leans toward the cursor — no dragging, and never far */
function tiltTo(cx,cy){
  if(drag)return;                       /* hold still while a page is being turned */
  const r=book.getBoundingClientRect();
  if(!r.width)return;
  const nx=Math.max(-1,Math.min(1,(cx-(r.left+r.width/2))/(r.width*0.62)));
  const ny=Math.max(-1,Math.min(1,(cy-(r.top+r.height/2))/(r.height*0.9)));
  setView(-ny*TILT_X, nx*TILT_Y, view.tz);
}
addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  tiltTo(e.clientX,e.clientY);
},{passive:true});
addEventListener('pointerout',e=>{if(!e.relatedTarget)setView(0,0,view.tz)});
addEventListener('blur',()=>setView(0,0,view.tz));
/* the wheel belongs to the page — zoom is on the toolbar, or a double click
   to come back to 100% */
stage.addEventListener('dblclick',()=>setView(view.trx,view.try_,1));

/* ------------------------------------------------------- pointer work */
let drag=null;
function bookRect(){return book.getBoundingClientRect()}
function hideHint(){hint.classList.add('gone')}

stage.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  e.preventDefault();                     /* no text selection, no image drag */
  const onBook=e.target.closest('.sb-zone');
  stage.setPointerCapture(e.pointerId);
  hideHint();
  if(!onBook||introOn)return;
  const r=bookRect();
  const dir=(e.clientX-r.left)/r.width>0.5?'next':'prev';
  startTurn(dir,0);
  drag={dir:dir,x0:e.clientX,w:r.width,moved:0,vel:0,tPrev:performance.now()};
});
stage.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-drag.x0;
  drag.moved=Math.max(drag.moved,Math.abs(dx));
  const raw=(drag.dir==='next'? -dx : dx)/(drag.w*0.62);
  const t=Math.max(0,Math.min(1,raw));
  const now=performance.now();
  drag.vel=(t-(turn?turn.t:0))/Math.max(0.001,(now-drag.tPrev)/1000);
  drag.tPrev=now;
  if(turn){turn.t=t;applyTurn(t);}
});
function endDrag(e){
  if(!drag)return;
  const d=drag;drag=null;
  if(!turn)return;
  if(d.moved<6){                              /* a tap, not a drag */
    commit();return;
  }
  const go = turn.t>0.42 || d.vel>1.1;
  if(go)commit(); else cancel();
}
stage.addEventListener('dragstart',e=>e.preventDefault());
stage.addEventListener('selectstart',e=>e.preventDefault());
stage.addEventListener('pointerup',endDrag);
stage.addEventListener('pointercancel',endDrag);

/* ------------------------------------------------------ turn control */
function startTurn(dir,t){
  spring=null;
  if(turn){idx=turn.to;turn=null;}      /* settle anything still in flight */
  if(typeof shoveLoupe==='function')shoveLoupe(dir);
  const from=idx;
  turn={dir:dir,from:from,to:dir==='next'?(from+1)%M:(from-1+M)%M,t:t||0};
  paint();
}
function commit(){
  if(!turn)return;
  if(REDUCED){idx=turn.to;turn=null;paint();return;}
  animateTo(1,()=>{idx=turn.to;turn=null;paint();},170,26);
  kick();
}
function cancel(){
  if(!turn)return;
  animateTo(0,()=>{turn=null;paint();},150,24);
  kick();
}
function step(dir){
  if(introOn)endIntro();
  if(turn){ /* finish whatever is in flight first */ idx=turn.to;turn=null; }
  startTurn(dir,0);commit();
}
function goTo(i){
  if(introOn)endIntro();
  if(i===idx)return;
  if(turn){idx=turn.to;turn=null;}
  const fwd=(i-idx+M)%M, back=(idx-i+M)%M;
  if(Math.min(fwd,back)===1){step(fwd===1?'next':'prev');return;}
  idx=i;paint();
}
document.getElementById('sbLeft').onclick=()=>step('prev');
document.getElementById('sbRight').onclick=()=>step('next');
addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  e.preventDefault();hideHint();
  step(e.key==='ArrowRight'?'next':'prev');
});
document.getElementById('heroDown').onclick=()=>{
  document.getElementById('about').scrollIntoView({behavior:'smooth',block:'start'});
};

/* --------------------------------------------------- loupe + controls */
const loupe=document.getElementById('loupe');
const lens=document.getElementById('loupeLens');
const zRead=document.getElementById('zRead');
const loupeBtn=document.getElementById('loupeBtn');
const zInBtn=document.getElementById('zIn'), zOutBtn=document.getElementById('zOut');
const MAG=2.3;
let loupeOn=true, lx=null, ly=null, lgrab=null, lTarget=null;

function loupeSize(){return Math.round(Math.max(165,Math.min(262,book.clientWidth*0.235)));}
/* the loupe's own coordinate space: stage pixels in live mode (it sits
   outside the book's transform), book pixels otherwise */
function bookBox(){
  return {x:0,y:0,w:book.clientWidth,h:book.clientHeight};
}
/* park it on the desk at the lower right, half off the book */
function restLoupe(){
  const b=bookBox();
  lx=b.x+b.w*0.88; ly=b.y+b.h*0.855;
  placeLoupe();
}
/* The glass sits above the tilt, in the book's untransformed pixels, so the
   lean of the page never nudges it.  What the tilt does change is which part
   of the paper is under the glass, and only the scale matters enough to
   correct for: the book is drawn about its own centre. */
const zoomWrap=document.getElementById('zoomWrap');
const zoomInner=document.getElementById('zoomInner');
/* mirror whatever the book is currently showing into the magnified copy */
function syncZoomLayer(){
  zoomInner.textContent='';
  for(const c of book.children){
    if(c.classList.contains('sb-zone'))continue;      /* hit targets need no copy */
    zoomInner.appendChild(c.cloneNode(true));
  }
}
function placeLoupe(){
  if(lx===null)return;
  const B=bookBox(), bw=B.w, bh=B.h;
  if(!bw)return;
  const R=loupeSize()/2, bez=R*2*0.058;
  loupe.style.setProperty('--lr',R*2+'px');
  loupe.style.transform='translate3d('+(lx-R).toFixed(1)+'px,'+(ly-R).toFixed(1)+'px,0)';
  if(loupeOn)loupe.classList.add('on');

  /* where the paper's edges actually land once the book is scaled */
  const z=view.z, cx=bw/2, cy=bh/2;
  const x0=cx+(bw*.051-cx)*z, x1=cx+(bw*.949-cx)*z;
  const y0=cy+(bh*.218-cy)*z, y1=cy+(bh*.782-cy)*z;
  /* How far the glass's own centre is inside the paper.  The copy fades out
     as it wanders off the sheet, so you are left looking through plain
     glass rather than at a sliver of page on flat desk. */
  const nx=Math.max(x0,Math.min(lx,x1));
  const ny=Math.max(y0,Math.min(ly,y1));
  const inside=(lx>x0&&lx<x1&&ly>y0&&ly<y1)
    ? Math.min(lx-x0, x1-lx, ly-y0, y1-ly)
    : -Math.hypot(lx-nx,ly-ny);
  const k=Math.max(0,Math.min(1,(inside+R*0.30)/(R*0.55)));

  zoomWrap.style.opacity=(loupeOn?k:0).toFixed(3);
  if(k<=0.002)return;
  const r=(R-bez).toFixed(1);
  const mask='radial-gradient(circle '+r+'px at '+lx.toFixed(1)+'px '+ly.toFixed(1)+'px,'
    +'#000 calc(100% - 1px),transparent 100%)';
  zoomWrap.style.webkitMaskImage=mask;
  zoomWrap.style.maskImage=mask;
  /* the page point beneath the glass, magnified about that same spot so the
     lens keeps showing MAG times whatever is on screen */
  const px=cx+(lx-cx)/z, py=cy+(ly-cy)/z, s=MAG*z;
  zoomInner.style.transform='translate('+(lx-px*s).toFixed(1)+'px,'+(ly-py*s).toFixed(1)+'px) '
    +'scale('+s.toFixed(4)+')';
}
/* the leaf shoves the glass aside as it sweeps past */
function shoveLoupe(dir){
  if(!loupeOn||lx===null||lgrab)return;
  const b=bookBox();
  /* which page point the glass covers, once the book's scale is undone */
  const nx=(b.w/2+(lx-b.x-b.w/2)/view.z)/b.w, ny=(b.h/2+(ly-b.y-b.h/2)/view.z)/b.h;
  if(nx<0.02||nx>0.98||ny<0.17||ny>0.83)return;      /* already clear of the page */
  lTarget={x:b.x+b.w*(dir==='next'?0.12:0.88), y:b.y+b.h*0.855};
  kick();
}
function loupeEase(){
  if(!lTarget)return false;
  if(lgrab){lTarget=null;return false;}
  const dx=lTarget.x-lx, dy=lTarget.y-ly;
  if(Math.abs(dx)<0.5&&Math.abs(dy)<0.5){lx=lTarget.x;ly=lTarget.y;lTarget=null;placeLoupe();return false;}
  lx+=dx*0.17;ly+=dy*0.17;placeLoupe();
  return true;
}
loupe.addEventListener('pointerdown',e=>{
  if(!loupeOn||e.button!==0)return;
  e.preventDefault();e.stopPropagation();     /* never starts a page turn */
  lTarget=null;
  lgrab={cx:e.clientX,cy:e.clientY,lx0:lx,ly0:ly};
  loupe.classList.add('held');
  loupe.setPointerCapture(e.pointerId);
  hideHint();
});
loupe.addEventListener('pointermove',e=>{
  if(!lgrab)return;
  const b=bookBox(), R=loupeSize()/2;
  /* the glass carries none of the book's transform, so the cursor maps 1:1 */
  lx=Math.max(b.x-R*0.7,Math.min(b.x+b.w+R*0.7, lgrab.lx0+(e.clientX-lgrab.cx)));
  ly=Math.max(b.y-R*0.7,Math.min(b.y+b.h+R*1.0, lgrab.ly0+(e.clientY-lgrab.cy)));
  placeLoupe();
});
function dropLoupe(){lgrab=null;loupe.classList.remove('held');}
loupe.addEventListener('pointerup',dropLoupe);
loupe.addEventListener('pointercancel',dropLoupe);
loupeBtn.onclick=()=>{
  loupeOn=!loupeOn;
  loupeBtn.setAttribute('aria-pressed',String(loupeOn));
  loupe.classList.toggle('on',loupeOn);
  if(loupeOn&&lx===null)restLoupe();
};
addEventListener('resize',()=>{lx=null;restLoupe();});

function syncZoom(){
  zRead.textContent=Math.round(view.tz*100)+'%';
  zOutBtn.disabled=view.tz<=ZOOM_MIN+0.001;
  zInBtn.disabled=view.tz>=ZOOM_MAX-0.001;
}
zInBtn.onclick=()=>{setView(view.trx,view.try_,view.tz*1.16);hideHint();};
zOutBtn.onclick=()=>{setView(view.trx,view.try_,view.tz/1.16);hideHint();};

/* --------------------------------------------------------- the index */
const plateList=document.getElementById('plateList');
PAGES.forEach((p,i)=>{
  const li=el('li');
  const b=el('button','plate');
  b.innerHTML='<span class="n">'+String(i+1).padStart(2,'0')+'</span>'+
              '<span class="t"></span><span class="p"></span>';
  b.querySelector('.t').textContent=p.title;
  b.querySelector('.p').textContent=p.place;
  b.onclick=()=>{goTo(i);document.getElementById('sketchbook').scrollIntoView({behavior:'smooth',block:'center'});};
  li.appendChild(b);plateList.appendChild(li);
});
function marks(){
  const cur=turn?turn.to:idx;
  plateList.querySelectorAll('.plate').forEach((b,i)=>b.setAttribute('aria-current',i===cur?'true':'false'));
}

/* ---------------------------------------------------------- the riffle */
let riffle=null,riffleAt=0,introOn=false;
function endIntro(){
  introOn=false;wrap.classList.remove('intro','b2');
}
function riffleStep(){
  const s=riffle[riffleAt];
  wrap.classList.toggle('b2',s.bell>0.55);
  startTurn('next',0);
  tweenTo(1,s.dur,()=>{
    idx=turn.to;turn=null;
    riffleAt++;
    if(introOn&&riffleAt<riffle.length){paint();riffleStep();}
    else{endIntro();paint();}
  });
}
function startIntro(){
  const coarse=matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  if(coarse||REDUCED||Q.has('nointro')){idx=LAND;paint();return;}
  const steps=M+LAND;
  riffle=[];
  for(let r=0;r<steps;r++){
    const bell=Math.sin(Math.PI*(r/(steps-1)));
    riffle.push({bell:bell,dur:0.26-0.19*bell});
  }
  riffleAt=0;introOn=true;wrap.classList.add('intro');
  riffleStep();
}

/* ------------------------------------------------------------- boot */
(async function boot(){
  idx=Q.has('shot')?(parseInt(Q.get('shot'),10)||0)%M:0;
  paint();applyView();
  await Promise.all(PAGES.map(p=>{
    const im=new Image();im.src=p.url;
    return im.decode?im.decode().catch(()=>{}):new Promise(r=>{im.onload=im.onerror=r});
  }));
  if(document.fonts&&document.fonts.ready)await document.fonts.ready.catch(()=>{});
  syncZoom();restLoupe();
  document.body.dataset.ready='1';
  if(Q.has('shot')){
    if(Q.has('t')){startTurn(Q.get('dir')||'next',parseFloat(Q.get('t')));}
    return;
  }
  setTimeout(startIntro,220);
})();
