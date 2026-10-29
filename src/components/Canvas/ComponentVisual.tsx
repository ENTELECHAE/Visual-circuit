import React from 'react';
import { PlacedComponent, PinDefinition } from '../../types/circuit';
import { COMPONENT_CATALOG } from '../../simulation/componentCatalog';

interface ComponentVisualProps {
  component: PlacedComponent;
  isSelected: boolean;
  onPinMouseDown: (pinDef: PinDefinition, e: React.MouseEvent) => void;
  onPinMouseEnter: (pinDef: PinDefinition) => void;
  onPinMouseLeave: () => void;
}

export const ComponentVisual: React.FC<ComponentVisualProps> = ({
  component,
  isSelected,
  onPinMouseDown,
  onPinMouseEnter,
  onPinMouseLeave,
}) => {
  const def = COMPONENT_CATALOG.find((c) => c.id === component.definitionId);
  if (!def) return null;

  const isIlluminated = Boolean(component.state?.illuminated);
  const servoAngle = component.state?.currentAngle ?? component.properties.angle ?? 90;

  return (
    <div
      style={{
        position: 'relative',
        width: `${def.width}px`,
        height: `${def.height}px`,
        transform: `rotate(${component.rotation}deg)`,
        transformOrigin: 'center center',
        userSelect: 'none',
        outline: isSelected ? '2px solid #ffffff' : 'none',
        borderRadius: '6px',
        boxShadow: isSelected ? '0 0 0 4px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {/* 1. ARDUINO UNO R3 & MEGA 2560 */}
      {(def.id === 'arduino-uno' || def.id === 'arduino-mega') && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#008184',
            borderRadius: '8px',
            border: '2px solid #005f61',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Silkscreen text */}
          <div style={{ position: 'absolute', top: 28, left: 45, fontSize: '10px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            {def.id === 'arduino-mega' ? 'ARDUINO MEGA 2560' : 'ARDUINO UNO R3'}
          </div>
          <div style={{ position: 'absolute', bottom: 18, left: 55, fontSize: '8px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
            VISUAL CIRCUITS
          </div>

          {/* USB-B Port */}
          <div style={{ position: 'absolute', top: 4, left: 6, width: 38, height: 50, backgroundColor: '#c4c4c4', borderRadius: '3px', border: '2px solid #8e8e8e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 18, height: 26, backgroundColor: '#333333', borderRadius: '2px' }} />
          </div>

          {/* DC Power Jack */}
          <div style={{ position: 'absolute', bottom: 4, left: 6, width: 44, height: 38, backgroundColor: '#18181b', borderRadius: '3px', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27272a' }} />
          </div>

          {/* Main MCU Chip */}
          <div style={{ position: 'absolute', top: 68, left: 105, width: def.id === 'arduino-mega' ? 52 : 110, height: def.id === 'arduino-mega' ? 52 : 30, backgroundColor: '#18181b', borderRadius: '2px', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
            <span style={{ fontSize: '7px', color: '#a1a1aa', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', fontWeight: 600 }}>
              {def.id === 'arduino-mega' ? 'ATmega2560' : 'ATMEGA328P-PU'}
            </span>
          </div>

          {/* Crystal Oscillator */}
          <div style={{ position: 'absolute', top: 52, left: 60, width: 22, height: 10, backgroundColor: '#d4d4d8', borderRadius: '4px', border: '1px solid #a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '5px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>16.000</span>
          </div>

          {/* Pin 13 Built-in LED */}
          <div style={{ position: 'absolute', top: 38, left: 115, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: isIlluminated ? '#facc15' : '#713f12',
                border: '1px solid #854d0e',
                boxShadow: isIlluminated ? '0 0 12px #facc15, 0 0 4px #ffffff' : 'none',
                transition: 'all 0.1s ease',
              }}
            />
            <span style={{ fontSize: '8px', color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>L</span>
          </div>

          {/* Reset Button */}
          <div style={{ position: 'absolute', top: 10, right: 14, width: 14, height: 14, backgroundColor: '#b91c1c', borderRadius: '3px', border: '1px solid #7f1d1d' }} />

          {/* Top Pin Header Strip */}
          <div style={{ position: 'absolute', top: 6, left: 68, right: 12, height: 16, backgroundColor: '#18181b', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} style={{ width: 4, height: 4, backgroundColor: '#3f3f46', borderRadius: '1px' }} />
            ))}
          </div>

          {/* Bottom Pin Header Strip */}
          <div style={{ position: 'absolute', bottom: 6, left: 96, right: 12, height: 16, backgroundColor: '#18181b', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{ width: 4, height: 4, backgroundColor: '#3f3f46', borderRadius: '1px' }} />
            ))}
          </div>
        </div>
      )}

      {/* 2. ESP32 DEVKIT */}
      {def.id.startsWith('esp32') && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#18181b',
            borderRadius: '6px',
            border: '2px solid #27272a',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {/* Metal RF Shield */}
          <div style={{ position: 'absolute', top: 24, left: 14, right: 14, height: 44, backgroundColor: '#e4e4e7', borderRadius: '3px', border: '1px solid #a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '8px', color: '#27272a', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              ESP-WROOM-32
            </span>
          </div>

          {/* Micro-USB Port */}
          <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', width: 20, height: 12, backgroundColor: '#c4c4c4', borderRadius: '2px', border: '1px solid #71717a' }} />

          {/* Silkscreen text */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: '7.5px', color: '#a1a1aa', fontFamily: 'var(--font-mono)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            ESP32 DEVKIT
          </div>
        </div>
      )}

      {/* 3. BREADBOARD (HALF & FULL) */}
      {(def.id === 'breadboard-half' || def.id === 'breadboard-full') && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f4ed',
            borderRadius: '6px',
            border: '2px solid #d4d0c4',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Power Rail Lines */}
          <div style={{ position: 'absolute', top: 16, left: 20, right: 20, height: 2, backgroundColor: '#ef4444' }} />
          <div style={{ position: 'absolute', top: 38, left: 20, right: 20, height: 2, backgroundColor: '#3b82f6' }} />
          <div style={{ position: 'absolute', bottom: 38, left: 20, right: 20, height: 2, backgroundColor: '#ef4444' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, height: 2, backgroundColor: '#3b82f6' }} />

          {/* Center Dividing Channel */}
          <div style={{ position: 'absolute', top: '50%', left: 16, right: 16, height: 8, transform: 'translateY(-50%)', backgroundColor: '#e2dfd2', borderRadius: '2px', border: '1px solid #cdc9ba' }} />

          {/* Tie Point Hole Visuals */}
          <div style={{ position: 'absolute', top: 52, bottom: 52, left: 24, right: 24, display: 'grid', gridTemplateColumns: `repeat(${def.id === 'breadboard-full' ? 63 : 30}, 1fr)`, gridTemplateRows: 'repeat(10, 1fr)', gap: '2px', pointerEvents: 'none' }}>
            {Array.from({ length: (def.id === 'breadboard-full' ? 63 : 30) * 10 }).map((_, i) => (
              <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#a8a29e', margin: 'auto' }} />
            ))}
          </div>
        </div>
      )}

      {/* 4. LED (STANDARD 5MM) */}
      {def.id.startsWith('led-') && def.id !== 'led-rgb' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: isIlluminated
                ? def.defaultProperties?.color || '#ef4444'
                : `${def.defaultProperties?.color || '#ef4444'}44`,
              border: `2px solid ${def.defaultProperties?.color || '#ef4444'}`,
              boxShadow: isIlluminated
                ? `0 0 20px ${def.defaultProperties?.color || '#ef4444'}, 0 0 40px ${def.defaultProperties?.color || '#ef4444'}88`
                : 'none',
              transition: 'all 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: isIlluminated ? '#ffffff' : 'rgba(255,255,255,0.2)' }} />
          </div>
          {/* Wire Leads */}
          <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
            <div style={{ width: 3, height: 26, backgroundColor: '#a1a1aa', borderRadius: '1px' }} />
            <div style={{ width: 3, height: 26, backgroundColor: '#71717a', borderRadius: '1px' }} />
          </div>
        </div>
      )}

      {/* 5. RGB LED */}
      {def.id === 'led-rgb' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: isIlluminated ? '#f43f5e' : 'rgba(255,255,255,0.15)',
              border: '2px solid #a1a1aa',
              boxShadow: isIlluminated ? '0 0 24px #f43f5e, 0 0 8px #ffffff' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff', opacity: 0.8 }} />
          </div>
          {/* 4 wire leads */}
          <div style={{ display: 'flex', gap: 9, marginTop: 4 }}>
            <div style={{ width: 2.5, height: 24, backgroundColor: '#ef4444' }} />
            <div style={{ width: 2.5, height: 26, backgroundColor: '#71717a' }} />
            <div style={{ width: 2.5, height: 24, backgroundColor: '#22c55e' }} />
            <div style={{ width: 2.5, height: 24, backgroundColor: '#3b82f6' }} />
          </div>
        </div>
      )}

      {/* 6. RESISTORS */}
      {def.id.startsWith('resistor') && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
          {/* Left Wire Lead */}
          <div style={{ flex: 1, height: 3, backgroundColor: '#a1a1aa' }} />
          {/* Resistor Body */}
          <div
            style={{
              width: 52,
              height: 20,
              backgroundColor: '#d8b688',
              borderRadius: '5px',
              border: '1px solid #b8976b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            {def.id === 'resistor-220' && (
              <>
                <div style={{ width: 4, height: '100%', backgroundColor: '#ef4444' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#ef4444' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#92400e' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#d97706' }} />
              </>
            )}
            {def.id === 'resistor-1k' && (
              <>
                <div style={{ width: 4, height: '100%', backgroundColor: '#92400e' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#18181b' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#ef4444' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#d97706' }} />
              </>
            )}
            {def.id === 'resistor-10k' && (
              <>
                <div style={{ width: 4, height: '100%', backgroundColor: '#92400e' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#18181b' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#ea580c' }} />
                <div style={{ width: 4, height: '100%', backgroundColor: '#d97706' }} />
              </>
            )}
          </div>
          {/* Right Wire Lead */}
          <div style={{ flex: 1, height: 3, backgroundColor: '#a1a1aa' }} />
        </div>
      )}

      {/* 7. CERAMIC CAPACITOR */}
      {def.id === 'capacitor-ceramic' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#ea580c', border: '2px solid #c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
            <span style={{ fontSize: '8px', color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>104</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            <div style={{ width: 2.5, height: 20, backgroundColor: '#a1a1aa' }} />
            <div style={{ width: 2.5, height: 20, backgroundColor: '#a1a1aa' }} />
          </div>
        </div>
      )}

      {/* 8. DIODE 1N4007 */}
      {def.id === 'diode-1n4007' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <div style={{ flex: 1, height: 3, backgroundColor: '#a1a1aa' }} />
          <div style={{ width: 44, height: 18, backgroundColor: '#18181b', borderRadius: '3px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', right: 6, top: 0, bottom: 0, width: 6, backgroundColor: '#e4e4e7' }} />
            <span style={{ fontSize: '7px', color: '#71717a', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>1N4007</span>
          </div>
          <div style={{ flex: 1, height: 3, backgroundColor: '#a1a1aa' }} />
        </div>
      )}

      {/* 9. NPN TRANSISTOR TO-92 */}
      {def.id === 'transistor-2n2222' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 36, height: 24, borderTopLeftRadius: '18px', borderTopRightRadius: '18px', backgroundColor: '#18181b', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '7px', color: '#a1a1aa', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>2N2222</span>
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 2 }}>
            <div style={{ width: 2.5, height: 22, backgroundColor: '#a1a1aa' }} />
            <div style={{ width: 2.5, height: 22, backgroundColor: '#a1a1aa' }} />
            <div style={{ width: 2.5, height: 22, backgroundColor: '#a1a1aa' }} />
          </div>
        </div>
      )}

      {/* 10. POTENTIOMETER */}
      {def.id === 'potentiometer' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#1f2937', borderRadius: '50%', border: '2px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#111827', border: '1px solid #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 4, height: 12, backgroundColor: '#3b82f6', borderRadius: '2px', transform: `rotate(${(component.properties?.value ?? 50) * 2.7 - 135}deg)`, transformOrigin: 'bottom center' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 4, fontSize: '8px', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>10k</div>
        </div>
      )}

      {/* 11. PUSHBUTTON */}
      {def.id === 'push-button' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#27272a', borderRadius: '6px', border: '2px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', top: 4, left: 4, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#71717a' }} />
          <div style={{ position: 'absolute', top: 4, right: 4, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#71717a' }} />
          <div style={{ position: 'absolute', bottom: 4, left: 4, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#71717a' }} />
          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#71717a' }} />
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: component.properties?.isPressed ? '#ffffff' : '#09090b', border: '2px solid #52525b', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)', transition: 'all 0.08s ease' }} />
        </div>
      )}

      {/* 12. SLIDE SWITCH */}
      {def.id === 'slide-switch' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#d4d4d8', borderRadius: '4px', border: '1px solid #71717a', position: 'relative', padding: '4px' }}>
          <div style={{ width: '100%', height: 16, backgroundColor: '#18181b', borderRadius: '2px', position: 'relative' }}>
            <div style={{ width: 14, height: 14, backgroundColor: '#e4e4e7', borderRadius: '2px', position: 'absolute', top: 1, left: component.properties?.position === 2 ? 38 : 6, transition: 'left 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 4 }}>
            <span style={{ fontSize: '7px', color: '#18181b', fontFamily: 'var(--font-mono)' }}>1</span>
            <span style={{ fontSize: '7px', color: '#18181b', fontFamily: 'var(--font-mono)' }}>COM</span>
            <span style={{ fontSize: '7px', color: '#18181b', fontFamily: 'var(--font-mono)' }}>2</span>
          </div>
        </div>
      )}

      {/* 13. HC-SR04 ULTRASONIC */}
      {def.id === 'hc-sr04' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#1e3a8a', borderRadius: '6px', border: '2px solid #1e40af', position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', top: 8, left: 14, width: 44, height: 44, borderRadius: '50%', backgroundColor: '#c4c4c4', border: '3px solid #8e8e8e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '7px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>T</span>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 8, right: 14, width: 44, height: 44, borderRadius: '50%', backgroundColor: '#c4c4c4', border: '3px solid #8e8e8e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '7px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>R</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', fontSize: '8px', color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            HC-SR04
          </div>
        </div>
      )}

      {/* 14. DHT11 / DHT22 SENSORS */}
      {(def.id === 'dht11' || def.id === 'dht22') && (
        <div style={{ width: '100%', height: '100%', backgroundColor: def.id === 'dht11' ? '#0284c7' : '#f4f4f5', borderRadius: '6px', border: `2px solid ${def.id === 'dht11' ? '#0369a1' : '#d4d4d8'}`, position: 'relative', overflow: 'hidden', padding: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, marginTop: 4 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 10, backgroundColor: def.id === 'dht11' ? '#075985' : '#a1a1aa', borderRadius: '1px' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: '8px', fontWeight: 700, color: def.id === 'dht11' ? '#ffffff' : '#18181b', fontFamily: 'var(--font-mono)' }}>
            {def.id.toUpperCase()}
          </div>
        </div>
      )}

      {/* 15. LDR PHOTORESISTOR */}
      {def.id === 'ldr-gl5528' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#ea580c', border: '2px solid #9a3412', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Serpentine track */}
            <div style={{ width: 22, height: 22, border: '2px dashed #fed7aa', borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            <div style={{ width: 2.5, height: 20, backgroundColor: '#a1a1aa' }} />
            <div style={{ width: 2.5, height: 20, backgroundColor: '#a1a1aa' }} />
          </div>
        </div>
      )}

      {/* 16. PIR HC-SR501 SENSOR */}
      {def.id === 'pir-hc-sr501' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#15803d', borderRadius: '6px', border: '2px solid #166534', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Fresnel Lens Dome */}
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f4f4f5', border: '2px solid #d4d4d8', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px dashed #a1a1aa' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 4, left: 8, fontSize: '7px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            PIR SR501
          </div>
        </div>
      )}

      {/* 17. MPU-6050 6-AXIS IMU */}
      {def.id === 'mpu6050' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#0284c7', borderRadius: '4px', border: '1px solid #0369a1', position: 'relative', padding: '6px' }}>
          {/* QFN IC Chip */}
          <div style={{ width: 26, height: 26, backgroundColor: '#18181b', borderRadius: '2px', border: '1px solid #e0e7ff', position: 'absolute', top: 10, left: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '5px', color: '#e0e7ff', fontFamily: 'var(--font-mono)' }}>MPU</span>
          </div>
          <div style={{ position: 'absolute', bottom: 18, left: 6, fontSize: '7px', color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            GY-521 MPU-6050
          </div>
        </div>
      )}

      {/* 18. MICRO SERVO SG90 */}
      {def.id === 'servo-sg90' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#1d4ed8', borderRadius: '6px', border: '2px solid #1e40af', position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.4)' }}>
          {/* Servo Spline Shaft */}
          <div style={{ position: 'absolute', top: 16, left: 24, width: 28, height: 28, borderRadius: '50%', backgroundColor: '#ffffff', border: '2px solid #d4d4d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2563eb' }} />
          </div>
          {/* Rotating Horn */}
          <div
            style={{
              position: 'absolute',
              top: 27,
              left: 36,
              width: 55,
              height: 7,
              backgroundColor: '#f4f4f5',
              borderRadius: '3px',
              border: '1px solid #d4d4d8',
              transform: `rotate(${servoAngle}deg)`,
              transformOrigin: '0% 50%',
              transition: 'transform 0.15s ease-out',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          />
          <div style={{ position: 'absolute', bottom: 18, left: 14, fontSize: '9px', color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            TOWER PRO SG90
          </div>
        </div>
      )}

      {/* 19. PIEZO BUZZER */}
      {def.id === 'piezo-buzzer' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#18181b', borderRadius: '50%', border: '2px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 6px 18px rgba(0,0,0,0.4)' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#09090b', border: '1px solid #27272a' }} />
          <div style={{ position: 'absolute', top: 8, right: 14, fontSize: '10px', color: '#ef4444', fontWeight: 800 }}>+</div>
        </div>
      )}

      {/* 20. 5V RELAY MODULE */}
      {def.id === 'relay-module' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#15803d', borderRadius: '6px', border: '1px solid #166534', position: 'relative', padding: '6px' }}>
          {/* Blue Songle Cube */}
          <div style={{ position: 'absolute', top: 12, left: 32, width: 44, height: 50, backgroundColor: '#1d4ed8', borderRadius: '3px', border: '1px solid #1e40af', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '6px', color: '#ffffff', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>SONGLE</span>
            <span style={{ fontSize: '5px', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>10A 250VAC</span>
          </div>
        </div>
      )}

      {/* 21. I2C LCD 1602 */}
      {def.id === 'lcd-1602-i2c' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#15803d', borderRadius: '6px', border: '2px solid #166534', position: 'relative', overflow: 'hidden', padding: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ width: '85%', height: '70%', backgroundColor: '#1e3a8a', borderRadius: '4px', border: '2px solid #172554', margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12px', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: '11px', color: '#93c5fd', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 600 }}>
              {component.properties.line1 || 'Visual Circuits'}
            </div>
            <div style={{ fontSize: '11px', color: '#93c5fd', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 600, marginTop: '2px' }}>
              {component.properties.line2 || 'Ready...'}
            </div>
          </div>
        </div>
      )}

      {/* 22. 7-SEGMENT DISPLAY */}
      {def.id === '7seg-display' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#18181b', borderRadius: '4px', border: '2px solid #27272a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 72, position: 'relative' }}>
            {/* Top 'a' */}
            <div style={{ position: 'absolute', top: 2, left: 6, right: 6, height: 5, backgroundColor: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            {/* Top right 'b' */}
            <div style={{ position: 'absolute', top: 8, right: 2, width: 5, height: 26, backgroundColor: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            {/* Bottom right 'c' */}
            <div style={{ position: 'absolute', bottom: 8, right: 2, width: 5, height: 26, backgroundColor: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            {/* Bottom 'd' */}
            <div style={{ position: 'absolute', bottom: 2, left: 6, right: 6, height: 5, backgroundColor: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            {/* Bottom left 'e' */}
            <div style={{ position: 'absolute', bottom: 8, left: 2, width: 5, height: 26, backgroundColor: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            {/* Top left 'f' */}
            <div style={{ position: 'absolute', top: 8, left: 2, width: 5, height: 26, backgroundColor: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            {/* Middle 'g' */}
            <div style={{ position: 'absolute', top: 33, left: 6, right: 6, height: 5, backgroundColor: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            {/* Decimal point 'dp' */}
            <div style={{ position: 'absolute', bottom: 2, right: -6, width: 5, height: 5, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          </div>
        </div>
      )}

      {/* 23. IC DIL PACKAGES (NE555, 74HC595, ETC.) */}
      {(def.id === 'ne555' || def.id.includes('shift-register') || def.id.startsWith('ic-')) && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#18181b', borderRadius: '3px', border: '1px solid #3f3f46', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          {/* Pin 1 notch */}
          <div style={{ position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)', width: 6, height: 10, borderRadius: '0 5px 5px 0', backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
          <span style={{ fontSize: '8px', color: '#e4e4e7', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em' }}>
            {def.id.toUpperCase()}
          </span>
        </div>
      )}

      {/* 24. 9V BATTERY */}
      {def.id === 'battery-9v' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#18181b', borderRadius: '6px', border: '2px solid #27272a', position: 'relative', overflow: 'hidden' }}>
          {/* Gold header */}
          <div style={{ height: 32, backgroundColor: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#e4e4e7', border: '2px solid #71717a' }} />
            <div style={{ width: 18, height: 18, borderRadius: '3px', backgroundColor: '#e4e4e7', border: '2px solid #71717a' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 20, left: 10, right: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>9 VOLT</div>
            <div style={{ fontSize: '8px', color: '#a1a1aa', fontFamily: 'var(--font-mono)' }}>ALKALINE</div>
          </div>
        </div>
      )}

      {/* 25. ANALOG JOYSTICK */}
      {def.id === 'joystick-ky-023' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#0284c7', borderRadius: '6px', border: '2px solid #0369a1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Thumbstick base */}
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#18181b', border: '3px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: '7px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>JOYSTICK</div>
        </div>
      )}

      {/* 26. ROTARY ENCODER */}
      {def.id === 'rotary-encoder-ky-040' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#15803d', borderRadius: '4px', border: '1px solid #166534', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Metal D-shaft */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#c4c4c4', border: '2px solid #8e8e8e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#18181b' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: '7px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>KY-040</div>
        </div>
      )}

      {/* 27. UNIVERSAL GENERIC FALLBACK (Guarantees EVERY catalog component is 100% visible!) */}
      {![
        'arduino-uno', 'arduino-mega', 'esp32-devkit',
        'breadboard-half', 'breadboard-full',
        'capacitor-ceramic', 'diode-1n4007', 'transistor-2n2222',
        'potentiometer', 'push-button', 'slide-switch',
        'hc-sr04', 'dht11', 'dht22', 'ldr-gl5528', 'pir-hc-sr501', 'mpu6050',
        'servo-sg90', 'piezo-buzzer', 'relay-module', 'lcd-1602-i2c', '7seg-display',
        'ne555', 'battery-9v', 'joystick-ky-023', 'rotary-encoder-ky-040'
      ].includes(def.id) &&
        !def.id.startsWith('led-') &&
        !def.id.startsWith('resistor-') &&
        !def.id.startsWith('esp32') &&
        !def.id.includes('shift-register') &&
        !def.id.startsWith('ic-') && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#18181b',
            borderRadius: '6px',
            border: '2px solid #27272a',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}
        >
          {/* Silkscreen component label */}
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#fafafa', fontFamily: 'var(--font-mono)', textAlign: 'center', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {def.label}
          </div>
          <div style={{ fontSize: '7.5px', color: '#71717a', fontFamily: 'var(--font-mono)', marginTop: '2px', textTransform: 'uppercase' }}>
            {def.category}
          </div>
        </div>
      )}

      {/* PINS & TERMINALS OVERLAY (Snappable Pin Targets) */}
      {def.pins.map((pin) => (
        <button
          key={pin.id}
          type="button"
          style={{
            position: 'absolute',
            left: `${pin.x}px`,
            top: `${pin.y}px`,
            width: 11,
            height: 11,
            borderRadius: '50%',
            backgroundColor: '#18181b',
            border: pin.type === 'power' ? '2px solid #ef4444' : pin.type === 'ground' ? '2px solid #71717a' : '2px solid #facc15',
            cursor: 'crosshair',
            zIndex: 20,
            transform: 'translate(-50%, -50%)',
            outline: 'none',
            padding: 0,
            transition: 'transform 0.12s ease, background-color 0.12s ease',
          }}
          title={`${pin.label} (${pin.type})${pin.description ? ` — ${pin.description}` : ''}`}
          onMouseDown={(e) => onPinMouseDown(pin, e)}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.4)';
            (e.target as HTMLElement).style.backgroundColor = '#ffffff';
            onPinMouseEnter(pin);
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)';
            (e.target as HTMLElement).style.backgroundColor = '#18181b';
            onPinMouseLeave();
          }}
        />
      ))}
    </div>
  );
};
