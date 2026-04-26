/* ═══════════════════════════════════════════════════════
   THREE.JS SCENE — Premium Neural Network + Geometry
   ═══════════════════════════════════════════════════════ */

(function() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 500;

  // ─── PARTICLE FIELD ───
  const N = 900;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const velocities = [];

  for (let i = 0; i < N; i++) {
    let x, y, z;
    
    // Reserve first 120 particles for the signature "M" pattern
    if (i < 120) {
      const t = (i / 120) * 4; // 0 to 4 for 4 segments of M
      const offsetX = -450; // Move to the left side
      const offsetY = 50;
      if (t < 1) { // Up
        x = -150; y = -150 + t * 300;
      } else if (t < 2) { // Down to middle
        x = -150 + (t - 1) * 150; y = 150 - (t - 1) * 150;
      } else if (t < 3) { // Up to right
        x = 0 + (t - 2) * 150; y = 0 + (t - 2) * 150;
      } else { // Down
        x = 150; y = 150 - (t - 3) * 300;
      }
      x += offsetX;
      y += offsetY;
      z = -250; // Push further back
      // Add jitter for "starry" look
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.5) * 60;
    } else {
      x = (Math.random() - 0.5) * 1400;
      y = (Math.random() - 0.5) * 1000;
      z = (Math.random() - 0.5) * 800;
    }

    positions[i*3]   = x;
    positions[i*3+1] = y;
    positions[i*3+2] = z;
    
    sizes[i] = Math.random() * 2.5 + 0.5;
    velocities.push({
      x: (Math.random() - 0.5) * 0.12,
      y: (Math.random() - 0.5) * 0.10,
      z: (Math.random() - 0.5) * 0.08
    });
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size;
      uniform float time;
      void main() {
        vec3 pos = position;
        pos.y += sin(pos.x * 0.005 + time * 0.4) * 8.0;
        pos.x += cos(pos.y * 0.005 + time * 0.3) * 6.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (400.0 / -gl_Position.z);
      }
    `,
    fragmentShader: `
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if(d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.3, 0.5, d);
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.65);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geo, particleMat);
  scene.add(particles);

  // ─── CONNECTION LINES ───
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.08,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });

  let linesMesh = null;
  const CONNECT_DIST = 100;

  function buildLines() {
    if (linesMesh) { scene.remove(linesMesh); linesMesh.geometry.dispose(); }
    const lp = [];
    const pos = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pos[i*3]   - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dz = pos[i*3+2] - pos[j*3+2];
        const d  = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d < CONNECT_DIST) {
          lp.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
          lp.push(pos[j*3], pos[j*3+1], pos[j*3+2]);
        }
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3));
    linesMesh = new THREE.LineSegments(lg, lineMat);
    scene.add(linesMesh);
  }

  // ─── FLOATING WIREFRAME POLYHEDRA ───
  function makePolyhedron(geo3d, size, x, y, z, color = 0xffffff) {
    const edges = new THREE.EdgesGeometry(geo3d);
    const mat = new THREE.LineBasicMaterial({
      color: color, transparent: true, opacity: 0.25,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const mesh = new THREE.LineSegments(edges, mat);
    mesh.scale.setScalar(size);
    mesh.position.set(x, y, z);
    mesh.userData = {
      rotX: (Math.random() - 0.5) * 0.008,
      rotY: (Math.random() - 0.5) * 0.012,
      rotZ: (Math.random() - 0.5) * 0.006,
      floatY: y,
      floatSpeed: Math.random() * 0.4 + 0.2,
      floatAmp: Math.random() * 20 + 10,
    };
    return mesh;
  }

  const polyhedra = [];
  const shapes = [
    new THREE.TorusGeometry(1, 0.3, 16, 32), // Wellness / ZenLife
    new THREE.DodecahedronGeometry(1),      // Tech / AI
    new THREE.OctahedronGeometry(1),        // Law / Structure
    new THREE.IcosahedronGeometry(1),       // Connectivity / Mobile
    new THREE.TorusKnotGeometry(1, 0.3, 64, 8), // Complexity / Data
  ];
  const configs = [
    { size: 50, x: -400, y: 150,  z: -100, color: 0x4ade80 }, // ZenLife Green
    { size: 45, x:  380, y: -100, z: -80,  color: 0x60a5fa }, // Tech Blue
    { size: 70, x:  450, y: 220,  z: -180, color: 0xd4af6a }, // Law Gold
    { size: 35, x: -320, y: -180, z: -50,  color: 0xf87171 }, // Mobile Red
    { size: 60, x:  150, y: 280,  z: -250, color: 0xffffff }, // General White
  ];
  configs.forEach((cfg, i) => {
    const poly = makePolyhedron(shapes[i % shapes.length], cfg.size, cfg.x, cfg.y, cfg.z, cfg.color);
    scene.add(poly);
    polyhedra.push(poly);
  });

  // ─── GRID PLANE ───
  const gridHelper = new THREE.GridHelper(1200, 30, 0x111111, 0x111111);
  gridHelper.position.y = -280;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.05;
  scene.add(gridHelper);

  // ─── LARGE WIREFRAME SPHERE ───
  const sphereGeo = new THREE.SphereGeometry(280, 24, 16);
  const sphereEdges = new THREE.EdgesGeometry(sphereGeo);
  const sphereMat = new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const sphere = new THREE.LineSegments(sphereEdges, sphereMat);
  scene.add(sphere);

  // ─── MOUSE TRACKING ───
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  document.addEventListener('mousemove', e => {
    targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 60;
    targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 40;
  });

  // ─── ANIMATE ───
  let frameCount = 0;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    frameCount++;

    particleMat.uniforms.time.value = elapsed;

    // Update particle positions
    const pos = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      if (i < 120) {
        // Signature particles: Very subtle oscillation
        pos[i*3]   += Math.sin(elapsed * 0.3 + i) * 0.05;
        pos[i*3+1] += Math.cos(elapsed * 0.3 + i) * 0.05;
      } else {
        // Background particles: Linear drift
        pos[i*3]   += velocities[i].x;
        pos[i*3+1] += velocities[i].y;
        pos[i*3+2] += velocities[i].z;
        if (pos[i*3]   >  700) pos[i*3]   = -700;
        if (pos[i*3]   < -700) pos[i*3]   =  700;
        if (pos[i*3+1] >  500) pos[i*3+1] = -500;
        if (pos[i*3+1] < -500) pos[i*3+1] =  500;
        if (pos[i*3+2] >  400) pos[i*3+2] = -400;
        if (pos[i*3+2] < -400) pos[i*3+2] =  400;
      }
    }
    geo.attributes.position.needsUpdate = true;

    if (frameCount % 6 === 0) buildLines();

    // Polyhedra animation
    polyhedra.forEach(p => {
      p.rotation.x += p.userData.rotX;
      p.rotation.y += p.userData.rotY;
      p.rotation.z += p.userData.rotZ;
      p.position.y = p.userData.floatY + Math.sin(elapsed * p.userData.floatSpeed) * p.userData.floatAmp;
    });

    // Large sphere rotation
    sphere.rotation.y += 0.0008;
    sphere.rotation.x += 0.0003;

    // Grid subtle wave
    gridHelper.position.y = -280 + Math.sin(elapsed * 0.3) * 5;

    // Particles group rotation
    particles.rotation.y = elapsed * 0.0006;

    // Camera follow mouse
    mouseX += (targetMouseX - mouseX) * 0.03;
    mouseY += (targetMouseY - mouseY) * 0.03;
    camera.position.x = mouseX;
    camera.position.y = mouseY;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
