export function createMobilePaint({stop,undo,clear,canEnter}){
 const query=matchMedia('(any-pointer: coarse), (max-width: 750px)');
 const css=document.createElement('link');css.rel='stylesheet';css.href='./mobile-paint.css?v=smooth-35';document.head.append(css);
 const toolbar=document.createElement('div');toolbar.className='mobile-paint-tools';toolbar.setAttribute('aria-label','Painting tools');
 toolbar.innerHTML=`<div class="mobile-paint-actions" hidden><button type="button" data-action="undo">UNDO</button><button type="button" data-action="clear">CLEAR</button><button type="button" data-action="done">DONE</button></div><button type="button" class="mobile-paint-toggle" aria-label="Start painting" aria-pressed="false"><svg viewBox="0 0 32 40" aria-hidden="true"><path d="M11 11V5h10v6M13 5V2h6v3M9 14l2-3h10l2 3v23H9ZM9 19h14M9 32h14M21 7h5"/></svg></button>`;
 document.body.append(toolbar);
 const dot=document.createElement('div');dot.className='touch-spray-feedback';document.body.append(dot);
 let active=false,contact=false;
 const toggle=toolbar.querySelector('.mobile-paint-toggle'),actions=toolbar.querySelector('.mobile-paint-actions');
 actions.hidden=false;actions.inert=true;actions.setAttribute('aria-hidden','true');
 function set(on){
  if(on===active)return;if(on&&(!query.matches||!canEnter()))return;
  stop();contact=false;dot.classList.remove('is-visible');active=on;
  // Preserve document geometry and scrollY: fixing body resets scroll-driven motion.
  document.documentElement.classList.toggle('mobile-painting',on);toolbar.classList.toggle('is-painting',on);actions.inert=!on;actions.setAttribute('aria-hidden',String(!on));
  toggle.setAttribute('aria-pressed',String(on));toggle.setAttribute('aria-label',on?'Stop painting':'Start painting');
 }
 toggle.onclick=()=>set(!active);
 toolbar.querySelector('[data-action="done"]').onclick=()=>set(false);
 toolbar.querySelector('[data-action="undo"]').onclick=undo;
 toolbar.querySelector('[data-action="clear"]').onclick=clear;
 function feedback(x,y,on){dot.style.transform=`translate(${x}px,${y}px)`;contact=on;dot.classList.toggle('is-visible',on);}
 function sync(){toolbar.hidden=!query.matches;if(!query.matches)set(false);document.documentElement.classList.toggle('touch-paint-ui',query.matches);}
 query.addEventListener('change',sync);sync();
 const preventScroll=e=>{if(active&&e.cancelable)e.preventDefault();};
 document.addEventListener('touchmove',preventScroll,{passive:false});
 document.addEventListener('wheel',preventScroll,{passive:false});
 document.addEventListener('keydown',e=>{if(active&&['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)&&!e.target.closest('button,input,textarea,select'))e.preventDefault();});
 document.addEventListener('click',e=>{if(e.target.closest('a,nav button,#close-photo,#photo-prev,#photo-next,#open-gallery,.read-more,.close-reading,#read'))set(false);},true);
 addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});addEventListener('blur',()=>set(false));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)set(false);});
 addEventListener('hashchange',()=>set(false));addEventListener('orientationchange',()=>set(false));
 // Keep controls reachable inside the native dialog's top layer.
 const dialog=document.querySelector('#photo-dialog');
 new MutationObserver(()=>{set(false);(dialog.open?dialog:document.body).append(toolbar,dot);}).observe(dialog,{attributes:true,attributeFilter:['open']});
 return {get active(){return active;},get enabled(){return query.matches;},set,feedback,toolbar};
}
