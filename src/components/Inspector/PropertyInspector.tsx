import React from 'react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { COMPONENT_CATALOG } from '../../simulation/componentCatalog';
import { Sliders, Trash2, RotateCw } from 'lucide-react';

export const PropertyInspector: React.FC = () => {
  const store = useCircuitStore();
  const selectedComp = store.project.components.find((c) => c.id === store.selectedComponentId);

  if (!selectedComp) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-500 bg-studio-panel border-l border-studio-border">
        <Sliders size={28} className="text-stone-600 mb-2" />
        <p className="text-xs font-mono">No component selected</p>
        <p className="text-[11px] text-stone-600 mt-1">
          Click any component on the canvas to inspect and edit its properties.
        </p>
      </div>
    );
  }

  const def = COMPONENT_CATALOG.find((d) => d.id === selectedComp.definitionId);

  return (
    <div className="h-full flex flex-col bg-studio-panel border-l border-studio-border text-stone-200 overflow-y-auto">
      {/* HEADER */}
      <div className="h-10 px-3 bg-studio-panel border-b border-studio-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-studio-accent" />
          <span className="font-semibold text-xs font-mono text-stone-200 truncate">
            {selectedComp.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => circuitStore.rotateComponent(selectedComp.id)}
            className="p-1 text-stone-400 hover:text-studio-accent rounded hover:bg-studio-subtle"
            title="Rotate 90°"
          >
            <RotateCw size={13} />
          </button>
          <button
            onClick={() => circuitStore.deleteComponent(selectedComp.id)}
            className="p-1 text-stone-400 hover:text-red-400 rounded hover:bg-studio-subtle"
            title="Delete component"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* COMPONENT INFO */}
      <div className="p-3 border-b border-studio-border/60">
        <div className="text-[10px] font-mono text-studio-accent uppercase tracking-wider mb-1">
          {def?.category || 'Component'}
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">{def?.description}</p>
      </div>

      {/* DYNAMIC PROPERTIES CONTROLS */}
      <div className="p-3 space-y-4 flex-1">
        {/* 1. RESISTOR PROPERTIES */}
        {selectedComp.definitionId.startsWith('resistor') && (
          <div className="space-y-2">
            <label className="text-xs font-mono text-stone-300 block">Resistance (Ω)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={selectedComp.properties.resistance || 220}
                onChange={(e) =>
                  circuitStore.updateComponentProperty(
                    selectedComp.id,
                    'resistance',
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                className="w-full bg-studio-dark border border-studio-border rounded-lg px-3 py-1.5 text-xs font-mono text-stone-100 focus:outline-none focus:border-studio-accent"
              />
            </div>
            {/* Color Band Preview */}
            <div className="bg-studio-dark p-2 rounded-lg border border-studio-border text-[10px] font-mono text-stone-400 flex items-center justify-between">
              <span>Bands:</span>
              <div className="flex gap-1">
                <span className="w-2.5 h-4 bg-red-600 rounded-xs" title="Red (2)" />
                <span className="w-2.5 h-4 bg-red-600 rounded-xs" title="Red (2)" />
                <span className="w-2.5 h-4 bg-amber-900 rounded-xs" title="Brown (x10)" />
                <span className="w-2.5 h-4 bg-amber-400 rounded-xs" title="Gold (±5%)" />
              </div>
            </div>
          </div>
        )}

        {/* 2. LED PROPERTIES */}
        {def?.category === 'led' && (
          <div className="space-y-2">
            <label className="text-xs font-mono text-stone-300 block">LED Color</label>
            <div className="flex gap-2">
              {[
                { label: 'Red', color: '#EF4444' },
                { label: 'Green', color: '#22C55E' },
                { label: 'Blue', color: '#3B82F6' },
                { label: 'Yellow', color: '#EAB308' },
                { label: 'Orange', color: '#F97316' },
                { label: 'White', color: '#F8FAFC' },
              ].map((item) => (
                <button
                  key={item.color}
                  onClick={() => circuitStore.updateComponentProperty(selectedComp.id, 'color', item.color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${
                    selectedComp.properties.color === item.color
                      ? 'border-white scale-110 ring-2 ring-studio-accent'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. POTENTIOMETER PROPERTIES */}
        {selectedComp.definitionId === 'potentiometer' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-300">Wiper Position</span>
              <span className="text-studio-accent font-bold">
                {selectedComp.properties.value ?? 50}% (
                {(((selectedComp.properties.value ?? 50) / 100) * 5).toFixed(2)}V)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedComp.properties.value ?? 50}
              onChange={(e) =>
                circuitStore.updateComponentProperty(
                  selectedComp.id,
                  'value',
                  parseInt(e.target.value, 10)
                )
              }
              className="w-full accent-studio-accent cursor-pointer"
            />
          </div>
        )}

        {/* 4. ULTRASONIC DISTANCE PROPERTIES */}
        {selectedComp.definitionId === 'hc-sr04' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-300">Target Distance</span>
              <span className="text-studio-accent font-bold">
                {selectedComp.properties.distanceCm ?? 40} cm
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="400"
              value={selectedComp.properties.distanceCm ?? 40}
              onChange={(e) =>
                circuitStore.updateComponentProperty(
                  selectedComp.id,
                  'distanceCm',
                  parseInt(e.target.value, 10)
                )
              }
              className="w-full accent-studio-accent cursor-pointer"
            />
          </div>
        )}

        {/* 5. SERVO MOTOR PROPERTIES */}
        {selectedComp.definitionId === 'servo-sg90' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-300">Target Angle</span>
              <span className="text-studio-accent font-bold">
                {selectedComp.state?.currentAngle ?? selectedComp.properties.angle ?? 90}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={selectedComp.state?.currentAngle ?? selectedComp.properties.angle ?? 90}
              onChange={(e) =>
                circuitStore.updateComponentProperty(
                  selectedComp.id,
                  'angle',
                  parseInt(e.target.value, 10)
                )
              }
              className="w-full accent-studio-accent cursor-pointer"
            />
          </div>
        )}

        {/* 6. PUSH BUTTON PROPERTIES */}
        {selectedComp.definitionId === 'push-button' && (
          <div className="space-y-2">
            <label className="text-xs font-mono text-stone-300 block">Tactile State</label>
            <button
              onClick={() => {
                const curr = selectedComp.properties.isPressed;
                circuitStore.updateComponentProperty(selectedComp.id, 'isPressed', !curr);
              }}
              className={`w-full py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                selectedComp.properties.isPressed
                  ? 'bg-studio-accent text-white shadow-md'
                  : 'bg-studio-dark border border-studio-border text-stone-300 hover:bg-studio-subtle'
              }`}
            >
              {selectedComp.properties.isPressed ? 'Pressed (Connected to GND)' : 'Released (Open)'}
            </button>
          </div>
        )}

        {/* PIN REFERENCE LIST */}
        <div className="pt-2 border-t border-studio-border/60">
          <label className="text-xs font-mono text-stone-400 block mb-2">Pin Connections</label>
          <div className="space-y-1">
            {def?.pins.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-[11px] font-mono bg-studio-dark/60 px-2 py-1 rounded border border-studio-border/40"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-stone-200">{p.label}</span>
                </div>
                <span className="text-[10px] text-stone-400 uppercase">{p.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

