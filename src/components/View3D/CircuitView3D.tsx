import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { COMPONENT_CATALOG } from '../../simulation/componentCatalog';
import { CircuitGraph } from '../../simulation/circuitGraph';
import { buildComponent3D, DynamicRefs } from './componentModels3D';
import { 
  RotateCcw, ZoomIn, ZoomOut, Maximize2, 
  RotateCw, Trash2, Sliders, X, Check, Eye 
} from 'lucide-react';

// Fixed affine origin: center of the circuit board workspace
const SCENE_ORIGIN_X = 400;
const SCENE_ORIGIN_Z = 300;

export const CircuitView3D: React.FC = () => {
  const store = useCircuitStore();
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeSide, setActiveSide] = useState<string>('iso');

  // Three.js Core References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Group Containers
  const componentsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const wiresGroupRef = useRef<THREE.Group>(new THREE.Group());
  const previewWireGroupRef = useRef<THREE.Group>(new THREE.Group());
  const selectionRingGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Dynamic Interactive References
  const pinHotspotsRef = useRef<THREE.Mesh[]>([]);
  const dynamicRefsMapRef = useRef<Map<string, DynamicRefs>>(new Map());
  const hoveredPinMeshRef = useRef<THREE.Mesh | null>(null);

  // Dragging in 3D State
  const dragStateRef = useRef<{
    isDragging: boolean;
    componentId: string | null;
    groundOffset: THREE.Vector3;
    startClientPos: { x: number; y: number };
    hasMoved: boolean;
  }>({
    isDragging: false,
    componentId: null,
    groundOffset: new THREE.Vector3(),
    startClientPos: { x: 0, y: 0 },
    hasMoved: false,
  });

  // Pin Hover & Floating Tooltip State
  const [hoveredPinInfo, setHoveredPinInfo] = useState<{
    visible: boolean;
    text: string;
    subText?: string;
    x: number;
    y: number;
  }>({ visible: false, text: '', x: 0, y: 0 });

  // Floating Action HUD position above selected component
  const [selectedHudPos, setSelectedHudPos] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
  }>({ visible: false, x: 0, y: 0, label: '' });

  // Camera animation target
  const animTargetRef = useRef<{
    active: boolean;
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
  }>({
    active: false,
    targetCamPos: new THREE.Vector3(260, 260, 260),
    targetLookAt: new THREE.Vector3(0, 5, 0),
  });

  // =========================================================================
  // 1. REBUILD SCENE (Components, Pins & Jumper Wires)
  // =========================================================================
  const rebuildScene = useCallback(() => {
    const compGroup = componentsGroupRef.current;
    const wireGroup = wiresGroupRef.current;

    // Clear previous objects
    while (compGroup.children.length > 0) compGroup.remove(compGroup.children[0]);
    while (wireGroup.children.length > 0) wireGroup.remove(wireGroup.children[0]);
    dynamicRefsMapRef.current.clear();
    pinHotspotsRef.current = [];

    const sceneOrigin = { x: SCENE_ORIGIN_X, z: SCENE_ORIGIN_Z };

    // A. Build Components and their interactive pins
    store.project.components.forEach((comp) => {
      const def = COMPONENT_CATALOG.find((d) => d.id === comp.definitionId);
      if (!def) return;

      const { group, dynamicRefs, pinHotspots } = buildComponent3D(comp, def, sceneOrigin);
      compGroup.add(group);
      dynamicRefsMapRef.current.set(comp.id, dynamicRefs);
      pinHotspotsRef.current.push(...pinHotspots);
    });

    // B. Build Photorealistic Catmull-Rom Jumper Wires
    store.project.wires.forEach((wire) => {
      const comp1 = store.project.components.find((c) => c.id === wire.from.componentId);
      const comp2 = store.project.components.find((c) => c.id === wire.to.componentId);
      if (!comp1 || !comp2) return;

      const def1 = COMPONENT_CATALOG.find((d) => d.id === comp1.definitionId);
      const def2 = COMPONENT_CATALOG.find((d) => d.id === comp2.definitionId);
      const pin1 = def1?.pins.find((p) => p.id === wire.from.pinId);
      const pin2 = def2?.pins.find((p) => p.id === wire.to.pinId);
      if (!pin1 || !pin2) return;

      const p1 = CircuitGraph.getPinWorldPos(comp1, pin1);
      const p2 = CircuitGraph.getPinWorldPos(comp2, pin2);

      const h1 = comp1.definitionId.startsWith('breadboard') ? 10.5 : 12.0;
      const h2 = comp2.definitionId.startsWith('breadboard') ? 10.5 : 12.0;

      const v1 = new THREE.Vector3(p1.x - SCENE_ORIGIN_X, h1, p1.y - SCENE_ORIGIN_Z);
      const v2 = new THREE.Vector3(p2.x - SCENE_ORIGIN_X, h2, p2.y - SCENE_ORIGIN_Z);

      // Terminal sleeves (Black DuPont plastic headers)
      const sleeveGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 12);
      const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
      const sl1 = new THREE.Mesh(sleeveGeo, sleeveMat);
      sl1.position.set(v1.x, v1.y + 3, v1.z);
      const sl2 = new THREE.Mesh(sleeveGeo, sleeveMat);
      sl2.position.set(v2.x, v2.y + 3, v2.z);
      wireGroup.add(sl1, sl2);

      // Natural Arch Catenary Curve
      const v1Up = new THREE.Vector3(v1.x, v1.y + 12, v1.z);
      const v2Up = new THREE.Vector3(v2.x, v2.y + 12, v2.z);
      const dist = v1.distanceTo(v2);
      const midY = Math.max(h1, h2) + 20 + Math.min(65, dist * 0.18);
      const vMid = new THREE.Vector3((v1.x + v2.x) / 2, midY, (v1.z + v2.z) / 2);

      const curve = new THREE.CatmullRomCurve3([v1, v1Up, vMid, v2Up, v2], false, 'catmullrom', 0.5);
      const tubeGeo = new THREE.TubeGeometry(curve, 36, 1.8, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(wire.color),
        roughness: 0.35,
        metalness: 0.05,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.castShadow = true;
      tube.userData = { wireId: wire.id };
      wireGroup.add(tube);
    });

    // Update Selection Ring
    updateSelectionVisual();
  }, [store.project.components, store.project.wires]);

  // =========================================================================
  // 2. SELECTION VISUAL HIGHLIGHT & FLOATING ACTION HUD
  // =========================================================================
  const updateSelectionVisual = useCallback(() => {
    const selGroup = selectionRingGroupRef.current;
    while (selGroup.children.length > 0) selGroup.remove(selGroup.children[0]);

    if (!store.selectedComponentId) {
      setSelectedHudPos({ visible: false, x: 0, y: 0, label: '' });
      return;
    }

    const comp = store.project.components.find((c) => c.id === store.selectedComponentId);
    if (!comp) {
      setSelectedHudPos({ visible: false, x: 0, y: 0, label: '' });
      return;
    }

    const def = COMPONENT_CATALOG.find((d) => d.id === comp.definitionId);
    const w = (def?.width || 60) * 0.5 + 8;
    const d = (def?.height || 60) * 0.5 + 8;

    const compCenterX = comp.x + (def?.width || 60) / 2 - SCENE_ORIGIN_X;
    const compCenterZ = comp.y + (def?.height || 60) / 2 - SCENE_ORIGIN_Z;

    // Glowing Minimalist Rectangular Ring on Ground Plane
    const ringGeo = new THREE.RingGeometry(Math.max(w, d) - 1.5, Math.max(w, d) + 1.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(compCenterX, 0.4, compCenterZ);
    selGroup.add(ring);

    // Update Floating HUD position in 2D viewport space
    if (cameraRef.current && mountRef.current) {
      const topWorld = new THREE.Vector3(compCenterX, 25, compCenterZ);
      topWorld.project(cameraRef.current);

      const rect = mountRef.current.getBoundingClientRect();
      const screenX = ((topWorld.x + 1) * rect.width) / 2;
      const screenY = ((-topWorld.y + 1) * rect.height) / 2;

      // Only show if in front of camera
      if (topWorld.z < 1.0) {
        setSelectedHudPos({
          visible: true,
          x: screenX,
          y: screenY,
          label: comp.label || def?.label || 'Component',
        });
      } else {
        setSelectedHudPos({ visible: false, x: 0, y: 0, label: '' });
      }
    }
  }, [store.selectedComponentId, store.project.components]);

  // Keep HUD aligned when camera moves
  useEffect(() => {
    updateSelectionVisual();
  }, [store.selectedComponentId, updateSelectionVisual]);

  // =========================================================================
  // 3. THREE.JS INITIALIZATION & LIFECYCLE
  // =========================================================================
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const initialWidth = container.clientWidth || 800;
    const initialHeight = container.clientHeight || 600;

    // A. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b); // Pitch-dark minimal Cursor style
    sceneRef.current = scene;

    // B. Camera
    const camera = new THREE.PerspectiveCamera(40, initialWidth / initialHeight, 1, 4000);
    camera.position.set(260, 260, 260);
    cameraRef.current = camera;

    // C. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // D. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(280, 520, 340);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4d4d8, 0.45);
    fillLight.position.set(-280, 220, -280);
    scene.add(fillLight);

    // E. Minimal Dark Floor & Grid
    const groundGeo = new THREE.PlaneGeometry(3000, 3000);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(3000, 120, 0x27272a, 0x141416);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // F. Add Scene Groups
    scene.add(componentsGroupRef.current);
    scene.add(wiresGroupRef.current);
    scene.add(previewWireGroupRef.current);
    scene.add(selectionRingGroupRef.current);

    // G. Three.js OrbitControls (Flawless Mouse & Touch Gestures)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 60;
    controls.maxDistance = 1600;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.target.set(0, 5, 0);

    // Multi-touch gestures
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controlsRef.current = controls;

    // H. Auto ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // I. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera transition when presets are clicked
      if (animTargetRef.current.active) {
        const { targetCamPos, targetLookAt } = animTargetRef.current;
        camera.position.lerp(targetCamPos, 0.12);
        controls.target.lerp(targetLookAt, 0.12);

        if (camera.position.distanceTo(targetCamPos) < 1.0) {
          animTargetRef.current.active = false;
        }
      }

      controls.update();

      // Live Simulation Updates (Pin 13 LED, Servo horn, illuminated LEDs)
      try {
        const simState = circuitStore.getState()?.simulation;
        const isPin13High = Boolean(simState?.pinVoltages && simState.pinVoltages['uno-1:D13'] > 2.5);

        // Update Pin 13 LED on Arduino Uno
        const unoRefs = dynamicRefsMapRef.current.get('uno-1');
        if (unoRefs?.led13Mesh) {
          const mat = unoRefs.led13Mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = isPin13High ? 2.8 : 0;
        }

        // Update other dynamic components (illuminated LEDs & servo angles)
        store.project.components.forEach((c) => {
          const refs = dynamicRefsMapRef.current.get(c.id);
          if (!refs) return;

          // LED live glow
          if (refs.pointLight && refs.ledDome) {
            const isLit = Boolean(c.state?.illuminated);
            refs.pointLight.intensity = isLit ? 2.6 : 0;
            const domeMat = refs.ledDome.material as THREE.MeshStandardMaterial;
            domeMat.emissiveIntensity = isLit ? 3.0 : 0.05;
          }

          // Servo live rotation
          if (refs.hornMesh && c.state?.currentAngle !== undefined) {
            refs.hornMesh.rotation.y = (c.state.currentAngle * Math.PI) / 180;
          }
        });
      } catch {
        // Safe guard animation loop
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Rebuild scene when project components or wires change
  useEffect(() => {
    rebuildScene();
  }, [rebuildScene]);

  // Ensure size & scene are accurate when switching into 3D view mode
  useEffect(() => {
    if (store.viewMode === '3d') {
      const resizeTimer = setTimeout(() => {
        if (mountRef.current && rendererRef.current && cameraRef.current) {
          const w = mountRef.current.clientWidth;
          const h = mountRef.current.clientHeight;
          if (w > 0 && h > 0) {
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
          }
        }
        rebuildScene();
      }, 40);
      return () => clearTimeout(resizeTimer);
    }
  }, [store.viewMode, rebuildScene]);

  // =========================================================================
  // 4. RAYCASTING HELPERS & INTERACTIVE WIRE PREVIEW
  // =========================================================================
  const getGroundIntersection = (clientX: number, clientY: number): THREE.Vector3 | null => {
    if (!mountRef.current || !cameraRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    return raycaster.ray.intersectPlane(groundPlane, target);
  };

  const updatePreviewWire = (cursorPos: THREE.Vector3) => {
    const pGroup = previewWireGroupRef.current;
    while (pGroup.children.length > 0) pGroup.remove(pGroup.children[0]);

    if (!store.drawingWire) return;

    const { from, color } = store.drawingWire;
    const comp = store.project.components.find((c) => c.id === from.componentId);
    const def = COMPONENT_CATALOG.find((d) => d.id === comp?.definitionId);
    const pin = def?.pins.find((p) => p.id === from.pinId);
    if (!comp || !pin) return;

    const p1 = CircuitGraph.getPinWorldPos(comp, pin);
    const h1 = comp.definitionId.startsWith('breadboard') ? 10.5 : 12.0;
    const v1 = new THREE.Vector3(p1.x - SCENE_ORIGIN_X, h1, p1.y - SCENE_ORIGIN_Z);
    const v2 = cursorPos.clone();

    const v1Up = new THREE.Vector3(v1.x, v1.y + 14, v1.z);
    const v2Up = new THREE.Vector3(v2.x, v2.y + 14, v2.z);
    const vMid = new THREE.Vector3((v1.x + v2.x) / 2, Math.max(v1.y, v2.y) + 25, (v1.z + v2.z) / 2);

    const curve = new THREE.CatmullRomCurve3([v1, v1Up, vMid, v2Up, v2], false, 'catmullrom', 0.5);
    const tubeGeo = new THREE.TubeGeometry(curve, 28, 1.8, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    pGroup.add(tube);
  };

  // =========================================================================
  // 5. DRAG & DROP FROM SIDEBAR INTO 3D
  // =========================================================================
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const defId = e.dataTransfer.getData('text/plain');
    if (!defId) return;

    const groundIntersect = getGroundIntersection(e.clientX, e.clientY);
    if (!groundIntersect) return;

    const def = COMPONENT_CATALOG.find((d) => d.id === defId);
    const w = def?.width ?? 60;
    const h = def?.height ?? 60;

    const newX = Math.round(groundIntersect.x + SCENE_ORIGIN_X - w / 2);
    const newY = Math.round(groundIntersect.z + SCENE_ORIGIN_Z - h / 2);

    circuitStore.addComponent(defId, newX, newY);
  };

  // =========================================================================
  // 6. IN-SCENE 3D POINTER INTERACTIONS (DRAG, SELECT, WIRE, CONTROLS)
  // =========================================================================
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!mountRef.current || !cameraRef.current || !controlsRef.current) return;
    if (e.button !== 0) return; // Left click / single touch only

    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    // 1. Check if user clicked a Pin Hotspot (Interactive Wiring)
    const pinIntersects = raycaster.intersectObjects(pinHotspotsRef.current, false);
    if (pinIntersects.length > 0) {
      const pinObj = pinIntersects[0].object;
      const { componentId, pinId } = pinObj.userData;

      if (!store.drawingWire) {
        circuitStore.startWireDrawing(componentId, pinId);
      } else {
        circuitStore.completeWireDrawing(componentId, pinId);
        const pGroup = previewWireGroupRef.current;
        while (pGroup.children.length > 0) pGroup.remove(pGroup.children[0]);
      }
      return;
    }

    // 2. Check if user clicked an interactive component control
    const compChildren = componentsGroupRef.current.children;
    const compIntersects = raycaster.intersectObjects(compChildren, true);

    if (compIntersects.length > 0) {
      // Find root component group
      let topGroup: THREE.Object3D | null = compIntersects[0].object;
      while (topGroup && !topGroup.userData?.componentId && topGroup.parent) {
        topGroup = topGroup.parent;
      }

      if (topGroup && topGroup.userData?.componentId) {
        const compId = topGroup.userData.componentId;
        const comp = store.project.components.find((c) => c.id === compId);

        // Interactive Push Button
        if (comp?.definitionId === 'push-button') {
          circuitStore.updateComponentProperty(compId, 'isPressed', true);
        }

        // Interactive Slide Switch
        if (comp?.definitionId === 'slide-switch') {
          const nextPos = comp.properties.position === 1 ? 2 : 1;
          circuitStore.updateComponentProperty(compId, 'position', nextPos);
        }

        // Select component in store
        circuitStore.setSelectedComponent(compId);

        // Prepare 3D in-scene dragging
        const groundIntersect = getGroundIntersection(e.clientX, e.clientY);
        if (groundIntersect) {
          dragStateRef.current = {
            isDragging: true,
            componentId: compId,
            groundOffset: groundIntersect.clone().sub(topGroup.position),
            startClientPos: { x: e.clientX, y: e.clientY },
            hasMoved: false,
          };
          // Disable orbit controls while dragging component
          controlsRef.current.enabled = false;
        }
        return;
      }
    }

    // 3. Clicked empty background ground plane
    if (store.drawingWire) {
      circuitStore.cancelWireDrawing();
      const pGroup = previewWireGroupRef.current;
      while (pGroup.children.length > 0) pGroup.remove(pGroup.children[0]);
    } else {
      circuitStore.setSelectedComponent(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!mountRef.current || !cameraRef.current) return;

    // A. Active In-Scene Component Dragging
    if (dragStateRef.current.isDragging && dragStateRef.current.componentId) {
      const dist = Math.hypot(
        e.clientX - dragStateRef.current.startClientPos.x,
        e.clientY - dragStateRef.current.startClientPos.y
      );
      if (dist > 4) dragStateRef.current.hasMoved = true;

      const groundIntersect = getGroundIntersection(e.clientX, e.clientY);
      if (groundIntersect) {
        const comp = store.project.components.find((c) => c.id === dragStateRef.current.componentId);
        const def = COMPONENT_CATALOG.find((d) => d.id === comp?.definitionId);
        const w = def?.width ?? 60;
        const h = def?.height ?? 60;

        const targetX = groundIntersect.x - dragStateRef.current.groundOffset.x;
        const targetZ = groundIntersect.z - dragStateRef.current.groundOffset.z;

        const newCircuitX = Math.round(targetX + SCENE_ORIGIN_X - w / 2);
        const newCircuitY = Math.round(targetZ + SCENE_ORIGIN_Z - h / 2);

        circuitStore.moveComponent(dragStateRef.current.componentId, newCircuitX, newCircuitY);
      }
      return;
    }

    // B. Pin Hover Detection & Tooltip
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const pinIntersects = raycaster.intersectObjects(pinHotspotsRef.current, false);
    if (pinIntersects.length > 0) {
      const pinObj = pinIntersects[0].object as THREE.Mesh;
      const { componentId, pinDef } = pinObj.userData;
      const comp = store.project.components.find((c) => c.id === componentId);

      // Light up hovered pin
      if (hoveredPinMeshRef.current && hoveredPinMeshRef.current !== pinObj) {
        (hoveredPinMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.0;
      }
      (pinObj.material as THREE.MeshBasicMaterial).opacity = 0.85;
      hoveredPinMeshRef.current = pinObj;

      setHoveredPinInfo({
        visible: true,
        text: `${comp?.label || 'Component'}: ${pinDef?.label || 'Pin'}`,
        subText: pinDef?.type ? `(${pinDef.type.toUpperCase()})` : undefined,
        x: e.clientX,
        y: e.clientY,
      });

      if (mountRef.current) mountRef.current.style.cursor = 'crosshair';

      // Update wire preview to snap to this pin
      if (store.drawingWire) {
        const worldPinPos = new THREE.Vector3();
        pinObj.getWorldPosition(worldPinPos);
        updatePreviewWire(worldPinPos);
      }
      return;
    }

    // Reset pin hover if cursor moved away
    if (hoveredPinMeshRef.current) {
      (hoveredPinMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.0;
      hoveredPinMeshRef.current = null;
    }
    setHoveredPinInfo((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    if (mountRef.current) mountRef.current.style.cursor = 'grab';

    // C. Live Wire Preview following ground cursor
    if (store.drawingWire) {
      const groundIntersect = getGroundIntersection(e.clientX, e.clientY);
      if (groundIntersect) updatePreviewWire(groundIntersect);
    }
  };

  const handlePointerUp = () => {
    if (dragStateRef.current.isDragging) {
      // Release push button if button was held down
      if (dragStateRef.current.componentId) {
        const comp = store.project.components.find((c) => c.id === dragStateRef.current.componentId);
        if (comp?.definitionId === 'push-button') {
          circuitStore.updateComponentProperty(comp.id, 'isPressed', false);
        }
      }

      dragStateRef.current.isDragging = false;
      dragStateRef.current.componentId = null;
      if (controlsRef.current) controlsRef.current.enabled = true;
    }
  };

  // =========================================================================
  // 7. KEYBOARD SHORTCUTS IN 3D (DEL, BACKSPACE, R, ESC)
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedComponentId) {
          circuitStore.deleteComponent(store.selectedComponentId);
        } else if (store.selectedWireId) {
          circuitStore.deleteWire(store.selectedWireId);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (store.selectedComponentId) {
          circuitStore.rotateComponent(store.selectedComponentId);
        }
      } else if (e.key === 'Escape') {
        circuitStore.cancelWireDrawing();
        circuitStore.setSelectedComponent(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.selectedComponentId, store.selectedWireId]);

  // =========================================================================
  // 8. CAMERA ORIENTATION PRESET HANDLERS
  // =========================================================================
  const setOrientation = (camPos: THREE.Vector3, lookAt: THREE.Vector3, sideName: string) => {
    setActiveSide(sideName);
    animTargetRef.current = {
      active: true,
      targetCamPos: camPos,
      targetLookAt: lookAt,
    };
  };

  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dir = new THREE.Vector3().subVectors(cameraRef.current.position, controlsRef.current.target);
    const newLen = Math.max(80, dir.length() - 80);
    dir.setLength(newLen);
    cameraRef.current.position.copy(controlsRef.current.target).add(dir);
  };

  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dir = new THREE.Vector3().subVectors(cameraRef.current.position, controlsRef.current.target);
    const newLen = Math.min(1600, dir.length() + 80);
    dir.setLength(newLen);
    cameraRef.current.position.copy(controlsRef.current.target).add(dir);
  };

  const handleReset = () => {
    setOrientation(new THREE.Vector3(260, 260, 260), new THREE.Vector3(0, 5, 0), 'iso');
  };

  const handleFitAll = () => {
    setOrientation(new THREE.Vector3(0, 380, 480), new THREE.Vector3(0, 0, 0), 'iso');
  };

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: '#09090b',
        touchAction: 'none',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 3D WebGL Canvas Target */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          if (store.drawingWire) circuitStore.cancelWireDrawing();
        }}
      />

      {/* VIEWPORT CONTROLS: 360° PRESETS (Cursor Minimalist Monochrome) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#111113',
          border: '1px solid #27272a',
          borderRadius: '8px',
          padding: '3px 6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          zIndex: 30,
        }}
      >
        <span style={{ fontSize: '10px', color: '#71717a', fontFamily: 'var(--font-mono)', fontWeight: 600, marginRight: '4px' }}>
          VIEW:
        </span>

        {[
          { label: 'Iso', pos: new THREE.Vector3(260, 260, 260), look: new THREE.Vector3(0, 0, 0), id: 'iso' },
          { label: 'Top', pos: new THREE.Vector3(0, 480, 0), look: new THREE.Vector3(0, 0, 0), id: 'top' },
          { label: 'Front', pos: new THREE.Vector3(0, 20, 460), look: new THREE.Vector3(0, 0, 0), id: 'front' },
          { label: 'Back', pos: new THREE.Vector3(0, 20, -460), look: new THREE.Vector3(0, 0, 0), id: 'back' },
          { label: 'Left', pos: new THREE.Vector3(-460, 20, 0), look: new THREE.Vector3(0, 0, 0), id: 'left' },
          { label: 'Right', pos: new THREE.Vector3(460, 20, 0), look: new THREE.Vector3(0, 0, 0), id: 'right' },
          { label: 'Bottom', pos: new THREE.Vector3(0, -480, 0), look: new THREE.Vector3(0, 0, 0), id: 'bottom' },
        ].map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setOrientation(view.pos, view.look, view.id)}
            style={{
              padding: '3px 8px',
              borderRadius: '5px',
              border: activeSide === view.id ? '1px solid #ffffff' : '1px solid transparent',
              backgroundColor: activeSide === view.id ? '#ffffff' : 'transparent',
              color: activeSide === view.id ? '#09090b' : '#a1a1aa',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: activeSide === view.id ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* QUICK CAMERA ZOOM BUTTONS (BOTTOM LEFT) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          backgroundColor: '#111113',
          border: '1px solid #27272a',
          borderRadius: '8px',
          padding: '3px',
          zIndex: 30,
        }}
      >
        <button type="button" className="sb-icon-btn" title="Zoom In" onClick={handleZoomIn}>
          <ZoomIn size={13} />
        </button>
        <button type="button" className="sb-icon-btn" title="Zoom Out" onClick={handleZoomOut}>
          <ZoomOut size={13} />
        </button>
        <button type="button" className="sb-icon-btn" title="Fit to Screen" onClick={handleFitAll}>
          <Maximize2 size={13} />
        </button>
        <button type="button" className="sb-icon-btn" title="Reset View" onClick={handleReset}>
          <RotateCcw size={13} />
        </button>
      </div>

      {/* FLOATING ACTION HUD ABOVE SELECTED COMPONENT IN 3D */}
      {selectedHudPos.visible && store.selectedComponentId && (
        <div
          style={{
            position: 'absolute',
            left: `${selectedHudPos.x}px`,
            top: `${selectedHudPos.y - 48}px`,
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#111113',
            border: '1px solid #27272a',
            borderRadius: '6px',
            padding: '3px 6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            zIndex: 40,
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#f4f4f5', marginRight: '4px' }}>
            {selectedHudPos.label}
          </span>
          <div style={{ height: '12px', width: '1px', background: '#27272a' }} />
          <button
            type="button"
            className="sb-icon-btn"
            title="Rotate 90° (Shortcut: R)"
            onClick={() => circuitStore.rotateComponent(store.selectedComponentId!)}
          >
            <RotateCw size={12} />
          </button>
          <button
            type="button"
            className="sb-icon-btn"
            title="Delete (Shortcut: Del)"
            onClick={() => circuitStore.deleteComponent(store.selectedComponentId!)}
          >
            <Trash2 size={12} color="#ef4444" />
          </button>
          <button
            type="button"
            className="sb-icon-btn"
            title="Inspector"
            onClick={() => circuitStore.toggleRightTab('inspector')}
          >
            <Sliders size={12} />
          </button>
        </div>
      )}

      {/* PIN HOVER TOOLTIP */}
      {hoveredPinInfo.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredPinInfo.x + 14}px`,
            top: `${hoveredPinInfo.y + 14}px`,
            backgroundColor: '#18181b',
            border: '1px solid #38bdf8',
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#fafafa',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 100,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{hoveredPinInfo.text}</span>
          {hoveredPinInfo.subText && (
            <span style={{ color: '#38bdf8', fontSize: '10px' }}>{hoveredPinInfo.subText}</span>
          )}
        </div>
      )}

      {/* DRAWING WIRE BANNER */}
      {store.drawingWire && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#18181b',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 40,
            fontSize: '11px',
            color: '#f4f4f5',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: store.drawingWire.color,
            }}
          />
          <span>Click a target pin to connect (Right-click / Esc to cancel)</span>
          <button
            type="button"
            onClick={() => circuitStore.cancelWireDrawing()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* INSTRUCTIONS HINT (BOTTOM RIGHT) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          fontSize: '10px',
          color: '#52525b',
          fontFamily: 'var(--font-mono)',
          backgroundColor: 'rgba(9, 9, 11, 0.85)',
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid #1e1e21',
          pointerEvents: 'none',
        }}
      >
        Drag parts from sidebar • Click/Drag in 3D to move • Click pins to wire • 1-Finger/Left-drag: Orbit
      </div>
    </div>
  );
};
