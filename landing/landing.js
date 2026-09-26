// Landing-only entry point. Never loaded by the book reader.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
const motionButton = document.querySelector('#motion');
function updateMotion() {
  motionButton.textContent = paused ? '▷' : 'Ⅱ';
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'فعال‌کردن حرکت خودکار' : 'توقف حرکت خودکار');
}
updateMotion();
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
const observer = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
}), {threshold: 0.08});
if (!reduced.matches) document.querySelectorAll('.reveal').forEach(el => { el.classList.add('will-reveal'); observer.observe(el); });
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const target = document.querySelector(a.getAttribute('href'));
  if (target) { e.preventDefault(); target.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth'}); history.replaceState(null, '', a.getAttribute('href')); }
}));
const modes = {
  design: ['وقتی رنگ، زبان می‌شود.', 'فرم، رنگ و ترکیب‌بندی، ایده را به تصویر تبدیل می‌کنند. طیف رنگ را تغییر دهید و تأثیر آن را در تصویر ببینید.', 'طیف رنگ', '01 / GENERATIVE COLOR'],
  video: ['هر قاب، یک روایت.', 'نور و قاب‌بندی به تصویر معنا می‌دهند. نوردهی این منظرهٔ متحرک را تغییر دهید؛ نمونه‌ای مولد از زبان تصویر سینمایی.', 'نوردهی تصویر', '02 / CINEMATIC LIGHT'],
  audio: ['صدایی که دیده می‌شود.', 'صدا، بُعد شنیداری تجربه است. موج را تغییر دهید و با انتخاب «شنیدن صدا»، صدای متناظر آن را بشنوید.', 'فرکانس صدا', '03 / SOUND FREQUENCY'],
  motion: ['تصویر، در گذر زمان.', 'انیمیشن با تغییر پیوستهٔ تصویر ساخته می‌شود. سرعت حرکت را تغییر دهید و رد فریم‌های متوالی را دنبال کنید.', 'سرعت حرکت', '04 / MOTION STUDY'],
  space: ['فراتر از سطح تصویر.', 'عمق، پرسپکتیو و زاویهٔ دید، یک فضای سه‌بعدی را تعریف می‌کنند. زاویهٔ این سازهٔ فضایی را تغییر دهید.', 'زاویهٔ دید', '05 / SPATIAL STRUCTURE'],
  ai: ['پیوندهایی برای یادگیری.', 'نمایشی مفهومی از یک شبکهٔ عصبی؛ با افزایش اتصال‌ها، مسیرهای بیشتری میان لایه‌ها آشکار می‌شود. این تصویر، مدل آموزش‌دیده نیست.', 'تراکم اتصال‌ها', '06 / NEURAL CONNECTIONS'],
  xr: ['میان جهان واقعی و مجازی.', 'واقعیت افزوده، اطلاعات دیجیتال را با محیط پیوند می‌دهد. سهم لایهٔ دیجیتال را در این نمایش مفهومی تنظیم کنید.', 'لایهٔ دیجیتال', '07 / EXTENDED REALITY']
};
let mode = 'design', value = 0.45;
const tabs = [...document.querySelectorAll('[data-mode]')];
const slider = document.querySelector('#parameter');
const soundButton = document.querySelector('#sound');
let audioContext, oscillator, gain, soundOn = false;
function stopSound() {
  if (oscillator) { oscillator.stop(); oscillator.disconnect(); oscillator = null; }
  soundOn = false; soundButton.textContent = 'شنیدن صدا ♫'; soundButton.setAttribute('aria-pressed', 'false');
  if (audioContext?.state === 'running') audioContext.suspend();
}
function selectMode(next, focus = false) {
  if (!modes[next]) return;
  mode = next; stopSound();
  const [title, desc, label, tag] = modes[mode];
  document.querySelector('#demo-title').textContent = title;
  document.querySelector('#demo-description').textContent = desc;
  document.querySelector('#parameter-label').textContent = label;
  document.querySelector('#demo-tag').textContent = tag;
  document.querySelector('#demo').setAttribute('aria-label', title + ' ' + desc);
  document.querySelector('#lab-panel').setAttribute('aria-labelledby', `tab-${mode}`);
  tabs.forEach(tab => { const active = tab.dataset.mode === mode; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && focus) tab.focus(); });
  soundButton.hidden = mode !== 'audio';
  drawDemo(demoTime);
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectMode(tab.dataset.mode));
  tab.addEventListener('keydown', e => {
    let n;
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') n = (i + tabs.length - 1) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    if (n !== undefined) { e.preventDefault(); selectMode(tabs[n].dataset.mode, true); }
  });
});
function jumpTo(mode) { selectMode(mode); document.querySelector('#universe').scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth'}); }
document.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => jumpTo(b.dataset.jump)));
slider.addEventListener('input', () => {
  value = Number(slider.value) / 100;
  if (oscillator) oscillator.frequency.setTargetAtTime(100 + value * 700, audioContext.currentTime, 0.05);
  drawDemo(demoTime);
});
soundButton.addEventListener('click', async () => {
  if (soundOn) { stopSound(); return; }
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    // A tab change during resume must not start sound in a different exhibit.
    if (mode !== 'audio') return;
    oscillator = audioContext.createOscillator(); gain = audioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = 100 + value * 700;
    gain.gain.setValueAtTime(0, audioContext.currentTime); gain.gain.linearRampToValueAtTime(0.045, audioContext.currentTime + 0.15);
    oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start();
    soundOn = true; soundButton.textContent = 'قطع صدا ◼'; soundButton.setAttribute('aria-pressed', 'true');
  } catch { soundButton.textContent = 'صدا در این مرورگر در دسترس نیست'; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSound(); });
window.addEventListener('pagehide', stopSound);
const demo = document.querySelector('#demo'), ctx = demo.getContext('2d');
let dw = 600, dh = 300, demoVisible = false, heroVisible = true, demoTime = 0;
new IntersectionObserver(entries => { demoVisible = entries[0].isIntersecting; }, {rootMargin:'100px'}).observe(demo);
new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; }, {rootMargin:'100px'}).observe(document.querySelector('#art'));
function sizeDemo() {
  dw = demo.clientWidth; dh = demo.clientHeight;
  const dpr = Math.min(devicePixelRatio, 1.5); demo.width = dw*dpr; demo.height = dh*dpr; ctx?.setTransform(dpr,0,0,dpr,0,0);
  drawDemo(demoTime);
}
function drawDemo(t) {
  if (!ctx || !dw || !dh) return;
  ctx.clearRect(0,0,dw,dh); ctx.save();
  const w = dw, h = dh, cx=w/2, cy=h/2;
  ctx.strokeStyle='#b9a3e810'; ctx.lineWidth=.6;
  for(let x=0;x<w;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  if(mode==='design') {
    ctx.translate(cx,cy+10); ctx.rotate(-.35);
    const radius=Math.min(w*.23,105);
    for(let i=25;i>=0;i--){
      const f=i/25, r=radius*(.45+f*.6), x=Math.sin(f*2.8+t*.25)*r*.45;
      ctx.beginPath();ctx.ellipse(x,0,r*.72,r,0,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${205+value*125+f*45},75%,${55+f*25}%,${.2+f*.65})`;
      ctx.lineWidth=2.5;ctx.stroke();
    }
    ctx.restore();ctx.save();ctx.font='9px Arial';ctx.fillStyle='#9285ab';ctx.textAlign='center';ctx.fillText('FORM + COLOR + COMPOSITION',cx,h-22);
  } else if(mode==='audio') {
    for(let j=0;j<7;j++){
      ctx.beginPath();for(let x=0;x<w;x+=2){const y=cy+Math.sin(x/w*Math.PI*(4+value*18)-t*2+j*.22)*Math.sin(x/w*Math.PI)*(25+j*6);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}
      ctx.strokeStyle=`hsla(${225+j*9},85%,${65+j*3}%,${1-j*.11})`;ctx.lineWidth=1.5;ctx.stroke();
    }
    ctx.fillStyle='#c9b7e8';ctx.font='12px monospace';ctx.textAlign='center';ctx.fillText(`${Math.round(100+value*700)} Hz`,cx,h-26);
  } else if(mode==='video') {
    const sky=ctx.createLinearGradient(0,40,0,h);sky.addColorStop(0,`hsl(245,40%,${4+value*15}%)`);sky.addColorStop(.6,`hsl(24,65%,${12+value*36}%)`);sky.addColorStop(1,'#0b0e20');ctx.fillStyle=sky;ctx.fillRect(0,45,w,h-90);
    const sun=ctx.createRadialGradient(cx,cy,1,cx,cy,65);sun.addColorStop(0,`rgba(255,181,126,${value*.9})`);sun.addColorStop(1,'transparent');ctx.fillStyle=sun;ctx.fillRect(cx-65,cy-65,130,130);
    for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w+6;x+=6){const y=cy+30+j*15-Math.sin(x/w*7+j+t*.05)*(18+j*9)-Math.cos(x/w*17+j)*10;ctx.lineTo(x,y);}ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle=['#302333','#211f31','#161928','#0e1220'][j];ctx.fill();}
    ctx.fillStyle='#090b12';ctx.fillRect(0,0,w,45);ctx.fillRect(0,h-45,w,45);ctx.fillStyle='#c2b0c6';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText('PROCEDURAL CINEMA / 2.39:1',cx,h-20);
  } else if(mode==='motion') {
    for(let i=0;i<26;i++){const angle=t*(.25+value*2)-i*.12;const x=cx+Math.cos(angle)*Math.min(w*.3,145),y=cy+Math.sin(angle*2)*55;ctx.beginPath();ctx.arc(x,y,Math.max(2,14-i*.4),0,Math.PI*2);ctx.fillStyle=`hsla(${260-i*2},80%,75%,${1-i/27})`;ctx.fill();}
    ctx.strokeStyle='#8f75ba55';ctx.beginPath();for(let i=0;i<=200;i++){const a=i/200*Math.PI*2,x=cx+Math.cos(a)*Math.min(w*.3,145),y=cy+Math.sin(a*2)*55;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  } else if(mode==='space') {
    const angle=value*Math.PI*2;
    function project(x,y,z){const nx=x*Math.cos(angle)+z*Math.sin(angle),nz=-x*Math.sin(angle)+z*Math.cos(angle),tilt=.25+angle*.45,ny=y*Math.cos(tilt)-nz*Math.sin(tilt),depth=y*Math.sin(tilt)+nz*Math.cos(tilt),p=360/(360+depth);return [cx+nx*p,cy+ny*p];}
    for(let i=0;i<16;i++){const y=(i-7.5)*9;ctx.beginPath();for(let j=0;j<=80;j++){const a=j/80*Math.PI*2,rad=70+Math.sin(i*.24)*25,[x1,y1]=project(Math.cos(a)*rad,y,Math.sin(a)*rad);j?ctx.lineTo(x1,y1):ctx.moveTo(x1,y1);}ctx.strokeStyle=`hsla(${235+i*3},65%,75%,.65)`;ctx.stroke();}
  } else if(mode==='ai') {
    const layers=[4,6,6,4],nodes=[];
    layers.forEach((n,l)=>{nodes[l]=[];for(let i=0;i<n;i++)nodes[l].push([w*.18+l*w*.215,cy+(i-(n-1)/2)*30]);});
    nodes.forEach((layer,l)=>layer.forEach(([x,y],i)=>{
      if(l<3)nodes[l+1].forEach(([nx,ny],j)=>{if(((i*7+j*3+l)%11)/11>value)return;ctx.strokeStyle=`rgba(170,137,244,${.1+(.5+.5*Math.sin(t*1.6+i+j))*.3})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();});
      ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle='#c0a8f0';ctx.shadowBlur=12;ctx.shadowColor='#956aff';ctx.fill();ctx.shadowBlur=0;
    }));
  } else if(mode==='xr') {
    ctx.strokeStyle='#8b819c55';ctx.lineWidth=1;
    for(let i=-6;i<7;i++){ctx.beginPath();ctx.moveTo(cx+i*20,cy);ctx.lineTo(cx+i*95,h);ctx.stroke();}
    for(let i=0;i<8;i++){const y=cy+(i*i)*3;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.strokeRect(cx-90,cy-80,180,150);
    ctx.globalAlpha=value;ctx.fillStyle='#a685ff18';ctx.fillRect(cx-90,cy-80,180,150);ctx.strokeStyle='#b6a0ff';ctx.lineWidth=2;
    [[-100,-90],[100,-90],[-100,80],[100,80]].forEach(([x,y])=>{ctx.beginPath();ctx.moveTo(cx+x,cy+y-Math.sign(y)*15);ctx.lineTo(cx+x,cy+y);ctx.lineTo(cx+x-Math.sign(x)*15,cy+y);ctx.stroke();});
    ctx.font='10px monospace';ctx.fillStyle='#d5c6ff';ctx.textAlign='center';ctx.fillText('SPATIAL ANCHOR',cx,cy-40);ctx.fillText('DIGITAL LAYER',cx,cy+45);
    ctx.beginPath();ctx.ellipse(cx,cy,45,17,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,17,45,Math.sin(t*.3)*.4,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}
new ResizeObserver(sizeDemo).observe(demo);
let lastFrame=0;
function demoLoop(now){requestAnimationFrame(demoLoop);if(document.hidden||!demoVisible||paused||now-lastFrame<33)return;demoTime+=Math.min((now-lastFrame)/1000,.04);lastFrame=now;drawDemo(demoTime);}
requestAnimationFrame(demoLoop);
// WebGL is optional: content, tabs, reading links and the designed book fallback work without it.
async function initScene() {
  const THREE = await import('./vendor/three.module.js');
  const canvas=document.querySelector('#scene'), art=document.querySelector('#art');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:innerWidth>760,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.4:1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(36,1,.1,80);
  camera.position.set(0,.25,11.5);camera.lookAt(0,0,0);
  const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;
  const ec=envCanvas.getContext('2d');ec.fillStyle='#16131d';ec.fillRect(0,0,1024,512);
  [[100,100,160,290,'#a8bdff'],[430,60,95,380,'#f3eaff'],[730,120,160,190,'#9e78ce'],[920,160,45,240,'#efae74']].forEach(([x,y,w,h,color])=>{const g=ec.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,color);g.addColorStop(1,'#2b223b');ec.fillStyle=g;ec.fillRect(x,y,w,h);});
  const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer),envTarget=pmrem.fromEquirectangular(envTexture);scene.environment=envTarget.texture;envTexture.dispose();pmrem.dispose();
  scene.add(new THREE.AmbientLight(0x8c8aa9,1.3));
  function light(color,intensity,x,y,z){const l=new THREE.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);}
  light(0xd5d7ff,3,2,6,7);light(0x705bff,3,-5,1,3);light(0xf3a56d,2,3,-3,2);
  const root=new THREE.Group();scene.add(root);
  const black=new THREE.MeshStandardMaterial({color:0x171822,metalness:.78,roughness:.28});
  const rubber=new THREE.MeshStandardMaterial({color:0x11131d,metalness:.15,roughness:.67});
  const silver=new THREE.MeshStandardMaterial({color:0xaaa6c2,metalness:.97,roughness:.19});
  const purple=new THREE.MeshPhysicalMaterial({color:0x7974c7,metalness:.86,roughness:.18,clearcoat:1,iridescence:1,iridescenceIOR:1.35});
  const glass=new THREE.MeshPhysicalMaterial({color:0x151a54,metalness:.65,roughness:.1,clearcoat:1,iridescence:1});
  function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
  function rounded(w,h,d,r,material,parent,x=0,y=0,z=0){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.018,bevelThickness:.018,curveSegments:12});geo.translate(0,0,-d/2);return mesh(geo,material,parent,x,y,z);}
  function tube(points,r,material,parent){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),90,r,10,false),material,parent);}
  function torus(radius,tubeRadius,material,parent,x=0,y=0,z=0){return mesh(new THREE.TorusGeometry(radius,tubeRadius,12,80),material,parent,x,y,z);}
  const book=new THREE.Group();root.add(book);book.position.set(.05,.05,.35);book.rotation.set(-.1,-.28,-.16);
  const coverMaterial=new THREE.MeshStandardMaterial({color:0x292434,metalness:.2,roughness:.5});
  rounded(2.45,3.5,.075,.035,coverMaterial,book,0,0,-.22);
  rounded(2.36,3.4,.34,.02,new THREE.MeshStandardMaterial({color:0xbdb4bf,roughness:.8}),book,.015,0,0);
  // Individually drawn page edges, confined to the promotional model.
  for(let i=0;i<26;i++)mesh(new THREE.BoxGeometry(2.34,.008,.004),new THREE.MeshBasicMaterial({color:i%3?0x968c9c:0xe3d9df}),book,.015,-1.702,-.15+i*.012);
  rounded(2.47,3.52,.06,.03,coverMaterial,book,0,0,.205);
  rounded(.11,3.5,.46,.045,coverMaterial,book,-1.2,0,0);
  await document.fonts.ready;
  const cover=document.createElement('canvas');cover.width=768;cover.height=1080;const c=cover.getContext('2d');
  const bg=c.createLinearGradient(0,0,768,1080);bg.addColorStop(0,'#282737');bg.addColorStop(1,'#10111b');c.fillStyle=bg;c.fillRect(0,0,768,1080);
  c.strokeStyle='#9482b133';c.strokeRect(25,25,718,1030);
  c.fillStyle='#b4a6cc';c.font='18px Arial';c.fillText('ART × TECHNOLOGY × EXPERIENCE',65,79);
  c.fillStyle='#f0eaf5';c.font='bold 116px Arial';c.fillText('MULTI',57,210);c.fillText('MEDIA',57,316);
  c.save();c.translate(395,574);c.rotate(-.58);
  for(let i=0;i<30;i++){const t=i/30;c.beginPath();c.ellipse(Math.sin(t*3)*65,0,95+t*100,135+t*35,0,0,Math.PI*2);c.strokeStyle=`hsl(${230+t*55},${30+t*25}%,${35+Math.sin(t*Math.PI)*45}%)`;c.lineWidth=5;c.stroke();}c.restore();
  c.textAlign='right';c.direction='rtl';c.fillStyle='#f1eaf9';c.font='48px Vazirmatn';c.fillText('چندرسانه‌ای',690,878);c.fillStyle='#bdb1cc';c.font='27px Vazirmatn';c.fillText('امیر سعید دهقان',690,935);
  c.direction='ltr';c.textAlign='left';c.font='16px Arial';c.fillStyle='#8f849f';c.fillText('AMIR SAEID DEHGHAN',65,1010);c.fillText('01',674,1010);
  const coverTexture=new THREE.CanvasTexture(cover);coverTexture.colorSpace=THREE.SRGBColorSpace;coverTexture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  mesh(new THREE.PlaneGeometry(2.43,3.48),new THREE.MeshStandardMaterial({map:coverTexture,roughness:.48,metalness:.18}),book,0,0,.256);
  // A purpose-built cinema lens with knurled focus rings, optics and engraved markings.
  const lens=new THREE.Group();root.add(lens);lens.position.set(-1.8,-1.2,1.05);lens.rotation.set(.18,-.3,.22);lens.scale.setScalar(.78);lens.userData.mode='video';
  const body=mesh(new THREE.CylinderGeometry(.71,.79,1.15,64),black,lens);body.rotation.x=Math.PI/2;
  for(let i=0;i<6;i++)torus(.74+i*.008,.027,i===3?silver:rubber,lens,0,0,-.45+i*.19);
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2;const grip=mesh(new THREE.BoxGeometry(.024,.03,.23),rubber,lens,Math.cos(a)*.755,Math.sin(a)*.755,.05);grip.rotation.z=a;}
  const optic=mesh(new THREE.CircleGeometry(.65,64),glass,lens,0,0,.593);
  for(let i=0;i<5;i++)torus(.26+i*.085,.01,i%2?purple:silver,lens,0,0,.6+i*.003);
  torus(.76,.055,black,lens,0,0,.61);torus(.81,.017,silver,lens,0,0,.61);
  const lensLabel=document.createElement('canvas');lensLabel.width=512;lensLabel.height=512;const lc=lensLabel.getContext('2d');lc.translate(256,256);lc.fillStyle='#bcb6ce';lc.font='14px Arial';lc.textAlign='center';
  'MULTIMEDIA • CINEMA LENS • 50mm 1:1.4 •'.split('').forEach((letter,i)=>{lc.save();lc.rotate(-1.8+i*.15);lc.fillText(letter,0,-231);lc.restore();});
  mesh(new THREE.PlaneGeometry(1.7,1.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lensLabel),transparent:true,depthWrite:false}),lens,0,0,.67);
  // Studio headphones: continuous headband, suspension forks and layered ear cushions.
  const phones=new THREE.Group();root.add(phones);phones.position.set(1.8,1.35,.2);phones.rotation.set(.16,-.38,-.28);phones.scale.setScalar(.68);phones.userData.mode='audio';
  const band=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI;band.push([Math.cos(a)*.94,Math.sin(a)*1.14,0]);}tube(band,.09,silver,phones);
  const pad=[];for(let i=0;i<=35;i++){const a=.15+i/35*(Math.PI-.3);pad.push([Math.cos(a)*.91,Math.sin(a)*1.08,0]);}tube(pad,.14,rubber,phones);
  [-1,1].forEach(side=>{rounded(.46,.83,.36,.2,black,phones,side*.91,-.28,.03);rounded(.37,.68,.13,.17,rubber,phones,side*.91,-.28,.25);rounded(.31,.59,.08,.15,purple,phones,side*.91,-.28,-.22);tube([[side*.95,.15,0],[side*1.12,-.02,-.12],[side*1.13,-.48,-.1]],.035,silver,phones);});
  // Sculptural ribbons are swept along bespoke spatial curves, not stock placeholder objects.
  const ribbonGroup=new THREE.Group();root.add(ribbonGroup);ribbonGroup.position.z=-.55;
  for(let k=0;k<3;k++){
    const points=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*(2.6+k*.16),Math.sin(a)*(1.15+k*.16),Math.sin(a*2)*.44));}
    const curve=new THREE.CatmullRomCurve3(points,true);const ribbon=mesh(new THREE.TubeGeometry(curve,160,.026+k*.009,8,true),k===1?silver:purple,ribbonGroup);ribbon.rotation.set(.55+k*.12,.25,-.55);ribbon.position.y=-.18;
  }
  const dustPositions=[];for(let i=0;i<65;i++){const a=i*2.39996,r=2+(i%17)/10;dustPositions.push(Math.cos(a)*r,Math.sin(a)*r*.8,-1-(i%9)/3);}
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xb9a9eb,size:.016,transparent:true,opacity:.6}));scene.add(dust);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let px=0,py=0;
  function hit(e){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects([lens,phones],true);if(!hits.length)return null;let obj=hits[0].object;while(obj&&!obj.userData.mode)obj=obj.parent;return obj?.userData.mode;}
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){const rect=canvas.getBoundingClientRect();px=(e.clientX-rect.left)/rect.width-.5;py=(e.clientY-rect.top)/rect.height-.5;canvas.style.cursor=hit(e)?'pointer':'default';}});
  canvas.addEventListener('pointerleave',()=>{px=py=0;canvas.style.cursor='default';});
  let down;
  canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  canvas.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<12){const m=hit(e);if(m)jumpTo(m);}down=null;});
  function resize(){const w=art.clientWidth,h=art.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=w/h<.85?13.2:11.5;camera.updateProjectionMatrix();renderer.render(scene,camera);}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(art);resize();art.classList.add('webgl-ready');
  let time=0,previous=0,stopped=false;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stopped=true;art.classList.remove('webgl-ready');canvas.style.visibility='hidden';});
  function animate(now){if(stopped)return;requestAnimationFrame(animate);if(document.hidden||!heroVisible||paused||now-previous<33)return;const dt=Math.min((now-previous)/1000,.04);previous=now;if(!paused){time+=dt;book.position.y=.05+Math.sin(time*.7)*.085;lens.position.y=-1.2+Math.sin(time*.65+1)*.1;phones.position.y=1.35+Math.sin(time*.8+2)*.07;root.rotation.y+=(px*.14-root.rotation.y)*.035;root.rotation.x+=(py*.06-root.rotation.x)*.035;ribbonGroup.rotation.z=Math.sin(time*.13)*.045;}renderer.render(scene,camera);}
  requestAnimationFrame(animate);
}
initScene().catch(() => { document.querySelector('#art').classList.remove('webgl-ready'); document.querySelector('.art-hint').textContent='از گزینه‌های بالا، رسانهٔ دلخواه را کشف کنید'; });
