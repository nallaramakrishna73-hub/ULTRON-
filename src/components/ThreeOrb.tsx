import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbState } from '../types';
import {
  Rotate3D,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

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

  // Interactive 3D Camera & Layer Explode State
  const [zoomLevel, setZoomLevel] = useState<number>(4.2);
  const [explodedView, setExplodedView] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotCoords, setRotCoords] = useState<{ x: number; y: number }>({ x: 12, y: -24 });

  const zoomRef = useRef(4.2);
  const explodeAmountRef = useRef(0);
  const autoRotateRef = useRef(true);

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
    zoomRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    explodeAmountRef.current = explodedView ? 1.0 : 0.0;
  }, [explodedView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth || container.offsetWidth || 380, 240);
    const height = Math.max(container.clientHeight || container.offsetHeight || 380, 240);

    const scene = new THREE.Scene();

    // 3D Perspective Camera positioned for deep volumetric perspective
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 0.15, zoomRef.current);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Root Group for interactive 3D rotation & floating motion
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Mouse drag interaction variables
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.18;
    let targetRotationY = -0.35;
    let currentRotationX = 0.18;
    let currentRotationY = -0.35;
    let currentExplodeAmount = 0;

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
      targetRotationX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationX));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newZoom = Math.max(2.2, Math.min(6.2, zoomRef.current + e.deltaY * 0.004));
      zoomRef.current = newZoom;
      setZoomLevel(Number(newZoom.toFixed(1)));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Dynamic color palettes for themes
    const getThemeColors = (t: OrbTheme) => {
      if (t === 'gold') {
        return {
          core: 0xffffff,
          primary: 0xf59e0b,      // Amber Gold
          secondary: 0xd97706,    // Deep Gold
          accent: 0xfef08a,       // Bright Yellow-Gold
          glow: 0xfbbf24,
          pedestal: 0xd97706,
          synapse: 0xfbbf24,
        };
      } else if (t === 'red') {
        return {
          core: 0xfff1f2,
          primary: 0xef4444,      // Crimson Red
          secondary: 0xb91c1c,    // Dark Blood Red
          accent: 0xfca5a5,       // Pinkish Red Specular
          glow: 0xdc2626,
          pedestal: 0xef4444,
          synapse: 0xf87171,
        };
      } else {
        return {
          core: 0xf0fdf4,
          primary: 0x06b6d4,      // Cyan
          secondary: 0x8b5cf6,    // Neon Purple
          accent: 0x38bdf8,       // Electric Sky
          glow: 0xa855f7,
          pedestal: 0x06b6d4,
          synapse: 0x22d3ee,
        };
      }
    };

    let colors = getThemeColors(themeRef.current);

    // =========================================================================
    // --- REAL 3D MULTI-POINT PBR LIGHTING RIG ---
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a1020, 2.2);
    scene.add(ambientLight);

    // Orbiting 3D Specular Key Light (reveals specular highlights across facets)
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(3.5, 4.5, 5);
    scene.add(keyLight);

    // Intense Colored Rim Light for 3D Edge Silhouette
    const rimLight = new THREE.PointLight(colors.primary, 8.0, 12);
    rimLight.position.set(-3.5, -2, -2.5);
    scene.add(rimLight);

    // Front Accent Fill Light
    const fillLight = new THREE.PointLight(colors.accent, 5.5, 9);
    fillLight.position.set(2.5, -2.5, 3.5);
    scene.add(fillLight);

    // Central Volumetric Point Light radiating outward from inside the core
    const corePointLight = new THREE.PointLight(colors.core, 10.0, 6);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // =========================================================================
    // --- 1. REAL 3D HOLOGRAPHIC PEDESTAL / BASE PLATFORM ---
    // =========================================================================
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -1.68;
    rootGroup.add(pedestalGroup);

    // 3D Concentric Torus Base Rings with visible bevel & depth
    const baseRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const radius = 0.55 + i * 0.35;
      const tubeRadius = 0.026 - i * 0.003;
      const baseGeo = new THREE.TorusGeometry(radius, tubeRadius, 16, 64);
      const baseMat = new THREE.MeshStandardMaterial({
        color: colors.pedestal,
        emissive: colors.primary,
        emissiveIntensity: 0.85 - i * 0.15,
        metalness: 0.92,
        roughness: 0.16,
        wireframe: i % 2 === 1,
      });
      const ring = new THREE.Mesh(baseGeo, baseMat);
      ring.rotation.x = Math.PI / 2;
      pedestalGroup.add(ring);
      baseRings.push(ring);
    }

    // Upward 3D Projector Light Cone
    const coneGeo = new THREE.CylinderGeometry(1.4, 0.45, 1.7, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.position.y = 0.85;
    pedestalGroup.add(lightCone);

    // =========================================================================
    // --- 2. TRUE 3D HOLOGRAPHIC NEURAL SPHERE ASSEMBLY ---
    // =========================================================================
    const globeGroup = new THREE.Group();
    rootGroup.add(globeGroup);

    // -------------------------------------------------------------------------
    // A. LAYER 1: 3D MECHANICAL FACETED REACTOR NUCLEUS (True 3D PBR Shaded)
    // -------------------------------------------------------------------------
    const layer1Core = new THREE.Group();
    globeGroup.add(layer1Core);

    // Central Faceted Solid 3D Icosahedron (Catches specular glints as it turns)
    const nucleusSolidGeo = new THREE.IcosahedronGeometry(0.24, 0);
    const nucleusSolidMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: colors.accent,
      emissiveIntensity: 2.2,
      metalness: 0.95,
      roughness: 0.1,
      flatShading: true, // Creates distinctly visible 3D triangular facets!
    });
    const nucleusSolidMesh = new THREE.Mesh(nucleusSolidGeo, nucleusSolidMat);
    layer1Core.add(nucleusSolidMesh);

    // Surrounding Solid 3D Dodecahedron Cage
    const dodecaGeo = new THREE.DodecahedronGeometry(0.38, 0);
    const dodecaMat = new THREE.MeshStandardMaterial({
      color: colors.accent,
      emissive: colors.primary,
      emissiveIntensity: 1.5,
      wireframe: true,
      metalness: 0.9,
      roughness: 0.15,
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    layer1Core.add(dodecaMesh);

    // Inner Glowing Plasma Sphere
    const innerPlasmaGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const innerPlasmaMat = new THREE.MeshStandardMaterial({
      color: colors.primary,
      emissive: colors.primary,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerPlasma = new THREE.Mesh(innerPlasmaGeo, innerPlasmaMat);
    layer1Core.add(innerPlasma);

    // Nested 3D Octahedral Gyro Frame
    const octaGeo = new THREE.OctahedronGeometry(0.52, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: colors.accent,
      emissive: colors.secondary,
      emissiveIntensity: 1.3,
      wireframe: true,
      metalness: 0.95,
      roughness: 0.2,
    });
    const octaMesh = new THREE.Mesh(octaGeo, octaMat);
    layer1Core.add(octaMesh);

    // -------------------------------------------------------------------------
    // B. LAYER 2: 3D NEURAL BRAIN SYNAPSE NETWORK (As in Tony Stark's JARVIS)
    // -------------------------------------------------------------------------
    const layer2Neural = new THREE.Group();
    globeGroup.add(layer2Neural);

    // Generate 120 3D Neural Nodes on Spherical Coordinates
    const neuralNodeCount = 120;
    const neuralNodes: {
      position: THREE.Vector3;
      baseRadius: number;
      theta: number;
      phi: number;
      mesh: THREE.Mesh;
      speed: number;
    }[] = [];

    const neuralNodeGeo = new THREE.OctahedronGeometry(0.038, 0);
    const neuralNodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: colors.synapse,
      emissiveIntensity: 2.5,
      metalness: 0.95,
      roughness: 0.1,
      flatShading: true,
    });

    for (let i = 0; i < neuralNodeCount; i++) {
      const r = 0.55 + Math.random() * 0.45; // Nodes sit in 3D volume r=0.55 to 1.0
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      const mesh = new THREE.Mesh(neuralNodeGeo, neuralNodeMat.clone());
      mesh.position.copy(pos);
      layer2Neural.add(mesh);

      neuralNodes.push({
        position: pos,
        baseRadius: r,
        theta,
        phi,
        mesh,
        speed: (Math.random() - 0.5) * 0.8,
      });
    }

    // Connect Neighboring Nodes with Real 3D Synapse Lines
    const maxDistance = 0.42;
    const linePositions: number[] = [];
    const lineIndices: [number, number][] = [];

    for (let i = 0; i < neuralNodeCount; i++) {
      for (let j = i + 1; j < neuralNodeCount; j++) {
        const dist = neuralNodes[i].position.distanceTo(neuralNodes[j].position);
        if (dist < maxDistance) {
          linePositions.push(
            neuralNodes[i].position.x, neuralNodes[i].position.y, neuralNodes[i].position.z,
            neuralNodes[j].position.x, neuralNodes[j].position.y, neuralNodes[j].position.z
          );
          lineIndices.push([i, j]);
        }
      }
    }

    const synapseLineGeo = new THREE.BufferGeometry();
    synapseLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    const synapseLineMat = new THREE.LineBasicMaterial({
      color: colors.synapse,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const synapseLines = new THREE.LineSegments(synapseLineGeo, synapseLineMat);
    layer2Neural.add(synapseLines);

    // -------------------------------------------------------------------------
    // C. LAYER 3: SEGMENTED 3D HOLOGRAPHIC HUD ARCS (STARK INDUSTRIES HUD)
    // -------------------------------------------------------------------------
    const layer3HUD = new THREE.Group();
    globeGroup.add(layer3HUD);

    interface SegmentedArcItem {
      group: THREE.Group;
      mesh: THREE.Mesh;
      material: THREE.MeshStandardMaterial;
      speed: number;
      audioSens: number;
      axis: 'x' | 'y' | 'z';
      satelliteNodes: THREE.Mesh[];
    }

    const hudArcs: SegmentedArcItem[] = [];

    // Helper to create true 3D segmented curved arcs (Torus with arc length < 2PI)
    const createSegmentedArc = (cfg: {
      radius: number;
      tube: number;
      arcLength: number; // in radians, e.g. Math.PI * 0.75
      tiltX: number;
      tiltY: number;
      tiltZ: number;
      speed: number;
      audioSens: number;
      axis: 'x' | 'y' | 'z';
      emissiveColor: number;
      hasEndBeacons?: boolean;
    }) => {
      const arcGroup = new THREE.Group();
      arcGroup.rotation.set(cfg.tiltX, cfg.tiltY, cfg.tiltZ);
      layer3HUD.add(arcGroup);

      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 64, cfg.arcLength);
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.emissiveColor,
        emissive: cfg.emissiveColor,
        emissiveIntensity: 1.2,
        metalness: 0.95,
        roughness: 0.15,
      });

      const mesh = new THREE.Mesh(geo, mat);
      arcGroup.add(mesh);

      // Add 3D glowing beacons at the arc endpoints and midpoints
      const satelliteNodes: THREE.Mesh[] = [];
      if (cfg.hasEndBeacons) {
        const beaconGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: colors.accent,
          emissiveIntensity: 2.5,
          metalness: 0.9,
          roughness: 0.1,
        });

        // Start beacon
        const startBeacon = new THREE.Mesh(beaconGeo, beaconMat);
        startBeacon.position.set(cfg.radius, 0, 0);
        mesh.add(startBeacon);
        satelliteNodes.push(startBeacon);

        // End beacon
        const endBeacon = new THREE.Mesh(beaconGeo, beaconMat);
        endBeacon.position.set(
          Math.cos(cfg.arcLength) * cfg.radius,
          Math.sin(cfg.arcLength) * cfg.radius,
          0
        );
        mesh.add(endBeacon);
        satelliteNodes.push(endBeacon);
      }

      hudArcs.push({
        group: arcGroup,
        mesh,
        material: mat,
        speed: cfg.speed,
        audioSens: cfg.audioSens,
        axis: cfg.axis,
        satelliteNodes,
      });
    };

    // 1. Equator Segmented Arc A (140° arc)
    createSegmentedArc({
      radius: 1.15,
      tube: 0.032,
      arcLength: Math.PI * 0.8,
      tiltX: Math.PI / 2.2,
      tiltY: 0.1,
      tiltZ: 0,
      speed: 0.65,
      audioSens: 5.0,
      axis: 'z',
      emissiveColor: colors.primary,
      hasEndBeacons: true,
    });

    // 2. Equator Segmented Arc B (Opposite side 100° arc)
    createSegmentedArc({
      radius: 1.15,
      tube: 0.032,
      arcLength: Math.PI * 0.6,
      tiltX: Math.PI / 2.2,
      tiltY: 0.1,
      tiltZ: Math.PI,
      speed: 0.65,
      audioSens: 5.0,
      axis: 'z',
      emissiveColor: colors.accent,
      hasEndBeacons: true,
    });

    // 3. Diagonal High-Speed Gyro Arc (180° arc)
    createSegmentedArc({
      radius: 1.38,
      tube: 0.035,
      arcLength: Math.PI,
      tiltX: Math.PI / 3.2,
      tiltY: -0.4,
      tiltZ: Math.PI / 6,
      speed: -0.85,
      audioSens: 6.5,
      axis: 'z',
      emissiveColor: colors.accent,
      hasEndBeacons: true,
    });

    // 4. Polar Orthogonal Arc (120° arc)
    createSegmentedArc({
      radius: 1.48,
      tube: 0.03,
      arcLength: Math.PI * 0.7,
      tiltX: 0,
      tiltY: Math.PI / 3,
      tiltZ: Math.PI / 2,
      speed: 0.72,
      audioSens: 5.5,
      axis: 'y',
      emissiveColor: colors.secondary,
      hasEndBeacons: true,
    });

    // -------------------------------------------------------------------------
    // D. LAYER 4: 3D DIGITAL GLOBE WIREFRAME SHELL & TICK RINGS
    // -------------------------------------------------------------------------
    const layer4Shell = new THREE.Group();
    globeGroup.add(layer4Shell);

    // Parallels (Latitudes) made of 3D Torus tubes
    const latList = [-60, -30, 0, 30, 60];
    latList.forEach((lat) => {
      const rad = 1.32 * Math.cos((lat * Math.PI) / 180);
      const y = 1.32 * Math.sin((lat * Math.PI) / 180);
      const latGeo = new THREE.TorusGeometry(rad, 0.014, 8, 48);
      const latMat = new THREE.MeshStandardMaterial({
        color: colors.primary,
        emissive: colors.primary,
        emissiveIntensity: 0.7,
        metalness: 0.9,
        roughness: 0.18,
      });
      const latMesh = new THREE.Mesh(latGeo, latMat);
      latMesh.rotation.x = Math.PI / 2;
      latMesh.position.y = y;
      layer4Shell.add(latMesh);
    });

    // Meridians (Longitudes) made of 3D Torus tubes
    for (let rot = 0; rot < Math.PI; rot += Math.PI / 4) {
      const merGeo = new THREE.TorusGeometry(1.32, 0.014, 8, 64);
      const merMat = new THREE.MeshStandardMaterial({
        color: colors.accent,
        emissive: colors.accent,
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.18,
      });
      const merMesh = new THREE.Mesh(merGeo, merMat);
      merMesh.rotation.y = rot;
      layer4Shell.add(merMesh);
    }

    // Concentric Equatorial Tick Marks (3D Stark Hologram Compass Scale)
    const tickCount = 36;
    const tickGeo = new THREE.BoxGeometry(0.015, 0.065, 0.015);
    const tickMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: colors.accent,
      emissiveIntensity: 2.0,
      metalness: 0.9,
      roughness: 0.1,
    });
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      const tickMesh = new THREE.Mesh(tickGeo, tickMat);
      const r = 1.38;
      tickMesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      tickMesh.rotation.y = -angle;
      layer4Shell.add(tickMesh);
    }

    // -------------------------------------------------------------------------
    // E. LAYER 5: MASSIVE 3D GIMBAL RINGS WITH ORBITING SATELLITE NODES
    // -------------------------------------------------------------------------
    const layer5Gimbals = new THREE.Group();
    globeGroup.add(layer5Gimbals);

    const fullRings3D: SegmentedArcItem[] = [];

    const createHeavyGimbalRing = (cfg: {
      radius: number;
      tube: number;
      tiltX: number;
      tiltY: number;
      tiltZ: number;
      speed: number;
      audioSens: number;
      axis: 'x' | 'y' | 'z';
      emissiveColor: number;
      wireframe?: boolean;
      nodeCount: number;
    }) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.set(cfg.tiltX, cfg.tiltY, cfg.tiltZ);
      layer5Gimbals.add(ringGroup);

      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 20, 96);
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.emissiveColor,
        emissive: cfg.emissiveColor,
        emissiveIntensity: 0.9,
        metalness: 0.94,
        roughness: 0.16,
        wireframe: Boolean(cfg.wireframe),
      });

      const mesh = new THREE.Mesh(geo, mat);
      ringGroup.add(mesh);

      // Add real 3D Satellite Nodes (Glowing Cubes and Octahedrons) stationed along the ring
      const satelliteNodes: THREE.Mesh[] = [];
      for (let n = 0; n < cfg.nodeCount; n++) {
        const angle = (n / cfg.nodeCount) * Math.PI * 2;
        const nodeGeo = n % 2 === 0 ? new THREE.BoxGeometry(0.075, 0.075, 0.075) : new THREE.OctahedronGeometry(0.075, 0);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: colors.accent,
          emissiveIntensity: 2.2,
          metalness: 0.95,
          roughness: 0.1,
          flatShading: true,
        });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.set(Math.cos(angle) * cfg.radius, Math.sin(angle) * cfg.radius, 0);
        mesh.add(nodeMesh);
        satelliteNodes.push(nodeMesh);
      }

      fullRings3D.push({
        group: ringGroup,
        mesh,
        material: mat,
        speed: cfg.speed,
        audioSens: cfg.audioSens,
        axis: cfg.axis,
        satelliteNodes,
      });
    };

    // 1. Primary Equatorial Heavy Gimbal Ring (Major 3D presence)
    createHeavyGimbalRing({
      radius: 1.65,
      tube: 0.048,
      tiltX: Math.PI / 2.3,
      tiltY: 0.12,
      tiltZ: 0,
      speed: 0.38,
      audioSens: 5.5,
      axis: 'z',
      emissiveColor: colors.primary,
      nodeCount: 8,
    });

    // 2. High-Inclination Outer Planetary Ring
    createHeavyGimbalRing({
      radius: 1.92,
      tube: 0.038,
      tiltX: Math.PI / 3.4,
      tiltY: -0.35,
      tiltZ: Math.PI / 7,
      speed: -0.32,
      audioSens: 6.0,
      axis: 'z',
      emissiveColor: colors.accent,
      nodeCount: 6,
    });

    // 3. Polar Vertical Armillary Ring
    createHeavyGimbalRing({
      radius: 1.52,
      tube: 0.034,
      tiltX: 0,
      tiltY: Math.PI / 4,
      tiltZ: Math.PI / 2,
      speed: 0.48,
      audioSens: 4.8,
      axis: 'y',
      emissiveColor: colors.secondary,
      nodeCount: 4,
    });

    // 4. Massive Outer Horizon Wireframe Torus Ring
    createHeavyGimbalRing({
      radius: 2.15,
      tube: 0.025,
      tiltX: Math.PI / 1.7,
      tiltY: -Math.PI / 5,
      tiltZ: Math.PI / 3.5,
      speed: 0.25,
      audioSens: 4.0,
      axis: 'z',
      wireframe: true,
      emissiveColor: colors.primary,
      nodeCount: 4,
    });

    // -------------------------------------------------------------------------
    // F. 3D PARTICLE NEURAL DATA CLOUD (2,500 SPHERICAL DATA SPARKS)
    // -------------------------------------------------------------------------
    const particleCount = 2500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleBaseRadius = new Float32Array(particleCount);
    const particleTheta = new Float32Array(particleCount);
    const particlePhi = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);

    const colorPrimaryObj = new THREE.Color(colors.primary);
    const colorAccentObj = new THREE.Color(colors.accent);
    const colorCoreObj = new THREE.Color(colors.core);

    for (let i = 0; i < particleCount; i++) {
      const shellLayer = Math.random();
      let r = 0.45 + shellLayer * 1.25; // 3D shells from 0.45 to 1.7
      if (Math.random() < 0.22) r = 1.7 + Math.random() * 0.55; // outer orbiting cyber dust

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particleBaseRadius[i] = r;
      particleTheta[i] = theta;
      particlePhi[i] = phi;
      particleSpeeds[i] = (Math.random() - 0.5) * 1.1;

      particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);

      const mix = Math.random();
      const col = mix > 0.65 ? colorCoreObj : mix > 0.3 ? colorPrimaryObj : colorAccentObj;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom 3D dot sprite
    const createSparkTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 240, 160, 0.9)');
        grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(c);
    };

    const sparkTexture = createSparkTexture();

    const particleMat = new THREE.PointsMaterial({
      size: 0.062,
      map: sparkTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleCloud);

    // =========================================================================
    // --- 3. ANIMATION & 3D RENDERING LOOP ---
    // =========================================================================
    let frameId: number;
    let resizeFrameId: number | null = null;
    const clock = new THREE.Clock();
    let smoothedAudio = 0;
    let cameraZ = zoomRef.current;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;
      const currentTheme = themeRef.current;
      const targetExplode = explodeAmountRef.current;

      smoothedAudio += (currentAudio - smoothedAudio) * 0.18;

      // Smooth layer explosion animation
      currentExplodeAmount += (targetExplode - currentExplodeAmount) * 0.08;

      // Camera smooth zoom dolly
      cameraZ += (zoomRef.current - cameraZ) * 0.1;
      camera.position.z = cameraZ;

      // Dynamic theme color update
      const newColors = getThemeColors(currentTheme);
      if (newColors.primary !== colors.primary) {
        colors = newColors;
        keyLight.color.set(0xffffff);
        rimLight.color.set(colors.primary);
        fillLight.color.set(colors.accent);
        corePointLight.color.set(colors.core);
        nucleusSolidMat.emissive.set(colors.accent);
        dodecaMat.color.set(colors.accent);
        dodecaMat.emissive.set(colors.primary);
        innerPlasmaMat.color.set(colors.primary);
        innerPlasmaMat.emissive.set(colors.primary);
        octaMat.color.set(colors.accent);
        octaMat.emissive.set(colors.secondary);
        coneMat.color.set(colors.primary);
        synapseLineMat.color.set(colors.synapse);
        baseRings.forEach((r) => (r.material as THREE.MeshStandardMaterial).color.set(colors.pedestal));

        hudArcs.forEach((arc) => {
          arc.material.color.set(colors.primary);
          arc.material.emissive.set(colors.primary);
        });

        fullRings3D.forEach((r, idx) => {
          const col = idx % 2 === 0 ? colors.primary : colors.accent;
          r.material.color.set(col);
          r.material.emissive.set(col);
          r.satelliteNodes.forEach((n) => (n.material as THREE.MeshStandardMaterial).emissive.set(colors.accent));
        });
      }

      // Voice & state speed multipliers
      let speedMult = 1.0;
      let pulseMult = 1.0;

      if (currentState === 'listening') {
        speedMult = 1.8;
        pulseMult = 1.15 + Math.sin(time * 8) * 0.15 + smoothedAudio * 0.45;
      } else if (currentState === 'thinking') {
        speedMult = 3.2;
        pulseMult = 1.12 + Math.sin(time * 16) * 0.14;
      } else if (currentState === 'speaking') {
        speedMult = 2.4;
        pulseMult = 1.14 + Math.sin(time * 10) * 0.2 + smoothedAudio * 0.35;
      } else if (currentState === 'executing') {
        speedMult = 2.8;
        pulseMult = 1.25 + Math.sin(time * 12) * 0.18;
      }

      // Autonomous rotation if enabled and not currently dragging
      if (autoRotateRef.current && !isDragging) {
        targetRotationY += delta * 0.22 * speedMult;
      }

      // Smooth interactive mouse rotation damping
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      rootGroup.rotation.x = currentRotationX;
      rootGroup.rotation.y = currentRotationY;

      // Update rotation degrees telemetry for HUD
      if (Math.random() < 0.08) {
        setRotCoords({
          x: Math.round((currentRotationX * 180) / Math.PI),
          y: Math.round((currentRotationY * 180) / Math.PI) % 360,
        });
      }

      // Exploded 3D view: radially separate each layer in 3D space
      layer1Core.position.z = 0;
      layer2Neural.scale.set(
        1.0 + currentExplodeAmount * 0.45,
        1.0 + currentExplodeAmount * 0.45,
        1.0 + currentExplodeAmount * 0.45
      );
      layer3HUD.scale.set(
        1.0 + currentExplodeAmount * 0.8,
        1.0 + currentExplodeAmount * 0.8,
        1.0 + currentExplodeAmount * 0.8
      );
      layer4Shell.scale.set(
        1.0 + currentExplodeAmount * 1.15,
        1.0 + currentExplodeAmount * 1.15,
        1.0 + currentExplodeAmount * 1.15
      );
      layer5Gimbals.scale.set(
        1.0 + currentExplodeAmount * 1.5,
        1.0 + currentExplodeAmount * 1.5,
        1.0 + currentExplodeAmount * 1.5
      );

      // Base autonomous 3D internal component rotations
      globeGroup.rotation.y += delta * 0.18 * speedMult;
      layer1Core.rotation.y += delta * 0.55 * speedMult;
      layer1Core.rotation.x -= delta * 0.28 * speedMult;
      nucleusSolidMesh.rotation.y -= delta * 0.85 * speedMult;
      nucleusSolidMesh.rotation.z += delta * 0.45 * speedMult;
      dodecaMesh.rotation.x += delta * 0.6 * speedMult;
      octaMesh.rotation.y -= delta * 0.4 * speedMult;
      pedestalGroup.rotation.y += delta * 0.08;

      // Orbiting key light sweeps across the 3D geometry creating dynamic specular highlights
      keyLight.position.x = Math.cos(time * 0.8) * 4.5;
      keyLight.position.z = Math.sin(time * 0.8) * 4.5;

      // 3D Neural Synapse Nodes Motion & Pulsing Lines
      layer2Neural.rotation.y += delta * 0.32 * speedMult;
      const linePosAttr = synapseLineGeo.getAttribute('position') as THREE.BufferAttribute;
      const lineArray = linePosAttr.array as Float32Array;

      // Update positions of nodes and their connected synapse line vertices
      for (let i = 0; i < neuralNodeCount; i++) {
        const node = neuralNodes[i];
        node.theta += delta * node.speed * 0.85 * speedMult;
        const rad = node.baseRadius * (1.0 + (pulseMult - 1) * 0.15);
        node.position.set(
          rad * Math.sin(node.phi) * Math.cos(node.theta),
          rad * Math.sin(node.phi) * Math.sin(node.theta),
          rad * Math.cos(node.phi)
        );
        node.mesh.position.copy(node.position);

        // Individual node scale pulse
        const s = 1.0 + Math.sin(time * 4 + i) * 0.25 + smoothedAudio * 0.6;
        node.mesh.scale.set(s, s, s);
      }

      // Re-link line vertices to node positions
      for (let k = 0; k < lineIndices.length; k++) {
        const [n1, n2] = lineIndices[k];
        const p1 = neuralNodes[n1].position;
        const p2 = neuralNodes[n2].position;
        lineArray[k * 6] = p1.x;
        lineArray[k * 6 + 1] = p1.y;
        lineArray[k * 6 + 2] = p1.z;
        lineArray[k * 6 + 3] = p2.x;
        lineArray[k * 6 + 4] = p2.y;
        lineArray[k * 6 + 5] = p2.z;
      }
      linePosAttr.needsUpdate = true;

      // Segmented HUD Arcs Rotation
      hudArcs.forEach((arc) => {
        const audioBoost = 1.0 + smoothedAudio * arc.audioSens;
        const deltaRot = arc.speed * audioBoost * delta * speedMult;
        arc.mesh.rotation[arc.axis] += deltaRot;
        arc.material.emissiveIntensity = 1.2 + smoothedAudio * 1.5;
      });

      // Real 3D Torus Gimbal Rings motion & satellite node rotations
      fullRings3D.forEach((item) => {
        const audioBoost = 1.0 + smoothedAudio * item.audioSens;
        const deltaRot = item.speed * audioBoost * delta * speedMult;
        item.mesh.rotation[item.axis] += deltaRot;

        // Rotate individual 3D satellite nodes on their local axes
        item.satelliteNodes.forEach((node) => {
          node.rotation.x += delta * 1.5;
          node.rotation.y += delta * 2.0;
        });

        // Dynamic emissive intensity scaling with audio
        item.material.emissiveIntensity = 0.9 + smoothedAudio * 1.2;
      });

      // Luminous breathing pulse
      const coreScale = pulseMult;
      layer1Core.scale.set(coreScale, coreScale, coreScale);
      corePointLight.intensity = (8.0 + Math.sin(time * 4) * 3.0) * pulseMult + smoothedAudio * 6.0;

      // Swirling 3D neural particles
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const pos = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        particleTheta[i] += delta * particleSpeeds[i] * 0.95 * speedMult;
        const rad = particleBaseRadius[i] * (1.0 + (pulseMult - 1) * 0.18 + currentExplodeAmount * 0.6);
        const phi = particlePhi[i];
        const theta = particleTheta[i];

        pos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = rad * Math.cos(phi);
      }
      posAttr.needsUpdate = true;

      // Floating 3D levitation wave
      globeGroup.position.y = Math.sin(time * 1.8) * 0.08;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Responsive resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      if (resizeFrameId) {
        cancelAnimationFrame(resizeFrameId);
      }
      resizeFrameId = requestAnimationFrame(() => {
        const entry = entries[0];
        const newW = Math.max(Math.floor(entry.contentRect.width), 240);
        const newH = Math.max(Math.floor(entry.contentRect.height), 240);
        if (container.contains(renderer.domElement)) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      });
    });
    resizeObserver.observe(container);

    return () => {
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      cancelAnimationFrame(frameId);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
      sparkTexture.dispose();
      nucleusSolidGeo.dispose();
      nucleusSolidMat.dispose();
      dodecaGeo.dispose();
      dodecaMat.dispose();
      innerPlasmaGeo.dispose();
      innerPlasmaMat.dispose();
      octaGeo.dispose();
      octaMat.dispose();
      coneGeo.dispose();
      coneMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      synapseLineGeo.dispose();
      synapseLineMat.dispose();
      neuralNodeGeo.dispose();
      neuralNodeMat.dispose();
      tickGeo.dispose();
      tickMat.dispose();

      hudArcs.forEach((a) => {
        a.mesh.geometry.dispose();
        a.material.dispose();
        a.satelliteNodes.forEach((n) => {
          n.geometry.dispose();
          (n.material as THREE.Material).dispose();
        });
      });

      fullRings3D.forEach((r) => {
        r.mesh.geometry.dispose();
        r.material.dispose();
        r.satelliteNodes.forEach((n) => {
          n.geometry.dispose();
          (n.material as THREE.Material).dispose();
        });
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(2.2, Math.min(6.2, zoomRef.current + delta));
    zoomRef.current = newZoom;
    setZoomLevel(Number(newZoom.toFixed(1)));
  };

  const resetCamera = () => {
    zoomRef.current = 4.2;
    setZoomLevel(4.2);
    setExplodedView(false);
    setAutoRotate(true);
  };

  return (
    <div
      className={`relative select-none group w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Volumetric Radial Ambient Hologram Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45 blur-3xl transition-all duration-700"
        style={{
          background:
            theme === 'gold'
              ? 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.28) 0%, rgba(217,119,6,0.1) 45%, transparent 75%)'
              : theme === 'red'
              ? 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.3) 0%, rgba(185,28,28,0.1) 45%, transparent 75%)'
              : 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.3) 0%, rgba(139,92,246,0.14) 45%, transparent 75%)',
        }}
      />

      {/* 3D WebGL Canvas Container - Free-Floating in Space */}
      <div
        ref={containerRef}
        onClick={onActivateVoice}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
        title="Click & drag to rotate 3D holographic neural globe • Scroll to zoom • Click to toggle voice"
      />

      {/* Discreet Floating Theme Selector (Top-Left of Space Area) */}
      {onThemeChange && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-indigo-900/40 pointer-events-auto backdrop-blur-md z-20 opacity-80 hover:opacity-100 transition-opacity">
          <button
            onClick={() => onThemeChange('gold')}
            title="Jarvis Gold (Photo Style)"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              theme === 'gold'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_#f59e0b]'
                : 'text-amber-400/80 hover:text-white'
            }`}
          >
            JARVIS GOLD
          </button>
          <button
            onClick={() => onThemeChange('neon')}
            title="Cyber Neon"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              theme === 'neon'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_#06b6d4]'
                : 'text-cyan-400/80 hover:text-white'
            }`}
          >
            NEON
          </button>
          <button
            onClick={() => onThemeChange('red')}
            title="Crimson Protocol"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              theme === 'red'
                ? 'bg-rose-600 text-white font-bold shadow-[0_0_10px_#ef4444]'
                : 'text-rose-400/80 hover:text-white'
            }`}
          >
            RED
          </button>
        </div>
      )}

      {/* Discreet Floating 3D Controls (Bottom-Left of Space Area) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 pointer-events-auto z-20 opacity-70 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setExplodedView(!explodedView)}
          title={explodedView ? 'Collapse 3D Layers' : 'Explode 3D Core Layers'}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 ${
            explodedView
              ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_#f59e0b]'
              : 'bg-black/60 text-amber-300 border border-amber-500/40 hover:bg-amber-950/60'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>{explodedView ? 'COLLAPSE' : '3D EXPLODE'}</span>
        </button>

        <button
          onClick={() => handleZoom(-0.35)}
          title="Zoom In"
          className="p-1.5 rounded-lg bg-black/60 hover:bg-amber-950/60 text-amber-300 border border-amber-500/40"
        >
          <ZoomIn className="w-3 h-3" />
        </button>

        <button
          onClick={() => handleZoom(0.35)}
          title="Zoom Out"
          className="p-1.5 rounded-lg bg-black/60 hover:bg-amber-950/60 text-amber-300 border border-amber-500/40"
        >
          <ZoomOut className="w-3 h-3" />
        </button>

        <button
          onClick={resetCamera}
          title="Reset Camera"
          className="p-1.5 rounded-lg bg-black/60 hover:bg-amber-950/60 text-amber-300 border border-amber-500/40"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
