import { ComponentDefinition } from '../types/circuit';

// Helper to generate full breadboard pins with columns and rails
export function generateBreadboardPins(rows: number) {
  const pins = [];
  const startX = 28;
  const colPitch = 9.5;

  // Top Power Rails (+ and -)
  for (let r = 1; r <= rows; r++) {
    const x = startX + (r - 1) * colPitch;
    pins.push({
      id: `rail-top-plus-${r}`,
      label: `+`,
      type: 'power' as const,
      x,
      y: 22,
      description: `Top Power Rail (+) Column ${r}`,
    });
    pins.push({
      id: `rail-top-minus-${r}`,
      label: `-`,
      type: 'ground' as const,
      x,
      y: 35,
      description: `Top Ground Rail (-) Column ${r}`,
    });
  }

  // Terminal Strips (Rows a, b, c, d, e above channel)
  const topCols = ['a', 'b', 'c', 'd', 'e'];
  topCols.forEach((col, colIdx) => {
    for (let r = 1; r <= rows; r++) {
      const x = startX + (r - 1) * colPitch;
      const y = 56 + colIdx * 10;
      pins.push({
        id: `tie-${r}-${col}`,
        label: `${r}${col.toUpperCase()}`,
        type: 'passive' as const,
        x,
        y,
        description: `Tie point ${r}${col.toUpperCase()}`,
      });
    }
  });

  // Terminal Strips (Rows f, g, h, i, j below channel)
  const bottomCols = ['f', 'g', 'h', 'i', 'j'];
  bottomCols.forEach((col, colIdx) => {
    for (let r = 1; r <= rows; r++) {
      const x = startX + (r - 1) * colPitch;
      const y = 118 + colIdx * 10;
      pins.push({
        id: `tie-${r}-${col}`,
        label: `${r}${col.toUpperCase()}`,
        type: 'passive' as const,
        x,
        y,
        description: `Tie point ${r}${col.toUpperCase()}`,
      });
    }
  });

  // Bottom Power Rails (+ and -)
  for (let r = 1; r <= rows; r++) {
    const x = startX + (r - 1) * colPitch;
    pins.push({
      id: `rail-bot-plus-${r}`,
      label: `+`,
      type: 'power' as const,
      x,
      y: 172,
      description: `Bottom Power Rail (+) Column ${r}`,
    });
    pins.push({
      id: `rail-bot-minus-${r}`,
      label: `-`,
      type: 'ground' as const,
      x,
      y: 185,
      description: `Bottom Ground Rail (-) Column ${r}`,
    });
  }

  return pins;
}

export const COMPONENT_CATALOG: ComponentDefinition[] = [
  // 1. ARDUINO UNO R3
  {
    id: 'arduino-uno',
    label: 'Arduino Uno R3',
    category: 'microcontroller',
    description: 'ATmega328P. 14 Digital I/O (6 PWM), 6 Analog Inputs. 16MHz, 5V logic.',
    width: 280,
    height: 190,
    datasheet: 'https://docs.arduino.cc/hardware/uno-rev3/',
    pins: [
      // Top Digital Header
      { id: 'SCL', label: 'SCL', type: 'i2c', x: 74, y: 14, description: 'I2C Clock' },
      { id: 'SDA', label: 'SDA', type: 'i2c', x: 86, y: 14, description: 'I2C Data' },
      { id: 'AREF', label: 'AREF', type: 'passive', x: 98, y: 14, description: 'Analog Reference' },
      { id: 'GND3', label: 'GND', type: 'ground', x: 110, y: 14, description: 'Digital Ground' },
      { id: 'D13', label: 'D13', type: 'digital', x: 122, y: 14, description: 'Digital Pin 13 (Built-in LED)' },
      { id: 'D12', label: 'D12', type: 'digital', x: 134, y: 14, description: 'Digital Pin 12 (MISO)' },
      { id: 'D11', label: '~D11', type: 'pwm', x: 146, y: 14, description: 'Digital Pin 11 (PWM / MOSI)' },
      { id: 'D10', label: '~D10', type: 'pwm', x: 158, y: 14, description: 'Digital Pin 10 (PWM / SS)' },
      { id: 'D9', label: '~D9', type: 'pwm', x: 170, y: 14, description: 'Digital Pin 9 (PWM)' },
      { id: 'D8', label: 'D8', type: 'digital', x: 182, y: 14, description: 'Digital Pin 8' },
      
      { id: 'D7', label: 'D7', type: 'digital', x: 199, y: 14, description: 'Digital Pin 7' },
      { id: 'D6', label: '~D6', type: 'pwm', x: 211, y: 14, description: 'Digital Pin 6 (PWM)' },
      { id: 'D5', label: '~D5', type: 'pwm', x: 223, y: 14, description: 'Digital Pin 5 (PWM)' },
      { id: 'D4', label: 'D4', type: 'digital', x: 235, y: 14, description: 'Digital Pin 4' },
      { id: 'D3', label: '~D3', type: 'pwm', x: 247, y: 14, description: 'Digital Pin 3 (PWM / Ext Int)' },
      { id: 'D2', label: 'D2', type: 'digital', x: 259, y: 14, description: 'Digital Pin 2 (Ext Int)' },
      { id: 'D1', label: 'TX->1', type: 'uart', x: 271, y: 14, description: 'Serial Transmit (TX)' },
      { id: 'D0', label: 'RX<-0', type: 'uart', x: 283, y: 14, description: 'Serial Receive (RX)' },

      // Bottom Power & Analog Header
      { id: 'IOREF', label: 'IOREF', type: 'power', x: 104, y: 176, description: 'I/O Reference Voltage' },
      { id: 'RESET', label: 'RESET', type: 'passive', x: 116, y: 176, description: 'Reset Pin' },
      { id: '3V3', label: '3.3V', type: 'power', x: 128, y: 176, voltage: 3.3, description: '3.3V Power Out' },
      { id: '5V', label: '5V', type: 'power', x: 140, y: 176, voltage: 5.0, description: '5V Regulated Power Out' },
      { id: 'GND1', label: 'GND', type: 'ground', x: 152, y: 176, description: 'System Ground' },
      { id: 'GND2', label: 'GND', type: 'ground', x: 164, y: 176, description: 'System Ground' },
      { id: 'VIN', label: 'VIN', type: 'power', x: 176, y: 176, description: 'External Voltage In' },

      { id: 'A0', label: 'A0', type: 'analog', x: 198, y: 176, description: 'Analog Input 0' },
      { id: 'A1', label: 'A1', type: 'analog', x: 210, y: 176, description: 'Analog Input 1' },
      { id: 'A2', label: 'A2', type: 'analog', x: 222, y: 176, description: 'Analog Input 2' },
      { id: 'A3', label: 'A3', type: 'analog', x: 234, y: 176, description: 'Analog Input 3' },
      { id: 'A4', label: 'A4', type: 'analog', x: 246, y: 176, description: 'Analog Input 4 (SDA)' },
      { id: 'A5', label: 'A5', type: 'analog', x: 258, y: 176, description: 'Analog Input 5 (SCL)' },
    ],
  },

  // 2. ESP32 DEVKIT
  {
    id: 'esp32-devkit',
    label: 'ESP32 NodeMCU-32S',
    category: 'microcontroller',
    description: 'ESP32-WROOM-32 module on DevKit. 30 GPIOs, dual-core 240MHz Xtensa LX6, Wi-Fi + Bluetooth, 3.3V logic.',
    width: 130,
    height: 190,
    pins: [
      { id: '3v3', label: '3V3', type: 'power', x: 14, y: 24, voltage: 3.3 },
      { id: 'en', label: 'EN', type: 'passive', x: 14, y: 36 },
      { id: 'vp', label: 'VP/36', type: 'analog', x: 14, y: 48 },
      { id: 'vn', label: 'VN/39', type: 'analog', x: 14, y: 60 },
      { id: 'd34', label: 'D34', type: 'digital', x: 14, y: 72 },
      { id: 'd35', label: 'D35', type: 'digital', x: 14, y: 84 },
      { id: 'd32', label: 'D32', type: 'digital', x: 14, y: 96 },
      { id: 'd33', label: 'D33', type: 'digital', x: 14, y: 108 },
      { id: 'd25', label: 'D25', type: 'digital', x: 14, y: 120 },
      { id: 'd26', label: 'D26', type: 'digital', x: 14, y: 132 },
      { id: 'd27', label: 'D27', type: 'digital', x: 14, y: 144 },
      { id: 'd14', label: 'D14', type: 'digital', x: 14, y: 156 },
      { id: 'd12', label: 'D12', type: 'digital', x: 14, y: 168 },
      { id: 'gnd1', label: 'GND', type: 'ground', x: 14, y: 180 },

      { id: 'vin', label: 'VIN', type: 'power', x: 116, y: 24, voltage: 5.0 },
      { id: 'gnd2', label: 'GND', type: 'ground', x: 116, y: 36 },
      { id: 'd13', label: 'D13', type: 'digital', x: 116, y: 48 },
      { id: 'd9', label: 'D9', type: 'digital', x: 116, y: 60 },
      { id: 'd10', label: 'D10', type: 'digital', x: 116, y: 72 },
      { id: 'd11', label: 'D11', type: 'digital', x: 116, y: 84 },
      { id: 'rx2', label: 'RX2/16', type: 'uart', x: 116, y: 96 },
      { id: 'tx2', label: 'TX2/17', type: 'uart', x: 116, y: 108 },
      { id: 'd5', label: 'D5', type: 'digital', x: 116, y: 120 },
      { id: 'd18', label: 'D18', type: 'digital', x: 116, y: 132 },
      { id: 'd19', label: 'D19', type: 'digital', x: 116, y: 144 },
      { id: 'd21', label: 'D21/SDA', type: 'i2c', x: 116, y: 156 },
      { id: 'rx0', label: 'RX0/3', type: 'uart', x: 116, y: 168 },
      { id: 'tx0', label: 'TX0/1', type: 'uart', x: 116, y: 180 },
    ],
  },

  // 3. ARDUINO MEGA 2560
  {
    id: 'arduino-mega',
    label: 'Arduino Mega 2560',
    category: 'microcontroller',
    description: 'ATmega2560. 54 Digital I/O (15 PWM), 16 Analog Inputs. 4 UARTs, 16MHz, 5V logic.',
    width: 380,
    height: 190,
    pins: [
      { id: 'SCL', label: 'SCL', type: 'i2c', x: 74, y: 14 },
      { id: 'SDA', label: 'SDA', type: 'i2c', x: 86, y: 14 },
      { id: 'AREF', label: 'AREF', type: 'passive', x: 98, y: 14 },
      { id: 'GND3', label: 'GND', type: 'ground', x: 110, y: 14 },
      { id: 'D13', label: 'D13', type: 'digital', x: 122, y: 14 },
      { id: 'D12', label: 'D12', type: 'digital', x: 134, y: 14 },
      { id: 'D11', label: 'D11', type: 'pwm', x: 146, y: 14 },
      { id: 'D10', label: 'D10', type: 'pwm', x: 158, y: 14 },
      { id: '5V', label: '5V', type: 'power', x: 140, y: 176, voltage: 5.0 },
      { id: 'GND1', label: 'GND', type: 'ground', x: 152, y: 176 },
      { id: 'A0', label: 'A0', type: 'analog', x: 198, y: 176 },
      { id: 'A1', label: 'A1', type: 'analog', x: 210, y: 176 },
      { id: 'A2', label: 'A2', type: 'analog', x: 222, y: 176 },
      { id: 'A3', label: 'A3', type: 'analog', x: 234, y: 176 },
    ],
  },

  // 4. BREADBOARD (HALF-PLUS)
  {
    id: 'breadboard-half',
    label: 'Breadboard (Half+)',
    category: 'breadboard',
    description: '400-tie-point solderless breadboard. 30 rows x 10 cols + 4 power rails.',
    width: 320,
    height: 190,
    pins: generateBreadboardPins(30),
  },

  // 5. BREADBOARD (FULL)
  {
    id: 'breadboard-full',
    label: 'Breadboard (Full-size)',
    category: 'breadboard',
    description: '830-tie-point full solderless breadboard. 63 rows x 10 cols + 4 power rails.',
    width: 630,
    height: 190,
    pins: generateBreadboardPins(63),
  },

  // 6. LED (RED)
  {
    id: 'led-red',
    label: 'LED (Red)',
    category: 'led',
    description: '5mm Red Diffused LED. Forward voltage 2.0V, current 20mA.',
    width: 50,
    height: 70,
    defaultProperties: { color: '#EF4444', forwardVoltage: 2.0 },
    pins: [
      { id: 'anode', label: 'Anode (+)', type: 'passive', x: 18, y: 64, description: 'Longer leg (Positive)' },
      { id: 'cathode', label: 'Cathode (-)', type: 'passive', x: 32, y: 64, description: 'Shorter leg (Negative/Flat edge)' },
    ],
  },

  // 7. LED (GREEN)
  {
    id: 'led-green',
    label: 'LED (Green)',
    category: 'led',
    description: '5mm Green Diffused LED. Forward voltage 2.1V, current 20mA.',
    width: 50,
    height: 70,
    defaultProperties: { color: '#22C55E', forwardVoltage: 2.1 },
    pins: [
      { id: 'anode', label: 'Anode (+)', type: 'passive', x: 18, y: 64, description: 'Longer leg (Positive)' },
      { id: 'cathode', label: 'Cathode (-)', type: 'passive', x: 32, y: 64, description: 'Shorter leg (Negative/Flat edge)' },
    ],
  },

  // 8. LED (BLUE)
  {
    id: 'led-blue',
    label: 'LED (Blue)',
    category: 'led',
    description: '5mm Blue Diffused LED. Forward voltage 3.0V, current 20mA.',
    width: 50,
    height: 70,
    defaultProperties: { color: '#3B82F6', forwardVoltage: 3.0 },
    pins: [
      { id: 'anode', label: 'Anode (+)', type: 'passive', x: 18, y: 64, description: 'Longer leg (Positive)' },
      { id: 'cathode', label: 'Cathode (-)', type: 'passive', x: 32, y: 64, description: 'Shorter leg (Negative/Flat edge)' },
    ],
  },

  // 9. LED (YELLOW)
  {
    id: 'led-yellow',
    label: 'LED (Yellow)',
    category: 'led',
    description: '5mm Yellow Diffused LED. Forward voltage 2.0V, current 20mA.',
    width: 50,
    height: 70,
    defaultProperties: { color: '#EAB308', forwardVoltage: 2.0 },
    pins: [
      { id: 'anode', label: 'Anode (+)', type: 'passive', x: 18, y: 64, description: 'Longer leg (Positive)' },
      { id: 'cathode', label: 'Cathode (-)', type: 'passive', x: 32, y: 64, description: 'Shorter leg (Negative/Flat edge)' },
    ],
  },

  // 10. LED (RGB)
  {
    id: 'led-rgb',
    label: 'LED (RGB 4-pin)',
    category: 'led',
    description: '5mm Common Cathode RGB LED with Red, Green, Blue cathodes.',
    width: 60,
    height: 70,
    defaultProperties: { red: 255, green: 100, blue: 50 },
    pins: [
      { id: 'red', label: 'Red', type: 'passive', x: 12, y: 64 },
      { id: 'cathode', label: 'GND (Cathode)', type: 'ground', x: 24, y: 64 },
      { id: 'green', label: 'Green', type: 'passive', x: 36, y: 64 },
      { id: 'blue', label: 'Blue', type: 'passive', x: 48, y: 64 },
    ],
  },

  // 11. RESISTOR (220 OHM)
  {
    id: 'resistor-220',
    label: 'Resistor (220Ω)',
    category: 'passive',
    description: '220 Ohm 1/4W Resistor. Ideal current limiting for 5V LEDs.',
    width: 90,
    height: 36,
    defaultProperties: { resistance: 220, unit: 'Ω' },
    pins: [
      { id: 'pin1', label: 'Terminal 1', type: 'passive', x: 10, y: 18 },
      { id: 'pin2', label: 'Terminal 2', type: 'passive', x: 80, y: 18 },
    ],
  },

  // 12. RESISTOR (1K OHM)
  {
    id: 'resistor-1k',
    label: 'Resistor (1kΩ)',
    category: 'passive',
    description: '1k Ohm 1/4W Resistor. General purpose pull-up / pull-down.',
    width: 90,
    height: 36,
    defaultProperties: { resistance: 1000, unit: 'kΩ' },
    pins: [
      { id: 'pin1', label: 'Terminal 1', type: 'passive', x: 10, y: 18 },
      { id: 'pin2', label: 'Terminal 2', type: 'passive', x: 80, y: 18 },
    ],
  },

  // 13. RESISTOR (10K OHM)
  {
    id: 'resistor-10k',
    label: 'Resistor (10kΩ)',
    category: 'passive',
    description: '10k Ohm Resistor. Standard pull-up / pull-down resistor.',
    width: 90,
    height: 36,
    defaultProperties: { resistance: 10000, unit: 'kΩ' },
    pins: [
      { id: 'pin1', label: 'Terminal 1', type: 'passive', x: 10, y: 18 },
      { id: 'pin2', label: 'Terminal 2', type: 'passive', x: 80, y: 18 },
    ],
  },

  // 14. CERAMIC CAPACITOR (100nF)
  {
    id: 'capacitor-ceramic',
    label: 'Capacitor (100nF)',
    category: 'passive',
    description: '100nF (0.1uF) ceramic disc bypass capacitor.',
    width: 50,
    height: 60,
    defaultProperties: { capacitance: '100nF' },
    pins: [
      { id: 'pin1', label: 'Terminal 1', type: 'passive', x: 18, y: 52 },
      { id: 'pin2', label: 'Terminal 2', type: 'passive', x: 32, y: 52 },
    ],
  },

  // 15. DIODE 1N4007
  {
    id: 'diode-1n4007',
    label: 'Diode (1N4007)',
    category: 'passive',
    description: 'General purpose 1A 1000V rectifier diode. Flyback protection.',
    width: 80,
    height: 32,
    defaultProperties: { model: '1N4007' },
    pins: [
      { id: 'anode', label: 'Anode', type: 'passive', x: 12, y: 16 },
      { id: 'cathode', label: 'Cathode', type: 'passive', x: 68, y: 16 },
    ],
  },

  // 16. NPN TRANSISTOR (2N2222)
  {
    id: 'transistor-2n2222',
    label: 'NPN Transistor (2N2222)',
    category: 'logic',
    description: 'TO-92 NPN general purpose switching transistor. 800mA, 40V.',
    width: 54,
    height: 56,
    defaultProperties: { type: 'NPN', model: '2N2222' },
    pins: [
      { id: 'emitter', label: 'Emitter', type: 'passive', x: 15, y: 48 },
      { id: 'base', label: 'Base', type: 'passive', x: 27, y: 48 },
      { id: 'collector', label: 'Collector', type: 'passive', x: 39, y: 48 },
    ],
  },

  // 17. POTENTIOMETER (10K)
  {
    id: 'potentiometer',
    label: 'Potentiometer (10kΩ)',
    category: 'input',
    description: 'Rotary linear 10k potentiometer with adjustable wiper voltage.',
    width: 70,
    height: 70,
    defaultProperties: { value: 50, maxResistance: 10000 },
    pins: [
      { id: 't1', label: 'Terminal 1 (VCC)', type: 'power', x: 16, y: 60 },
      { id: 'wiper', label: 'Wiper (OUT)', type: 'analog', x: 35, y: 60 },
      { id: 't2', label: 'Terminal 2 (GND)', type: 'ground', x: 54, y: 60 },
    ],
  },

  // 18. PUSHBUTTON
  {
    id: 'push-button',
    label: 'Push Button',
    category: 'input',
    description: '6mm Momentary SPST tactile push button switch.',
    width: 60,
    height: 60,
    defaultProperties: { isPressed: false },
    pins: [
      { id: '1a', label: 'Terminal 1a', type: 'passive', x: 14, y: 16 },
      { id: '1b', label: 'Terminal 1b', type: 'passive', x: 14, y: 44 },
      { id: '2a', label: 'Terminal 2a', type: 'passive', x: 46, y: 16 },
      { id: '2b', label: 'Terminal 2b', type: 'passive', x: 46, y: 44 },
    ],
  },

  // 19. SLIDE SWITCH (SPDT)
  {
    id: 'slide-switch',
    label: 'Slide Switch (SPDT)',
    category: 'input',
    description: 'SPDT slide switch, maintained latching. COM connects to 1 or 2.',
    width: 66,
    height: 44,
    defaultProperties: { position: 1 },
    pins: [
      { id: 'pin1', label: 'Terminal 1', type: 'passive', x: 17, y: 36 },
      { id: 'com', label: 'Common (COM)', type: 'passive', x: 33, y: 36 },
      { id: 'pin2', label: 'Terminal 2', type: 'passive', x: 49, y: 36 },
    ],
  },

  // 20. ULTRASONIC SENSOR (HC-SR04)
  {
    id: 'hc-sr04',
    label: 'HC-SR04 Ultrasonic',
    category: 'sensor',
    description: 'Ultrasonic distance ranging module. 2cm - 400cm.',
    width: 140,
    height: 70,
    defaultProperties: { distanceCm: 45 },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 44, y: 62, voltage: 5.0 },
      { id: 'trig', label: 'Trig', type: 'digital', x: 58, y: 62 },
      { id: 'echo', label: 'Echo', type: 'digital', x: 72, y: 62 },
      { id: 'gnd', label: 'GND', type: 'ground', x: 86, y: 62 },
    ],
  },

  // 21. DHT11 TEMP / HUMIDITY SENSOR
  {
    id: 'dht11',
    label: 'DHT11 Temp/Humidity',
    category: 'sensor',
    description: 'Digital temperature & humidity sensor. 20-90% RH, 0-50°C.',
    width: 70,
    height: 80,
    defaultProperties: { temperature: 24, humidity: 55 },
    pins: [
      { id: 'vcc', label: 'VCC (3.3-5V)', type: 'power', x: 20, y: 72, voltage: 5.0 },
      { id: 'data', label: 'DATA', type: 'digital', x: 35, y: 72 },
      { id: 'gnd', label: 'GND', type: 'ground', x: 50, y: 72 },
    ],
  },

  // 22. DHT22 HIGH PRECISION SENSOR
  {
    id: 'dht22',
    label: 'DHT22 (AM2302)',
    category: 'sensor',
    description: 'High-precision digital temperature and humidity sensor. -40 to 80°C.',
    width: 76,
    height: 90,
    defaultProperties: { temperature: 22.5, humidity: 48.0 },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 18, y: 82, voltage: 5.0 },
      { id: 'data', label: 'DATA', type: 'digital', x: 32, y: 82 },
      { id: 'nc', label: 'NC', type: 'passive', x: 46, y: 82 },
      { id: 'gnd', label: 'GND', type: 'ground', x: 60, y: 82 },
    ],
  },

  // 23. PHOTORESISTOR (LDR)
  {
    id: 'ldr-gl5528',
    label: 'Photoresistor / LDR',
    category: 'sensor',
    description: 'Light-dependent resistor. Changes resistance from 1MΩ (dark) to 10kΩ (light).',
    width: 50,
    height: 60,
    defaultProperties: { lightLevel: 70 },
    pins: [
      { id: 'pin1', label: 'Terminal 1', type: 'passive', x: 18, y: 52 },
      { id: 'pin2', label: 'Terminal 2', type: 'passive', x: 32, y: 52 },
    ],
  },

  // 24. PIR MOTION SENSOR
  {
    id: 'pir-hc-sr501',
    label: 'PIR Motion Sensor',
    category: 'sensor',
    description: 'Pyroelectric infrared motion detector. Digital output pulses HIGH on motion.',
    width: 100,
    height: 80,
    defaultProperties: { motionDetected: false },
    pins: [
      { id: 'vcc', label: 'VCC (5V)', type: 'power', x: 35, y: 70, voltage: 5.0 },
      { id: 'out', label: 'OUT', type: 'digital', x: 50, y: 70 },
      { id: 'gnd', label: 'GND', type: 'ground', x: 65, y: 70 },
    ],
  },

  // 25. MPU-6050 6-AXIS IMU
  {
    id: 'mpu6050',
    label: 'MPU-6050 (Accel/Gyro)',
    category: 'sensor',
    description: '6-axis motion tracking: 3-axis accelerometer + 3-axis gyroscope with I2C.',
    width: 90,
    height: 65,
    defaultProperties: { ax: 0, ay: 0, az: 9.8, gx: 0, gy: 0, gz: 0 },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 14, y: 55, voltage: 3.3 },
      { id: 'gnd', label: 'GND', type: 'ground', x: 24, y: 55 },
      { id: 'scl', label: 'SCL', type: 'i2c', x: 34, y: 55 },
      { id: 'sda', label: 'SDA', type: 'i2c', x: 44, y: 55 },
      { id: 'xda', label: 'XDA', type: 'passive', x: 54, y: 55 },
      { id: 'xcl', label: 'XCL', type: 'passive', x: 64, y: 55 },
      { id: 'ad0', label: 'AD0', type: 'digital', x: 74, y: 55 },
      { id: 'int', label: 'INT', type: 'digital', x: 84, y: 55 },
    ],
  },

  // 26. MICRO SERVO SG90
  {
    id: 'servo-sg90',
    label: 'Servo Motor (SG90)',
    category: 'actuator',
    description: '9g Micro Servo Motor. 0-180 degree rotation controlled via PWM.',
    width: 110,
    height: 90,
    defaultProperties: { angle: 90 },
    pins: [
      { id: 'gnd', label: 'GND (Brown)', type: 'ground', x: 30, y: 80 },
      { id: 'vcc', label: 'VCC (Red)', type: 'power', x: 45, y: 80, voltage: 5.0 },
      { id: 'signal', label: 'PWM (Orange)', type: 'pwm', x: 60, y: 80 },
    ],
  },

  // 27. PIEZO BUZZER
  {
    id: 'piezo-buzzer',
    label: 'Piezo Buzzer',
    category: 'actuator',
    description: 'Passive electromagnetic piezo transducer. Supports tone() audio.',
    width: 70,
    height: 70,
    defaultProperties: { isPlaying: false, frequency: 0 },
    pins: [
      { id: 'positive', label: 'Positive (+)', type: 'passive', x: 25, y: 60 },
      { id: 'negative', label: 'Negative (-)', type: 'ground', x: 45, y: 60 },
    ],
  },

  // 28. 5V RELAY MODULE
  {
    id: 'relay-module',
    label: 'Relay Module (5V)',
    category: 'actuator',
    description: 'Single-channel 10A 250VAC SPDT relay with optocoupler isolation.',
    width: 105,
    height: 75,
    defaultProperties: { state: false },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 16, y: 22, voltage: 5.0 },
      { id: 'in', label: 'IN', type: 'digital', x: 16, y: 38 },
      { id: 'gnd', label: 'GND', type: 'ground', x: 16, y: 54 },
      { id: 'no', label: 'NO', type: 'passive', x: 92, y: 22 },
      { id: 'com', label: 'COM', type: 'passive', x: 92, y: 38 },
      { id: 'nc', label: 'NC', type: 'passive', x: 92, y: 54 },
    ],
  },

  // 29. I2C LCD 1602
  {
    id: 'lcd-1602-i2c',
    label: 'LCD 16x2 (I2C)',
    category: 'display',
    description: '16x2 Character LCD with PCF8574 I2C backpack. Default address 0x27.',
    width: 220,
    height: 100,
    defaultProperties: { line1: 'Visual Circuits', line2: 'Ready...' },
    pins: [
      { id: 'gnd', label: 'GND', type: 'ground', x: 26, y: 20 },
      { id: 'vcc', label: 'VCC', type: 'power', x: 26, y: 35, voltage: 5.0 },
      { id: 'sda', label: 'SDA', type: 'i2c', x: 26, y: 50 },
      { id: 'scl', label: 'SCL', type: 'i2c', x: 26, y: 65 },
    ],
  },

  // 30. 7-SEGMENT DISPLAY
  {
    id: '7seg-display',
    label: '7-Segment Display',
    category: 'display',
    description: 'Common-cathode 1-digit 7-segment LED display.',
    width: 80,
    height: 110,
    defaultProperties: { currentDigit: 8 },
    pins: [
      { id: 'g', label: 'G', type: 'digital', x: 16, y: 15 },
      { id: 'f', label: 'F', type: 'digital', x: 28, y: 15 },
      { id: 'com1', label: 'GND', type: 'ground', x: 40, y: 15 },
      { id: 'a', label: 'A', type: 'digital', x: 52, y: 15 },
      { id: 'b', label: 'B', type: 'digital', x: 64, y: 15 },

      { id: 'e', label: 'E', type: 'digital', x: 16, y: 95 },
      { id: 'd', label: 'D', type: 'digital', x: 28, y: 95 },
      { id: 'com2', label: 'GND', type: 'ground', x: 40, y: 95 },
      { id: 'c', label: 'C', type: 'digital', x: 52, y: 95 },
      { id: 'dp', label: 'DP', type: 'digital', x: 64, y: 95 },
    ],
  },

  // 31. 555 TIMER IC (NE555)
  {
    id: 'ne555',
    label: '555 Timer (NE555)',
    category: 'logic',
    description: 'Precision timing circuit. Astable oscillator or monostable pulse generator DIP-8.',
    width: 72,
    height: 64,
    pins: [
      { id: 'gnd', label: 'GND (1)', type: 'ground', x: 16, y: 12 },
      { id: 'trig', label: 'TRIG (2)', type: 'analog', x: 28, y: 12 },
      { id: 'out', label: 'OUT (3)', type: 'digital', x: 40, y: 12 },
      { id: 'reset', label: 'RESET (4)', type: 'passive', x: 52, y: 12 },

      { id: 'vcc', label: 'VCC (8)', type: 'power', x: 16, y: 52, voltage: 5.0 },
      { id: 'disch', label: 'DISCH (7)', type: 'passive', x: 28, y: 52 },
      { id: 'thresh', label: 'THRESH (6)', type: 'analog', x: 40, y: 52 },
      { id: 'ctrl', label: 'CTRL (5)', type: 'passive', x: 52, y: 52 },
    ],
  },

  // 32. 74HC595 SHIFT REGISTER
  {
    id: '74hc595-shift-register',
    label: '74HC595 Shift Register',
    category: 'logic',
    description: '8-bit serial-in, parallel-out shift register with 3-state output registers DIP-16.',
    width: 124,
    height: 64,
    pins: [
      { id: 'qb', label: 'QB (1)', type: 'digital', x: 14, y: 12 },
      { id: 'qc', label: 'QC (2)', type: 'digital', x: 26, y: 12 },
      { id: 'qd', label: 'QD (3)', type: 'digital', x: 38, y: 12 },
      { id: 'qe', label: 'QE (4)', type: 'digital', x: 50, y: 12 },
      { id: 'qf', label: 'QF (5)', type: 'digital', x: 62, y: 12 },
      { id: 'qg', label: 'QG (6)', type: 'digital', x: 74, y: 12 },
      { id: 'qh', label: 'QH (7)', type: 'digital', x: 86, y: 12 },
      { id: 'gnd', label: 'GND (8)', type: 'ground', x: 98, y: 12 },

      { id: 'vcc', label: 'VCC (16)', type: 'power', x: 14, y: 52, voltage: 5.0 },
      { id: 'qa', label: 'QA (15)', type: 'digital', x: 26, y: 52 },
      { id: 'ser', label: 'SER (14)', type: 'digital', x: 38, y: 52 },
      { id: 'oe', label: 'OE (13)', type: 'passive', x: 50, y: 52 },
      { id: 'rclk', label: 'RCLK (12)', type: 'digital', x: 62, y: 52 },
      { id: 'srclk', label: 'SRCLK (11)', type: 'digital', x: 74, y: 52 },
      { id: 'srclr', label: 'SRCLR (10)', type: 'passive', x: 86, y: 52 },
      { id: 'qhprime', label: 'QH` (9)', type: 'digital', x: 98, y: 52 },
    ],
  },

  // 33. 9V BATTERY
  {
    id: 'battery-9v',
    label: '9V Battery',
    category: 'power',
    description: 'Standard 9-volt PP3 alkaline battery with positive/negative clip terminals.',
    width: 80,
    height: 120,
    defaultProperties: { voltage: 9.0 },
    pins: [
      { id: 'pos', label: '(+) Positive (9V)', type: 'power', x: 28, y: 14, voltage: 9.0 },
      { id: 'neg', label: '(-) Negative (GND)', type: 'ground', x: 52, y: 14 },
    ],
  },

  // 34. ANALOG JOYSTICK (KY-023)
  {
    id: 'joystick-ky-023',
    label: 'KY-023 XY Joystick',
    category: 'input',
    description: 'Dual-axis analog potentiometer thumbstick with integrated tactile push button.',
    width: 90,
    height: 90,
    defaultProperties: { x: 512, y: 512, pressed: false },
    pins: [
      { id: 'gnd', label: 'GND', type: 'ground', x: 18, y: 80 },
      { id: '5v', label: '+5V', type: 'power', x: 32, y: 80, voltage: 5.0 },
      { id: 'vrx', label: 'VRX', type: 'analog', x: 46, y: 80 },
      { id: 'vry', label: 'VRY', type: 'analog', x: 60, y: 80 },
      { id: 'sw', label: 'SW', type: 'digital', x: 74, y: 80 },
    ],
  },

  // 35. ROTARY ENCODER (KY-040)
  {
    id: 'rotary-encoder-ky-040',
    label: 'Rotary Encoder (KY-040)',
    category: 'input',
    description: 'Incremental quadrature rotary encoder with pushbutton switch.',
    width: 75,
    height: 80,
    defaultProperties: { steps: 0 },
    pins: [
      { id: 'clk', label: 'CLK', type: 'digital', x: 14, y: 72 },
      { id: 'dt', label: 'DT', type: 'digital', x: 28, y: 72 },
      { id: 'sw', label: 'SW', type: 'digital', x: 42, y: 72 },
      { id: 'vcc', label: '+', type: 'power', x: 54, y: 72, voltage: 5.0 },
      { id: 'gnd', label: 'GND', type: 'ground', x: 66, y: 72 },
    ],
  },
];
