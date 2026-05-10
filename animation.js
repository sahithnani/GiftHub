/* CINEMATIC ROCKET - Three.js + GSAP - Plasma Exhaust + Cockpit + Characters */

function launchRocket() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  // --- DOM OVERLAYS ---
  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;z-index:200;background:#000';
  document.body.appendChild(container);

  var narration = document.createElement('div');
  narration.style.cssText = "position:fixed;bottom:8%;left:0;right:0;text-align:center;z-index:202;font:italic 24px 'Cormorant Garamond',serif;color:rgba(232,201,109,0.95);opacity:0;text-shadow:0 0 30px rgba(232,201,109,0.4);pointer-events:none";
  document.body.appendChild(narration);

  var hud = document.createElement('div');
  hud.style.cssText = 'position:fixed;inset:0;z-index:201;pointer-events:none;opacity:0';
  hud.innerHTML = "<div style=\"position:absolute;top:20px;left:24px;font:bold 12px 'Courier Prime',monospace;color:rgba(0,220,180,0.7)\"><div>VEL <span id=hud-speed>0</span>c</div><div style='margin-top:4px;font-size:10px;color:rgba(0,180,150,0.5)'>SPEED OF LIGHT</div></div><div style=\"position:absolute;top:20px;right:24px;text-align:right;font:bold 12px 'Courier Prime',monospace;color:rgba(0,220,180,0.7)\"><div>DST <span id=hud-dist>613</span> ly</div><div style='margin-top:4px;font-size:10px;color:rgba(0,180,150,0.5)'>CASSIOPEIA</div></div>";
  document.body.appendChild(hud);

  // --- RENDERER ---
  var W = window.innerWidth, H = window.innerHeight;
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // --- EXTERIOR SCENE ---
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000208, 0.00012);
  var camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 50000);
  camera.position.set(0, 4, 25);

  // Stars
  var starGeo = new THREE.BufferGeometry();
  var starPos = new Float32Array(36000);
  for (var i = 0; i < 12000; i++) { starPos[i*3]=(Math.random()-.5)*4000; starPos[i*3+1]=(Math.random()-.5)*4000; starPos[i*3+2]=(Math.random()-.5)*4000; }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xfff4e0, size:1.5, sizeAttenuation:true, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending }));
  scene.add(stars);

  // Earth
  var earth = new THREE.Mesh(new THREE.SphereGeometry(80,64,64), new THREE.MeshPhongMaterial({ color:0x1a4488, emissive:0x0a2244, emissiveIntensity:0.4, specular:0x446688, shininess:20 }));
  earth.position.set(0,-90,0); scene.add(earth);
  var atmos = new THREE.Mesh(new THREE.SphereGeometry(83,64,64), new THREE.ShaderMaterial({
    vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec3 vN;void main(){float i=pow(0.65-dot(vN,vec3(0,0,1.0)),2.0);gl_FragColor=vec4(0.3,0.6,1.0,1.0)*i*0.8;}',
    blending:THREE.AdditiveBlending, side:THREE.BackSide, transparent:true
  }));
  atmos.position.copy(earth.position); scene.add(atmos);

  // Lighting (exterior)
  scene.add(new THREE.AmbientLight(0x445566, 0.6));
  var sun = new THREE.DirectionalLight(0xffeedd, 1.8); sun.position.set(10,20,10); scene.add(sun);
  var fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
  fillLight.position.set(0, 0, 20);
  scene.add(fillLight);

  // --- ROCKET ---
  var rocket = new THREE.Group();
  (function buildRocket(r) {
    var white = new THREE.MeshStandardMaterial({color:0xf0ece4, metalness:0.25, roughness:0.55});
    // First stage body
    r.add(new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.0,14,48), white));
    // Interstage
    var inter = new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.05,2,48), new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.6,roughness:0.35}));
    inter.position.y = -5; r.add(inter);
    // Second stage
    var s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.9,5,48), new THREE.MeshStandardMaterial({color:0xf5f0e8,metalness:0.2,roughness:0.6}));
    s2.position.y = 5; r.add(s2);
    // Fairing
    var nc = new THREE.Mesh(new THREE.ConeGeometry(0.85,4,48), new THREE.MeshStandardMaterial({color:0xf8f4ec,metalness:0.15,roughness:0.65}));
    nc.position.y = 9.5; r.add(nc);
    // Tip
    var tip = new THREE.Mesh(new THREE.ConeGeometry(0.12,0.8,24), new THREE.MeshStandardMaterial({color:0x222222,metalness:0.85,roughness:0.15}));
    tip.position.y = 11.9; r.add(tip);
    // Panel lines
    for (var i=0;i<6;i++) { var ln=new THREE.Mesh(new THREE.CylinderGeometry(0.905,1.005,0.03,48),new THREE.MeshBasicMaterial({color:0x999999})); ln.position.y=-6+i*2.5; r.add(ln); }
    // Landing legs
    for (var i=0;i<4;i++) { var leg=new THREE.Mesh(new THREE.BoxGeometry(0.1,5,0.25),new THREE.MeshStandardMaterial({color:0x111111,metalness:0.7,roughness:0.3})); leg.position.set(Math.sin(i*Math.PI/2)*1.05,-7,Math.cos(i*Math.PI/2)*1.05); r.add(leg); }
    // Grid fins
    for (var i=0;i<4;i++) { var gf=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.5,0.05),new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.75,roughness:0.25})); gf.position.set(Math.sin(i*Math.PI/2)*1.3,2,Math.cos(i*Math.PI/2)*1.3); gf.rotation.y=i*Math.PI/2; r.add(gf); }
    // Engine bell cluster
    var bellMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.35,2,48), new THREE.MeshStandardMaterial({color:0x0f0f0f,metalness:0.9,roughness:0.15}));
    bellMesh.position.y = -10;
    r.add(bellMesh);
    var nMat = new THREE.MeshStandardMaterial({color:0x3a3a3a,metalness:0.92,roughness:0.1,side:THREE.DoubleSide});
    for (var i=0;i<9;i++) { var n=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.26,0.9,16,1,true),nMat); if(i===0) n.position.set(0,-11.2,0); else { var a=(i-1)*Math.PI/4; n.position.set(Math.cos(a)*0.55,-11.2,Math.sin(a)*0.55); } r.add(n); }
  })(rocket);
  rocket.rotation.x = -Math.PI / 2;
  scene.add(rocket);

  // --- PLASMA EXHAUST (shader-based, smooth) ---
  var exhaustGroup = new THREE.Group();
  exhaustGroup.position.y = -11; exhaustGroup.rotation.x = Math.PI;
  rocket.add(exhaustGroup);

  // Core plume cone
  var plumeMat = new THREE.ShaderMaterial({
    transparent:true, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, depthWrite:false,
    uniforms: { uTime:{value:0}, uPower:{value:0} },
    vertexShader: [
      'varying vec2 vUv; varying float vPos;',
      'void main(){ vUv=uv; vPos=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime, uPower; varying vec2 vUv; varying float vPos;',
      'void main(){',
      '  float d=length(vUv - vec2(0.5));',
      '  float core=smoothstep(0.5,0.0,d);',
      '  float fade=smoothstep(0.0,1.0,vUv.y);',
      '  float flicker=0.92+0.08*sin(uTime*25.0+vPos*4.0);',
      '  float hotspot=smoothstep(0.3,0.0,d)*smoothstep(0.6,0.0,vUv.y);',
      '  vec3 col=mix(vec3(1.0,0.45,0.05), vec3(0.5,0.7,1.0), hotspot);',
      '  col=mix(col, vec3(1.0,0.95,0.8), hotspot*0.7);',
      '  float alpha=fade*core*flicker*uPower*0.95;',
      '  gl_FragColor=vec4(col, alpha);',
      '}'
    ].join('\n')
  });
  var plume = new THREE.Mesh(new THREE.ConeGeometry(1.3, 20, 32, 1, true), plumeMat);
  plume.position.y = 10; exhaustGroup.add(plume);

  // Outer glow
  var outerMat = new THREE.ShaderMaterial({
    transparent:true, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, depthWrite:false,
    uniforms: { uTime:{value:0}, uPower:{value:0} },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: [
      'uniform float uTime, uPower; varying vec2 vUv;',
      'void main(){',
      '  float d=length(vUv-vec2(0.5));',
      '  float glow=smoothstep(0.5,0.05,d)*0.35;',
      '  float fade=smoothstep(0.0,0.7,vUv.y);',
      '  float pulse=0.88+0.12*sin(uTime*18.0+vUv.y*6.0);',
      '  vec3 col=mix(vec3(1.0,0.35,0.0),vec3(0.6,0.15,0.0),vUv.y);',
      '  gl_FragColor=vec4(col, fade*glow*pulse*uPower*0.7);',
      '}'
    ].join('\n')
  });
  var outerPlume = new THREE.Mesh(new THREE.ConeGeometry(2.8, 25, 32, 1, true), outerMat);
  outerPlume.position.y = 12.5; exhaustGroup.add(outerPlume);

  // Hot core sprites (smooth glow)
  var spriteTex = createSoftCircle();
  var coreSprites = [];
  for (var i = 0; i < 8; i++) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:spriteTex, color:0xffffff, transparent:true, opacity:0, blending:THREE.AdditiveBlending }));
    sp.scale.set(1.8 - i*0.15, 1.8 - i*0.15, 1); sp.position.y = i * 2.2 + 1;
    exhaustGroup.add(sp); coreSprites.push(sp);
  }
  var engineLight = new THREE.PointLight(0xff6620, 0, 50);
  engineLight.position.set(0, -12, 0); rocket.add(engineLight);

  // --- WARP STREAKS ---
  var warpCount = 2500, warpGeo = new THREE.BufferGeometry();
  var warpPos = new Float32Array(warpCount * 6), warpSpd = [];
  for (var i=0;i<warpCount;i++) { var x=(Math.random()-.5)*200,y=(Math.random()-.5)*200,z=(Math.random()-.5)*800; warpPos[i*6]=x;warpPos[i*6+1]=y;warpPos[i*6+2]=z;warpPos[i*6+3]=x;warpPos[i*6+4]=y;warpPos[i*6+5]=z+2; warpSpd.push(100+Math.random()*300); }
  warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPos, 3));
  var warpMat = new THREE.LineBasicMaterial({ color:0xaaddff, transparent:true, opacity:0, blending:THREE.AdditiveBlending });
  var warpLines = new THREE.LineSegments(warpGeo, warpMat);
  scene.add(warpLines);

  // --- DESTINATION STAR ---
  var destStar = new THREE.Mesh(new THREE.SphereGeometry(5,32,32), new THREE.MeshBasicMaterial({color:0xfff8e0}));
  destStar.position.set(0,0,-2000); scene.add(destStar);
  var glowTex = createGlowTex();
  var starGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffe880,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending}));
  starGlow.scale.set(80,80,1); starGlow.position.copy(destStar.position); scene.add(starGlow);

  // --- COCKPIT SCENE ---
  var cockpitScene = new THREE.Scene();
  cockpitScene.background = new THREE.Color(0x060a10);
  var cockpitCam = new THREE.PerspectiveCamera(72, W/H, 0.1, 100);
  cockpitCam.position.set(0, 1.4, 3); cockpitCam.lookAt(0, 1.0, -5);
  buildCockpitScene(cockpitScene);

  // --- STATE ---
  var st = { speed:0, dist:613, exh:0, warp:0, shake:0, camY:4, camZ:25, cockpit:false, cShake:0 };

  // --- RUNNING FLAG ---
  var running = true;
  var animFrameId = 0;

  // --- RESIZE HANDLER ---
  function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    cockpitCam.aspect = W / H;
    cockpitCam.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // --- CLEANUP ---
  function cleanup() {
    running = false;
    cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    spriteTex.dispose();
    glowTex.dispose();
  }

  // --- TIMELINE ---
  var tl = gsap.timeline({ onComplete: function() {
    cleanup();
    container.remove(); narration.remove(); hud.remove();
    document.getElementById('screen-reveal').classList.add('active');
    spawnParticles();
  }});

  // S1: Exterior launch (0-3.5s)
  tl.set(narration,{textContent:'Two passengers. One destination.'},0)
    .to(narration,{opacity:1,duration:1},0.5)
    .to(st,{exh:0.5,duration:2},1).to(st,{exh:1,shake:0.5,duration:1.5,ease:'power2.in'},2.5)
    .to(narration,{opacity:0,duration:0.5},3);

  // S2: Cockpit ignition (3.5-7s)
  tl.call(function(){st.cockpit=true;},null,3.5)
    .set(narration,{textContent:'Systems online.'},3.5).to(narration,{opacity:1,duration:0.4},3.7)
    .to(st,{cShake:0.4,duration:1.5,ease:'power2.in'},5)
    .to(narration,{opacity:0,duration:0.3},5.3)
    .set(narration,{textContent:'Ignition.'},5.6).to(narration,{opacity:1,duration:0.3},5.6)
    .to(st,{cShake:1,duration:0.8,ease:'power2.in'},6).to(narration,{opacity:0,duration:0.3},6.7);

  // S3: Exterior liftoff (7-10s)
  tl.call(function(){st.cockpit=false;hud.style.opacity='1';},null,7)
    .to(st,{speed:0.05,shake:0.9,duration:3,ease:'power2.in'},7)
    .to(earth.position,{y:-600,duration:3,ease:'power2.in'},7)
    .to(atmos.position,{y:-600,duration:3,ease:'power2.in'},7)
    .set(narration,{textContent:'Leaving everything behind.'},7.5)
    .to(narration,{opacity:1,duration:0.5},7.5).to(narration,{opacity:0,duration:0.5},9.5);

  // S4: Cockpit in space (10-12.5s)
  tl.call(function(){st.cockpit=true;},null,10)
    .to(st,{speed:5,cShake:0.1,duration:0.3},10)
    .set(narration,{textContent:'613 light-years to go.'},10.5)
    .to(narration,{opacity:1,duration:0.5},10.5).to(narration,{opacity:0,duration:0.5},12);

  // S5: Exterior warp (12.5-17s)
  tl.call(function(){st.cockpit=false;},null,12.5)
    .to(st,{warp:1,speed:9999,shake:0.5,duration:3,ease:'power2.inOut'},12.5)
    .to(warpMat,{opacity:0.7,duration:2},12.5)
    .to(st,{camZ:18,camY:2,duration:2},12.5)
    .to(st,{dist:5,duration:4.5,ease:'power1.in'},12.5)
    .to(st,{warp:0,speed:0,shake:0,duration:1.5},16)
    .to(warpMat,{opacity:0,duration:1.5},16);

  // S6: Cockpit arrival (17.5-23s)
  tl.call(function(){st.cockpit=true;},null,17.5)
    .to(st,{exh:0.1,camZ:30,camY:5,duration:1},17.5)
    .to(destStar.position,{z:-50,duration:2,ease:'power2.out'},17.5)
    .to(starGlow.scale,{x:400,y:400,duration:2,ease:'power2.out'},17.5)
    .set(narration,{textContent:'"See that star?"'},19)
    .to(narration,{opacity:1,duration:0.6},19)
    .to(narration,{opacity:0,duration:0.4},20.5)
    .set(narration,{textContent:'"That one\u2019s yours."'},21)
    .to(narration,{opacity:1,duration:0.5},21)
    .to(narration,{opacity:0,duration:0.5},22.5)
    .to(container,{backgroundColor:'#fffcf0',duration:0.8,ease:'power3.in'},22.5);

  // --- RENDER LOOP ---
  var clock = new THREE.Clock();
  function animate() {
    if (!running) return;

    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    // Plasma exhaust update
    plumeMat.uniforms.uTime.value = t;
    plumeMat.uniforms.uPower.value = st.exh;
    outerMat.uniforms.uTime.value = t;
    outerMat.uniforms.uPower.value = st.exh;
    engineLight.intensity = st.exh * 5;
    for (var i = 0; i < coreSprites.length; i++) {
      coreSprites[i].material.opacity = st.exh * (0.6 - i * 0.06);
      var s = 1.8 - i*0.12 + Math.sin(t*12+i)*0.15*st.exh;
      coreSprites[i].scale.set(s, s, 1);
    }

    // Warp
    if (st.warp > 0) {
      var wp = warpGeo.attributes.position.array;
      for (var i=0;i<warpCount;i++) { var s=warpSpd[i]*st.warp*dt; wp[i*6+2]+=s; wp[i*6+5]=wp[i*6+2]+2+st.warp*20; wp[i*6+3]=wp[i*6]; wp[i*6+4]=wp[i*6+1]; if(wp[i*6+2]>400){wp[i*6+2]=-400;wp[i*6+5]=wp[i*6+2]+2;wp[i*6]=(Math.random()-.5)*200;wp[i*6+1]=(Math.random()-.5)*200;wp[i*6+3]=wp[i*6];wp[i*6+4]=wp[i*6+1];} }
      warpGeo.attributes.position.needsUpdate = true;
    }

    // Scene updates
    stars.position.z += st.speed * dt * 0.3;
    if (stars.position.z > 2000) stars.position.z -= 4000;
    earth.rotation.y += dt * 0.05;
    rocket.position.x = Math.sin(t*0.3)*0.12;
    rocket.position.y = Math.cos(t*0.5)*0.08;

    // Exterior camera
    var sx = st.shake>0 ? (Math.random()-.5)*st.shake : 0;
    var sy = st.shake>0 ? (Math.random()-.5)*st.shake*0.6 : 0;
    camera.position.set(sx, st.camY+sy, st.camZ);
    camera.lookAt(0, 0.5, -15);

    // Cockpit camera shake
    var cs = st.cShake;
    cockpitCam.position.x = (Math.random()-.5)*cs*0.04;
    cockpitCam.position.y = 1.4 + (Math.random()-.5)*cs*0.03;

    // HUD
    var sEl = document.getElementById('hud-speed');
    var dEl = document.getElementById('hud-dist');
    if (sEl) { var sp=st.speed; sEl.textContent = sp<0.01?sp.toFixed(4):sp<1?sp.toFixed(3):sp<100?sp.toFixed(1):Math.round(sp).toLocaleString(); }
    if (dEl) dEl.textContent = Math.round(st.dist);

    // Render correct scene
    if (st.cockpit) { renderer.render(cockpitScene, cockpitCam); }
    else { renderer.render(scene, camera); }

    animFrameId = requestAnimationFrame(animate);
  }
  animate();
}

// === COCKPIT INTERIOR ===
function buildCockpitScene(scene) {
  // Ambient
  scene.add(new THREE.AmbientLight(0x112233, 0.3));
  // Blue LED accent lights
  var l1 = new THREE.PointLight(0x00aaff, 0.9, 10); l1.position.set(-3.5, 2.8, -1); scene.add(l1);
  var l2 = new THREE.PointLight(0x00aaff, 0.9, 10); l2.position.set(3.5, 2.8, -1); scene.add(l2);
  var l3 = new THREE.PointLight(0x00ccff, 0.5, 8); l3.position.set(0, 3.2, -2); scene.add(l3);
  // Warm fill from console
  var l4 = new THREE.PointLight(0x003355, 0.4, 5); l4.position.set(0, 0.5, -2); scene.add(l4);

  var darkMetal = new THREE.MeshStandardMaterial({color:0x0c1018, metalness:0.7, roughness:0.4});
  var frameMetal = new THREE.MeshStandardMaterial({color:0x1a2535, metalness:0.8, roughness:0.3});

  // --- VIEWPORT (large hexagonal window showing space) ---
  var vpMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0} },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: [
      'varying vec2 vUv;',
      'void main(){',
      '  vec3 bg=vec3(0.005,0.01,0.025);',
      '  float star=0.0;',
      '  for(int i=0;i<50;i++){',
      '    vec2 p=fract(vUv*float(i+3)*1.7+float(i)*0.9);',
      '    float d=length(p-0.5);',
      '    star+=smoothstep(0.015,0.0,d)*0.6;',
      '  }',
      '  vec3 col=bg+vec3(star)*vec3(0.95,0.92,0.85);',
      '  // Subtle nebula',
      '  col+=vec3(0.02,0.01,0.04)*smoothstep(0.7,0.3,length(vUv-vec2(0.3,0.6)));',
      '  gl_FragColor=vec4(col,1.0);',
      '}'
    ].join('\n')
  });
  var viewport = new THREE.Mesh(new THREE.PlaneGeometry(7, 4), vpMat);
  viewport.position.set(0, 1.8, -5); scene.add(viewport);

  // Hexagonal frame around viewport
  var frameThick = 0.18;
  // Top
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(5.5, frameThick, 0.35), frameMetal).translateX(0).translateY(3.85).translateZ(-5));
  // Bottom
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(5.5, frameThick, 0.35), frameMetal).translateY(-0.25).translateZ(-5));
  // Left angle pieces
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(frameThick, 2.2, 0.35), frameMetal).translateX(-3.3).translateY(1.8).translateZ(-5));
  // Right
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(frameThick, 2.2, 0.35), frameMetal).translateX(3.3).translateY(1.8).translateZ(-5));
  // Top-left angle
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, frameThick, 0.35), frameMetal).translateX(-3.0).translateY(3.3).translateZ(-5).rotateZ(0.5));
  // Top-right angle
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, frameThick, 0.35), frameMetal).translateX(3.0).translateY(3.3).translateZ(-5).rotateZ(-0.5));
  // Bottom-left angle
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, frameThick, 0.35), frameMetal).translateX(-3.0).translateY(0.3).translateZ(-5).rotateZ(-0.5));
  // Bottom-right angle
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, frameThick, 0.35), frameMetal).translateX(3.0).translateY(0.3).translateZ(-5).rotateZ(0.5));

  // LED strips on frame (cyan glow)
  var ledMat = new THREE.MeshBasicMaterial({color:0x00ccff});
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.03, 0.04), ledMat).translateY(3.72).translateZ(-4.8));
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.03, 0.04), ledMat).translateY(-0.12).translateZ(-4.8));
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.0, 0.04), ledMat).translateX(-3.18).translateY(1.8).translateZ(-4.8));
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.0, 0.04), ledMat).translateX(3.18).translateY(1.8).translateZ(-4.8));

  // --- CEILING ---
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(8, 0.25, 10), new THREE.MeshStandardMaterial({color:0x080c14, metalness:0.5, roughness:0.6}));
  ceiling.position.set(0, 3.8, 0); scene.add(ceiling);
  // Ceiling LED strip
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(6, 0.03, 0.04), ledMat).translateY(3.65).translateZ(0));
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(6, 0.03, 0.04), ledMat).translateY(3.65).translateZ(-2));

  // --- WALLS ---
  var lWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 10), darkMetal);
  lWall.position.set(-4, 1.5, 0); scene.add(lWall);
  var rWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 10), darkMetal);
  rWall.position.set(4, 1.5, 0); scene.add(rWall);

  // Wall tech panels with LED indicators
  for (var side = -1; side <= 1; side += 2) {
    for (var i = 0; i < 4; i++) {
      var panel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 1.2), new THREE.MeshStandardMaterial({color:0x0a0e14, metalness:0.5, roughness:0.5}));
      panel.position.set(side * 3.7, 1 + i * 0.9, -2 + i * 0.5); scene.add(panel);
      // LED bar
      var bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.5 + Math.random()*0.4), new THREE.MeshBasicMaterial({color: i<2 ? 0x00ccff : 0x00ff88}));
      bar.position.set(side * 3.66, 1.1 + i * 0.9, -2 + i * 0.5); scene.add(bar);
      // LED dot
      var dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({color: i%3===0 ? 0xff3333 : 0x00ccff}));
      dot.position.set(side * 3.64, 0.75 + i * 0.9, -1.6 + i * 0.5); scene.add(dot);
    }
    // Vertical LED strip on wall edge
    scene.add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 3.5, 0.04), ledMat).translateX(side * 3.78).translateY(1.8).translateZ(-2));
  }

  // --- FLOOR ---
  var floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 10), new THREE.MeshStandardMaterial({color:0x0a0e16, metalness:0.4, roughness:0.7}));
  floor.position.set(0, -0.6, 0); scene.add(floor);
  // Floor LED strip (center)
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 5), new THREE.MeshBasicMaterial({color:0x005588})).translateY(-0.48).translateZ(0));

  // --- CONSOLE ---
  var consoleMat = new THREE.MeshStandardMaterial({color:0x141a24, metalness:0.6, roughness:0.4});
  var con = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.9, 1.8), consoleMat);
  con.position.set(0, 0.1, -3); con.rotation.x = -0.2; scene.add(con);
  // Console LED edge
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.03, 0.04), ledMat).translateY(0.58).translateZ(-2.2));

  // MFD screens
  var mfdBg = new THREE.MeshBasicMaterial({color:0x001822});
  for (var i = 0; i < 3; i++) {
    var mfd = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.7), mfdBg);
    mfd.position.set(-1.6 + i * 1.6, 0.6, -2.8); mfd.rotation.x = -0.2; scene.add(mfd);
    var border = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), new THREE.MeshBasicMaterial({color:0x004466, wireframe:true}));
    border.position.copy(mfd.position); border.position.z += 0.01; border.rotation.x = -0.2; scene.add(border);
    // Screen glow text simulation (small bars)
    for (var j = 0; j < 3; j++) {
      var bar = new THREE.Mesh(new THREE.BoxGeometry(0.4+Math.random()*0.5, 0.03, 0.01), new THREE.MeshBasicMaterial({color:0x00aacc}));
      bar.position.set(-1.6 + i*1.6 - 0.3, 0.7 - j*0.12, -2.78); bar.rotation.x = -0.2; scene.add(bar);
    }
  }

  // --- CHARACTERS (Wall-E inspired: big round heads, smooth bodies) ---
  buildWalleCharacter(scene, -0.9, -0.6, 1.5, true);  // Male (left seat)
  buildWalleCharacter(scene, 0.9, -0.6, 1.5, false);   // Female (right seat)
}

// === WALL-E STYLE CHARACTER ===
function buildWalleCharacter(scene, x, y, z, isMale) {
  var g = new THREE.Group();
  g.position.set(x, y, z);

  // Seat (futuristic bucket seat)
  var seatMat = new THREE.MeshStandardMaterial({color:0x1a1e2a, metalness:0.4, roughness:0.6});
  var back = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.1, 0.18, 4, 4), seatMat);
  back.position.set(0, 0.85, -0.1);
  var backCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.65, 16, 1, false, 0, Math.PI), seatMat);
  backCurve.rotation.z = Math.PI/2; backCurve.rotation.y = Math.PI/2;
  backCurve.position.set(0, 1.4, -0.1);
  g.add(back); g.add(backCurve);
  var base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.55), seatMat);
  base.position.set(0, 0.3, 0.1); g.add(base);

  // Body (rounded, plump torso - Wall-E proportions)
  var bodyColor = isMale ? 0x2a3a55 : 0x4a2850;
  var bodyMat = new THREE.MeshStandardMaterial({color:bodyColor, metalness:0.05, roughness:0.85});
  var torso = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), bodyMat);
  torso.scale.set(1, 1.2, 0.85); torso.position.set(0, 0.8, 0.15); g.add(torso);

  // Head (BIG round - key Wall-E proportion)
  var skinColor = isMale ? 0xe8c9a0 : 0xf0d4b0;
  var skinMat = new THREE.MeshStandardMaterial({color:skinColor, metalness:0, roughness:0.82});
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), skinMat);
  head.scale.set(1, 1.05, 0.95); head.position.set(0, 1.4, 0.18); g.add(head);

  // Eyes (big, round, expressive)
  var eyeWhite = new THREE.MeshBasicMaterial({color:0xffffff});
  var eyePupil = new THREE.MeshBasicMaterial({color:isMale ? 0x2a1a0a : 0x1a1a2a});
  for (var side = -1; side <= 1; side += 2) {
    var ew = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), eyeWhite);
    ew.position.set(side * 0.08, 1.44, 0.34); g.add(ew);
    var ep = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), eyePupil);
    ep.position.set(side * 0.08, 1.44, 0.38); g.add(ep);
  }

  // Hair
  var hairColor = isMale ? 0x1a1a2a : 0x2a1520;
  var hairMat = new THREE.MeshStandardMaterial({color:hairColor, metalness:0.05, roughness:0.9});
  if (isMale) {
    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), hairMat);
    hair.scale.set(1, 0.5, 1); hair.position.set(0, 1.55, 0.15); g.add(hair);
  } else {
    var hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), hairMat);
    hair.scale.set(1.05, 0.65, 1.05); hair.position.set(0, 1.55, 0.14); g.add(hair);
    // Side hair strands (CylinderGeometry replaces CapsuleGeometry for r128 compat)
    var strandMat = new THREE.MeshStandardMaterial({color:hairColor, metalness:0, roughness:0.9});
    var ls = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), strandMat);
    ls.position.set(-0.2, 1.25, 0.15); g.add(ls);
    var rs = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), strandMat);
    rs.position.set(0.2, 1.25, 0.15); g.add(rs);
  }

  // Arms (CylinderGeometry replaces CapsuleGeometry for r128 compat)
  var armMat = bodyMat;
  var la = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.35, 12), armMat);
  la.position.set(-0.28, 0.55, 0.1); la.rotation.z = 0.4; la.rotation.x = -0.6; g.add(la);
  var ra = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.35, 12), armMat);
  ra.position.set(0.28, 0.55, 0.1); ra.rotation.z = -0.4; ra.rotation.x = -0.6; g.add(ra);

  // Hands (small spheres)
  var lh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), skinMat);
  lh.position.set(-0.4, 0.35, -0.15); g.add(lh);
  var rh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), skinMat);
  rh.position.set(0.4, 0.35, -0.15); g.add(rh);

  // Legs (CylinderGeometry replaces CapsuleGeometry for r128 compat)
  var legMat = new THREE.MeshStandardMaterial({color:isMale ? 0x222840 : 0x382040, metalness:0.05, roughness:0.85});
  var ll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8), legMat);
  ll.position.set(-0.12, 0.05, 0.2); g.add(ll);
  var rl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8), legMat);
  rl.position.set(0.12, 0.05, 0.2); g.add(rl);

  // Shoes (small rounded)
  var shoeMat = new THREE.MeshStandardMaterial({color:0x111111, metalness:0.3, roughness:0.6});
  var lShoe = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), shoeMat);
  lShoe.scale.set(1, 0.7, 1.3); lShoe.position.set(-0.12, -0.15, 0.25); g.add(lShoe);
  var rShoe = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), shoeMat);
  rShoe.scale.set(1, 0.7, 1.3); rShoe.position.set(0.12, -0.15, 0.25); g.add(rShoe);

  scene.add(g);
  return g;
}

// === HELPER TEXTURES ===
function createSoftCircle() {
  var c = document.createElement('canvas'); c.width = 128; c.height = 128;
  var ctx = c.getContext('2d');
  var g = ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.15, 'rgba(200,230,255,0.7)');
  g.addColorStop(0.4, 'rgba(100,160,255,0.25)');
  g.addColorStop(0.7, 'rgba(50,80,200,0.05)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
}

function createGlowTex() {
  var c = document.createElement('canvas'); c.width = 256; c.height = 256;
  var ctx = c.getContext('2d');
  var g = ctx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0, 'rgba(255,250,220,1)');
  g.addColorStop(0.15, 'rgba(255,240,160,0.7)');
  g.addColorStop(0.4, 'rgba(255,200,80,0.25)');
  g.addColorStop(0.7, 'rgba(255,150,40,0.05)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
  return new THREE.CanvasTexture(c);
}
