import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbState } from '../types';

export type OrbTheme = 'gold' | 'neon' | 'red';

interface ThreeOrbProps {
  state: OrbState;
  onActivateVoice?: () => void;
  audioLevel?: number; // 0 to 1
  theme?: OrbTheme;
  className?: string;
  onThemeChange?: (theme: OrbTheme) => void;
}

export const ThreeOrb: React.FC<ThreeOrbProps> = ({
  state,
  onActivateVoice,
  audioLevel = 0,
  theme = 'gold',
  className = '',
  onThemeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);
  const themeRef = useRef<OrbTheme>(theme);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Interactive mouse rotation with damping
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Dynamic color helper based on theme
    const getThemeColors = (t: OrbTheme) => {
      if (t === 'gold') {
        return {
          core: new THREE.Color(0xfffbeb),
          inner: new THREE.Color(0xf59e0b),
          outer: new THREE.Color(0xd97706),
          accent: new THREE.Color(0xfef08a),
          lightA: 0xf59e0b,
          lightB: 0xfbbf24,
        };
      } else if (t === 'red') {
        return {
          core: new THREE.Color(0xfff1f2),
          inner: new THREE.Color(0xef4444),
          outer: new THREE.Color(0xb91c1c),
          accent: new THREE.Color(0xfca5a5),
          lightA: 0xef4444,
          lightB: 0xdc2626,
        };
      } else {
        return {
          core: new THREE.Color(0xf0fdf4),
          inner: new THREE.Color(0x06b6d4),
          outer: new THREE.Color(0x8b5cf6),
          accent: new THREE.Color(0x38bdf8),
          lightA: 0x06b6d4,
          lightB: 0xa855f7,
        };
      }
    };

    let themeColors = getThemeColors(themeRef.current);

    // --- 1. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x101528, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(themeColors.lightA, 4.5, 8);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(themeColors.lightB, 4.0, 8);
    pointLight2.position.set(-2, -1, 2);
    scene.add(pointLight2);

    const coreLight = new THREE.PointLight(0xffffff, 5.0, 5);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // --- 2. HOLOGRAPHIC NEURAL MATRIX GLOBE (AS IN MOVIE PICTURE) ---
    const globeGroup = new THREE.Group();
    rootGroup.add(globeGroup);

    // A. CENTRAL BLAZING ENERGY NUCLEUS
    const coreMeshGroup = new THREE.Group();
    globeGroup.add(coreMeshGroup);

    // Ultra-bright glowing white/amber center point
    const coreGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    coreMeshGroup.add(coreSphere);

    // Middle plasma halo
    const haloGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: themeColors.inner,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const haloSphere = new THREE.Mesh(haloGeo, haloMat);
    coreMeshGroup.add(haloSphere);

    // Inner wireframe energy web around core
    const innerWebGeo = new THREE.IcosahedronGeometry(0.55, 2);
    const innerWebMat = new THREE.MeshBasicMaterial({
      color: themeColors.accent,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const innerWeb = new THREE.Mesh(innerWebGeo, innerWebMat);
    globeGroup.add(innerWeb);

    // B. DENSE PARTICULATE NEURAL CLOUD (THOUSANDS OF HOLOGRAPHIC DATA NODES)
    const particleCount = isSoftwareGl ? 850 : 2400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleBaseRadius = new Float32Array(particleCount);
    const particleTheta = new Float32Array(particleCount);
    const particlePhi = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Stratified spherical shells for layered holographic depth
      const shellLayer = Math.random();
      let r = 0.5 + shellLayer * 0.95; // shells from 0.5 to 1.45
      if (Math.random() < 0.25) r = 1.45 + Math.random() * 0.25; // outer sparks

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particleBaseRadius[i] = r;
      particleTheta[i] = theta;
      particlePhi[i] = phi;
      particleSpeeds[i] = (Math.random() - 0.5) * 0.8;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePos[i * 3] = x;
      particlePos[i * 3 + 1] = y;
      particlePos[i * 3 + 2] = z;

      // Color variation between golden yellow and electric amber/white
      const mixRatio = Math.random();
      const col = mixRatio > 0.7 ? themeColors.core : mixRatio > 0.3 ? themeColors.inner : themeColors.outer;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom procedural circular dot texture for crisp glowing points
    const createSparkTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 220, 120, 0.8)');
        grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(c);
    };

    const sparkTexture = createSparkTexture();

    const particleMat = new THREE.PointsMaterial({
      size: 0.052,
      map: sparkTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleCloud);

    // C. CONCENTRIC SEGMENTED HOLOGRAPHIC CIRCUIT RINGS (GYROSCOPIC GIMBAL)
    // Create circuit ring texture with dashes and ticks
    const createCircuitRingTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 1024, 64);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;

        // Draw segmented dashed telemetry lines and tick marks
        for (let i = 0; i < 1024; i += 16) {
          if (i % 64 === 0) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(i, 16, 6, 32);
          } else if (i % 32 === 0) {
            ctx.fillStyle = 'rgba(255, 220, 100, 0.8)';
            ctx.fillRect(i, 24, 3, 16);
          } else {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
            ctx.fillRect(i, 28, 2, 8);
          }
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(4, 1);
      return tex;
    };

    const ringTex = createCircuitRingTexture();

    // C. INDEPENDENT MULTI-AXIS ORBITAL RINGS TIED TO AUDIO LEVEL
    interface OrbitalRingConfig {
      id: string;
      group: THREE.Group;
      mesh: THREE.Mesh;
      material: THREE.MeshBasicMaterial;
      geometry: THREE.BufferGeometry;
      baseSpeed: number;
      audioSensitivity: number;
      axis: 'x' | 'y' | 'z';
      precessionSpeed?: number;
      precessionAxis?: 'x' | 'y' | 'z';
      baseOpacity: number;
      themeRole: 'inner' | 'accent' | 'outer';
    }

    const orbitalRings: OrbitalRingConfig[] = [];

    // Helper to register an independent ring
    const addOrbitalRing = (cfg: {
      id: string;
      geometry: THREE.BufferGeometry;
      color: THREE.Color;
      opacity: number;
      tilt: { x: number; y: number; z: number };
      baseSpeed: number;
      audioSensitivity: number;
      axis: 'x' | 'y' | 'z';
      precessionSpeed?: number;
      precessionAxis?: 'x' | 'y' | 'z';
      themeRole: 'inner' | 'accent' | 'outer';
      map?: THREE.Texture;
    }) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.set(cfg.tilt.x, cfg.tilt.y, cfg.tilt.z);
      globeGroup.add(ringGroup);

      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        map: cfg.map,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: cfg.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(cfg.geometry, mat);
      ringGroup.add(mesh);

      orbitalRings.push({
        id: cfg.id,
        group: ringGroup,
        mesh,
        material: mat,
        geometry: cfg.geometry,
        baseSpeed: cfg.baseSpeed,
        audioSensitivity: cfg.audioSensitivity,
        axis: cfg.axis,
        precessionSpeed: cfg.precessionSpeed,
        precessionAxis: cfg.precessionAxis,
        baseOpacity: cfg.opacity,
        themeRole: cfg.themeRole,
      });

      return ringGroup;
    };

    // 1. Primary Equatorial HUD Circuit Ring (Z-axis rotation, slight equatorial tilt)
    addOrbitalRing({
      id: 'ring-equatorial',
      geometry: new THREE.RingGeometry(1.48, 1.58, 80),
      color: themeColors.inner,
      opacity: 0.85,
      tilt: { x: Math.PI / 2.05, y: 0.05, z: 0 },
      baseSpeed: 0.42,
      audioSensitivity: 5.5,
      axis: 'z',
      precessionSpeed: 0.08,
      precessionAxis: 'y',
      themeRole: 'inner',
      map: ringTex,
    });

    // 2. Polar Orbital Ring (Y-axis rotation, nearly vertical)
    addOrbitalRing({
      id: 'ring-polar',
      geometry: new THREE.RingGeometry(1.62, 1.69, 72),
      color: themeColors.accent,
      opacity: 0.75,
      tilt: { x: 0.15, y: Math.PI / 2.2, z: 0.2 },
      baseSpeed: -0.58,
      audioSensitivity: 6.2,
      axis: 'y',
      precessionSpeed: -0.12,
      precessionAxis: 'x',
      themeRole: 'accent',
      map: ringTex,
    });

    // 3. Inclined Gyroscopic Matrix Ring (45 degree inclination, fast Z spin)
    addOrbitalRing({
      id: 'ring-gyro-45',
      geometry: new THREE.RingGeometry(1.34, 1.42, 64),
      color: themeColors.accent,
      opacity: 0.7,
      tilt: { x: Math.PI / 3.4, y: Math.PI / 5, z: -0.2 },
      baseSpeed: 0.75,
      audioSensitivity: 7.2,
      axis: 'z',
      precessionSpeed: 0.15,
      precessionAxis: 'y',
      themeRole: 'accent',
      map: ringTex,
    });

    // 4. Counter-Tilted Outer Telemetry Ring (Negative tilt, reverse Z spin)
    addOrbitalRing({
      id: 'ring-outer-counter',
      geometry: new THREE.RingGeometry(1.72, 1.80, 72),
      color: themeColors.outer,
      opacity: 0.65,
      tilt: { x: -Math.PI / 3.5, y: 0.25, z: Math.PI / 3.8 },
      baseSpeed: -0.68,
      audioSensitivity: 6.8,
      axis: 'z',
      precessionSpeed: -0.1,
      precessionAxis: 'x',
      themeRole: 'outer',
      map: ringTex,
    });

    // 5. Inner Fast Core Gimbal Ring (Tight radius right above nucleus, X-axis rotation)
    addOrbitalRing({
      id: 'ring-inner-gimbal',
      geometry: new THREE.RingGeometry(1.08, 1.15, 56),
      color: themeColors.inner,
      opacity: 0.8,
      tilt: { x: Math.PI / 4.2, y: -Math.PI / 3.2, z: 0.35 },
      baseSpeed: 0.95,
      audioSensitivity: 8.5, // hyper-responsive to voice audio
      axis: 'x',
      themeRole: 'inner',
      map: ringTex,
    });

    // 6. Far Outer Boundary Coordinate Ring (Wide radius 1.95, Y-axis rotation)
    const outerRingGroup = addOrbitalRing({
      id: 'ring-outer-boundary',
      geometry: new THREE.TorusGeometry(1.95, 0.012, 16, 120),
      color: themeColors.outer,
      opacity: 0.5,
      tilt: { x: Math.PI / 1.9, y: -0.2, z: 0.15 },
      baseSpeed: -0.32,
      audioSensitivity: 4.2,
      axis: 'y',
      precessionSpeed: 0.05,
      precessionAxis: 'z',
      themeRole: 'outer',
    });

    // Add 4 glowing satellite telemetry markers along the perimeter of the outer ring
    const markerGeo = new THREE.BoxGeometry(0.04, 0.04, 0.08);
    const markerMat = new THREE.MeshBasicMaterial({
      color: themeColors.accent,
      transparent: true,
      opacity: 0.9,
    });
    for (let m = 0; m < 4; m++) {
      const angle = (m * Math.PI) / 2;
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(Math.cos(angle) * 1.95, Math.sin(angle) * 1.95, 0);
      outerRingGroup.add(marker);
    }

    // 7. Ascending Diagonal Data Stream Ring (Compound 3D axis tilt, X-axis spin)
    addOrbitalRing({
      id: 'ring-diagonal-stream',
      geometry: new THREE.RingGeometry(1.52, 1.57, 64),
      color: themeColors.accent,
      opacity: 0.6,
      tilt: { x: -Math.PI / 2.6, y: -Math.PI / 4, z: Math.PI / 6 },
      baseSpeed: 0.62,
      audioSensitivity: 5.8,
      axis: 'x',
      precessionSpeed: 0.09,
      precessionAxis: 'z',
      themeRole: 'accent',
      map: ringTex,
    });

    // D. SPHERICAL WIREFRAME LATITUDE & LONGITUDE NEURAL ARCS
    const latLongGroup = new THREE.Group();
    globeGroup.add(latLongGroup);

    for (let lat = -60; lat <= 60; lat += 30) {
      const rad = 1.35 * Math.cos((lat * Math.PI) / 180);
      const y = 1.35 * Math.sin((lat * Math.PI) / 180);
      const latGeo = new THREE.RingGeometry(rad - 0.008, rad + 0.008, 48);
      const latMat = new THREE.MeshBasicMaterial({
        color: themeColors.inner,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const latMesh = new THREE.Mesh(latGeo, latMat);
      latMesh.rotation.x = Math.PI / 2;
      latMesh.position.y = y;
      latLongGroup.add(latMesh);
    }

    // Great circle arcs (longitudinal)
    for (let rot = 0; rot < Math.PI; rot += Math.PI / 4) {
      const arcGeo = new THREE.TorusGeometry(1.35, 0.006, 16, 64);
      const arcMat = new THREE.MeshBasicMaterial({
        color: themeColors.accent,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      const arcMesh = new THREE.Mesh(arcGeo, arcMat);
      arcMesh.rotation.y = rot;
      latLongGroup.add(arcMesh);
    }

    // E. SWIRLING ENERGY VORTEX FILAMENTS
    const curvePointsCount = 180;
    const spiralGeo = new THREE.BufferGeometry();
    const spiralPos = new Float32Array(curvePointsCount * 3);
    for (let i = 0; i < curvePointsCount; i++) {
      const t = i / curvePointsCount;
      const angle = t * Math.PI * 8;
      const r = 0.25 + t * 1.1;
      const y = (t - 0.5) * 1.4;
      spiralPos[i * 3] = Math.cos(angle) * r;
      spiralPos[i * 3 + 1] = y;
      spiralPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    spiralGeo.setAttribute('position', new THREE.BufferAttribute(spiralPos, 3));
    const spiralMat = new THREE.LineBasicMaterial({
      color: themeColors.accent,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const spiralLine = new THREE.Line(spiralGeo, spiralMat);
    globeGroup.add(spiralLine);

    // --- ANIMATION LOOP ---
    let frameId: number;
    const clock = new THREE.Clock();
    let smoothedAudio = 0;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;
      const currentTheme = themeRef.current;

      // Smooth exponential tracking for audio level to provide organic fluid acceleration & deceleration
      smoothedAudio += (currentAudio - smoothedAudio) * 0.16;

      // Dynamic theme color update if changed
      const desiredColors = getThemeColors(currentTheme);
      if (!themeColors.inner.equals(desiredColors.inner)) {
        themeColors = desiredColors;
        pointLight1.color.set(themeColors.lightA);
        pointLight2.color.set(themeColors.lightB);
        haloMat.color.set(themeColors.inner);
        innerWebMat.color.set(themeColors.accent);
        markerMat.color.set(themeColors.accent);
        spiralMat.color.set(themeColors.accent);
        orbitalRings.forEach((r) => {
          r.material.color.set(desiredColors[r.themeRole]);
        });
      }

      // Voice and state reactivity
      let speedMult = 1.0;
      let pulseMult = 1.0;

      if (currentState === 'listening') {
        speedMult = 1.8;
        pulseMult = 1.15 + Math.sin(time * 8) * 0.15 + smoothedAudio * 0.45;
      } else if (currentState === 'thinking') {
        speedMult = 3.2;
        pulseMult = 1.1 + Math.sin(time * 16) * 0.12;
      } else if (currentState === 'speaking') {
        speedMult = 2.2;
        pulseMult = 1.12 + Math.sin(time * 10) * 0.2 + smoothedAudio * 0.25;
      } else if (currentState === 'executing') {
        speedMult = 2.6;
        pulseMult = 1.2 + Math.sin(time * 12) * 0.15;
      }

      // Smooth mouse rotation damping
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      rootGroup.rotation.x = currentRotationX;
      rootGroup.rotation.y = currentRotationY;

      // Base autonomous gyroscopic rotations for globe core
      globeGroup.rotation.y += delta * 0.2 * speedMult;
      innerWeb.rotation.y -= delta * 0.35 * speedMult;
      innerWeb.rotation.x += delta * 0.25 * speedMult;

      // DYNAMIC MULTI-AXIAL ROTATION TIED TO AUDIO LEVEL
      orbitalRings.forEach((ring) => {
        // Instantaneous rotational velocity dynamically scales with audioLevel
        const audioVelocityBoost = 1.0 + smoothedAudio * ring.audioSensitivity;
        const deltaRot = ring.baseSpeed * audioVelocityBoost * delta * speedMult;
        
        // Rotate on the ring's designated independent axis (x, y, or z)
        ring.mesh.rotation[ring.axis] += deltaRot;

        // Secondary precession rotation on an alternate axis
        if (ring.precessionAxis && ring.precessionSpeed) {
          const precessionBoost = 1.0 + smoothedAudio * 3.5;
          ring.group.rotation[ring.precessionAxis] += ring.precessionSpeed * precessionBoost * delta * speedMult;
        }

        // Responsive visual feedback: ring brightness & opacity expand with audio energy
        ring.material.opacity = Math.min(1.0, ring.baseOpacity + smoothedAudio * 0.35);
      });

      latLongGroup.rotation.y += delta * 0.15 * speedMult;
      spiralLine.rotation.y += delta * 1.2 * speedMult;

      // Breathing Core Scale & Glow
      const coreScale = pulseMult;
      coreSphere.scale.set(coreScale, coreScale, coreScale);
      haloSphere.scale.set(coreScale * 1.1, coreScale * 1.1, coreScale * 1.1);
      coreLight.intensity = (4.5 + Math.sin(time * 4) * 1.5) * pulseMult + smoothedAudio * 3.5;
      pointLight1.intensity = 4.0 * pulseMult + smoothedAudio * 2.0;
      pointLight2.intensity = 3.5 * pulseMult + smoothedAudio * 2.0;

      // Neural particle swirling motion
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const pos = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        particleTheta[i] += delta * particleSpeeds[i] * 0.9 * speedMult;
        const rad = particleBaseRadius[i] * (1.0 + (pulseMult - 1) * 0.15);
        const phi = particlePhi[i];
        const theta = particleTheta[i];

        pos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = rad * Math.cos(phi);
      }
      posAttr.needsUpdate = true;

      // Floating levitation
      globeGroup.position.y = Math.sin(time * 1.8) * 0.05;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
      sparkTexture.dispose();
      ringTex.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      innerWebGeo.dispose();
      innerWebMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      orbitalRings.forEach((r) => {
        r.geometry.dispose();
        r.material.dispose();
      });
      markerGeo.dispose();
      markerMat.dispose();
      spiralGeo.dispose();
      spiralMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className={`relative select-none group w-full h-full flex flex-col justify-between ${className}`}
    >
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        onClick={onActivateVoice}
        className="w-full h-full cursor-grab active:cursor-grabbing relative"
        title="Click and drag to rotate 3D holographic neural globe • Click to toggle voice"
      />

      {/* Floating State Badge & Theme Switcher */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* State Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-amber-500/40 text-[11px] font-mono text-amber-200 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <span
            className={`w-2 h-2 rounded-full ${
              theme === 'gold'
                ? 'bg-amber-400'
                : theme === 'red'
                ? 'bg-rose-500'
                : 'bg-cyan-400'
            } ${state !== 'idle' ? 'animate-ping' : ''}`}
          />
          <span className="uppercase tracking-widest font-bold">
            {state === 'idle' ? 'NEURAL MATRIX ONLINE' : state}
          </span>
        </div>

        {/* Hologram Theme Switcher */}
        {onThemeChange && (
          <div className="flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-indigo-900/60 pointer-events-auto backdrop-blur-md">
            <button
              onClick={() => onThemeChange('gold')}
              title="Stark / JARVIS Golden Amber Neural Matrix (Movie Reference)"
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                theme === 'gold'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/80 shadow-[0_0_8px_#f59e0b]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gold
            </button>
            <button
              onClick={() => onThemeChange('neon')}
              title="Cyber Neon Cyan / Purple"
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                theme === 'neon'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/80 shadow-[0_0_8px_#06b6d4]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cyan
            </button>
            <button
              onClick={() => onThemeChange('red')}
              title="Ultron Crimson Combat Protocol"
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                theme === 'red'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400/80 shadow-[0_0_8px_#ef4444]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Red
            </button>
          </div>
        )}
      </div>

      {/* Floating Instructions Footer */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <span className="text-[10px] font-mono tracking-wider text-amber-300/80 bg-black/60 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-sm">
          [DRAG TO ROTATE 3D MATRIX • CLICK TO ENGAGE VOICE]
        </span>
      </div>
    </div>
  );
};
