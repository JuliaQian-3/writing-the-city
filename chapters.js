// All copy comes from the publication's existing content file.
export function buildChapters(data){
 const gallery=document.querySelector('#gallery');
 const shortNames=['EARLY HITS','FOR SUBWAY GRAFFITI','FROM TAGS TO STYLE','GRAFFITI','STYLE WARS & EXPANSION','ON THE WALLS OF NEW YORK','WHOLE CARS & THE FUTURE'];
 const alt={IMG_1416:'Graffiti lettering across a New York truck',IMG_1421:'Turquoise graffiti on a fire hydrant','IMG_1098 2':'Green bubble lettering on a retaining wall',IMG_1255:'Black and white graffiti sticker',IMG_1376:'Yellow cartoon figure drawn on a brick wall',IMG_1388:'Dog illustration on a yellow pedestrian signal',IMG_1372:'Layered graffiti lettering on a New York wall',IMG_1383:'Red and black tags on a storefront',IMG_1415:'New York column covered in stickers and tags',IMG_1427:'Yellow-painted New York storefront',IMG_1425:'Silver bubble lettering on a wall'};
 const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 function photo(name,cls){const f=make('figure',cls),img=make('img');img.src=`assets/${encodeURIComponent(name)}.jpg`;img.alt=alt[name]||'Street art photographed in New York City';const portrait=['IMG_1256','IMG_1421','IMG_1388','IMG_1415'].includes(name);img.width=portrait?900:1200;img.height=portrait?1200:900;img.loading='lazy';img.decoding='async';f.append(img,make('figcaption',null,'JULIA QIAN / NYC, 2026'));return f;}
 function poem(text,el){for(const line of text.split('\n')){const row=make('div','poem-line');const indent=(line.match(/^ */)||[''])[0].length;row.style.setProperty('--indent',Math.min(indent/8,5));let words=line.trim();const italic=words.startsWith('*')&&words.endsWith('*');if(italic)words=words.slice(1,-1);row.append(make(italic?'em':'span',null,words||'\u00a0'));el.append(row);}}
 function prose(text,el){const sentences=text.match(/[^.!?]+(?:[.!?]+[”’"]?|$)/g)||[text];let para='';for(const s of sentences){para+=s;if(para.length>540){el.append(make('p',null,para.trim()));para='';}}if(para.trim())el.append(make('p',null,para.trim()));}
 data.chapters.slice(1).forEach((chapter,i)=>{
  const n=i+2,poetry=chapter.kind==='POETRY',section=make('section',`chapter chapter-${n} ${poetry?'poetry':'essay'}`);section.id=`chapter-${n}`;section.setAttribute('aria-labelledby',`title-${n}`);
  const overview=make('div','chapter-overview paintable');
  const kicker=make('div','chapter-kicker');kicker.append(make('span',null,`${String(n).padStart(2,'0')} / ${poetry?'POETRY':'A BRIEF HISTORY OF WRITING'}`),make('span',null,chapter.author.toUpperCase()));
  const heading=make('h2','chapter-title');heading.id=`title-${n}`;chapter.lines.split('\n').forEach(line=>heading.append(make('span',null,line)));
  const composition=make('div','chapter-grid');composition.append(photo(chapter.photo,'chapter-photo main-photo'));
  const copy=make('div','chapter-copy');copy.append(make('p','byline',chapter.author));
  const excerpt=make('div',poetry?'poem-copy':'prose-copy');if(poetry)poem(n===2?chapter.full:chapter.preview,excerpt);else prose(chapter.preview,excerpt);copy.append(excerpt);
  const button=make('button','read-more',`READ ${poetry?'THE POEM':'THE CHAPTER'} ↗`);button.id=`read-${n}`;button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',`reading-${n}`);
  if(n!==2)copy.append(button);
  composition.append(copy,photo(chapter.secondary,'chapter-photo secondary-photo'));
  overview.append(kicker,heading,composition);
  const reader=make('div','chapter-reader');reader.id=`reading-${n}`;reader.inert=true;reader.setAttribute('aria-hidden','true');
  const clip=make('div','reader-clip'),readingSurface=make('div','reading-surface paintable');
  const text=make('div',`reading-text ${poetry?'poem-copy':'prose-copy'}`);
  text.append(make('p','reading-label',`${chapter.title} / ${chapter.author}`));
  if(poetry)poem(chapter.full,text);else {const normalized=chapter.preview.replace(/\s+/g,' ').trim();const source=chapter.full;prose(source.startsWith(normalized)?source.slice(normalized.length).trim():source,text);}
  const close=make('button','close-reading','CLOSE READING ↑');text.append(close);readingSurface.append(text);clip.append(readingSurface);reader.append(clip);
  function toggle(open){section.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));button.textContent=open?'CLOSE READING ↙':`READ ${poetry?'THE POEM':'THE CHAPTER'} ↗`;reader.inert=!open;reader.setAttribute('aria-hidden',String(!open));}
  let closing=false;
  function closeSmooth(){
   if(closing)return;
   const startY=scrollY,targetY=Math.max(0,button.getBoundingClientRect().top+startY-Math.min(180,innerHeight*.2));
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){toggle(false);window.scrollTo({top:targetY,behavior:'instant'});button.focus({preventScroll:true});return;}
   closing=true;const height=reader.getBoundingClientRect().height,start=performance.now();
   const root=document.documentElement,oldAnchor=root.style.overflowAnchor,oldScroll=root.style.scrollBehavior;
   root.style.overflowAnchor='none';root.style.scrollBehavior='auto';
   reader.style.transition='none';reader.style.height=`${height}px`;reader.style.overflow='hidden';reader.style.gridTemplateRows='1fr';
   reader.inert=true;button.disabled=true;
   function step(now){const p=Math.min(1,(now-start)/600),e=1-Math.pow(1-p,3);reader.style.height=`${height*(1-e)}px`;window.scrollTo({top:startY+(targetY-startY)*e,behavior:'instant'});
    if(p<1){requestAnimationFrame(step);return;}
    toggle(false);reader.style.removeProperty('height');reader.style.removeProperty('overflow');reader.style.removeProperty('grid-template-rows');
    button.disabled=false;button.focus({preventScroll:true});
    requestAnimationFrame(()=>{reader.style.removeProperty('transition');root.style.overflowAnchor=oldAnchor;root.style.scrollBehavior=oldScroll;closing=false;});
   }requestAnimationFrame(step);
  }
  button.onclick=()=>{if(section.classList.contains('is-open'))closeSmooth();else toggle(true);};close.onclick=closeSmooth;
  const end=make('div','chapter-end paintable');end.append(make('span',null,poetry?'POETRY / '+chapter.author.toUpperCase():'GETTING UP / CRAIG CASTLEMAN, 1982'));const next=make('a',null,n===7?'GALLERY ↗':`${String(n+1).padStart(2,'0')} / NEXT CHAPTER ↗`);next.href=n===7?'#gallery':`#chapter-${n+1}`;end.append(next);
  section.append(overview);if(n!==2)section.append(reader);section.append(end);gallery.before(section);
 });
 const index=document.querySelector('#index');index.querySelectorAll('a').forEach(a=>a.remove());index.append(make('p','index-label','WRITING THE CITY / CONTENTS'));
 data.chapters.forEach((chapter,i)=>{const a=make('a','index-chapter');a.href=i===0?'#article':`#chapter-${i+1}`;a.append(make('span','index-number',String(i+1).padStart(2,'0')),make('span',null,shortNames[i]),make('small',null,chapter.kind==='TEXT'?'TEXT':'POEM'));index.append(a);});
 for(const [href,title]of [['#gallery','PHOTO GALLERY'],['#colophon','COLOPHON'],['#home','BACK TO TOP ↑']]){const a=make('a','index-secondary',title);a.href=href;index.append(a);}
 const first=document.querySelector('#article');first.dataset.chapter='1';
 const firstEnd=first.querySelector('.chapter-end');firstEnd.lastElementChild.remove();const next=make('a',null,'02 / NEXT CHAPTER ↗');next.href='#chapter-2';firstEnd.append(next);
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){index.querySelectorAll('a').forEach(a=>{const current=a.hash==='#'+entry.target.id;a.classList.toggle('current',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('#article,.chapter,#gallery,#colophon').forEach(el=>observer.observe(el));
 document.fonts.ready.then(()=>{if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));});
}
