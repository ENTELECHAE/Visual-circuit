import { useState, useEffect } from 'react';
import { CircuitProject, PlacedComponent, Wire, ViewMode, SimulationState, PinDefinition } from '../types/circuit';
import { COMPONENT_CATALOG } from '../simulation/componentCatalog';
import { CircuitGraph } from '../simulation/circuitGraph';
import { arduinoRunner } from '../simulation/arduinoRunner';
import { audioManager } from '../simulation/audioManager';
import { PRESET_CIRCUITS } from '../simulation/presets';

interface CircuitStoreState {
  project: CircuitProject;
  selectedComponentId: string | null;
  selectedWireId: string | null;
  hoveredPin: { componentId: string; pinId: string; pinDef: PinDefinition } | null;
  drawingWire: { from: { componentId: string; pinId: string }; color: string } | null;
  viewMode: ViewMode;
  theme: 'dark' | 'light';
  zoom: number;
  pan: { x: number; y: number };
  simulation: SimulationState;
  activeRightTab: 'editor' | 'serial' | 'inspector' | 'ai' | null;
  isPaletteOpen: boolean;
}

const DEFAULT_PROJECT: CircuitProject = PRESET_CIRCUITS[0];

let state: CircuitStoreState = {
  project: { ...DEFAULT_PROJECT },
  selectedComponentId: null,
  selectedWireId: null,
  hoveredPin: null,
  drawingWire: null,
  viewMode: '2d',
  theme: (localStorage.getItem('visual-circuits:theme') as 'dark' | 'light') || 'dark',
  zoom: 1.0,
  pan: { x: 40, y: 30 },
  simulation: {
    isRunning: false,
    isPaused: false,
    timeElapsedMs: 0,
    speed: 1.0,
    pinVoltages: {},
    pinModes: {},
    serialOutput: [],
    serialBaud: 9600,
  },
  activeRightTab: null,
  isPaletteOpen: true,
};

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

// Simulation loop handle
let simInterval: any = null;

export const circuitStore = {
  getState: () => state,

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setTheme: (theme: 'dark' | 'light') => {
    state.theme = theme;
    localStorage.setItem('visual-circuits:theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#171614' : '#FBFBF9');
    notify();
  },

  setViewMode: (viewMode: ViewMode) => {
    state.viewMode = viewMode;
    notify();
  },

  setZoom: (zoom: number) => {
    state.zoom = Math.max(0.2, Math.min(3.0, zoom));
    notify();
  },

  setPan: (pan: { x: number; y: number }) => {
    state.pan = pan;
    notify();
  },

  setSelectedComponent: (id: string | null) => {
    state.selectedComponentId = id;
    state.selectedWireId = null;
    if (id && state.activeRightTab === null) {
      state.activeRightTab = 'inspector';
    }
    notify();
  },

  setSelectedWire: (id: string | null) => {
    state.selectedWireId = id;
    state.selectedComponentId = null;
    notify();
  },

  setHoveredPin: (pin: { componentId: string; pinId: string; pinDef: PinDefinition } | null) => {
    state.hoveredPin = pin;
    notify();
  },

  toggleRightTab: (tab: 'editor' | 'serial' | 'inspector' | 'ai') => {
    state.activeRightTab = state.activeRightTab === tab ? null : tab;
    notify();
  },

  togglePalette: () => {
    state.isPaletteOpen = !state.isPaletteOpen;
    notify();
  },

  addComponent: (definitionId: string, x = 200, y = 150) => {
    const def = COMPONENT_CATALOG.find((c) => c.id === definitionId);
    if (!def) return;

    const newId = `${definitionId.split('-')[0]}-${Date.now().toString().slice(-4)}`;
    const newComp: PlacedComponent = {
      id: newId,
      definitionId: def.id,
      label: def.label,
      x,
      y,
      rotation: 0,
      properties: { ...(def.defaultProperties || {}) },
    };

    state.project.components.push(newComp);
    state.selectedComponentId = newId;
    state.activeRightTab = 'inspector';
    notify();
  },

  moveComponent: (id: string, x: number, y: number) => {
    const comp = state.project.components.find((c) => c.id === id);
    if (comp) {
      comp.x = x;
      comp.y = y;
      notify();
    }
  },

  rotateComponent: (id: string) => {
    const comp = state.project.components.find((c) => c.id === id);
    if (comp) {
      comp.rotation = (comp.rotation + 90) % 360;
      notify();
    }
  },

  deleteComponent: (id: string) => {
    state.project.components = state.project.components.filter((c) => c.id !== id);
    // Remove associated wires
    state.project.wires = state.project.wires.filter(
      (w) => w.from.componentId !== id && w.to.componentId !== id
    );
    if (state.selectedComponentId === id) state.selectedComponentId = null;
    notify();
  },

  updateComponentProperty: (id: string, key: string, value: any) => {
    const comp = state.project.components.find((c) => c.id === id);
    if (comp) {
      comp.properties[key] = value;
      notify();
    }
  },

  startWireDrawing: (componentId: string, pinId: string, color?: string) => {
    const comp = state.project.components.find((c) => c.id === componentId);
    const def = COMPONENT_CATALOG.find((c) => c.id === comp?.definitionId);
    const pinDef = def?.pins.find((p) => p.id === pinId);

    const wireColor = color || CircuitGraph.getWireColorForPin(pinDef);
    state.drawingWire = {
      from: { componentId, pinId },
      color: wireColor,
    };
    notify();
  },

  completeWireDrawing: (toComponentId: string, toPinId: string) => {
    if (!state.drawingWire) return;
    const { from, color } = state.drawingWire;

    // Avoid self-connecting to the exact same pin
    if (from.componentId === toComponentId && from.pinId === toPinId) {
      state.drawingWire = null;
      notify();
      return;
    }

    const newWire: Wire = {
      id: `wire-${Date.now().toString().slice(-5)}`,
      color,
      from,
      to: { componentId: toComponentId, pinId: toPinId },
    };

    state.project.wires.push(newWire);
    state.drawingWire = null;
    notify();
  },

  cancelWireDrawing: () => {
    state.drawingWire = null;
    notify();
  },

  deleteWire: (wireId: string) => {
    state.project.wires = state.project.wires.filter((w) => w.id !== wireId);
    if (state.selectedWireId === wireId) state.selectedWireId = null;
    notify();
  },

  updateWireColor: (wireId: string, color: string) => {
    const wire = state.project.wires.find((w) => w.id === wireId);
    if (wire) {
      wire.color = color;
      notify();
    }
  },

  setCode: (code: string) => {
    state.project.code = code;
    notify();
  },

  setProjectName: (name: string) => {
    state.project.name = name;
    notify();
  },

  setBoard: (board: string) => {
    state.project.board = board;
    notify();
  },

  loadPreset: (presetId: string) => {
    const preset = PRESET_CIRCUITS.find(
      (p) =>
        p.id === presetId ||
        p.id === `preset-${presetId.replace('uno-', '')}` ||
        p.id === `uno-${presetId.replace('preset-', '')}`
    );
    if (preset) {
      circuitStore.stopSimulation();
      state.project = JSON.parse(JSON.stringify(preset));
      state.selectedComponentId = null;
      state.selectedWireId = null;
      state.zoom = 1.0;
      state.pan = { x: 50, y: 40 };
      notify();
    }
  },

  clearCircuit: () => {
    circuitStore.stopSimulation();
    state.project.components = [];
    state.project.wires = [];
    state.selectedComponentId = null;
    state.selectedWireId = null;
    notify();
  },

  startSimulation: () => {
    if (state.simulation.isRunning) return;

    state.simulation.isRunning = true;
    state.simulation.timeElapsedMs = 0;
    arduinoRunner.reset();

    const tickMs = 50;
    simInterval = setInterval(() => {
      if (!state.simulation.isRunning) return;

      state.simulation.timeElapsedMs += tickMs * state.simulation.speed;

      // Collect component interactive context
      const pot = state.project.components.find((c) => c.definitionId === 'potentiometer');
      const btn = state.project.components.find((c) => c.definitionId === 'push-button');
      const sonar = state.project.components.find((c) => c.definitionId === 'hc-sr04');
      const ldr = state.project.components.find((c) => c.definitionId === 'ldr-gl5528');

      const inputs = {
        potentiometer: pot?.properties.value,
        buttonPressed: btn?.properties.isPressed,
        distanceCm: sonar?.properties.distanceCm,
        lightLevel: ldr?.properties.lightLevel,
      };

      arduinoRunner.executeCodeTick(state.project.code, tickMs * state.simulation.speed, inputs);

      // Resolve voltages across all components via netlist
      const pinStates = arduinoRunner.getAllPinStates();
      const voltages: Record<string, number> = {};

      for (const [pin, s] of Object.entries(pinStates)) {
        voltages[`uno-1:${pin}`] = s.voltage;
      }
      voltages['uno-1:5V'] = 5.0;
      voltages['uno-1:3V3'] = 3.3;
      voltages['uno-1:GND1'] = 0.0;
      voltages['uno-1:GND2'] = 0.0;
      voltages['uno-1:GND3'] = 0.0;

      // Update LED illumination state based on connected nets
      const nets = CircuitGraph.resolveNets(state.project.components, state.project.wires);

      for (const comp of state.project.components) {
        if (comp.definitionId.startsWith('led')) {
          const anodeKey = `${comp.id}:anode`;
          const cathodeKey = `${comp.id}:cathode`;
          const anodeNet = nets.get(anodeKey);
          const cathodeNet = nets.get(cathodeKey);

          // Check if anode net reaches a driving 5V/HIGH pin
          let hasHigh = false;
          let hasGnd = false;

          if (anodeNet) {
            for (const member of anodeNet) {
              if (voltages[member] > 2.5) hasHigh = true;
            }
          }
          if (cathodeNet) {
            for (const member of cathodeNet) {
              if (voltages[member] === 0.0 || member.includes('GND') || member.includes('minus')) hasGnd = true;
            }
          }

          comp.state = {
            ...comp.state,
            illuminated: hasHigh && hasGnd,
          };
        }

        // Update Servo Angle
        if (comp.definitionId === 'servo-sg90') {
          const angle = arduinoRunner.servoAngles.get('D9') ?? comp.properties.angle ?? 90;
          comp.state = { ...comp.state, currentAngle: angle };
        }

        // Update LCD lines
        if (comp.definitionId === 'lcd-1602-i2c') {
          comp.state = { ...comp.state, ...arduinoRunner.lcdLines };
        }

        // Update Buzzer state
        if (comp.definitionId === 'piezo-buzzer') {
          comp.state = {
            ...comp.state,
            isPlaying: audioManager.getFrequency() > 0,
            frequency: audioManager.getFrequency(),
          };
        }
      }

      state.simulation.pinVoltages = voltages;
      state.simulation.serialOutput = [...arduinoRunner.getSerialOutput()];
      notify();
    }, tickMs);

    notify();
  },

  stopSimulation: () => {
    state.simulation.isRunning = false;
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
    audioManager.stopTone();

    // Turn off active states
    for (const comp of state.project.components) {
      if (comp.state) {
        comp.state.illuminated = false;
        comp.state.isPlaying = false;
      }
    }
    notify();
  },

  setSimulationSpeed: (speed: number) => {
    state.simulation.speed = speed;
    notify();
  },
};

export function useCircuitStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return circuitStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  return circuitStore.getState();
}
