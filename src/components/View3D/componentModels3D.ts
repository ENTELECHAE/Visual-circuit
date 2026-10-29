import * as THREE from 'three';
import { PlacedComponent, ComponentDefinition, PinDefinition } from '../../types/circuit';

export interface DynamicRefs {
  hornMesh?: THREE.Mesh;
  pointLight?: THREE.PointLight;
  ledDome?: THREE.Mesh;
  potKnob?: THREE.Mesh;
  switchKnob?: THREE.Mesh;
  buttonCap?: THREE.Mesh;
  led13Mesh?: THREE.Mesh;
  lcdMaterial?: THREE.MeshStandardMaterial;
  lcdCanvas?: HTMLCanvasElement;
  lcdTexture?: THREE.CanvasTexture;
}

export interface BuildResult {
  group: THREE.Group;
  dynamicRefs: DynamicRefs;
  pinHotspots: THREE.Mesh[];
  boundingBox: { width: number; height: number; depth: number };
}

// =========================================================================
// TEXTURE GENERATION CACHE
// =========================================================================
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Photorealistic Arduino Uno R3 PCB Texture with Authentic Silkscreen
 */
function getArduinoTexture(isMega: boolean): THREE.CanvasTexture {
  const key = `arduino_${isMega ? 'mega' : 'uno'}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. PCB Base: Authentic Italian Arduino Teal
  const pcbTeal = isMega ? '#007882' : '#00878F';
  ctx.fillStyle = pcbTeal;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle copper trace tracks
  ctx.strokeStyle = '#00727a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(120, 180); ctx.lineTo(240, 180); ctx.lineTo(300, 240); ctx.lineTo(460, 240);
  ctx.moveTo(180, 320); ctx.lineTo(280, 320); ctx.lineTo(340, 280); ctx.lineTo(520, 280);
  ctx.moveTo(600, 140); ctx.lineTo(720, 140); ctx.lineTo(780, 200); ctx.lineTo(880, 200);
  ctx.stroke();

  // 2. Gold Annular Rings for Mounting Holes
  const drawHole = (x: number, y: number) => {
    ctx.fillStyle = '#facc15'; // Gold annular pad
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09090b'; // Hole cutout
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
  };
  drawHole(120, 100);
  drawHole(120, 420);
  drawHole(940, 120);
  drawHole(940, 400);

  // 3. Crisp White Silkscreen
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';

  // --- Arduino Logo ---
  ctx.save();
  ctx.translate(620, 160);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-26, 0, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(26, 0, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('-', -26, -1);
  ctx.fillText('+', 26, -1);
  ctx.restore();

  // --- Brand Markings ---
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ARDUINO', 620, 220);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(isMega ? 'MEGA 2560' : 'UNO', 620, 260);

  ctx.font = '600 14px monospace';
  ctx.fillStyle = '#e4e4e7';
  ctx.fillText('MADE IN ITALY', 620, 288);
  ctx.fillText('www.arduino.cc', 620, 308);

  // --- Top Header Markings (DIGITAL PWM~) ---
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DIGITAL (PWM~)', 660, 40);

  const topPins = isMega 
    ? ['AREF', 'GND', '13', '12', '~11', '~10', '~9', '8', '7', '~6', '~5', '~4', '~3', '~2', 'TX>1', 'RX<0']
    : ['AREF', 'GND', '13', '12', '~11', '~10', '~9', '8', '7', '~6', '~5', '4', '~3', '2', 'TX>1', 'RX<0'];
  
  const topStartX = 340;
  const topStep = (960 - topStartX) / topPins.length;
  topPins.forEach((pin, idx) => {
    ctx.font = '600 13px monospace';
    ctx.fillText(pin, topStartX + idx * topStep, 72);
  });

  // Header socket outline line
  ctx.lineWidth = 1.5;
  ctx.strokeRect(320, 80, 650, 4);

  // --- Bottom Header Markings (POWER & ANALOG IN) ---
  ctx.font = 'bold 15px monospace';
  ctx.fillText('POWER', 420, 480);
  ctx.fillText('ANALOG IN', 760, 480);

  const pwrPins = ['IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN'];
  const pwrStartX = 340;
  const pwrStep = (550 - pwrStartX) / pwrPins.length;
  pwrPins.forEach((pin, idx) => {
    ctx.font = '600 13px monospace';
    ctx.fillText(pin, pwrStartX + idx * pwrStep, 450);
  });

  const anaPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
  const anaStartX = 660;
  const anaStep = (880 - anaStartX) / anaPins.length;
  anaPins.forEach((pin, idx) => {
    ctx.font = '600 13px monospace';
    ctx.fillText(pin, anaStartX + idx * anaStep, 450);
  });

  ctx.strokeRect(320, 428, 580, 4);

  // --- ICSP Outline ---
  ctx.strokeRect(840, 220, 60, 80);
  ctx.font = '11px monospace';
  ctx.fillText('ICSP', 870, 212);
  ctx.beginPath();
  ctx.arc(852, 232, 3, 0, Math.PI * 2);
  ctx.fill(); // Pin 1 dot

  // --- Status LED Labels ---
  ctx.font = 'bold 12px monospace';
  ctx.fillText('ON', 360, 160);
  ctx.fillText('L', 420, 160);
  ctx.fillText('TX', 420, 195);
  ctx.fillText('RX', 420, 225);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Photorealistic Breadboard Surface Texture with Coordinate Labels & Holes
 */
function getBreadboardTexture(isFull: boolean): THREE.CanvasTexture {
  const key = `breadboard_${isFull ? 'full' : 'half'}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = isFull ? 2048 : 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Off-white ABS plastic base
  ctx.fillStyle = '#F5F3EB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const numCols = isFull ? 63 : 30;
  const marginX = 60;
  const colWidth = (canvas.width - marginX * 2) / numCols;

  // 1. Red & Blue Power Rails
  // Top Rails
  ctx.fillStyle = '#ef4444'; // Red (+)
  ctx.fillRect(marginX, 32, canvas.width - marginX * 2, 4);
  ctx.fillStyle = '#3b82f6'; // Blue (-)
  ctx.fillRect(marginX, 68, canvas.width - marginX * 2, 4);

  // Bottom Rails
  ctx.fillStyle = '#3b82f6'; // Blue (-)
  ctx.fillRect(marginX, 440, canvas.width - marginX * 2, 4);
  ctx.fillStyle = '#ef4444'; // Red (+)
  ctx.fillRect(marginX, 476, canvas.width - marginX * 2, 4);

  // Plus & Minus Labels
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ef4444';
  ctx.fillText('+', marginX - 25, 34);
  ctx.fillText('+', canvas.width - marginX + 25, 34);
  ctx.fillText('+', marginX - 25, 478);
  ctx.fillText('+', canvas.width - marginX + 25, 478);

  ctx.fillStyle = '#3b82f6';
  ctx.fillText('-', marginX - 25, 70);
  ctx.fillText('-', canvas.width - marginX + 25, 70);
  ctx.fillText('-', marginX - 25, 442);
  ctx.fillText('-', canvas.width - marginX + 25, 442);

  // 2. Center Channel Trench (DIP IC divider)
  ctx.fillStyle = '#D6D1C4';
  ctx.fillRect(marginX - 10, 246, canvas.width - (marginX - 10) * 2, 20);

  // 3. Row Coordinate Numbers (1, 5, 10, 15, 20, 25, 30...)
  ctx.fillStyle = '#52525b';
  ctx.font = 'bold 12px monospace';

  for (let c = 1; c <= numCols; c++) {
    const x = marginX + (c - 0.5) * colWidth;
    if (c === 1 || c % 5 === 0) {
      ctx.fillText(String(c), x, 105);
      ctx.fillText(String(c), x, 405);
    }
  }

  // 4. Column Coordinate Letters (a-e and f-j)
  const lettersTop = ['a', 'b', 'c', 'd', 'e'];
  const lettersBot = ['f', 'g', 'h', 'i', 'j'];

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#71717a';

  lettersTop.forEach((ltr, idx) => {
    const y = 130 + idx * 22;
    ctx.fillText(ltr, marginX - 20, y);
    ctx.fillText(ltr, canvas.width - marginX + 20, y);
  });

  lettersBot.forEach((ltr, idx) => {
    const y = 285 + idx * 22;
    ctx.fillText(ltr, marginX - 20, y);
    ctx.fillText(ltr, canvas.width - marginX + 20, y);
  });

  // 5. Draw Square Sockets with Nickel-Silver Depth Clip
  for (let c = 1; c <= numCols; c++) {
    const x = marginX + (c - 0.5) * colWidth;

    // Top power rails (+ and -)
    [34, 70].forEach((y) => {
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    });

    // Terminal strips a-e
    for (let r = 0; r < 5; r++) {
      const y = 130 + r * 22;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = '#a1a1aa';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }

    // Terminal strips f-j
    for (let r = 0; r < 5; r++) {
      const y = 285 + r * 22;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = '#a1a1aa';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }

    // Bottom power rails (+ and -)
    [442, 478].forEach((y) => {
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Photorealistic ATmega328P DIP IC Laser-Etched Package Texture
 */
function getAtmegaTexture(): THREE.CanvasTexture {
  const key = 'atmega328p';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pin 1 Dot & Notch
  ctx.fillStyle = '#3f3f46';
  ctx.beginPath();
  ctx.arc(35, 80, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#27272a';
  ctx.beginPath();
  ctx.arc(55, 35, 8, 0, Math.PI * 2);
  ctx.fill();

  // Laser etched text
  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ATMEL', 280, 50);

  ctx.font = 'bold 22px monospace';
  ctx.fillText('ATMEGA328P-PU', 280, 85);

  ctx.font = '18px monospace';
  ctx.fillStyle = '#71717a';
  ctx.fillText('2148  PHILIPPINES', 280, 115);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

/**
 * 1602 LCD Dynamic Character Display Canvas Texture
 */
export function createLcdScreenTexture(line1 = 'Visual Circuits', line2 = 'Studio Ready'): {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  updateText: (l1: string, l2: string) => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);

  const render = (l1: string, l2: string) => {
    // Backlight Blue
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 16x2 Grid of 5x8 dot matrix blocks
    const charW = 28;
    const charH = 46;
    const padX = 18;

    // Draw unlit dot background matrix
    ctx.fillStyle = '#0d47a1';
    for (let row = 0; row < 2; row++) {
      const startY = 12 + row * 54;
      for (let col = 0; col < 16; col++) {
        const startX = padX + col * 30;
        ctx.fillRect(startX, startY, charW, charH);
      }
    }

    // Render Characters in glowing Cyan/White
    ctx.fillStyle = '#e0f7fa';
    ctx.font = 'bold 30px monospace';
    ctx.textBaseline = 'middle';

    const cleanL1 = (l1 || '').padEnd(16, ' ').slice(0, 16);
    const cleanL2 = (l2 || '').padEnd(16, ' ').slice(0, 16);

    for (let c = 0; c < 16; c++) {
      ctx.fillText(cleanL1[c], padX + c * 30 + 5, 36);
      ctx.fillText(cleanL2[c], padX + c * 30 + 5, 90);
    }

    texture.needsUpdate = true;
  };

  render(line1, line2);

  return {
    canvas,
    texture,
    updateText: (l1, l2) => render(l1, l2),
  };
}

// Reusable standard materials
const MATS = {
  blackPlastic: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75, metalness: 0.05 }),
  whitePlastic: new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.45, metalness: 0.02 }),
  breadboardTrench: new THREE.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 0.8 }),
  silverMetal: new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.18 }),
  goldMetal: new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.2 }),
  resistorBody: new THREE.MeshStandardMaterial({ color: 0xd8b688, roughness: 0.55, metalness: 0.05 }),
  pcbDark: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.45, metalness: 0.1 }),
  pcbBlue: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.08 }),
  pcbGreen: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35, metalness: 0.08 }),
};

/**
 * Builds photorealistic 3D representation of any component in the catalog
 */
export function buildComponent3D(
  comp: PlacedComponent,
  def: ComponentDefinition,
  sceneOrigin: { x: number; z: number }
): BuildResult {
  const compWidth = def.width || 60;
  const compHeight = def.height || 60;
  const worldCenterX = comp.x + compWidth / 2;
  const worldCenterZ = comp.y + compHeight / 2;

  const group = new THREE.Group();
  group.position.set(worldCenterX - sceneOrigin.x, 0, worldCenterZ - sceneOrigin.z);
  group.rotation.y = (-comp.rotation * Math.PI) / 180;
  group.userData = { componentId: comp.id, definitionId: comp.definitionId };

  const dynamicRefs: DynamicRefs = {};
  const pinHotspots: THREE.Mesh[] = [];

  let pinElevation = 10.0;
  let bbDimensions = { width: compWidth * 0.5, height: 20, depth: compHeight * 0.5 };

  // =========================================================================
  // 1. ARDUINO UNO R3 & MEGA 2560 (PHOTOREALISTIC SILKSCREEN)
  // =========================================================================
  if (comp.definitionId === 'arduino-uno' || comp.definitionId === 'arduino-mega') {
    const isMega = comp.definitionId === 'arduino-mega';
    const pcbW = isMega ? 190 : 138;
    const pcbD = 95;
    bbDimensions = { width: pcbW, height: 22, depth: pcbD };
    pinElevation = 12.0;

    // PCB Materials: Face 2 (+Y top) gets photorealistic silkscreen canvas texture
    const pcbTex = getArduinoTexture(isMega);
    const sideMat = new THREE.MeshStandardMaterial({
      color: isMega ? 0x007882 : 0x00878F,
      roughness: 0.35,
      metalness: 0.08,
    });
    const topMat = new THREE.MeshStandardMaterial({
      map: pcbTex,
      roughness: 0.32,
      metalness: 0.08,
    });

    const pcbMaterials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
    const pcbGeo = new THREE.BoxGeometry(pcbW, 3.8, pcbD);
    const pcb = new THREE.Mesh(pcbGeo, pcbMaterials);
    pcb.position.y = 1.9;
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    group.add(pcb);

    // USB Type-B Port (Metallic Shield + Inner Blue/White Insulator Tongue)
    const usbOuterGeo = new THREE.BoxGeometry(20, 15, 24);
    const usb = new THREE.Mesh(usbOuterGeo, MATS.silverMetal);
    usb.position.set(isMega ? -pcbW / 2 + 25 : -56, 9.5, -28);
    usb.castShadow = true;
    group.add(usb);

    const usbHole = new THREE.Mesh(new THREE.BoxGeometry(16, 11, 4), MATS.blackPlastic);
    usbHole.position.set(isMega ? -pcbW / 2 + 25 : -56, 9.5, -40);
    const usbTongue = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 8), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    usbTongue.position.set(isMega ? -pcbW / 2 + 25 : -56, 9.5, -36);
    group.add(usbHole, usbTongue);

    // DC Power Barrel Jack
    const dcGeo = new THREE.BoxGeometry(24, 14, 18);
    const dc = new THREE.Mesh(dcGeo, MATS.blackPlastic);
    dc.position.set(isMega ? -pcbW / 2 + 27 : -54, 9, 32);
    dc.castShadow = true;
    const dcHole = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 8, 16), MATS.silverMetal);
    dcHole.rotation.z = Math.PI / 2;
    dcHole.position.set(isMega ? -pcbW / 2 + 13 : -67, 9, 32);
    group.add(dc, dcHole);

    // ATmega328P DIP IC with Laser Etched Markings Texture
    const atmegaTex = getAtmegaTexture();
    const chipTopMat = new THREE.MeshStandardMaterial({ map: atmegaTex, roughness: 0.7 });
    const chipSideMat = MATS.blackPlastic;
    const chipMats = [chipSideMat, chipSideMat, chipTopMat, chipSideMat, chipSideMat, chipSideMat];

    const chipGeo = isMega ? new THREE.BoxGeometry(28, 4.5, 28) : new THREE.BoxGeometry(54, 6.5, 15);
    const chip = new THREE.Mesh(chipGeo, isMega ? MATS.blackPlastic : chipMats);
    chip.position.set(isMega ? 25 : 12, 5.2, 8);
    chip.castShadow = true;
    group.add(chip);

    // 16MHz Crystal Oscillator (Shiny Silver Can with Frequency Print)
    const oscGeo = new THREE.CylinderGeometry(2.5, 2.5, 11, 16);
    const osc = new THREE.Mesh(oscGeo, MATS.silverMetal);
    osc.rotation.z = Math.PI / 2;
    osc.position.set(-18, 5, -8);
    group.add(osc);

    // Tactile Reset Button
    const rstBase = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 8), MATS.silverMetal);
    rstBase.position.set(pcbW / 2 - 14, 4, -pcbD / 2 + 16);
    const rstBtn = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 3, 16), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    rstBtn.position.set(pcbW / 2 - 14, 6.5, -pcbD / 2 + 16);
    group.add(rstBase, rstBtn);

    // Female Pin Header Strips with Individual Socket Cavities
    const topHdrGeo = new THREE.BoxGeometry(pcbW - 32, 9.5, 8);
    const topHdr = new THREE.Mesh(topHdrGeo, MATS.blackPlastic);
    topHdr.position.set(12, 7, -42);
    topHdr.castShadow = true;
    group.add(topHdr);

    const botHdrGeo = new THREE.BoxGeometry(pcbW - 36, 9.5, 8);
    const botHdr = new THREE.Mesh(botHdrGeo, MATS.blackPlastic);
    botHdr.position.set(12, 7, 42);
    botHdr.castShadow = true;
    group.add(botHdr);

    // SMD ON LED (Green)
    const ledOn = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 3), new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 1.6,
    }));
    ledOn.position.set(-15, 4.2, -20);
    group.add(ledOn);

    // Pin 13 LED (Amber/Yellow - Blinks live with simulation!)
    const led13 = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 3), new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0,
    }));
    led13.position.set(-5, 4.2, -20);
    group.add(led13);
    dynamicRefs.led13Mesh = led13;

    // ICSP 6-pin Header with Real Gold-Plated Square Pins
    const icspBase = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 12), MATS.blackPlastic);
    icspBase.position.set(pcbW / 2 - 10, 4, 0);
    group.add(icspBase);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const pinPin = new THREE.Mesh(new THREE.BoxGeometry(0.65, 5.5, 0.65), MATS.goldMetal);
        pinPin.position.set(pcbW / 2 - 12 + r * 4, 6.8, -3 + c * 3);
        group.add(pinPin);
      }
    }
  }

  // =========================================================================
  // 2. ESP32 DEVKIT V1
  // =========================================================================
  else if (comp.definitionId.startsWith('esp32')) {
    const pcbGeo = new THREE.BoxGeometry(62, 3.2, 95);
    const pcb = new THREE.Mesh(pcbGeo, MATS.pcbDark);
    pcb.position.y = 1.6;
    pcb.castShadow = true;
    group.add(pcb);

    const rfGeo = new THREE.BoxGeometry(44, 3.8, 36);
    const rf = new THREE.Mesh(rfGeo, MATS.silverMetal);
    rf.position.set(0, 4, -14);
    rf.castShadow = true;
    group.add(rf);

    const usb = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 12), MATS.silverMetal);
    usb.position.set(0, 4.5, -45);
    group.add(usb);

    const hL = new THREE.Mesh(new THREE.BoxGeometry(6, 9.5, 84), MATS.blackPlastic);
    hL.position.set(-26, 6, 0);
    const hR = new THREE.Mesh(new THREE.BoxGeometry(6, 9.5, 84), MATS.blackPlastic);
    hR.position.set(26, 6, 0);
    group.add(hL, hR);
    pinElevation = 11.5;
  }

  // =========================================================================
  // 3. BREADBOARDS (HALF & FULL - PHOTOREALISTIC SURFACE)
  // =========================================================================
  else if (comp.definitionId === 'breadboard-half' || comp.definitionId === 'breadboard-full') {
    const isFull = comp.definitionId === 'breadboard-full';
    const bbW = isFull ? 315 : 165;
    const bbD = 104;
    pinElevation = 10.5;
    bbDimensions = { width: bbW, height: 12, depth: bbD };

    // Top face receives high-res breadboard coordinate texture
    const bbTex = getBreadboardTexture(isFull);
    const sideMat = new THREE.MeshStandardMaterial({ color: 0xf5f3eb, roughness: 0.55 });
    const topMat = new THREE.MeshStandardMaterial({
      map: bbTex,
      roughness: 0.48,
    });
    const bbMats = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];

    const bbGeo = new THREE.BoxGeometry(bbW, 10, bbD);
    const bb = new THREE.Mesh(bbGeo, bbMats);
    bb.position.y = 5;
    bb.castShadow = true;
    bb.receiveShadow = true;
    group.add(bb);

    // Center DIP Channel Trench
    const trenchGeo = new THREE.BoxGeometry(bbW - 12, 3.5, 6);
    const trench = new THREE.Mesh(trenchGeo, MATS.breadboardTrench);
    trench.position.set(0, 8.8, 0);
    group.add(trench);
  }

  // =========================================================================
  // 4. 5MM DIFFUSED LEDS (REFRACTIVE POLYCARBONATE & INTERNAL LEADFRAME)
  // =========================================================================
  else if (comp.definitionId.startsWith('led-') && comp.definitionId !== 'led-rgb') {
    const isLit = Boolean(comp.state?.illuminated);
    const ledColor = comp.properties.color || '#ef4444';
    pinElevation = 15.0;

    // Refractive Polycarbonate Dome with Leadframe Visible Inside
    const domeGeo = new THREE.SphereGeometry(6.5, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2);
    const cylinderGeo = new THREE.CylinderGeometry(6.5, 6.5, 7, 28);
    const collarGeo = new THREE.CylinderGeometry(7.2, 7.2, 1.5, 28);

    const domeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(ledColor),
      emissive: isLit ? new THREE.Color(ledColor) : new THREE.Color(0x000000),
      emissiveIntensity: isLit ? 3.5 : 0.05,
      roughness: 0.12,
      metalness: 0.05,
      transmission: 0.55,
      ior: 1.52,
      thickness: 2.0,
      transparent: true,
      opacity: 0.94,
    });

    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 19;
    dome.castShadow = true;
    const body = new THREE.Mesh(cylinderGeo, domeMat);
    body.position.y = 15.5;
    const collar = new THREE.Mesh(collarGeo, domeMat);
    collar.position.y = 11.5;
    group.add(dome, body, collar);
    dynamicRefs.ledDome = dome;

    // Internal Leadframe (Anode Post & Cathode Anvil Cup)
    const postGeo = new THREE.CylinderGeometry(0.35, 0.35, 6);
    const post = new THREE.Mesh(postGeo, MATS.silverMetal);
    post.position.set(-1.8, 14, 0);
    const anvilGeo = new THREE.BoxGeometry(2.5, 4, 1.2);
    const anvil = new THREE.Mesh(anvilGeo, MATS.silverMetal);
    anvil.position.set(1.5, 14, 0);
    group.add(post, anvil);

    // Volumetric Dynamic Light Source
    const pointLight = new THREE.PointLight(new THREE.Color(ledColor), isLit ? 2.8 : 0, 160, 1.4);
    pointLight.position.set(0, 20, 0);
    group.add(pointLight);
    dynamicRefs.pointLight = pointLight;

    // Bent Silver Wire Leads (Longer Anode, Shorter Cathode)
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 13), MATS.silverMetal);
    l1.position.set(-2.5, 5, 0);
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 11), MATS.silverMetal);
    l2.position.set(2.5, 6, 0);
    group.add(l1, l2);
  }

  // =========================================================================
  // 5. RGB 4-PIN LED
  // =========================================================================
  else if (comp.definitionId === 'led-rgb') {
    const isLit = Boolean(comp.state?.illuminated);
    pinElevation = 15.0;

    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      transparent: true,
      opacity: 0.88,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(7, 28, 28), domeMat);
    dome.position.y = 17;
    group.add(dome);

    const pointLight = new THREE.PointLight(0xffffff, isLit ? 2.8 : 0, 150, 1.4);
    pointLight.position.set(0, 20, 0);
    group.add(pointLight);
    dynamicRefs.pointLight = pointLight;

    for (let i = 0; i < 4; i++) {
      const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 12), MATS.silverMetal);
      lead.position.set(-4.5 + i * 3, 5.5, 0);
      group.add(lead);
    }
  }

  // =========================================================================
  // 6. RESISTORS (220Ω, 1kΩ, 10kΩ - DOG-BONE BODY & COLOR BANDS)
  // =========================================================================
  else if (comp.definitionId.startsWith('resistor')) {
    pinElevation = 8.0;

    // Dog-bone ceramic body with bulbous end caps
    const bodyGeo = new THREE.CylinderGeometry(3.0, 3.0, 16, 20);
    const body = new THREE.Mesh(bodyGeo, MATS.resistorBody);
    body.rotation.z = Math.PI / 2;
    body.position.y = 8;
    body.castShadow = true;

    const capGeo = new THREE.SphereGeometry(3.3, 16, 16);
    const capL = new THREE.Mesh(capGeo, MATS.resistorBody);
    capL.position.set(-8, 8, 0);
    const capR = new THREE.Mesh(capGeo, MATS.resistorBody);
    capR.position.set(8, 8, 0);
    group.add(body, capL, capR);

    // Color bands according to resistance value
    const bands = comp.definitionId === 'resistor-220'
      ? [0xef4444, 0xef4444, 0x92400e, 0xfbbf24] // Red, Red, Brown, Gold
      : comp.definitionId === 'resistor-1k'
      ? [0x92400e, 0x18181b, 0xef4444, 0xfbbf24] // Brown, Black, Red, Gold
      : [0x92400e, 0x18181b, 0xea580c, 0xfbbf24]; // Brown, Black, Orange, Gold

    bands.forEach((bColor, idx) => {
      const isGold = bColor === 0xfbbf24;
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(3.1, 3.1, 1.8, 20),
        new THREE.MeshStandardMaterial({
          color: bColor,
          roughness: isGold ? 0.2 : 0.4,
          metalness: isGold ? 0.8 : 0.1,
        })
      );
      ring.rotation.z = Math.PI / 2;
      ring.position.set(-5.5 + idx * 3.6, 8, 0);
      group.add(ring);
    });

    // 90° Bent Axial Leads going down into breadboard
    const wireH = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 34), MATS.silverMetal);
    wireH.rotation.z = Math.PI / 2;
    wireH.position.set(0, 8, 0);
    group.add(wireH);

    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 8), MATS.silverMetal);
    legL.position.set(-17, 4, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 8), MATS.silverMetal);
    legR.position.set(17, 4, 0);
    group.add(legL, legR);
  }

  // =========================================================================
  // 7. CAPACITORS (CERAMIC & ELECTROLYTIC)
  // =========================================================================
  else if (comp.definitionId.includes('capacitor')) {
    pinElevation = 7.0;
    const isCeramic = comp.definitionId.includes('ceramic');

    if (isCeramic) {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(5.5, 5.5, 2.5, 24),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
      );
      disc.rotation.x = Math.PI / 2;
      disc.position.y = 11;
      group.add(disc);
    } else {
      const can = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, 14, 24),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.3, roughness: 0.3 })
      );
      can.position.y = 10;
      const topCap = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 0.5, 24), MATS.silverMetal);
      topCap.position.y = 17;
      group.add(can, topCap);
    }

    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 8), MATS.silverMetal);
    l1.position.set(-2.5, 4, 0);
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 8), MATS.silverMetal);
    l2.position.set(2.5, 4, 0);
    group.add(l1, l2);
  }

  // =========================================================================
  // 8. DIODE 1N4007
  // =========================================================================
  else if (comp.definitionId.includes('diode')) {
    pinElevation = 6.0;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 14, 16), MATS.blackPlastic);
    body.rotation.z = Math.PI / 2;
    body.position.y = 6;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.55, 2.5, 16), MATS.silverMetal);
    band.rotation.z = Math.PI / 2;
    band.position.set(4, 6, 0);
    group.add(body, band);

    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 28), MATS.silverMetal);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0, 6, 0);
    group.add(wire);
  }

  // =========================================================================
  // 9. TRANSISTOR (2N2222 / TO-92)
  // =========================================================================
  else if (comp.definitionId.includes('transistor')) {
    pinElevation = 6.0;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 9, 16, 1, false, 0, Math.PI), MATS.blackPlastic);
    body.position.y = 9;
    group.add(body);

    for (let i = 0; i < 3; i++) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 7), MATS.silverMetal);
      l.position.set(-2.5 + i * 2.5, 3.5, 0);
      group.add(l);
    }
  }

  // =========================================================================
  // 10. MICRO SERVO SG90 (TRANSLUCENT BLUE CASING & ROTATING NYLON HORN)
  // =========================================================================
  else if (comp.definitionId === 'servo-sg90') {
    pinElevation = 14.0;
    bbDimensions = { width: 34, height: 32, depth: 16 };

    // Translucent Blue Casing
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(32, 28, 14),
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.9,
        roughness: 0.35,
      })
    );
    body.position.y = 14;
    body.castShadow = true;
    group.add(body);

    // Gear Output Shaft Boss
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 5, 20), MATS.whitePlastic);
    shaft.position.set(-6, 30, 0);
    group.add(shaft);

    // White Rotating Servo Horn
    const horn = new THREE.Mesh(new THREE.BoxGeometry(34, 2.5, 7), MATS.whitePlastic);
    horn.position.set(-6, 33, 0);
    const curAngle = comp.state?.currentAngle ?? comp.properties.angle ?? 90;
    horn.rotation.y = (curAngle * Math.PI) / 180;
    group.add(horn);
    dynamicRefs.hornMesh = horn;
  }

  // =========================================================================
  // 11. ULTRASONIC SENSOR HC-SR04
  // =========================================================================
  else if (comp.definitionId === 'hc-sr04') {
    pinElevation = 14.0;
    bbDimensions = { width: 64, height: 26, depth: 16 };

    const pcb = new THREE.Mesh(new THREE.BoxGeometry(62, 24, 3.5), MATS.pcbBlue);
    pcb.position.y = 12;
    pcb.castShadow = true;
    group.add(pcb);

    // Twin Cylindrical Ultrasonic Transducers with Silver Grille Mesh
    const cylGeo = new THREE.CylinderGeometry(8, 8, 14, 24);
    const c1 = new THREE.Mesh(cylGeo, MATS.silverMetal);
    c1.rotation.x = Math.PI / 2;
    c1.position.set(-18, 12, 9);
    c1.castShadow = true;

    const c2 = new THREE.Mesh(cylGeo, MATS.silverMetal);
    c2.rotation.x = Math.PI / 2;
    c2.position.set(18, 12, 9);
    c2.castShadow = true;
    group.add(c1, c2);

    const hdr = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 4), MATS.blackPlastic);
    hdr.position.set(0, 4, 0);
    group.add(hdr);
  }

  // =========================================================================
  // 12. PUSH BUTTON (TACTILE SWITCH)
  // =========================================================================
  else if (comp.definitionId === 'push-button') {
    pinElevation = 6.0;
    const base = new THREE.Mesh(new THREE.BoxGeometry(18, 6.5, 18), MATS.blackPlastic);
    base.position.y = 3.25;
    group.add(base);

    const bezel = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 16), MATS.silverMetal);
    bezel.position.y = 6.6;
    group.add(bezel);

    const isPressed = Boolean(comp.properties.isPressed);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 4.5, 4, 20),
      new THREE.MeshStandardMaterial({ color: isPressed ? 0xef4444 : 0x27272a })
    );
    cap.position.y = isPressed ? 7.2 : 9.0;
    group.add(cap);
    dynamicRefs.buttonCap = cap;

    for (let x = -7; x <= 7; x += 14) {
      for (let z = -7; z <= 7; z += 14) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6), MATS.silverMetal);
        leg.position.set(x, 1.5, z);
        group.add(leg);
      }
    }
  }

  // =========================================================================
  // 13. POTENTIOMETER (10K)
  // =========================================================================
  else if (comp.definitionId === 'potentiometer') {
    pinElevation = 8.0;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 10, 24), MATS.pcbBlue);
    pot.position.y = 5;
    pot.castShadow = true;
    group.add(pot);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 12, 16), MATS.silverMetal);
    shaft.position.y = 14;
    group.add(shaft);

    const knob = new THREE.Mesh(new THREE.CylinderGeometry(7, 8, 8, 20), MATS.blackPlastic);
    knob.position.y = 15;
    const pointer = new THREE.Mesh(new THREE.BoxGeometry(1, 8.2, 3), MATS.whitePlastic);
    pointer.position.set(0, 15, 6);
    const knobGroup = new THREE.Group();
    knobGroup.add(knob, pointer);
    const rotVal = ((comp.properties.value || 50) / 100) * (Math.PI * 1.5) - Math.PI * 0.75;
    knobGroup.rotation.y = rotVal;
    group.add(knobGroup);
    dynamicRefs.potKnob = knob;
  }

  // =========================================================================
  // 14. SLIDE SWITCH (SPDT)
  // =========================================================================
  else if (comp.definitionId === 'slide-switch') {
    pinElevation = 5.0;
    const base = new THREE.Mesh(new THREE.BoxGeometry(22, 6.5, 12), MATS.silverMetal);
    base.position.y = 3.25;
    group.add(base);

    const isPos2 = comp.properties.position === 2;
    const knob = new THREE.Mesh(new THREE.BoxGeometry(4.5, 7, 5), MATS.blackPlastic);
    knob.position.set(isPos2 ? 5.5 : -5.5, 8, 0);
    group.add(knob);
    dynamicRefs.switchKnob = knob;
  }

  // =========================================================================
  // 15. PIEZO BUZZER
  // =========================================================================
  else if (comp.definitionId === 'piezo-buzzer') {
    pinElevation = 7.0;
    const bz = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 11, 24), MATS.blackPlastic);
    bz.position.y = 5.5;
    bz.castShadow = true;

    const hole = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2, 16), new THREE.MeshStandardMaterial({ color: 0x09090b }));
    hole.position.y = 11.1;
    group.add(bz, hole);
  }

  // =========================================================================
  // 16. LCD 1602 DISPLAY (I2C) - DYNAMIC 16x2 CHARACTER CANVAS TEXTURE
  // =========================================================================
  else if (comp.definitionId === 'lcd-1602-i2c') {
    pinElevation = 10.0;
    bbDimensions = { width: 110, height: 16, depth: 50 };

    const pcb = new THREE.Mesh(new THREE.BoxGeometry(108, 3.5, 48), MATS.pcbGreen);
    pcb.position.y = 1.75;
    pcb.castShadow = true;
    group.add(pcb);

    const screenBezel = new THREE.Mesh(new THREE.BoxGeometry(86, 4.5, 32), MATS.blackPlastic);
    screenBezel.position.set(0, 4.5, 0);
    group.add(screenBezel);

    // Live Dynamic Canvas Texture for LCD Screen
    const l1 = comp.state?.line1 ?? comp.properties.line1 ?? 'Visual Circuits';
    const l2 = comp.state?.line2 ?? comp.properties.line2 ?? 'Studio Ready';
    const { canvas, texture } = createLcdScreenTexture(l1, l2);

    const lcdMat = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      roughness: 0.25,
    });

    const screenGlass = new THREE.Mesh(new THREE.BoxGeometry(78, 4.6, 26), lcdMat);
    screenGlass.position.set(0, 4.6, 0);
    group.add(screenGlass);

    dynamicRefs.lcdMaterial = lcdMat;
    dynamicRefs.lcdCanvas = canvas;
    dynamicRefs.lcdTexture = texture;
  }

  // =========================================================================
  // 17. 5V RELAY MODULE
  // =========================================================================
  else if (comp.definitionId === 'relay-module') {
    pinElevation = 10.0;
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(50, 3, 36), MATS.pcbBlue);
    pcb.position.y = 1.5;
    group.add(pcb);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(22, 16, 18),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35 })
    );
    cube.position.set(4, 10, 0);
    cube.castShadow = true;
    group.add(cube);

    const term = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 28), MATS.pcbGreen);
    term.position.set(-18, 8, 0);
    group.add(term);
  }

  // =========================================================================
  // 18. PHOTORESISTOR (LDR)
  // =========================================================================
  else if (comp.definitionId.includes('ldr')) {
    pinElevation = 6.0;
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 4.5, 1.8, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
    );
    disc.position.y = 8;
    group.add(disc);

    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 8), MATS.silverMetal);
    l1.position.set(-2, 4, 0);
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 8), MATS.silverMetal);
    l2.position.set(2, 4, 0);
    group.add(l1, l2);
  }

  // =========================================================================
  // 19. DHT11 / DHT22 SENSOR
  // =========================================================================
  else if (comp.definitionId.startsWith('dht')) {
    pinElevation = 10.0;
    const isDht22 = comp.definitionId === 'dht22';
    const caseMat = isDht22 ? MATS.whitePlastic : new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const casing = new THREE.Mesh(new THREE.BoxGeometry(16, 22, 10), caseMat);
    casing.position.y = 14;
    casing.castShadow = true;
    group.add(casing);
  }

  // =========================================================================
  // 20. GENERIC IC FALLBACK
  // =========================================================================
  else {
    pinElevation = 8.0;
    const chipW = Math.max(20, compWidth * 0.4);
    const chipD = Math.max(16, compHeight * 0.4);
    const chip = new THREE.Mesh(new THREE.BoxGeometry(chipW, 6, chipD), MATS.blackPlastic);
    chip.position.y = 4;
    chip.castShadow = true;
    group.add(chip);
  }

  // =========================================================================
  // PIN HOTSPOTS (Exact 1:1 World Alignment with 2D Pins)
  // =========================================================================
  def.pins.forEach((pin) => {
    const localX = pin.x - compWidth / 2;
    const localZ = pin.y - compHeight / 2;
    const localY = pinElevation;

    const hotspotGeo = new THREE.CylinderGeometry(2.0, 2.0, 4.0, 10);
    const hotspotMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
    });
    const hotspot = new THREE.Mesh(hotspotGeo, hotspotMat);
    hotspot.position.set(localX, localY, localZ);
    hotspot.userData = {
      isPin: true,
      componentId: comp.id,
      pinId: pin.id,
      pinDef: pin,
      localPos: new THREE.Vector3(localX, localY, localZ),
    };
    group.add(hotspot);
    pinHotspots.push(hotspot);
  });

  return { group, dynamicRefs, pinHotspots, boundingBox: bbDimensions };
}
