// Use vector arrows rather than platform-dependent Unicode/emoji glyphs.
const directions={'↗':-45,'↙':135,'↑':-90,'↓':90,'→':0,'←':180};
const ns='http://www.w3.org/2000/svg';
function convert(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode()){
  const node=walker.currentNode;
  if(node.parentElement.closest('svg')||!/[↗↙↑↓→←]/.test(node.data))continue;
  nodes.push(node);
 }
 for(const node of nodes){
  const fragment=document.createDocumentFragment();
  for(const part of node.data.split(/([↗↙↑↓→←])/)){
   if(!(part in directions)){fragment.append(document.createTextNode(part));continue;}
   const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('class','city-arrow');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   const path=document.createElementNS(ns,'path');path.setAttribute('d','M5 16H27M17 6L27 16L17 26');path.setAttribute('transform',`rotate(${directions[part]} 16 16)`);svg.append(path);fragment.append(svg);
  }
  node.replaceWith(fragment);
 }
}
const css=document.createElement('link');css.rel='stylesheet';css.href='./arrows.css?v=52';document.head.append(css);
function refresh(){document.querySelectorAll('a,button').forEach(convert);}
refresh();
new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true,characterData:true});
