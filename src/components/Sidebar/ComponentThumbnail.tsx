import React from 'react';

interface ComponentThumbnailProps {
  definitionId: string;
  size?: number; // width/height in px
  className?: string;
}

export const ComponentThumbnail: React.FC<ComponentThumbnailProps> = ({
  definitionId,
  size = 36,
  className = '',
}) => {
  // Render high-fidelity, recognizable vector graphic preview for each component
  const renderVisual = () => {
    // 1. ARDUINO UNO & MEGA
    if (definitionId === 'arduino-uno' || definitionId === 'arduino-mega') {
      const isMega = definitionId === 'arduino-mega';
      return (
        <svg viewBox="0 0 80 56" width="100%" height="100%">
          <defs>
            <linearGradient id="unoTeal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00979D" />
              <stop offset="100%" stopColor="#006870" />
            </linearGradient>
            <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e4e4e7" />
              <stop offset="100%" stopColor="#a1a1aa" />
            </linearGradient>
          </defs>
          {/* PCB */}
          <rect x="2" y="2" width="76" height="52" rx="4" fill="url(#unoTeal)" stroke="#005860" strokeWidth="1" />
          {/* USB Port */}
          <rect x="0" y="8" width="14" height="16" rx="1.5" fill="url(#metalGrad)" stroke="#71717a" strokeWidth="0.8" />
          <rect x="2" y="12" width="6" height="8" rx="1" fill="#0284c7" />
          {/* DC Jack */}
          <rect x="0" y="32" width="16" height="15" rx="1.5" fill="#18181b" />
          <circle cx="8" cy="39.5" r="3.5" fill="#a1a1aa" />
          <circle cx="8" cy="39.5" r="1.5" fill="#18181b" />
          {/* Top Digital Header */}
          <rect x="22" y="4" width="52" height="6" rx="1" fill="#18181b" />
          {/* Bottom Headers */}
          <rect x="22" y="46" width="22" height="6" rx="1" fill="#18181b" />
          <rect x="48" y="46" width="26" height="6" rx="1" fill="#18181b" />
          {/* ATmega328P DIP Chip */}
          <rect x="26" y="22" width="34" height="12" rx="1.5" fill="#18181b" stroke="#27272a" strokeWidth="0.5" />
          <line x1="28" y1="24" x2="58" y2="24" stroke="#52525b" strokeWidth="0.6" strokeDasharray="2,2" />
          <line x1="28" y1="32" x2="58" y2="32" stroke="#52525b" strokeWidth="0.6" strokeDasharray="2,2" />
          {/* 16MHz Crystal */}
          <rect x="18" y="24" width="4" height="8" rx="2" fill="url(#metalGrad)" />
          {/* Reset button */}
          <rect x="66" y="14" width="6" height="6" rx="1" fill="#71717a" />
          <circle cx="69" cy="17" r="1.8" fill="#ef4444" />
          {/* Text mark */}
          <text x="43" y="18" fill="#ffffff" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            {isMega ? 'MEGA' : 'UNO'}
          </text>
        </svg>
      );
    }

    // 2. ESP32 DEVKIT
    if (definitionId.startsWith('esp32')) {
      return (
        <svg viewBox="0 0 80 56" width="100%" height="100%">
          <rect x="8" y="2" width="64" height="52" rx="3" fill="#18181b" stroke="#27272a" strokeWidth="1" />
          {/* RF Shield */}
          <rect x="20" y="8" width="40" height="26" rx="2" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="0.8" />
          <text x="40" y="22" fill="#3f3f46" fontSize="5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ESP-WROOM</text>
          {/* Micro USB */}
          <rect x="32" y="46" width="16" height="8" rx="1" fill="#a1a1aa" />
          {/* Left/Right Pin Headers */}
          <rect x="10" y="6" width="4" height="44" rx="1" fill="#27272a" />
          <rect x="66" y="6" width="4" height="44" rx="1" fill="#27272a" />
        </svg>
      );
    }

    // 3. BREADBOARDS
    if (definitionId === 'breadboard-half' || definitionId === 'breadboard-full') {
      return (
        <svg viewBox="0 0 80 56" width="100%" height="100%">
          <rect x="2" y="4" width="76" height="48" rx="3" fill="#f5f3eb" stroke="#d4d0c4" strokeWidth="1" />
          {/* Rails */}
          <line x1="6" y1="10" x2="74" y2="10" stroke="#ef4444" strokeWidth="1.2" />
          <line x1="6" y1="14" x2="74" y2="14" stroke="#3b82f6" strokeWidth="1.2" />
          <line x1="6" y1="42" x2="74" y2="42" stroke="#3b82f6" strokeWidth="1.2" />
          <line x1="6" y1="46" x2="74" y2="46" stroke="#ef4444" strokeWidth="1.2" />
          {/* Center Trench */}
          <rect x="6" y="26.5" width="68" height="3" fill="#d4d0c4" />
          {/* Sockets simulation */}
          <line x1="10" y1="18" x2="70" y2="18" stroke="#18181b" strokeWidth="1" strokeDasharray="1.5,2.5" />
          <line x1="10" y1="22" x2="70" y2="22" stroke="#18181b" strokeWidth="1" strokeDasharray="1.5,2.5" />
          <line x1="10" y1="34" x2="70" y2="34" stroke="#18181b" strokeWidth="1" strokeDasharray="1.5,2.5" />
          <line x1="10" y1="38" x2="70" y2="38" stroke="#18181b" strokeWidth="1" strokeDasharray="1.5,2.5" />
        </svg>
      );
    }

    // 4. LEDS (RED, GREEN, BLUE, YELLOW, WHITE, RGB)
    if (definitionId.startsWith('led')) {
      const isRgb = definitionId === 'led-rgb';
      const color = isRgb ? '#ec4899'
        : definitionId === 'led-green' ? '#22c55e'
        : definitionId === 'led-blue' ? '#3b82f6'
        : definitionId === 'led-yellow' ? '#eab308'
        : '#ef4444';

      return (
        <svg viewBox="0 0 60 60" width="100%" height="100%">
          <defs>
            <radialGradient id={`ledGrad-${definitionId}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="40%" stopColor={color} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          {/* Leads */}
          <line x1="26" y1="34" x2="26" y2="54" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="34" y1="34" x2="34" y2="48" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
          {isRgb && (
            <>
              <line x1="22" y1="34" x2="22" y2="52" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
              <line x1="38" y1="34" x2="38" y2="52" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          {/* Bulb Dome */}
          <path
            d="M 18,30 C 18,16 42,16 42,30 L 42,32 L 18,32 Z"
            fill={`url(#ledGrad-${definitionId})`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
          />
          {/* Flange Collar */}
          <rect x="16" y="32" width="28" height="3" rx="1.5" fill={color} opacity="0.9" />
          {/* Internal Anvil / Post */}
          <path d="M 28,26 L 31,23 L 33,26 Z" fill="rgba(255,255,255,0.7)" />
        </svg>
      );
    }

    // 5. RESISTORS
    if (definitionId.startsWith('resistor')) {
      const bands = definitionId === 'resistor-220'
        ? ['#ef4444', '#ef4444', '#92400e', '#facc15']
        : definitionId === 'resistor-1k'
        ? ['#92400e', '#18181b', '#ef4444', '#facc15']
        : ['#92400e', '#18181b', '#ea580c', '#facc15'];

      return (
        <svg viewBox="0 0 70 40" width="100%" height="100%">
          {/* Lead wire */}
          <line x1="4" y1="20" x2="66" y2="20" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
          {/* Dumbbell body */}
          <rect x="18" y="12" width="34" height="16" rx="4" fill="#d8b688" stroke="#a88252" strokeWidth="0.8" />
          {/* Color bands */}
          {bands.map((bColor, idx) => (
            <rect key={idx} x={24 + idx * 6.5} y="12" width="3.2" height="16" fill={bColor} />
          ))}
        </svg>
      );
    }

    // 6. MICRO SERVO SG90
    if (definitionId === 'servo-sg90') {
      return (
        <svg viewBox="0 0 60 60" width="100%" height="100%">
          {/* Blue Body */}
          <rect x="12" y="18" width="36" height="30" rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
          {/* Mounting tabs */}
          <rect x="6" y="24" width="48" height="6" rx="1" fill="#1d4ed8" />
          <circle cx="9" cy="27" r="1.5" fill="#f4f4f5" />
          <circle cx="51" cy="27" r="1.5" fill="#f4f4f5" />
          {/* Gear output shaft */}
          <circle cx="24" cy="14" r="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
          {/* Horn */}
          <rect x="16" y="6" width="28" height="4.5" rx="2" fill="#ffffff" stroke="#a1a1aa" strokeWidth="0.6" />
          <circle cx="24" cy="8.2" r="1.5" fill="#52525b" />
        </svg>
      );
    }

    // 7. ULTRASONIC SENSOR HC-SR04
    if (definitionId === 'hc-sr04') {
      return (
        <svg viewBox="0 0 70 50" width="100%" height="100%">
          {/* Blue PCB */}
          <rect x="4" y="10" width="62" height="30" rx="3" fill="#1e3a8a" stroke="#1e40af" strokeWidth="1" />
          {/* Left/Right Metal Transducers */}
          <circle cx="22" cy="25" r="11" fill="#e4e4e7" stroke="#71717a" strokeWidth="1.2" />
          <circle cx="22" cy="25" r="8" fill="#d4d4d8" />
          <text x="22" y="27" fill="#71717a" fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">T</text>

          <circle cx="48" cy="25" r="11" fill="#e4e4e7" stroke="#71717a" strokeWidth="1.2" />
          <circle cx="48" cy="25" r="8" fill="#d4d4d8" />
          <text x="48" y="27" fill="#71717a" fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">R</text>

          {/* 4 Header pins */}
          <rect x="25" y="40" width="20" height="6" rx="1" fill="#18181b" />
        </svg>
      );
    }

    // 8. PUSH BUTTON
    if (definitionId === 'push-button') {
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          {/* 4 Leads */}
          <rect x="6" y="12" width="6" height="3" fill="#a1a1aa" />
          <rect x="6" y="35" width="6" height="3" fill="#a1a1aa" />
          <rect x="38" y="12" width="6" height="3" fill="#a1a1aa" />
          <rect x="38" y="35" width="6" height="3" fill="#a1a1aa" />
          {/* Square metal base */}
          <rect x="10" y="10" width="30" height="30" rx="4" fill="#27272a" stroke="#52525b" strokeWidth="1" />
          <rect x="13" y="13" width="24" height="24" rx="2" fill="#d4d4d8" />
          {/* Plunger */}
          <circle cx="25" cy="25" r="7" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
        </svg>
      );
    }

    // 9. POTENTIOMETER
    if (definitionId === 'potentiometer') {
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          {/* 3 terminals */}
          <rect x="14" y="40" width="4" height="7" fill="#a1a1aa" />
          <rect x="23" y="40" width="4" height="7" fill="#a1a1aa" />
          <rect x="32" y="40" width="4" height="7" fill="#a1a1aa" />
          {/* Circular Blue/Metal Body */}
          <circle cx="25" cy="23" r="17" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="1" />
          {/* Shaft knob */}
          <circle cx="25" cy="23" r="10" fill="#18181b" stroke="#71717a" strokeWidth="1" />
          {/* Pointer */}
          <line x1="25" y1="23" x2="25" y2="14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }

    // 10. SLIDE SWITCH
    if (definitionId === 'slide-switch') {
      return (
        <svg viewBox="0 0 60 40" width="100%" height="100%">
          {/* Metal base */}
          <rect x="10" y="10" width="40" height="18" rx="2" fill="#d4d4d8" stroke="#71717a" strokeWidth="1" />
          {/* Slider knob */}
          <rect x="16" y="7" width="10" height="24" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
          {/* 3 Leads */}
          <rect x="18" y="28" width="4" height="8" fill="#a1a1aa" />
          <rect x="28" y="28" width="4" height="8" fill="#a1a1aa" />
          <rect x="38" y="28" width="4" height="8" fill="#a1a1aa" />
        </svg>
      );
    }

    // 11. PIEZO BUZZER
    if (definitionId === 'piezo-buzzer') {
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          {/* Leads */}
          <line x1="18" y1="36" x2="18" y2="48" stroke="#a1a1aa" strokeWidth="2" />
          <line x1="32" y1="36" x2="32" y2="48" stroke="#a1a1aa" strokeWidth="2" />
          {/* Cylinder black casing */}
          <circle cx="25" cy="24" r="18" fill="#18181b" stroke="#27272a" strokeWidth="1.2" />
          <circle cx="25" cy="24" r="5" fill="#09090b" />
          <text x="34" y="18" fill="#ef4444" fontSize="8" fontWeight="bold">+</text>
        </svg>
      );
    }

    // 12. LCD 1602
    if (definitionId === 'lcd-1602-i2c') {
      return (
        <svg viewBox="0 0 80 50" width="100%" height="100%">
          <rect x="2" y="4" width="76" height="42" rx="3" fill="#15803d" stroke="#166534" strokeWidth="1" />
          <rect x="8" y="9" width="64" height="32" rx="2" fill="#18181b" />
          <rect x="12" y="13" width="56" height="24" rx="1.5" fill="#1d4ed8" />
          <line x1="16" y1="20" x2="64" y2="20" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,1.5" />
          <line x1="16" y1="28" x2="64" y2="28" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,1.5" />
        </svg>
      );
    }

    // 13. RELAY MODULE
    if (definitionId === 'relay-module') {
      return (
        <svg viewBox="0 0 60 50" width="100%" height="100%">
          <rect x="4" y="6" width="52" height="38" rx="3" fill="#1e3a8a" stroke="#1e40af" strokeWidth="1" />
          {/* Blue Songle Cube */}
          <rect x="18" y="10" width="34" height="26" rx="2" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
          {/* Terminal Block */}
          <rect x="8" y="12" width="10" height="22" rx="1" fill="#15803d" />
        </svg>
      );
    }

    // 14. PHOTORESISTOR (LDR)
    if (definitionId.includes('ldr')) {
      return (
        <svg viewBox="0 0 50 50" width="100%" height="100%">
          <line x1="18" y1="28" x2="18" y2="46" stroke="#a1a1aa" strokeWidth="2" />
          <line x1="32" y1="28" x2="32" y2="46" stroke="#a1a1aa" strokeWidth="2" />
          <circle cx="25" cy="20" r="12" fill="#d97706" stroke="#b45309" strokeWidth="1" />
          {/* Squiggly trace */}
          <path d="M 18,20 Q 21,15 25,20 T 32,20" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    // 15. DIODE 1N4007
    if (definitionId.includes('diode')) {
      return (
        <svg viewBox="0 0 60 30" width="100%" height="100%">
          <line x1="4" y1="15" x2="56" y2="15" stroke="#a1a1aa" strokeWidth="2.5" />
          <rect x="18" y="8" width="24" height="14" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
          <rect x="36" y="8" width="4" height="14" fill="#d4d4d8" />
        </svg>
      );
    }

    // Fallback: Generic IC Chip
    return (
      <svg viewBox="0 0 50 40" width="100%" height="100%">
        <rect x="10" y="8" width="30" height="24" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
        <circle cx="15" cy="20" r="2" fill="#71717a" />
        <line x1="12" y1="5" x2="12" y2="8" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="20" y1="5" x2="20" y2="8" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="28" y1="5" x2="28" y2="8" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="36" y1="5" x2="36" y2="8" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="12" y1="32" x2="12" y2="35" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="20" y1="32" x2="20" y2="35" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="28" y1="32" x2="28" y2="35" stroke="#a1a1aa" strokeWidth="1.5" />
        <line x1="36" y1="32" x2="36" y2="35" stroke="#a1a1aa" strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {renderVisual()}
    </div>
  );
};

