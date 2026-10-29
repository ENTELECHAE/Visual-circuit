import { Wire, PlacedComponent, PinDefinition } from '../types/circuit';
import { COMPONENT_CATALOG } from './componentCatalog';

export interface PinAnchor {
  componentId: string;
  pinId: string;
  pinDef: PinDefinition;
  worldX: number;
  worldY: number;
}

export class CircuitGraph {
  /**
   * Determine default wire color based on the pin characteristics.
   */
  static getWireColorForPin(pinDef?: PinDefinition): string {
    if (!pinDef) return '#3B82F6'; // Default Blue
    const label = pinDef.label.toUpperCase();
    const id = pinDef.id.toUpperCase();

    if (pinDef.type === 'power' || id.includes('5V') || id.includes('3V3') || id.includes('VCC') || label === '+') {
      return '#EF4444'; // Red
    }
    if (pinDef.type === 'ground' || id.includes('GND') || label === '-') {
      return '#1F2937'; // Black
    }
    if (pinDef.type === 'i2c' || id.includes('SDA') || id.includes('SCL')) {
      return '#EAB308'; // Yellow
    }
    if (pinDef.type === 'uart' || id.includes('TX') || id.includes('RX')) {
      return '#10B981'; // Green
    }
    if (pinDef.type === 'analog' || id.startsWith('A')) {
      return '#8B5CF6'; // Purple
    }
    if (pinDef.type === 'pwm') {
      return '#F97316'; // Orange
    }
    return '#3B82F6'; // Vibrant Blue
  }

  /**
   * Calculate absolute world coordinate of a pin on a placed component.
   */
  static getPinWorldPos(comp: PlacedComponent, pinDef: PinDefinition): { x: number; y: number } {
    const rad = (comp.rotation * Math.PI) / 180;
    const def = COMPONENT_CATALOG.find((c) => c.id === comp.definitionId);
    const originX = (def?.width ?? 60) / 2;
    const originY = (def?.height ?? 60) / 2;

    const relX = pinDef.x - originX;
    const relY = pinDef.y - originY;

    const rotX = relX * Math.cos(rad) - relY * Math.sin(rad);
    const rotY = relX * Math.sin(rad) + relY * Math.cos(rad);

    return {
      x: comp.x + originX + rotX,
      y: comp.y + originY + rotY,
    };
  }

  /**
   * Find internal breadboard peer pins that are electrically bridged.
   */
  static getInternalConnections(comp: PlacedComponent): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];

    // 1. Passive Components Conduction
    if (comp.definitionId.startsWith('resistor')) {
      pairs.push(['pin1', 'pin2']);
      return pairs;
    }
    if (comp.definitionId.startsWith('diode')) {
      pairs.push(['anode', 'cathode']);
      return pairs;
    }
    if (comp.definitionId === 'push-button' && comp.properties?.isPressed) {
      pairs.push(['1a', '2a']);
      pairs.push(['1b', '2b']);
      pairs.push(['1a', '1b']);
      pairs.push(['2a', '2b']);
      return pairs;
    }
    if (comp.definitionId === 'slide-switch') {
      if (comp.properties?.position === 2) {
        pairs.push(['com', 'pin2']);
      } else {
        pairs.push(['com', 'pin1']);
      }
      return pairs;
    }

    if (!comp.definitionId.startsWith('breadboard')) return pairs;

    const numRows = comp.definitionId === 'breadboard-full' ? 63 : 30;

    // Connect rows a-b-c-d-e and f-g-h-i-j for each row (1 to numRows)
    for (let r = 1; r <= numRows; r++) {
      const topGroup = ['a', 'b', 'c', 'd', 'e'].map((c) => `tie-${r}-${c}`);
      for (let i = 0; i < topGroup.length - 1; i++) {
        pairs.push([topGroup[i], topGroup[i + 1]]);
      }

      const botGroup = ['f', 'g', 'h', 'i', 'j'].map((c) => `tie-${r}-${c}`);
      for (let i = 0; i < botGroup.length - 1; i++) {
        pairs.push([botGroup[i], botGroup[i + 1]]);
      }
    }

    // Connect power rails continuously across all columns
    for (let r = 1; r < numRows; r++) {
      pairs.push([`rail-top-plus-${r}`, `rail-top-plus-${r + 1}`]);
      pairs.push([`rail-top-minus-${r}`, `rail-top-minus-${r + 1}`]);
      pairs.push([`rail-bot-plus-${r}`, `rail-bot-plus-${r + 1}`]);
      pairs.push([`rail-bot-minus-${r}`, `rail-bot-minus-${r + 1}`]);
    }

    return pairs;
  }

  /**
   * Resolve connected electrical nets (connected sets of pins).
   */
  static resolveNets(components: PlacedComponent[], wires: Wire[]): Map<string, Set<string>> {
    // Adjacency graph: key is `${componentId}:${pinId}`
    const adj = new Map<string, Set<string>>();

    const addEdge = (u: string, v: string) => {
      if (!adj.has(u)) adj.set(u, new Set());
      if (!adj.has(v)) adj.set(v, new Set());
      adj.get(u)!.add(v);
      adj.get(v)!.add(u);
    };

    // 1. Add all jumper wires
    for (const w of wires) {
      const u = `${w.from.componentId}:${w.from.pinId}`;
      const v = `${w.to.componentId}:${w.to.pinId}`;
      addEdge(u, v);
    }

    // 2. Add internal breadboard bridges
    for (const comp of components) {
      const internalPairs = this.getInternalConnections(comp);
      for (const [p1, p2] of internalPairs) {
        addEdge(`${comp.id}:${p1}`, `${comp.id}:${p2}`);
      }
    }

    // 3. Find connected components (nets) via BFS
    const visited = new Set<string>();
    const pinToNetMap = new Map<string, Set<string>>();

    for (const node of adj.keys()) {
      if (!visited.has(node)) {
        const net = new Set<string>();
        const queue = [node];
        visited.add(node);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          net.add(curr);
          const neighbors = adj.get(curr);
          if (neighbors) {
            for (const n of neighbors) {
              if (!visited.has(n)) {
                visited.add(n);
                queue.push(n);
              }
            }
          }
        }

        for (const member of net) {
          pinToNetMap.set(member, net);
        }
      }
    }

    return pinToNetMap;
  }
}

