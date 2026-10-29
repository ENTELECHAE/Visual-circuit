export type ComponentCategory = 
  | 'microcontroller' 
  | 'breadboard' 
  | 'led' 
  | 'passive' 
  | 'sensor' 
  | 'actuator' 
  | 'display' 
  | 'power' 
  | 'input'
  | 'output'
  | 'logic'
  | 'communication';

export type PinType = 
  | 'power' 
  | 'ground' 
  | 'digital' 
  | 'analog' 
  | 'pwm' 
  | 'i2c' 
  | 'uart' 
  | 'spi' 
  | 'passive';

export interface PinDefinition {
  id: string;
  label: string;
  type: PinType;
  x: number; // coordinate offset relative to component origin (px)
  y: number; // coordinate offset relative to component origin (px)
  description?: string;
  voltage?: number; // nominal voltage e.g. 5, 3.3
}

export interface ComponentDefinition {
  id: string;
  label: string;
  category: ComponentCategory;
  description: string;
  width: number;
  height: number;
  pins: PinDefinition[];
  defaultProperties?: Record<string, any>;
  datasheet?: string;
}

export interface PlacedComponent {
  id: string;
  definitionId: string;
  label: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  properties: Record<string, any>;
  state?: Record<string, any>; // e.g. led illuminated: true/false, servo angle: 90, etc.
}

export interface Wire {
  id: string;
  color: string;
  from: {
    componentId: string;
    pinId: string;
  };
  to: {
    componentId: string;
    pinId: string;
  };
}

export interface CircuitProject {
  id: string;
  name: string;
  description?: string;
  board: string;
  components: PlacedComponent[];
  wires: Wire[];
  code: string;
  createdAt: number;
  updatedAt: number;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  timeElapsedMs: number;
  speed: number; // 0.5x, 1x, 2x
  pinVoltages: Record<string, number>; // key: `${componentId}:${pinId}` -> voltage
  pinModes: Record<string, 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'>;
  serialOutput: string[];
  serialBaud: number;
}

export type ViewMode = '2d' | '3d' | 'schematic';

