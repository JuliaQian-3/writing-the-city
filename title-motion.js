const titles=[...document.querySelectorAll('#article h2,.chapter h2,.gallery-heading h2,#colophon h2')];
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   entry.target.animate([
    {opacity:0,translate:'0 36px',filter:'blur(2px)'},
    {opacity:1,translate:'0 0',filter:'blur(0)'}
   ],{duration:850,easing:'cubic-bezier(.22,1,.36,1)'});
   observer.unobserve(entry.target);
  }
 },{threshold:.12});
 titles.forEach(title=>observer.observe(title));
}
