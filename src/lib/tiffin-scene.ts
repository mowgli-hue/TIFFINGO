// @ts-nocheck
/* TiffinGo hero - procedural 3D tiffin, animated backdrop and steam.
   Every texture is generated at runtime, so this ships no image assets. */
export function initTiffinScene(THREE: any) {
 let rafId = 0;
 const $=id=>document.getElementById(id);
 const nav=$('nav'),wrap=$('stageWrap'),canvas=$('gl'),loader=$('loader');
 const sets=[$('c0'),$('c1'),$('c2'),$('c3')];
 const dots=[...document.querySelectorAll('.pd')];
 const hint=$('hint'),acts=$('acts'),chips=$('chips'),peek=$('peek');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const seg=(p,a,b)=>clamp((p-a)/(b-a),0,1);
 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const easeOut=t=>1-Math.pow(1-t,3);
 const lerp=(a,b,t)=>a+(b-a)*t;
 const rnd=(a,b)=>a+Math.random()*(b-a);

 if(!canvas) return ()=>{};
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.04;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.autoClear=false;

 const scene=new THREE.Scene();
 const cam=new THREE.PerspectiveCamera(33,1,0.1,120);

 /* every texture is generated at runtime — no external files, so this works
    from file://, any path, and never renders a black tier on a failed fetch */
 function canvasTex(w,h,draw,srgb){
   const c=document.createElement('canvas'); c.width=w; c.height=h;
   draw(c.getContext('2d'),w,h);
   const t=new THREE.CanvasTexture(c);
   t.wrapS=t.wrapT=THREE.RepeatWrapping;
   if(srgb!==false) t.colorSpace=THREE.SRGBColorSpace;
   return t;
 }
 const blobPlate=(list)=>canvasTex(512,320,(g,w,h)=>{
   g.clearRect(0,0,w,h);
   g.filter='blur(42px)';
   list.forEach(([x,y,r,col])=>{
     g.fillStyle=col; g.beginPath();
     g.ellipse(x*w,y*h,r*w,r*w*0.85,0,0,6.2832); g.fill();
   });
   g.filter='none';
 });
 /* golden hearth warmth, weighted toward the tiffin */
 const texA=blobPlate([
   [0.86,0.30,0.34,'rgba(254,176,1,.58)'],[0.70,0.64,0.30,'rgba(255,205,90,.42)'],
   [0.22,0.16,0.28,'rgba(255,251,235,.42)'],[0.12,0.82,0.26,'rgba(240,214,150,.31)'],
   [0.50,0.46,0.22,'rgba(255,244,214,.32)']]);
 /* forest-green depth in the corners */
 const texB=blobPlate([
   [0.28,0.74,0.34,'rgba(4,63,40,.27)'],[0.64,0.10,0.28,'rgba(232,240,232,.47)'],
   [0.05,0.40,0.24,'rgba(45,106,74,.23)'],[0.95,0.88,0.26,'rgba(4,63,40,.22)']]);
 /* film grain */
 const texG=canvasTex(128,128,(g,w,h)=>{
   const d=g.createImageData(w,h);
   for(let i=0;i<w*h;i++){
     const v=96+Math.random()*64;
     d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v; d.data[i*4+3]=255;
   }
   g.putImageData(d,0,0);
 },false);
 /* chapati: dough with tawa char */
 const texR=canvasTex(256,256,(g,w,h)=>{
   g.fillStyle='#E7CD96'; g.fillRect(0,0,w,h);
   const tone=['#96602C','#C49454','#F3E0B4','#78482A'];
   g.filter='blur(1.4px)';
   for(let i=0;i<420;i++){
     g.fillStyle=tone[(Math.random()*tone.length)|0];
     g.beginPath(); g.arc(Math.random()*w,Math.random()*h,1+Math.random()*5,0,6.2832); g.fill();
   }
   g.filter='blur(2.4px)';
   g.fillStyle='#7E4E24';
   for(let i=0;i<55;i++){
     g.beginPath(); g.arc(Math.random()*w,Math.random()*h,2+Math.random()*8,0,6.2832); g.fill();
   }
   g.filter='none';
 });

 const bgScene=new THREE.Scene();
 const bgCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 const bgMat=new THREE.ShaderMaterial({
   depthTest:false,depthWrite:false,
   uniforms:{uT:{value:0},uP:{value:0},uA:{value:1},uCx:{value:.5},t1:{value:texA},t2:{value:texB},tg:{value:texG}},
   vertexShader:`varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}`,
   fragmentShader:`
     precision highp float;
     varying vec2 vUv; uniform float uT,uP,uA,uCx; uniform sampler2D t1,t2,tg;
     void main(){
       vec2 uv=vUv; vec2 c=uv-0.5; c.x*=uA;
       vec3 lo=vec3(0.918,0.925,0.906);
       vec3 hi=vec3(0.988,0.986,0.976);
       float d=clamp(1.0-length(uv-vec2(0.16,0.90))*0.95,0.0,1.0);
       vec3 col=mix(lo,hi,d*d);
       vec2 gp=vec2((uCx-0.5)*uA+0.04*sin(uT*0.11), 0.02+0.04*cos(uT*0.09));
       float g=exp(-length(c-gp)*1.55);
       col=mix(col,vec3(1.000,0.851,0.475),g*(0.26+0.07*sin(uT*0.33)));
       vec2 rc=vec2((uCx-0.5)*uA,-0.02);
       float rd=length(c-rc);
       float rings=0.0;
       for(int i=0;i<3;i++){
         float rr=0.29+float(i)*0.085+0.006*sin(uT*0.28+float(i)*1.7);
         rings+=smoothstep(0.0022,0.0,abs(rd-rr));
       }
       col=mix(col,vec3(0.847,0.694,0.353),rings*0.13);
       vec2 u1=uv*1.06+vec2(sin(uT*0.043)*0.030, uT*0.0055+uP*0.075);
       vec2 u2=uv*1.23+vec2(-uT*0.0075-uP*0.050, cos(uT*0.052)*0.024);
       vec4 a=texture2D(t1,u1); vec4 b=texture2D(t2,u2);
       col=mix(col,a.rgb,a.a*0.115);
       col=mix(col,b.rgb,b.a*0.075);
       col*=1.0-0.16*pow(clamp(length(c)*0.80,0.0,1.0),2.0);
       float n=texture2D(tg,uv*vec2(uA,1.0)*7.0+vec2(fract(uT*0.63),fract(uT*0.41))).r;
       col+=(n-0.5)*0.015;
       gl_FragColor=vec4(col,1.0);
     }`
 });
 bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat));

 const pmrem=new THREE.PMREMGenerator(renderer);
 const envTex=(()=>{
   const c=document.createElement('canvas'); c.width=1024; c.height=512;
   const g=c.getContext('2d');
   const v=g.createLinearGradient(0,0,0,512);
   v.addColorStop(0.00,'#FFFFFF');
   v.addColorStop(0.20,'#FDFBF3');
   v.addColorStop(0.42,'#EFEFE6');
   v.addColorStop(0.54,'#CBCEC2');
   v.addColorStop(0.595,'#33382F');
   v.addColorStop(0.65,'#EAEBE0');
   v.addColorStop(0.82,'#9AA093');
   v.addColorStop(1.00,'#4F564C');
   g.fillStyle=v; g.fillRect(0,0,1024,512);
   g.filter='blur(18px)';
   g.fillStyle='#FFFFFF';
   g.fillRect(70,20,250,170); g.fillRect(560,10,300,140); g.fillRect(880,210,150,60);
   g.fillStyle='rgba(255,224,150,.85)'; g.fillRect(340,150,200,80);
   g.fillStyle='rgba(45,106,74,.35)';   g.fillRect(150,250,180,120);
   g.fillStyle='rgba(24,22,18,.55)';
   g.fillRect(400,250,90,262); g.fillRect(760,270,70,242);
   g.filter='none';
   const t=new THREE.CanvasTexture(c);
   t.mapping=THREE.EquirectangularReflectionMapping; t.colorSpace=THREE.SRGBColorSpace;
   return t;
 })();
 scene.environment=pmrem.fromEquirectangular(envTex).texture;

 scene.add(new THREE.HemisphereLight(0xFFFDF2,0xBFC9B8,.6));
 const key=new THREE.DirectionalLight(0xFFF8E4,1.6); key.position.set(4.5,6.5,5); scene.add(key);
 const rim=new THREE.DirectionalLight(0xFEB001,1.05); rim.position.set(-5,2.5,-4.5); scene.add(rim);
 const grn=new THREE.DirectionalLight(0x52B788,.45); grn.position.set(5,-1,-3); scene.add(grn);
 const fill=new THREE.DirectionalLight(0xFFFDF4,.8); fill.position.set(-3.5,-1.5,4); scene.add(fill);
 const under=new THREE.DirectionalLight(0xEFEFE4,.5); under.position.set(0,-5,1.5); scene.add(under);

 const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 const r=g.createRadialGradient(128,128,8,128,128,124);
 r.addColorStop(0,'rgba(4,63,40,.30)');r.addColorStop(.55,'rgba(4,63,40,.11)');r.addColorStop(1,'rgba(4,63,40,0)');
 g.fillStyle=r;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);})();
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.0,4.0),
   new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;

 const group=new THREE.Group(); scene.add(group);
 const model=new THREE.Group(); group.add(model);

 const CHROME =new THREE.MeshStandardMaterial({color:0xF2F4F2,metalness:.92,roughness:.15,envMapIntensity:1.0,side:THREE.DoubleSide});
 const CHROME2=new THREE.MeshStandardMaterial({color:0xDCE0DA,metalness:.94,roughness:.22,envMapIntensity:1.05});
 const GOLD   =new THREE.MeshStandardMaterial({color:0xFEB001,metalness:.86,roughness:.25,envMapIntensity:1.05});
 const GREEN  =new THREE.MeshStandardMaterial({color:0x043F28,metalness:.20,roughness:.5});

 const R=.62, TH=.34;
 const lathe=(pts,mat,s=80)=>new THREE.Mesh(
   new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),s),mat);

 function chapati(t){
   const m=new THREE.MeshStandardMaterial({map:texR,metalness:0,roughness:.85});
   for(let i=0;i<5;i++){
     const d=new THREE.Mesh(new THREE.CylinderGeometry(R-.10,R-.105,.036,48),m);
     d.position.set(rnd(-.02,.02),.16+i*.040,rnd(-.02,.02));
     d.rotation.set(rnd(-.03,.03),i*.7,rnd(-.03,.03)); t.add(d);
   }
 }
 function sabzi(t){
   const base=new THREE.Mesh(new THREE.CylinderGeometry(R-.085,R-.10,.20,48),
     new THREE.MeshStandardMaterial({color:0xB4531C,metalness:0,roughness:.72}));
   base.position.y=.16; t.add(base);
   const veg=[
     {c:0x6E9B2E,g:()=>new THREE.SphereGeometry(.036,10,8)},
     {c:0xE2761B,g:()=>new THREE.BoxGeometry(.055,.055,.055)},
     {c:0xE3C077,g:()=>new THREE.SphereGeometry(.042,10,8)},
     {c:0xC2321C,g:()=>new THREE.BoxGeometry(.05,.038,.05)},
     {c:0xF2EADA,g:()=>new THREE.BoxGeometry(.05,.022,.05)},
   ];
   const mats=veg.map(v=>new THREE.MeshStandardMaterial({color:v.c,metalness:0,roughness:.55}));
   for(let i=0;i<64;i++){
     const k=i%veg.length, a=rnd(0,Math.PI*2), rr=Math.sqrt(Math.random())*(R-.13);
     const q=new THREE.Mesh(veg[k].g(),mats[k]);
     q.position.set(Math.cos(a)*rr,.255+rnd(-.012,.03),Math.sin(a)*rr);
     q.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3)); t.add(q);
   }
   leaf(t,.30);
 }
 function dal(t){
   const m=new THREE.MeshStandardMaterial({color:0xE0A62A,metalness:.05,roughness:.34});
   const b=new THREE.Mesh(new THREE.CylinderGeometry(R-.075,R-.10,.22,48),m); b.position.y=.16; t.add(b);
   const dome=new THREE.Mesh(new THREE.SphereGeometry(R-.075,44,22,0,Math.PI*2,0,Math.PI/2),m);
   dome.scale.y=.20; dome.position.y=.268; t.add(dome);
   const seed=new THREE.MeshStandardMaterial({color:0x5A3A12,metalness:0,roughness:.6});
   for(let i=0;i<52;i++){
     const a=rnd(0,Math.PI*2), rr=Math.sqrt(Math.random())*(R-.15);
     const s=new THREE.Mesh(new THREE.BoxGeometry(.032,.014,.046),seed);
     s.position.set(Math.cos(a)*rr,.292-rr*.05,Math.sin(a)*rr); s.rotation.y=rnd(0,3); t.add(s);
   }
   const chilli=new THREE.Mesh(new THREE.CapsuleGeometry(.032,.20,4,10),
     new THREE.MeshStandardMaterial({color:0x9C1F10,metalness:0,roughness:.5}));
   chilli.rotation.set(Math.PI/2,0,.7); chilli.position.set(-.10,.292,.12); t.add(chilli);
   leaf(t,.30);
 }
 function rice(t){
   const m=new THREE.MeshStandardMaterial({color:0xF2E9D4,metalness:0,roughness:.72});
   const b=new THREE.Mesh(new THREE.CylinderGeometry(R-.075,R-.10,.20,48),m); b.position.y=.155; t.add(b);
   for(let i=0;i<190;i++){
     const a=rnd(0,Math.PI*2), rr=Math.sqrt(Math.random())*(R-.11);
     const g=new THREE.Mesh(new THREE.CapsuleGeometry(.011,.030,3,6),m);
     g.position.set(Math.cos(a)*rr,.268+rnd(-.006,.034)-rr*.075,Math.sin(a)*rr);
     g.rotation.set(rnd(-.5,.5),rnd(0,3),Math.PI/2+rnd(-.5,.5)); t.add(g);
   }
   const cum=new THREE.MeshStandardMaterial({color:0x4A3312,metalness:0,roughness:.6});
   for(let i=0;i<40;i++){
     const a=rnd(0,Math.PI*2), rr=Math.sqrt(Math.random())*(R-.14);
     const s=new THREE.Mesh(new THREE.BoxGeometry(.020,.009,.028),cum);
     s.position.set(Math.cos(a)*rr,.294-rr*.07,Math.sin(a)*rr); s.rotation.y=rnd(0,3); t.add(s);
   }
   leaf(t,.285);
 }
 function leaf(t,y){
   const m=new THREE.MeshStandardMaterial({color:0x3E7A24,metalness:0,roughness:.5,side:THREE.DoubleSide});
   for(let i=0;i<3;i++){
     const s=new THREE.Shape();
     s.moveTo(0,0); s.bezierCurveTo(.055,.03,.075,.09,0,.135); s.bezierCurveTo(-.075,.09,-.055,.03,0,0);
     const l=new THREE.Mesh(new THREE.ShapeGeometry(s),m);
     l.rotation.x=-Math.PI/2+rnd(-.25,.25); l.rotation.z=rnd(0,3);
     l.position.set(rnd(-.16,.16),y+rnd(0,.02),rnd(-.16,.16)); t.add(l);
   }
 }
 const FILL=[chapati,sabzi,dal,rice];

 function makeTier(fillFn){
   const t=new THREE.Group();
   t.add(lathe([[0,0],[R-.14,0],[R-.04,.045],[R,.11],[R,TH-.10],
     [R+.035,TH-.055],[R+.035,TH-.012],[R-.015,TH]],CHROME));
   const ring=new THREE.Mesh(new THREE.TorusGeometry(R+.026,.022,12,72),CHROME2);
   ring.rotation.x=-Math.PI/2; ring.position.y=TH-.012; t.add(ring);
   fillFn(t); return t;
 }
 function makeLid(){
   const l=new THREE.Group();
   l.add(lathe([[0,.085],[.20,.082],[.44,.068],[R-.10,.038],[R+.045,0],[R+.045,-.05],[R+.005,-.062]],CHROME));
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.038,.052,.055,24),CHROME); stem.position.y=.108; l.add(stem);
   const knob=new THREE.Mesh(new THREE.SphereGeometry(.058,28,18),GOLD); knob.position.y=.152; l.add(knob);
   return l;
 }

 const Y0=-.98;
 const tiers=[];
 for(let i=0;i<4;i++){
   const t=makeTier(FILL[3-i]); t.position.y=Y0+i*(TH-.004);
   model.add(t); tiers.push(t);
 }
 const lid=makeLid(); lid.position.y=TH; tiers[3].add(lid);

 const frame=new THREE.Group(); model.add(frame);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(R+.13,R+.17,.075,64),CHROME2);
 base.position.y=Y0-.037; frame.add(base);
 const railH=2.02, railY=Y0+railH/2-.03;
 [-1,1].forEach(s=>{
   const rail=new THREE.Mesh(new THREE.BoxGeometry(.055,railH,.10),CHROME2);
   rail.position.set(s*(R+.095),railY,0); frame.add(rail);
   for(let i=1;i<5;i++){
     const tab=new THREE.Mesh(new THREE.BoxGeometry(.078,.058,.14),GOLD);
     tab.position.set(s*(R+.095),Y0+i*(TH-.004)-.02,0); frame.add(tab);
   }
 });
 const arch=new THREE.Mesh(new THREE.TorusGeometry(R+.095,.030,14,56,Math.PI),CHROME2);
 arch.position.y=Y0+railH-.03; frame.add(arch);
 const grip=new THREE.Mesh(new THREE.CylinderGeometry(.050,.050,.30,28),GREEN);
 grip.rotation.z=Math.PI/2; grip.position.y=Y0+railH+R+.06; frame.add(grip);

 const bb=new THREE.Box3().setFromObject(model);
 model.position.y=-(bb.min.y+bb.max.y)/2;
 shadow.position.y=bb.min.y-.02; model.add(shadow);

 const parts=tiers.map((t,i)=>({mesh:t,base:t.position.clone(),rank:3-i})).sort((a,b)=>a.rank-b.rank);

 const arcs=[];
 [[1.95,.010,.62,.55],[2.32,.008,.44,.38],[1.62,.007,.34,.30]].forEach(([rad,tube,arc,op],i)=>{
   const m=new THREE.Mesh(new THREE.TorusGeometry(rad,tube,8,150,Math.PI*arc),
     new THREE.MeshBasicMaterial({color:i===1?0x52B788:0xFEB001,transparent:true,opacity:op,depthWrite:false}));
   m.position.z=-0.9-i*0.35; group.add(m); arcs.push({m,sp:.12+i*.055,dir:i%2?-1:1,op});
 });

 const MO=70;
 const mgeo=new THREE.BufferGeometry();
 const mp=new Float32Array(MO*3), mc=new Float32Array(MO*3), ms=new Float32Array(MO);
 const MOT=[];
 const PAL=[[.94,.71,.16],[.32,.72,.53],[.89,.46,.11],[.10,.23,.16]];
 for(let i=0;i<MO;i++){
   const c=PAL[i%PAL.length];
   MOT.push({x:rnd(-5,5),y:rnd(-3,3),z:rnd(-2.5,1.5),sp:rnd(.02,.09),ph:rnd(0,6.3),am:rnd(.10,.34)});
   mc[i*3]=c[0]; mc[i*3+1]=c[1]; mc[i*3+2]=c[2];
   ms[i]=rnd(.020,.055);
 }
 mgeo.setAttribute('position',new THREE.BufferAttribute(mp,3));
 mgeo.setAttribute('aCol',new THREE.BufferAttribute(mc,3));
 mgeo.setAttribute('aSize',new THREE.BufferAttribute(ms,1));
 const motes=new THREE.Points(mgeo,new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,
   uniforms:{uPix:{value:1}},
   vertexShader:`attribute vec3 aCol; attribute float aSize; varying vec3 vC; uniform float uPix;
     void main(){ vC=aCol; vec4 mv=modelViewMatrix*vec4(position,1.0);
       gl_PointSize=aSize*uPix*(300.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
   fragmentShader:`varying vec3 vC;
     void main(){ float d=length(gl_PointCoord-0.5);
       float a=smoothstep(0.5,0.05,d)*0.42; if(a<0.004) discard;
       gl_FragColor=vec4(vC,a); }`
 }));
 motes.frustumCulled=false; scene.add(motes);

 const SEG=32, NR=6;
 const ribMat=new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,side:THREE.DoubleSide,
   uniforms:{uOp:{value:1}},
   vertexShader:`attribute float aT; attribute float aS; attribute float aA;
     varying float vT,vS,vA;
     void main(){ vT=aT; vS=aS; vA=aA; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
   fragmentShader:`varying float vT,vS,vA; uniform float uOp;
     void main(){
       float edge=pow(1.0-abs(vS),1.7);
       float head=smoothstep(0.0,0.12,vT);
       float tail=1.0-smoothstep(0.40,1.0,vT);
       float a=edge*head*tail*vA*uOp*0.80;
       if(a<0.002) discard;
       gl_FragColor=vec4(1.0,0.999,0.994,a);
     }`
 });
 const ribbons=[];
 for(let r=0;r<NR;r++){
   const n=(SEG+1)*2, g=new THREE.BufferGeometry();
   const pos=new Float32Array(n*3), aT=new Float32Array(n), aS=new Float32Array(n), aA=new Float32Array(n);
   const idx=[];
   for(let i=0;i<=SEG;i++){
     aT[i*2]=aT[i*2+1]=i/SEG; aS[i*2]=-1; aS[i*2+1]=1;
     if(i<SEG){const a=i*2; idx.push(a,a+1,a+2, a+1,a+3,a+2);}
   }
   g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   g.setAttribute('aT',new THREE.BufferAttribute(aT,1));
   g.setAttribute('aS',new THREE.BufferAttribute(aS,1));
   g.setAttribute('aA',new THREE.BufferAttribute(aA,1));
   g.setIndex(idx);
   const m=new THREE.Mesh(g,ribMat); m.frustumCulled=false; scene.add(m);
   ribbons.push({mesh:m,pos,aA,g,ph:r*1.9,sp:rnd(.18,.30),amp:rnd(.17,.30),amp2:rnd(.07,.16),
     len:rnd(1.35,2.05),wid:rnd(.12,.20),src:r<2?4:(r-2)%4});
 }
 const _wp=new THREE.Vector3(), _right=new THREE.Vector3(), _vd=new THREE.Vector3(), _up=new THREE.Vector3(0,1,0);
 const _o=new THREE.Vector3(0,0,0);
 const emit=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];

 loader.classList.add('done');

 const FAN=[{dx:-0.34,dy:0.74,rz:-.10,rx:.24},{dx:0.40,dy:0.56,rz:.09,rx:.18},
            {dx:-0.36,dy:0.28,rz:-.07,rx:.11},{dx:0.28,dy:0.05,rz:.05,rx:.04}];

 let P=0;
 function layout(p){
   P=p;
   let phase=0;
   if(p>.76)phase=3;else if(p>.51)phase=2;else if(p>.26)phase=1;
   sets.forEach((s,i)=>s.classList.toggle('on',i===phase));
   dots.forEach((d,i)=>d.classList.toggle('on',i===phase));
   hint.style.opacity=p>.04?0:1;
 }
 layout(0);
 acts.classList.add('on'); chips.classList.add('on'); peek.classList.add('on');

 let lastF=null;
 function tick(t){
   rafId=requestAnimationFrame(tick);
   const T=t*.001;
   const w=canvas.clientWidth,h=canvas.clientHeight,pr=renderer.getPixelRatio();
   if(canvas.width!==Math.round(w*pr)||canvas.height!==Math.round(h*pr)){
     renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();lastF=null;
   }
   const p=reduced?0:P;

   const wide=cam.aspect>1.15;
   const f=wide?0.20:0.0, gy=wide?0.0:0.24;   /* narrow: drop the tiffin below the copy */
   const fk=f+','+gy;
   if(fk!==lastF){ lastF=fk; cam.setViewOffset(w,h,-f*w,-gy*h,w,h); }
   bgMat.uniforms.uT.value=T; bgMat.uniforms.uP.value=p;
   bgMat.uniforms.uA.value=cam.aspect; bgMat.uniforms.uCx.value=.5+f;
   motes.material.uniforms.uPix.value=pr;

   const nar=clamp((1.05-cam.aspect)/1.05,0,.60);
   const spread=1-nar*.45;
   const az=lerp(.30,-.52,ease(p))+Math.sin(T*.20)*.03;
   const dist=lerp(7.15,8.45,ease(seg(p,.10,.86)))*(1+nar*1.04);
   const cy=lerp(.24,.62,ease(p));
   cam.position.set(Math.sin(az)*dist,cy+Math.sin(T*.42)*.05,Math.cos(az)*dist);
   cam.lookAt(0,lerp(0,.20,ease(p)),0);

   group.rotation.y=ease(seg(p,.02,.50))*.62-ease(seg(p,.50,.92))*.46;
   model.position.x=Math.sin(T*.31)*.012;
   model.rotation.z=Math.sin(T*.24)*.006;

   parts.forEach(({mesh,base,rank})=>{
     const o=ease(seg(p,.16+rank*.08,.48+rank*.08));
     const F=FAN[rank];
     const flt=Math.sin(T*.65+rank*1.7)*.020*o;
     mesh.position.set(base.x+F.dx*o*spread, base.y+F.dy*o+flt, base.z);
     mesh.rotation.set(F.rx*o,Math.sin(T*.33+rank)*.025*o,F.rz*o);
   });

   const lo=easeOut(seg(p,.08,.34));
   lid.position.set(-lo*.26*spread,TH+lo*.24+Math.sin(T*.55)*.012*lo,0);
   lid.rotation.set(lo*.22,0,-lo*.34);

   arcs.forEach(a=>{ a.m.rotation.z=T*a.sp*a.dir; a.m.material.opacity=a.op*(.55+.45*Math.sin(T*.4+a.sp*9)); });

   for(let i=0;i<MO;i++){
     const q=MOT[i];
     q.y+=q.sp*.016;
     if(q.y>3.4) q.y=-3.4;
     mp[i*3]=q.x+Math.sin(T*.35+q.ph)*q.am;
     mp[i*3+1]=q.y;
     mp[i*3+2]=q.z+Math.cos(T*.27+q.ph)*q.am*.5;
   }
   mgeo.attributes.position.needsUpdate=true;

   const open=seg(p,.06,.34), closed=1-open;
   tiers.forEach((tr,i)=>{ tr.getWorldPosition(_wp); emit[3-i].set(_wp.x,_wp.y+.30,_wp.z); });
   model.getWorldPosition(_wp); emit[4].set(_wp.x,_wp.y+0.58,_wp.z);
   _vd.subVectors(cam.position,_o).normalize();
   _right.crossVectors(_vd,_up).normalize();
   for(const rb of ribbons){
     const act=rb.src===4?closed:open;
     const e=emit[rb.src];
     const off=rb.src===4?(rb.ph%2-0.5)*.22:(rb.ph%2-0.5)*.34;
     for(let i=0;i<=SEG;i++){
       const u=i/SEG, t2=T*rb.sp+rb.ph;
       const x=e.x+off+Math.sin(u*3.1+t2*2.2)*rb.amp*(0.25+u)+Math.sin(u*7.3+t2*1.3)*rb.amp2*u;
       const y=e.y+u*rb.len;
       const z=e.z+Math.cos(u*2.4+t2*1.7)*rb.amp*.55*(0.25+u);
       const wd=rb.wid*(0.30+1.15*Math.pow(Math.sin(u*Math.PI*0.86),0.7))*(0.6+0.4*Math.sin(u*9.0+t2*2.0));
       const k=i*6;
       rb.pos[k]  =x-_right.x*wd; rb.pos[k+1]=y-_right.y*wd; rb.pos[k+2]=z-_right.z*wd;
       rb.pos[k+3]=x+_right.x*wd; rb.pos[k+4]=y+_right.y*wd; rb.pos[k+5]=z+_right.z*wd;
       rb.aA[i*2]=rb.aA[i*2+1]=act*(0.55+0.45*Math.sin(t2*1.6+u*2.0));
     }
     rb.g.attributes.position.needsUpdate=true;
     rb.g.attributes.aA.needsUpdate=true;
     rb.mesh.visible=act>.01;
   }

   renderer.clear();
   renderer.render(bgScene,bgCam);
   renderer.clearDepth();
   renderer.render(scene,cam);
 }
 rafId=requestAnimationFrame(tick);

 const onScroll=()=>{
   nav.classList.toggle('scrolled',scrollY>40);
   const r=wrap.getBoundingClientRect();
   layout(clamp(-r.top/(r.height-innerHeight),0,1));
 };
 addEventListener('scroll',onScroll,{passive:true});

 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.25});
 document.querySelectorAll('[data-r]').forEach(el=>io.observe(el));

 return () => {
   cancelAnimationFrame(rafId);
   removeEventListener('scroll', onScroll);
   try { io.disconnect(); } catch (e) {}
   try { renderer.dispose(); } catch (e) {}
   try { pmrem.dispose(); } catch (e) {}
 };
}
