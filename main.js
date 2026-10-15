import * as THREE from './vendor/three.module.js';
import { createSubway } from './subway.js?v=full-train-51';
import { createMobilePaint } from './mobile-paint.js?v=smooth-35';
import { buildChapters } from './chapters.js?v=reading-25';
const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const data=await fetch('./assets/content.json').then(r=>r.json());
buildChapters(data);
await import('./title-motion.js?v=titles-23');
const heroTrack=document.createElement('div');heroTrack.className='hero-track';$('#home').before(heroTrack);heroTrack.append($('#home'));
const heroLines=[...document.querySelectorAll('.hero-title h1 span')];let heroProgress=0;
$('#preview').textContent=data.chapters[0].preview;
const full=data.chapters[0].full.slice(data.chapters[0].preview.length).trim();
for(const text of full.split(/(?=As hundreds|At this time|As writers|Bama tried|The real competition|In order)/)){const p=document.createElement('p');p.textContent=text;$('#fulltext').append(p);}
$('#expanded').inert=true;$('#expanded').setAttribute('aria-hidden','true');
$('#read').onclick=()=>{const open=$('#article').classList.toggle('open');$('#read').setAttribute('aria-expanded',open);$('#expanded').inert=!open;$('#expanded').setAttribute('aria-hidden',String(!open));$('#read').innerHTML=open?'CLOSE CHAPTER <span>↙</span>':'READ THE CHAPTER <span>↗</span>';};
const toolsToggle=$('#tools-toggle'),toolsPanel=$('#tools-panel');
const nav=toolsToggle.closest('nav');
function updateNavContrast(){
 const r=nav.getBoundingClientRect();
 let el=document.elementsFromPoint(Math.min(innerWidth-1,r.right-22),r.top+28).find(el=>!el.closest('nav,#can')&&!el.classList.contains('paint-layer')),color=null;
 if(el?.closest('#gallery'))color=[237,0,127];
 while(el&&!color){const c=getComputedStyle(el).backgroundColor.match(/[\d.]+/g);if(c&&c.length>=3&&(c.length<4||Number(c[3])>.8))color=c.slice(0,3).map(Number);el=el.parentElement;}
 const bright=color?(.2126*color[0]+.7152*color[1]+.0722*color[2])>155:true;
 nav.style.setProperty('--nav-ink',bright?'#171916':'#f6f4e9');nav.style.setProperty('--nav-hover',bright?'#d00068':'#ffeb29');
}
let navFrame=0;function scheduleNavContrast(){cancelAnimationFrame(navFrame);navFrame=requestAnimationFrame(updateNavContrast);}
addEventListener('scroll',scheduleNavContrast,{passive:true});addEventListener('resize',scheduleNavContrast);scheduleNavContrast();
function setTools(open){toolsToggle.setAttribute('aria-expanded',String(open));toolsToggle.setAttribute('aria-label',open?'Close tools':'Open tools');toolsToggle.closest('nav').classList.toggle('is-open',open);toolsPanel.inert=!open;}
toolsToggle.onclick=()=>setTools(toolsToggle.getAttribute('aria-expanded')!=='true');
addEventListener('keydown',e=>{if(e.key==='Escape'&&toolsToggle.getAttribute('aria-expanded')==='true'){setTools(false);toolsToggle.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('nav,aside')&&toolsToggle.getAttribute('aria-expanded')==='true')setTools(false);});
const indexPanel=$('#index');let indexClosing;
function openIndex(){clearTimeout(indexClosing);setTools(false);indexPanel.hidden=false;indexPanel.inert=false;indexPanel.classList.remove('index-open');void indexPanel.offsetWidth;indexPanel.classList.add('index-open');$('#contents').setAttribute('aria-expanded','true');$('#close-index').focus({preventScroll:true});}
function closeIndex(){indexPanel.classList.remove('index-open');indexPanel.inert=true;$('#contents').setAttribute('aria-expanded','false');clearTimeout(indexClosing);indexClosing=setTimeout(()=>{indexPanel.hidden=true;scheduleNavContrast();toolsToggle.focus({preventScroll:true});},matchMedia('(prefers-reduced-motion: reduce)').matches?0:350);}
$('#contents').onclick=openIndex;
$('#close-index').onclick=closeIndex;
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#index').hidden){$('#close-index').click();}});
indexPanel.addEventListener('click',e=>{if(e.target.closest('a')){e.stopImmediatePropagation();closeIndex();}},true);

// Paint is accumulated into a white mask. Difference is applied once, not per dab.
const layers=[],history=[];let active=null,pointer={x:innerWidth*.8,y:innerHeight*.6},down=false,lastTime=0,dwell=0,drips=[],muted=true,audio,gain;
function layer(element,canvas=null){
 canvas ||= document.createElement('canvas');
 if(element){canvas.className='paint-layer';element.append(canvas);}
 const item={element,canvas,ctx:canvas.getContext('2d'),dirty:false};layers.push(item);
 if(element){let resizeTimer;const resize=()=>{const w=Math.ceil(element.clientWidth),h=Math.ceil(element.clientHeight);if(w===canvas.width&&h===canvas.height)return;canvas.width=w;canvas.height=h;canvas.style.width=w+'px';canvas.style.height=h+'px';for(const stroke of history)for(const entry of stroke.ops)if(entry.l===item)paintOp(item,entry.op,false);};
 new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,80);}).observe(element);}
 return item;
}
document.querySelectorAll('.paintable').forEach(el=>layer(el));
const subway=createSubway({layer,reduced});
const stamp=document.createElement('canvas');stamp.width=stamp.height=160;const sc=stamp.getContext('2d');let seed=7;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<9500;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*77,x=80+Math.cos(a)*r,y=80+Math.sin(a)*r;sc.fillStyle=`rgba(255,255,255,${Math.pow(1-r/80,1.8)*.6})`;sc.fillRect(x,y,rand()*1.6+.3,rand()*1.6+.3);}
const coloredStamp=document.createElement('canvas');coloredStamp.width=coloredStamp.height=160;
const colorContext=coloredStamp.getContext('2d');let rainbowHue=310,lastRainbowPoint=null;
function paintOp(l,op,record=true){
 const c=l.ctx;
 // Only train layers use pigment. Store colors in history so Undo replays identically.
 if(l.rainbow&&!op.color){
  const distance=lastRainbowPoint?.l===l?Math.hypot(op.x-lastRainbowPoint.x,op.y-lastRainbowPoint.y):0;
  rainbowHue=(rainbowHue+Math.min(distance,35)*.42+.25)%360;
  op.color=`hsl(${rainbowHue} 95% 52%)`;lastRainbowPoint={l,x:op.x,y:op.y};
 }
 if(op.type==='dab'){
  let brush=stamp;const size=op.size*(l.rainbow?.45:1);
  if(l.rainbow){colorContext.globalCompositeOperation='source-over';colorContext.clearRect(0,0,160,160);colorContext.drawImage(stamp,0,0);colorContext.globalCompositeOperation='source-in';colorContext.fillStyle=op.color;colorContext.fillRect(0,0,160,160);brush=coloredStamp;}
  c.globalAlpha=op.alpha;c.drawImage(brush,op.x-size/2,op.y-size/2,size,size);
 }else{
  const width=op.width*(l.rainbow?.5:1);
  c.globalAlpha=.75;c.strokeStyle=l.rainbow?op.color:'#fff';c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(op.x,op.y);c.lineTo(op.x+op.dx,op.y+op.len);c.stroke();c.beginPath();c.arc(op.x+op.dx,op.y+op.len,width*.68,0,Math.PI*2);c.fillStyle=l.rainbow?op.color:'#fff';c.fill();
 }
 c.globalAlpha=1;l.dirty=true;if(l.rainbow&&op.type==='dab')l.lastColor=op.color;if(record&&active)active.ops.push({l,op});
}
function snapshotDripColor(d){
 if(!d.l.rainbow||d.color)return;
 const x=Math.max(0,Math.min(d.l.canvas.width-1,Math.round(d.x)));
 const y=Math.max(0,Math.min(d.l.canvas.height-1,Math.round(d.y)));
 const pixel=d.l.ctx.getImageData(x,y,1,1).data;
 // Capture the actual mixed pigment at the source, before any older drip is redrawn.
 // Once assigned, this color belongs to the drip and its recorded replay operations.
 d.color=pixel[3]>12?`rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})`:d.l.lastColor;
}
function buttons(){$('#undo').disabled=$('#clear').disabled=history.length===0;}
function replay(){for(const l of layers){l.ctx.clearRect(0,0,l.canvas.width,l.canvas.height);l.dirty=true;}for(const s of history)for(const {l,op}of s.ops)paintOp(l,op,false);buttons();}
$('#undo').onclick=()=>{history.pop();drips=[];replay();};$('#clear').onclick=()=>{history.length=0;drips=[];replay();};
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();$('#undo').click();}});
function sound(on){if(muted)return;if(!audio){audio=new AudioContext();const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate);const ar=buffer.getChannelData(0);for(let i=0;i<ar.length;i++)ar[i]=Math.random()*2-1;const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1800;gain=audio.createGain();gain.gain.value=0;source.connect(filter).connect(gain).connect(audio.destination);source.start();}audio.resume();gain.gain.setTargetAtTime(on?.045:0,audio.currentTime,.06);}
$('#sound').onclick=()=>{if(!muted)sound(false);muted=!muted;$('#sound').textContent=muted?'SOUND OFF':'SOUND ON';$('#sound').setAttribute('aria-pressed',!muted);};

// A metal can made of lit, volumetric geometry, not a cursor image.
const canRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true});canRenderer.setPixelRatio(Math.min(devicePixelRatio,2));canRenderer.setSize(180,240);$('#can').append(canRenderer.domElement);
const canScene=new THREE.Scene(),canCamera=new THREE.PerspectiveCamera(32,180/240,.1,30);canCamera.position.set(0,0,6.5);
canScene.add(new THREE.HemisphereLight(0xffffff,0x50505e,3));const key=new THREE.DirectionalLight(0xffffff,6);key.position.set(-3,4,5);canScene.add(key);const rim=new THREE.DirectionalLight(0xffbfdd,3);rim.position.set(4,1,-2);canScene.add(rim);
const can=new THREE.Group();canScene.add(can);const metal=new THREE.MeshStandardMaterial({color:0xb7bcc0,metalness:.85,roughness:.26});
function cylinder(rt,rb,h,y,mat=metal){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,48),mat);m.position.y=y;can.add(m);return m;}
cylinder(.42,.42,1.45,-.12);cylinder(.34,.42,.17,.69);cylinder(.44,.44,.055,-.86);cylinder(.42,.42,.05,.61);cylinder(.17,.34,.15,.85);
cylinder(.075,.075,.18,.98);
const nozzle=cylinder(.22,.22,.38,1.22,new THREE.MeshStandardMaterial({color:0xffeb29,roughness:.55}));
// A projecting side outlet stays legible in silhouette while facing away from the viewer.
const outlet=new THREE.Mesh(new THREE.CylinderGeometry(.085,.09,.24,24),new THREE.MeshStandardMaterial({color:0x333333,roughness:.5}));outlet.rotation.x=Math.PI/2;outlet.position.set(0,.02,-.29);nozzle.add(outlet);
const hole=new THREE.Mesh(new THREE.CircleGeometry(.048,20),new THREE.MeshBasicMaterial({color:0x050505,side:THREE.DoubleSide}));hole.position.set(0,.02,-.415);nozzle.add(hole);
const label=document.createElement('canvas');label.width=512;label.height=512;const lc=label.getContext('2d');lc.fillStyle='#dbdedd';lc.fillRect(0,0,512,512);lc.fillStyle='#181918';lc.font='bold 62px sans-serif';lc.fillText('WRITING',35,170);lc.fillText('THE CITY',35,235);lc.fillStyle='#ec007f';lc.fillRect(35,285,440,65);lc.fillStyle='#111';for(let i=0;i<45;i++)lc.fillRect(35+i*5,395,1+(i%3),65);const labelTex=new THREE.CanvasTexture(label);labelTex.colorSpace=THREE.SRGBColorSpace;const wrap=new THREE.Mesh(new THREE.CylinderGeometry(.423,.423,1.1,64,1,true),new THREE.MeshStandardMaterial({map:labelTex,metalness:.35,roughness:.4}));wrap.position.y=-.1;can.add(wrap);can.rotation.set(-.5,.8,-.5);

// Upright three-quarter view: show the actuator above the shoulder, with the outlet facing into the page.
can.rotation.set(.12,1.02,-.28);
// Shared world-space paint mask keeps paint attached to the wall and posters.
const wallEl=$('#wall'),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xe80078);wallEl.append(renderer.domElement);const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(43,1,.1,100);camera.position.set(0,0,15);
scene.add(new THREE.HemisphereLight(0xffe9f2,0x720033,2.3));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(-5,8,10);scene.add(sun);
// A shared light lets each raised poster cast onto both the wall and lower posters.
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-12,right:12,top:10,bottom:-10,near:.5,far:35});
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias=-.00015;
sun.shadow.normalBias=.015;
const mask=document.createElement('canvas');mask.width=2304;mask.height=1280;const wallLayer=layer(null,mask),maskTexture=new THREE.CanvasTexture(mask);const wallGroup=new THREE.Group();scene.add(wallGroup);
function painted(material){material.onBeforeCompile=shader=>{shader.uniforms.paintMask={value:maskTexture};shader.vertexShader='varying vec2 wallUV;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vec4 localP = vec4(position,1.0);\n #ifdef USE_INSTANCING\n localP = instanceMatrix * localP;\n #endif\n wallUV = ((modelMatrix * localP).xy + vec2(9.0,5.0))/vec2(18.0,10.0);');shader.fragmentShader='uniform sampler2D paintMask; varying vec2 wallUV;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n float ink = texture2D(paintMask,wallUV).a;\n gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0)-gl_FragColor.rgb, ink);');};return material;}
const wallBase=new THREE.Mesh(new THREE.PlaneGeometry(18,10),painted(new THREE.MeshStandardMaterial({color:0xa70057,roughness:1})));wallBase.position.z=-.12;wallGroup.add(wallBase);
const bricks=new THREE.InstancedMesh(new THREE.BoxGeometry(1.05,.43,.16),painted(new THREE.MeshStandardMaterial({color:0xed007f,roughness:.83})),22*18);const dummy=new THREE.Object3D();let bi=0;for(let row=0;row<22;row++)for(let col=0;col<18;col++){dummy.position.set(-9.3+col*1.1+(row%2)*.55,-5.1+row*.48,0);dummy.updateMatrix();bricks.setMatrixAt(bi,dummy.matrix);bricks.setColorAt(bi,new THREE.Color().setHSL(.916,.97,.39+Math.random()*.09));bi++;}wallGroup.add(bricks);
const picks=[['IMG_1098 2',-4.4,1.2,5.6,-.06],['IMG_1424',1.9,1.2,3.15,.08],['IMG_1258',5.3,.6,3.2,-.04],['IMG_1376',-1.2,-1.35,3.25,.045],['IMG_1036',-5.2,-2.15,3.5,-.04],['IMG_1421',2,-2.1,1.75,-.1],['IMG_1425',5.2,-2.7,3.7,.05],['IMG_1378',-.5,2,2.5,-.09]];
wallBase.receiveShadow=true;
bricks.receiveShadow=true;
const posters=[],loader=new THREE.TextureLoader();await Promise.all(picks.map(async([name,x,y,w,r],i)=>{const texture=await loader.loadAsync(`assets/${name}.jpg`);texture.colorSpace=THREE.SRGBColorSpace;const h=w*texture.image.height/texture.image.width;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),painted(new THREE.MeshStandardMaterial({map:texture,roughness:.9,side:THREE.DoubleSide})));m.position.set(x,y,.25+i*.065);m.castShadow=true;m.receiveShadow=true;m.rotation.z=r;m.userData={name};wallGroup.add(m);posters.push(m);}));
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();function cast(){const b=wallEl.getBoundingClientRect();mouse.set((pointer.x-b.left)/b.width*2-1,-(pointer.y-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);return ray.intersectObjects([...posters,wallBase]);}
let photoIndex=0;
const photoStages=picks.map(([name],i)=>{const stage=document.createElement('div');stage.className='photo-stage paintable';stage.hidden=true;const img=document.createElement('img');img.src=`assets/${name}.jpg`;img.alt=`New York graffiti photograph ${i+1} by Julia Qian`;const texture=posters.find(p=>p.userData.name===name).material.map;img.width=texture.image.width;img.height=texture.image.height;stage.append(img);$('#photo-pages').append(stage);layer(stage);return stage;});
let photoAnimations=[],photoTransition=0,photoCloseTimer,photoEntrance;
function showPhoto(index){
 end();const previous=photoIndex,next=(index+picks.length)%picks.length,dialog=$('#photo-dialog');
 if(dialog.classList.contains('photo-closing'))return;
 if(dialog.open&&next===previous)return;
 const animate=dialog.open&&!reduced,direction=index<previous?-1:1,token=++photoTransition;
 photoAnimations.forEach(a=>a.cancel());photoAnimations=[];
 photoIndex=next;photoStages.forEach((stage,i)=>{stage.hidden=i!==next;stage.style.pointerEvents='';});
 $('#photo-count').textContent=`${String(next+1).padStart(2,'0')} / ${String(picks.length).padStart(2,'0')}`;
 if(!dialog.open){clearTimeout(photoCloseTimer);dialog.classList.remove('photo-visible','photo-closing');dialog.showModal();void dialog.offsetWidth;dialog.classList.add('photo-visible');if(!reduced){photoEntrance=$('#photo-pages').animate([{opacity:0,clipPath:'inset(28% 16% 28% 16%)',transform:'perspective(1400px) translateY(65px) rotateX(9deg) rotateZ(-2deg) scale(.86)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',transform:'perspective(1400px) translateY(0) rotateX(0) rotateZ(0) scale(1)'}],{duration:780,easing:'cubic-bezier(.16,1,.3,1)'});}}
 dialog.classList.toggle('photo-transitioning',animate);
 if(!animate)return;
 const outgoing=photoStages[previous],incoming=photoStages[next];outgoing.hidden=false;outgoing.style.pointerEvents='none';
 const timing={duration:550,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'};
 photoAnimations=[outgoing.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*64}px)`}],timing),incoming.animate([{opacity:0,transform:`translateX(${direction*64}px)`},{opacity:1,transform:'translateX(0)'}],timing)];
 Promise.all(photoAnimations.map(a=>a.finished)).then(()=>{if(token!==photoTransition)return;outgoing.hidden=true;photoAnimations.forEach(a=>a.cancel());photoAnimations=[];dialog.classList.remove('photo-transitioning');}).catch(()=>{});
}
wallEl.addEventListener('click',()=>{const hit=cast().find(h=>h.object.userData.name);if(hit)showPhoto(picks.findIndex(p=>p[0]===hit.object.userData.name));});
$('#open-gallery').onclick=()=>showPhoto(0);
$('#photo-prev').onclick=()=>showPhoto(photoIndex-1);$('#photo-next').onclick=()=>showPhoto(photoIndex+1);
$('#photo-undo').onclick=()=>{const l=layers.find(l=>l.element===photoStages[photoIndex]);const i=history.findLastIndex(s=>s.ops.some(e=>e.l===l));if(i>=0)history.splice(i,1);drips=drips.filter(d=>history.includes(d.stroke));replay();};
$('#photo-clear').onclick=()=>{const l=layers.find(l=>l.element===photoStages[photoIndex]);for(const s of history)s.ops=s.ops.filter(e=>e.l!==l);for(let i=history.length-1;i>=0;i--)if(!history[i].ops.length)history.splice(i,1);drips=drips.filter(d=>d.l!==l);replay();};
addEventListener('keydown',e=>{if(!$('#photo-dialog').open)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowLeft'?-1:1));}if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();e.stopImmediatePropagation();$('#photo-undo').click();}},true);
function closePhoto(){const dialog=$('#photo-dialog');if(!dialog.open||dialog.classList.contains('photo-closing'))return;end();photoEntrance?.cancel();if(!reduced)$('#photo-pages').animate([{opacity:1,clipPath:'inset(0% 0% 0% 0%)',transform:'perspective(1400px) translateY(0) rotateX(0) scale(1)'},{opacity:0,clipPath:'inset(18% 12% 18% 12%)',transform:'perspective(1400px) translateY(40px) rotateX(-7deg) scale(.88)'}],{duration:680,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished.then(()=>{$('#photo-pages').getAnimations().forEach(a=>a.cancel());}).catch(()=>{});dialog.classList.add('photo-closing');dialog.classList.remove('photo-visible');photoCloseTimer=setTimeout(()=>{dialog.close();dialog.classList.remove('photo-closing');},reduced?0:700);}
$('#close-photo').onclick=closePhoto;
$('#photo-dialog').addEventListener('cancel',e=>{e.preventDefault();closePhoto();});
$('#photo-dialog').addEventListener('close',()=>{end();clearTimeout(photoCloseTimer);$('#photo-dialog').classList.remove('photo-visible','photo-closing');});
$('#photo-dialog').addEventListener('click',e=>{if(e.target===$('#photo-dialog'))closePhoto();});
new MutationObserver(()=>{const dialog=$('#photo-dialog');if(dialog.open)dialog.append($('#can'));else document.body.append($('#can'));}).observe($('#photo-dialog'),{attributes:true,attributeFilter:['open']});
new ResizeObserver(()=>{renderer.setSize(wallEl.clientWidth,wallEl.clientHeight);camera.aspect=wallEl.clientWidth/wallEl.clientHeight;camera.updateProjectionMatrix();}).observe(wallEl);
function targetAt(){const el=document.elementFromPoint(pointer.x,pointer.y);if(!el||el.closest('button,nav,aside,a'))return null;if(el.closest('#subway-stage'))return subway.target(pointer);if(el.closest('#wall')){const hits=cast();if(!hits.length)return null;const p=hits[0].point;return{l:wallLayer,x:(p.x+9)/18*mask.width,y:(5-p.y)/10*mask.height,scale:mask.width/(wallEl.clientWidth*.95)};}const parent=el.closest('.paintable');if(!parent)return null;const l=layers.find(l=>l.element===parent);if(!l)return null;const r=parent.getBoundingClientRect();return{l,x:pointer.x-r.left,y:pointer.y-r.top,scale:1};}
addEventListener('contextmenu',e=>{if(e.target.closest('main,dialog'))e.preventDefault();});
let paintPointer=null,touchStroke=false,suppressTouchClickUntil=0;
addEventListener('pointermove',e=>{if(paintPointer!==null&&e.pointerId!==paintPointer)return;pointer={x:e.clientX,y:e.clientY};if(touchStroke)mobilePaint.feedback(pointer.x,pointer.y,true);});
document.addEventListener('click',e=>{if(performance.now()<suppressTouchClickUntil&&!e.target.closest('.mobile-paint-tools,nav,button,a')){e.preventDefault();e.stopImmediatePropagation();}},true);
addEventListener('pointerdown',e=>{
 const touch=e.pointerType==='touch'||e.pointerType==='pen';
 if(!e.isPrimary||paintPointer!==null)return;
 if(touch&&!mobilePaint.active)return;
 pointer={x:e.clientX,y:e.clientY};const t=targetAt();
 if((!touch&&e.button!==2)||!t)return;
 if(e.target.closest('#subway-stage')&&['arriving','stopped','opening'].includes(subway.section.dataset.phase))return;
 e.preventDefault();paintPointer=e.pointerId;touchStroke=touch;
 try{e.target.setPointerCapture(e.pointerId);}catch{}
 if(touch){suppressTouchClickUntil=performance.now()+500;mobilePaint.feedback(pointer.x,pointer.y,true);}
 down=true;active={ops:[]};history.push(active);paintOp(t.l,{type:'dab',x:t.x,y:t.y,size:125*t.scale*(touch?.72:1),alpha:.8});
 last=t;lastTime=0;dwell=0;$('#hint').style.opacity=0;sound(true);buttons();
});
function end(){if(touchStroke){suppressTouchClickUntil=performance.now()+450;mobilePaint.feedback(pointer.x,pointer.y,false);}paintPointer=null;touchStroke=false;if(!down)return;down=false;sound(false);active=null;last=null;buttons();}
addEventListener('pointerup',e=>{if(e.pointerId===paintPointer)end();});addEventListener('pointercancel',end);addEventListener('lostpointercapture',end);addEventListener('blur',end);
let last=null,canX=pointer.x,canY=pointer.y,canScale=1,brushPressure=.65;
function frame(time){requestAnimationFrame(frame);const dt=Math.min((time-lastTime)||16,40);lastTime=time;
 subway.update(time,pointer,down,mobilePaint.active);
 $('#can').style.setProperty('--shadow-x',`${(down?8:13)+Math.max(-4,Math.min(4,(pointer.x-canX)*.06))}px`);$('#can').style.setProperty('--shadow-y',`${down?12:20}px`);
 const hovered=document.elementFromPoint(pointer.x,pointer.y)?.closest('button,a,aside');canScale+=( (hovered?.28:1)-canScale)*.15;canX+=(pointer.x-canX)*.3;canY+=(pointer.y-canY)*.3;$('#can').style.transform=`translate(${canX-96}px,${canY-48}px) scale(${canScale})`;$('#can').style.opacity=hovered?'.25':'1';can.rotation.z=-.28+Math.max(-.07,Math.min(.07,(pointer.x-canX)*.003));nozzle.position.y=down?1.17:1.22;canRenderer.render(canScene,canCamera);
 const travel=Math.max(1,heroTrack.offsetHeight-innerHeight),target=reduced?0:THREE.MathUtils.clamp(-heroTrack.getBoundingClientRect().top/travel,0,1);heroProgress+=(target-heroProgress)*(1-Math.exp(-dt/110));const hp=heroProgress*heroProgress*(3-2*heroProgress);heroLines.forEach((line,i)=>{line.style.transform=`translate3d(${hp*(i?23:-30)}vw,${hp*(i?6:-6)}vh,0) scale(${1+hp*(i?.32:.48)})`;});$('.hero-title').style.transform=`translate3d(0,${-hp*5}vh,0)`;const bounds=$('#gallery').getBoundingClientRect(),progress=THREE.MathUtils.clamp(-bounds.top/(bounds.height-innerHeight),0,1);if(!mobilePaint.active){camera.position.x=reduced?0:(pointer.x/innerWidth-.5)*.45;camera.position.y=reduced?0:2*(1-progress)+(pointer.y/innerHeight-.5)*-.2;camera.position.z=15.8-progress*2;camera.lookAt(0,-.1,0);}renderer.render(scene,camera);
 if(down){const t=targetAt();if(t){const distance=last&&last.l===t.l?Math.hypot(t.x-last.x,t.y-last.y):0;dwell=distance<3*t.scale?dwell+dt:0;const speed=distance/t.scale/Math.max(dt,1);const targetPressure=1/(1+speed*.85);brushPressure+=(targetPressure-brushPressure)*(1-Math.exp(-dt/75));const size=(85+80*brushPressure)*t.scale*(touchStroke?.72:1);const opacity=.28+.57*brushPressure;if(last&&last.l===t.l&&distance<600){const n=Math.max(1,Math.ceil(distance/(5*t.scale)));for(let i=1;i<=n;i++)paintOp(t.l,{type:'dab',x:last.x+(t.x-last.x)*i/n,y:last.y+(t.y-last.y)*i/n,size,alpha:opacity});}else paintOp(t.l,{type:'dab',x:t.x,y:t.y,size,alpha:opacity});if(dwell>240&&drips.filter(d=>d.stroke===active).length<10){drips.push({l:t.l,stroke:active,x:t.x+(Math.random()-.5)*48*t.scale,y:t.y+17*t.scale,len:0,width:(3.5+Math.random()*2.5)*t.scale,dx:(Math.random()-.5)*5*t.scale,life:0,duration:2100+Math.random()*1400,speed:(.085+Math.random()*.06)*t.scale});dwell=0;}last=t;}}
 for(const d of drips)snapshotDripColor(d);
 for(const d of drips){d.life+=dt;if(d.life<d.duration&&history.includes(d.stroke)){d.len+=dt*d.speed*Math.max(.12,1-d.life/d.duration);const op={type:'drip',x:d.x,y:d.y,len:d.len,width:d.width,dx:d.dx,...(d.color?{color:d.color}:{})};paintOp(d.l,op,false);d.stroke.ops.push({l:d.l,op});}}
 drips=drips.filter(d=>d.life<d.duration&&history.includes(d.stroke));
 if(wallLayer.dirty){maskTexture.needsUpdate=true;wallLayer.dirty=false;}
}
const mobilePaint=createMobilePaint({
 stop:end,
 undo:()=>($('#photo-dialog').open?$('#photo-undo'):$('#undo')).onclick(),
 clear:()=>($('#photo-dialog').open?$('#photo-clear'):$('#clear')).onclick(),
 canEnter:()=>{if(!$('#index').hidden)return false;const r=subway.section.getBoundingClientRect();return !(r.top<innerHeight*.5&&r.bottom>innerHeight*.5&&['arriving','stopped','opening'].includes(subway.section.dataset.phase));}
});
requestAnimationFrame(frame);
window.__city={history,layers,posters,subway,ready:true};
