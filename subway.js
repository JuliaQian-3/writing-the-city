import * as THREE from './vendor/three.module.js';

// A NYC-inspired car facade, not a replica of a specific MTA car class.
export function createSubway({ layer, reduced }) {
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='./subway.css?v=type-41';document.head.append(stylesheet);
  const section = document.createElement('section');
  section.id = 'subway';
  section.innerHTML = `<div class="subway-sticky"><div class="subway-caption"><span>WRITING THE CITY</span><span>ON THE TRAIN</span></div><div id="subway-stage" role="img" aria-label="Interactive silver subway car with half-open doors. Hold right mouse button to paint the metal panels."></div><div class="subway-footer"><span>HOLD RIGHT CLICK TO SPRAY</span><a href="#gallery">PHOTO GALLERY <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 25L25 7M7 7H25V25"/></svg></a></div></div>`;
  document.querySelector('#gallery').before(section);
  const announcement=document.createElement('p');announcement.className='subway-announcement';announcement.innerHTML='<span class="warning-yellow">STAND CLEAR</span> OF THE CLOSING DOORS, <span class="warning-yellow">PLEASE.</span>';section.querySelector('.subway-sticky').append(announcement);
  const end = document.querySelector('#chapter-7 .chapter-end a');
  if (end) { end.href = '#subway'; end.textContent = 'ON THE TRAIN →'; }
  const indexLink = document.createElement('a');
  indexLink.className = 'index-secondary'; indexLink.href = '#subway'; indexLink.textContent = 'ON THE TRAIN';
  document.querySelector('#index a[href="#gallery"]').before(indexLink);
  const host = section.querySelector('#subway-stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x08090a);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
  camera.position.set(0, .15, 12);
  const car = new THREE.Group(); scene.add(car);
  // Dark platform environment: long fluorescent fixtures reflected in brushed steel.
  const room = new THREE.Scene(); room.background = new THREE.Color(0x11171b);
  function lightPanel(x,y,z,w,h,color,intensity=2) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color, side:THREE.DoubleSide}));
    p.material.color.multiplyScalar(intensity); p.position.set(x,y,z); p.lookAt(0,0,0); room.add(p);
  }
  lightPanel(0,5,5,24,.5,0xffe5b6,6);
  lightPanel(-4,1.2,7,9,.75,0xffeccb,4);
  lightPanel(5,2.8,5,7,.32,0xc6dce6,4);
  lightPanel(-8,0,4,1.6,5,0xadc9d3,.7);
  lightPanel(7,-1,5,2,4,0xe7bd84,.45);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room,.02); scene.environment = environment.texture;
  pmrem.dispose(); room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  scene.add(new THREE.HemisphereLight(0xc2d0d6,0x08090b,.65));
  const key = new THREE.DirectionalLight(0xffe3b5,1.6); key.position.set(-4,7,4);scene.add(key);
  const fill = new THREE.DirectionalLight(0xa6c6db,.38);fill.position.set(6,2,5);scene.add(fill);
  // A fixed station lamp throws a soft pool across the moving car, not a flat overlay.
  const platformLight=new THREE.SpotLight(0xffe0ae,100,24,.68,.85,2);
  platformLight.position.set(-5,6,7);platformLight.target.position.set(-1,-.8,0);scene.add(platformLight,platformLight.target);
  const coolLight=new THREE.SpotLight(0xb7d7e9,45,22,.72,1,2);
  coolLight.position.set(7,4,6);coolLight.target.position.set(4,.4,0);scene.add(coolLight,coolLight.target);
  const platform=new THREE.Mesh(new THREE.PlaneGeometry(80,28),new THREE.MeshStandardMaterial({color:0x171b1d,roughness:.48,metalness:.18}));
  platform.rotation.x=-Math.PI/2;platform.position.set(0,-3.76,2);scene.add(platform);
  // Stationary track bed: dark oxidised webs with a narrow polished running surface.
  const tracks=new THREE.Group();scene.add(tracks);
  const railSteel=new THREE.MeshStandardMaterial({color:0x353b3e,metalness:.85,roughness:.36,envMapIntensity:.45});
  const railOxide=new THREE.MeshStandardMaterial({color:0x242321,metalness:.48,roughness:.79,envMapIntensity:.18});
  const sleeperMat=new THREE.MeshStandardMaterial({color:0x171819,roughness:.96,metalness:.03});
  const fastenerMat=new THREE.MeshStandardMaterial({color:0x30302b,roughness:.67,metalness:.6,envMapIntensity:.25});
  function trackBox(w,h,d,x,y,z,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);tracks.add(mesh);return mesh;}
  for(const z of [-1.35,1.05]){
    trackBox(80,.05,.25,0,-3.55,z,railOxide);
    trackBox(80,.16,.065,0,-3.45,z,railOxide);
    trackBox(80,.065,.14,0,-3.34,z,railSteel);
  }
  for(let x=-39;x<=39;x+=.8){
    trackBox(.22,.13,3.35,x,-3.66,-.15,sleeperMat);
    for(const z of [-1.35,1.05]){
      trackBox(.3,.025,.39,x,-3.575,z,railOxide);
      for(const side of [-1,1])trackBox(.075,.055,.055,x,-3.53,z+side*.145,fastenerMat);
    }
  }
  // Foreground platform lip stays in the station, in front of the track bed.
  // Repeating tactile bumps are instanced so the small detail stays inexpensive.
  const concrete=new THREE.MeshStandardMaterial({color:0x292b29,roughness:.94,metalness:.02});
  const coping=new THREE.MeshStandardMaterial({color:0x43443e,roughness:.87,metalness:.04});
  const tactile=new THREE.MeshStandardMaterial({color:0x87712b,roughness:.87,metalness:.02,envMapIntensity:.15});
  trackBox(80,.55,5,0,-3.48,4.7,concrete);
  trackBox(80,.07,.16,0,-3.17,2.23,coping);
  trackBox(80,.035,.48,0,-3.185,2.58,tactile);
  const bumpGeometry=new THREE.CylinderGeometry(.022,.032,.014,8);
  const bumps=new THREE.InstancedMesh(bumpGeometry,tactile,Math.floor(80/.14)*3);
  const bumpMatrix=new THREE.Matrix4();let bumpIndex=0;
  for(let i=0;i<Math.floor(80/.14);i++)for(let row=0;row<3;row++){
    bumpMatrix.makeTranslation(-40+i*.14,-3.16,2.43+row*.14);bumps.setMatrixAt(bumpIndex++,bumpMatrix);
  }
  tracks.add(bumps);
  const seamMat=new THREE.MeshStandardMaterial({color:0x101211,roughness:1});
  for(let x=-40;x<40;x+=1.6)trackBox(.012,.005,4.35,x,-3.202,4.99,seamMat);
  // Shade the receiving geometry itself: no transparent planes intersecting
  // coping, tactile bumps or rails, and no disappearing subpixel-width decal.
  const spillAperture={value:0},spillCenter={value:0};
  for(const material of [concrete,coping,tactile,seamMat,railSteel,railOxide,sleeperMat,fastenerMat,platform.material]){
    material.onBeforeCompile=shader=>{
      shader.uniforms.spillAperture=spillAperture;shader.uniforms.spillCenter=spillCenter;
      shader.vertexShader='varying vec3 spillWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
        vec4 spillLocal=vec4(transformed,1.0);
        #ifdef USE_INSTANCING
          spillLocal=instanceMatrix*spillLocal;
        #endif
        spillWorld=(modelMatrix*spillLocal).xyz;
      `);
      shader.fragmentShader='varying vec3 spillWorld;uniform float spillAperture;uniform float spillCenter;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
        float spillWidth=.12+.60*spillAperture;
        float across=exp(-pow((spillWorld.x-spillCenter)/spillWidth,2.0)*2.0);
        float along=smoothstep(0.0,.25,spillWorld.z)*(1.0-smoothstep(.45,3.6,spillWorld.z));
        float below=1.0-smoothstep(-3.1,-2.95,spillWorld.y);
        outgoingLight+=vec3(1.0,.64,.28)*.17*across*along*below*spillAperture*spillAperture;
        #include <opaque_fragment>
      `);
    };
    material.customProgramCacheKey=()=> 'station-ground-spill-v2';
  }
  // Very low station haze bridges the black page and the silhouette of the carriage.
  const haloCanvas=document.createElement('canvas');haloCanvas.width=512;haloCanvas.height=256;
  const hc=haloCanvas.getContext('2d'),halo=hc.createRadialGradient(256,128,5,256,128,250);
  halo.addColorStop(0,'rgba(154,164,156,0.18)');halo.addColorStop(.55,'rgba(82,97,106,0.08)');halo.addColorStop(1,'rgba(0,0,0,0)');hc.fillStyle=halo;hc.fillRect(0,0,512,256);
  const haze=new THREE.Mesh(new THREE.PlaneGeometry(36,13),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(haloCanvas),transparent:true,depthWrite:false}));haze.position.set(0,1,-3);scene.add(haze);
  const grain = document.createElement('canvas'); grain.width=512;grain.height=512;
  const gc=grain.getContext('2d');gc.fillStyle='#999';gc.fillRect(0,0,512,512);
  let randomSeed=93;const random=()=>((randomSeed=(randomSeed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<2400;i++){const v=105+Math.floor(random()*90);gc.strokeStyle=`rgba(${v},${v},${v},.25)`;gc.lineWidth=.25+random()*.5;const y=random()*512;gc.beginPath();gc.moveTo(0,y);gc.lineTo(512,y);gc.stroke();}
  const brushed=new THREE.CanvasTexture(grain);brushed.wrapS=brushed.wrapT=THREE.RepeatWrapping;brushed.repeat.set(2,3);
  const silver=new THREE.MeshStandardMaterial({color:0xaeb5b8,metalness:.92,roughness:.27,bumpMap:brushed,bumpScale:.009,envMapIntensity:1.25});
  const trim=silver.clone();trim.roughness=.2;trim.color.set(0xd3d7d8);
  const rubber=new THREE.MeshStandardMaterial({color:0x171b1b,roughness:.88});
  const interior=new THREE.MeshStandardMaterial({color:0x94866a,roughness:.68});
  // One transparent surface per pane avoids double blended front/back faces.
  const glass=new THREE.MeshStandardMaterial({color:0xc5dbd5,metalness:.15,roughness:.14,envMapIntensity:.65,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide});
  const masks=[];
  function painted(w,h,base=silver){
    const c=document.createElement('canvas');c.width=Math.round(w*140);c.height=Math.round(h*140);
    const l=layer(null,c), texture=new THREE.CanvasTexture(c), material=base.clone();
    l.rainbow=true;texture.colorSpace=THREE.SRGBColorSpace;
    material.onBeforeCompile=s=>{
      s.uniforms.subwayInk={value:texture};s.uniforms.panelSize={value:new THREE.Vector2(w,h)};
      s.vertexShader='varying vec2 inkUV; uniform vec2 panelSize;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n inkUV=position.xy/panelSize+0.5;');
      s.fragmentShader='varying vec2 inkUV; uniform sampler2D subwayInk;\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n vec4 paintSample=texture2D(subwayInk,inkUV); float inkCoverage=paintSample.a; diffuseColor.rgb=mix(diffuseColor.rgb,paintSample.rgb,inkCoverage); diffuseColor.a=mix(diffuseColor.a,1.0,inkCoverage);');
      s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,0.48,inkCoverage);');
      s.fragmentShader=s.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n metalnessFactor=mix(metalnessFactor,0.06,inkCoverage);');
    };
    masks.push({l,texture});return {material,l,w,h};
  }
  function rounded(w,h,r=.08){
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  function plate(w,h,x,y,z,material,parent=car,window=null,paint=false){
    const shape=rounded(w,h);
    if(window){const points=rounded(window.w,window.h,.1).getPoints(16).map(p=>new THREE.Vector2(p.x,p.y+window.y));shape.holes.push(new THREE.Path(points));}
    const geometry=material.transparent?new THREE.ShapeGeometry(shape):new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1,curveSegments:8});
    const p=paint?painted(w,h,material):null;
    const mesh=new THREE.Mesh(geometry,p?p.material:material);mesh.position.set(x,y,z);parent.add(mesh);if(p)mesh.userData.paint=p;return mesh;
  }
  function box(w,h,d,x,y,z,mat,parent=car){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m;}
  // Interior is recessed. It is deliberately not a paint target.
  box(60,5.8,.1,0,-.1,-2.5,interior);
  box(60,.1,2.8,0,-2.9,-1.15,rubber);
  box(60,.1,2.8,0,2.8,-1.15,interior);
  const seats=new THREE.MeshStandardMaterial({color:0x9c542e,roughness:.63});
  const lampMaterial=new THREE.MeshStandardMaterial({color:0xffe8b9,emissive:0xffcf80,emissiveIntensity:2,roughness:.5});
  const rearGlass=new THREE.MeshStandardMaterial({color:0x121a1c,roughness:.28,metalness:.15});
  for(let x=-24;x<=24;x+=4){
    box(3.65,.3,.8,x,-1.65,-1.95,seats);box(3.65,.8,.13,x,-1.1,-2.35,seats);
    // Opposite windows, seat divisions and stanchions make the view through glass legible.
    plate(2.95,1.55,x,.8,-2.38,rubber);plate(2.74,1.34,x,.8,-2.27,rearGlass);
    for(const dx of [-1.2,0,1.2])box(.026,.65,.018,x+dx,-1.05,-2.265,rubber);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,5.3,16),trim);pole.position.set(x+1.75,-.05,-1.15);car.add(pole);
    box(3.5,.09,.16,x,2.45,-1.85,lampMaterial);
  }
  // Local warm lamps light the interior, not just a glowing yellow strip.
  for(const x of [-12,-6,0,6,12]){const lamp=new THREE.PointLight(0xffc475,9,9,2);lamp.position.set(x,2.05,-1.5);car.add(lamp);}
  // Large uninterrupted metal panels flank the doorway, with actual window holes.
  for(const sign of [-1,1]){
    const x=sign*4.7;
    plate(5.7,6.2,x,0,0,silver,car,{w:3.7,h:2.15,y:.72},true);
    plate(3.94,2.39,x,.72,.04,rubber,car,{w:3.68,h:2.13,y:0});
    plate(3.7,2.15,x,.72,-.12,glass,car,null,true);
    for(let i=0;i<7;i++)box(5.66,.027,.027,x,-1.42-i*.19,.105,trim);
  }
  // Continue the facade beyond both screen edges throughout the arrival movement.
  // Rails and body now have matching extents; their ends never enter the shot.
  for(const sign of [-1,1])for(let i=1;i<=4;i++){
    const x=sign*(4.7+i*5.7);
    plate(5.7,6.2,x,0,0,silver,car,{w:3.7,h:2.15,y:.72},true);
    plate(3.94,2.39,x,.72,.04,rubber,car,{w:3.68,h:2.13,y:0});
    plate(3.7,2.15,x,.72,-.12,glass,car,null,true);
    for(let rib=0;rib<7;rib++)box(5.68,.027,.027,x,-1.42-rib*.19,.105,trim);
  }
  plate(3.64,.62,0,2.9,.025,silver,car,null,true);
  for(const x of [-1.79,1.79])plate(.16,5.75,x,-.15,.06,trim);
  box(3.62,.22,.4,0,-2.93,.04,trim);
  const doors=[];
  for(const sign of [-1,1]){
    const group=new THREE.Group();group.position.x=sign*.895;car.add(group);doors.push({group,sign});
    plate(1.8,5.52,0,-.08,-.07,silver,group,{w:.89,h:1.86,y:.76},true);
    plate(1.03,2,0,.68,.005,rubber,group,{w:.85,h:1.82,y:0});
    plate(.87,1.84,0,.68,-.10,glass,group,null,true);
    box(.085,5.56,.10,-sign*.875,-.08,.035,rubber,group);
    plate(.12,.6,-sign*.56,-.5,.04,trim,group);
  }
  // Horizontal rails and tiny fasteners catch light without visual clutter.
  for(const y of [-3.13,3.23])plate(60,.16,0,y,.03,trim);
  for(const x of [-7.3,-2.04,2.04,7.3])for(const y of [-2.8,2.7]){const screw=new THREE.Mesh(new THREE.SphereGeometry(.026,8,6),trim);screw.scale.z=.35;screw.position.set(x,y,.11);car.add(screw);}
  const badgeCanvas=document.createElement('canvas');badgeCanvas.width=badgeCanvas.height=256;
  const bc=badgeCanvas.getContext('2d');bc.fillStyle='#101719';bc.fillRect(0,0,256,256);bc.fillStyle='#ed007f';bc.beginPath();bc.arc(128,128,105,0,Math.PI*2);bc.fill();bc.fillStyle='white';bc.font='bold 150px Arial';bc.textAlign='center';bc.textBaseline='middle';bc.fillText('G',128,139);
  const badgeTexture=new THREE.CanvasTexture(badgeCanvas);badgeTexture.colorSpace=THREE.SRGBColorSpace;
  const badge=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshStandardMaterial({map:badgeTexture,roughness:.5}));badge.position.set(-2.38,-.1,.13);car.add(badge);
  // Station-fixed strip-light reflection. World coordinates make it pass across
  // moving panels; material metalness masks it out of paint, rubber and glass.
  const reflectiveMaterials=new Set();
  car.traverse(object=>{
    const material=object.material;
    if(!material||material.transparent||material.metalness<.8||reflectiveMaterials.has(material))return;
    reflectiveMaterials.add(material);
    const previousCompile=material.onBeforeCompile;
    material.onBeforeCompile=function(shader,renderer){
      previousCompile.call(this,shader,renderer);
      shader.vertexShader='varying vec3 stationWorldPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n stationWorldPosition=(modelMatrix*vec4(position,1.0)).xyz;');
      shader.fragmentShader='varying vec3 stationWorldPosition;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
        float stripX=stationWorldPosition.x+1.6+stationWorldPosition.y*.12;
        float stripCore=exp(-pow(stripX/.28,2.0));
        float stripHalo=exp(-pow(stripX/1.05,2.0));
        float stripLength=1.0-smoothstep(2.0,3.4,abs(stationWorldPosition.y-.2));
        float frontFace=smoothstep(0.1,0.9,dot(normal,normalize(vViewPosition)));
        outgoingLight+=vec3(1.0,.87,.66)*(stripCore*.20+stripHalo*.06)*stripLength*metalnessFactor*frontFace;
        #include <opaque_fragment>
      `);
    };
    material.customProgramCacheKey=()=>`station-strip-${material.uuid}`;
    material.needsUpdate=true;
  });
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
  let visible=false, arrivalStarted=false, arrivalTime=0, previous=performance.now();
  let previousProgress=0,smoothedProgress=null,returning=false,hasDeparted=false;
  let pinnedLastFrame=false;
  addEventListener('resize',()=>{
    if(!pinnedLastFrame||reduced)return;
    // Preserve the narrative position when orientation changes the section height.
    const top=section.getBoundingClientRect().top+scrollY;
    const distance=Math.max(1,section.offsetHeight-host.clientHeight);
    window.scrollTo({top:top+previousProgress*distance,behavior:'instant'});
    smoothedProgress=previousProgress;
  });
  car.position.x=reduced?0:8;
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'160px'});observer.observe(section);
  new ResizeObserver(()=>{if(!host.clientWidth||!host.clientHeight)return;renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}).observe(host);
  function update(time,pointer,down,freezeCamera=false){
    const dt=Math.min(time-previous,40);previous=time;if(!visible||document.hidden)return;
    const b=section.getBoundingClientRect();
    pinnedLastFrame=b.top<=1&&b.bottom>=host.clientHeight-1;
    const scrollProgress=THREE.MathUtils.clamp(-b.top/Math.max(1,section.offsetHeight-host.clientHeight),0,1);
    if(scrollProgress<previousProgress-.0001)returning=true;
    if(scrollProgress<=.105)returning=false;
    previousProgress=scrollProgress;
    // One shared, frame-rate-independent follow-through keeps all three phases in sync.
    // Exponential damping settles without spring overshoot or a second bounce.
    if(smoothedProgress===null||reduced)smoothedProgress=scrollProgress;
    else smoothedProgress+=(scrollProgress-smoothedProgress)*(1-Math.exp(-dt/140));
    if(Math.abs(scrollProgress-smoothedProgress)<.00002)smoothedProgress=scrollProgress;
    const progress=smoothedProgress;
    if(b.top<innerHeight*.45)arrivalStarted=true;
    if(arrivalStarted)arrivalTime+=dt;
    // One continuous sequence: brake to a stop, pause 300ms, then open the doors.
    // It does not reverse when the user scrolls back while painting.
    const travel=reduced?1:Math.min(1,arrivalTime/2100);
    const brake=1-Math.pow(1-travel,3);
    car.position.x=8*(1-brake);
    const opening=reduced?1:THREE.MathUtils.clamp((arrivalTime-2400)/1100,0,1);
    let doorEase=opening*opening*(3-2*opening);
    let phase=travel<1?'arriving':opening===0?'stopped':opening<1?'opening':'ready';
    const close=THREE.MathUtils.clamp((progress-.685)/.105,0,1);
    const departure=THREE.MathUtils.clamp((progress-.79)/.168,0,1);
    if(!reduced&&(progress>.105||hasDeparted)){
      hasDeparted=true;arrivalTime=Math.max(arrivalTime,3500);
      doorEase=1-close*close*(3-2*close);
      car.position.x=-48*departure*departure;
      phase=departure>0?'departing':close>0?'closing':'ready';
    }
    const textProgress=THREE.MathUtils.clamp((progress-.105)/.58,0,1);
    announcement.style.visibility=!reduced&&!returning&&progress>.105&&progress<.685?'visible':'hidden';
    announcement.style.transform=`translate3d(${host.clientWidth-(host.clientWidth+announcement.offsetWidth)*textProgress}px,-50%,0)`;
    section.dataset.scrollProgress=progress.toFixed(4);
    section.dataset.scrollTarget=scrollProgress.toFixed(4);
    if(section.dataset.phase!==phase)section.dataset.phase=phase;
    for(const {group,sign}of doors)group.position.x=sign*(.895+.47*doorEase);
    spillCenter.value=car.position.x;
    spillAperture.value=doorEase;
    const damping=1-Math.exp(-dt/220), strength=down?.15:1;
    const px=reduced?0:(pointer.x/innerWidth-.5)*.38*strength,py=reduced?.1:.1-(pointer.y/innerHeight-.5)*.2*strength;
    if(!freezeCamera){camera.position.x+=(px-camera.position.x)*damping;camera.position.y+=(py-camera.position.y)*damping;}
    camera.position.z=camera.aspect<.8?14.8:11.4;camera.lookAt(0,0,0);
    for(const m of masks)if(m.l.dirty){m.texture.needsUpdate=true;m.l.dirty=false;}
    renderer.render(scene,camera);
  }
  function target(pointer){
    const b=host.getBoundingClientRect();mouse.set((pointer.x-b.left)/b.width*2-1,1-(pointer.y-b.top)/b.height*2);ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObject(car,true)[0];if(!hit?.object.userData.paint)return null;
    const p=hit.object.userData.paint,local=hit.object.worldToLocal(hit.point.clone());
    const worldHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
    return {l:p.l,x:(local.x/p.w+.5)*p.l.canvas.width,y:(.5-local.y/p.h)*p.l.canvas.height,scale:worldHeight/b.height*140};
  }
  return {update,target,section,renderer,scene,camera,car,masks,doors};
}
