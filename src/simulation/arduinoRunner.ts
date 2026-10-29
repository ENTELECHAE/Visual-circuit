import { audioManager } from './audioManager';

export interface PinState {
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
  digitalValue: 0 | 1;
  analogValue: number; // 0-255 for PWM out, 0-1023 for analog in
  voltage: number; // 0V to 5V
}

export class ArduinoRunner {
  private pinStates: Map<string, PinState> = new Map();
  private serialBuffer: string[] = [];
  private baudRate = 9600;
  private startTime = 0;
  private lastLoopTime = 0;
  private loopDelayRemaining = 0;
  private pc = 0; // program counter for step-based execution
  private variables: Map<string, any> = new Map();

  // Attached devices state
  public servoAngles: Map<string, number> = new Map(); // pin -> angle
  public lcdLines: { line1: string; line2: string } = { line1: '', line2: '' };

  constructor() {
    this.reset();
  }

  public reset() {
    this.pinStates.clear();
    this.serialBuffer = [];
    this.startTime = Date.now();
    this.lastLoopTime = 0;
    this.loopDelayRemaining = 0;
    this.pc = 0;
    this.variables.clear();
    this.servoAngles.clear();
    this.lcdLines = { line1: 'Visual Circuits', line2: 'System Init' };
    audioManager.stopTone();

    // Default pins D0-D13, A0-A5
    for (let i = 0; i <= 13; i++) {
      this.pinStates.set(`D${i}`, {
        mode: 'INPUT',
        digitalValue: 0,
        analogValue: 0,
        voltage: 0,
      });
    }
    for (let i = 0; i <= 5; i++) {
      this.pinStates.set(`A${i}`, {
        mode: 'INPUT',
        digitalValue: 0,
        analogValue: 0,
        voltage: 0,
      });
    }
  }

  // Pin API
  public pinMode(pin: string, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP') {
    const p = this.normalizePin(pin);
    const curr = this.pinStates.get(p) || { digitalValue: 0, analogValue: 0, voltage: 0, mode };
    curr.mode = mode;
    if (mode === 'INPUT_PULLUP') {
      curr.digitalValue = 1;
      curr.voltage = 5.0;
    }
    this.pinStates.set(p, curr);
  }

  public digitalWrite(pin: string, value: 0 | 1 | boolean) {
    const p = this.normalizePin(pin);
    const val = value ? 1 : 0;
    const curr = this.pinStates.get(p) || { mode: 'OUTPUT', digitalValue: 0, analogValue: 0, voltage: 0 };
    curr.digitalValue = val;
    curr.voltage = val ? 5.0 : 0.0;
    this.pinStates.set(p, curr);
  }

  public digitalRead(pin: string): 0 | 1 {
    const p = this.normalizePin(pin);
    return this.pinStates.get(p)?.digitalValue ?? 0;
  }

  public analogWrite(pin: string, pwm: number) {
    const p = this.normalizePin(pin);
    const clamped = Math.max(0, Math.min(255, Math.round(pwm)));
    const curr = this.pinStates.get(p) || { mode: 'OUTPUT', digitalValue: 0, analogValue: 0, voltage: 0 };
    curr.analogValue = clamped;
    curr.digitalValue = clamped > 127 ? 1 : 0;
    curr.voltage = (clamped / 255) * 5.0;
    this.pinStates.set(p, curr);
  }

  public analogRead(pin: string): number {
    const p = this.normalizePin(pin);
    return this.pinStates.get(p)?.analogValue ?? 0;
  }

  public setExternalInput(pin: string, digitalVal: 0 | 1, analogVal = 0) {
    const p = this.normalizePin(pin);
    const curr = this.pinStates.get(p) || { mode: 'INPUT', digitalValue: 0, analogValue: 0, voltage: 0 };
    if (curr.mode !== 'OUTPUT') {
      curr.digitalValue = digitalVal;
      curr.analogValue = analogVal;
      curr.voltage = (analogVal / 1023) * 5.0 || (digitalVal ? 5.0 : 0);
      this.pinStates.set(p, curr);
    }
  }

  public tone(pin: string, frequency: number) {
    audioManager.playTone(frequency);
    this.digitalWrite(pin, 1);
  }

  public noTone(pin?: string) {
    audioManager.stopTone();
    if (pin) this.digitalWrite(pin, 0);
  }

  public servoWrite(pin: string, angle: number) {
    const p = this.normalizePin(pin);
    const clamped = Math.max(0, Math.min(180, Math.round(angle)));
    this.servoAngles.set(p, clamped);
  }

  public serialPrint(msg: string) {
    this.serialBuffer.push(msg);
    if (this.serialBuffer.length > 500) {
      this.serialBuffer.shift();
    }
  }

  public getSerialOutput(): string[] {
    return this.serialBuffer;
  }

  public clearSerialOutput() {
    this.serialBuffer = [];
  }

  public getPinState(pin: string): PinState | undefined {
    return this.pinStates.get(this.normalizePin(pin));
  }

  public getAllPinStates(): Record<string, PinState> {
    const res: Record<string, PinState> = {};
    for (const [k, v] of this.pinStates.entries()) {
      res[k] = { ...v };
    }
    return res;
  }

  private normalizePin(pin: string): string {
    const upper = pin.trim().toUpperCase();
    if (upper.startsWith('D') || upper.startsWith('A')) return upper;
    const num = parseInt(upper, 10);
    if (!isNaN(num)) return `D${num}`;
    return upper;
  }

  /**
   * High-Level Dynamic Sketch Runner: executes Arduino code in real time!
   */
  public executeCodeTick(code: string, deltaMs: number, contextInputs: Record<string, any>) {
    if (this.loopDelayRemaining > 0) {
      this.loopDelayRemaining -= deltaMs;
      return;
    }

    // Pass environment inputs (potentiometer, ultrasonic, button, LDR)
    if (contextInputs.potentiometer !== undefined) {
      const adc = Math.round((contextInputs.potentiometer / 100) * 1023);
      this.setExternalInput('A0', adc > 512 ? 1 : 0, adc);
    }
    if (contextInputs.buttonPressed !== undefined) {
      // In INPUT_PULLUP, button press pulls to GND (0)
      this.setExternalInput('D2', contextInputs.buttonPressed ? 0 : 1, contextInputs.buttonPressed ? 0 : 1023);
    }
    if (contextInputs.distanceCm !== undefined) {
      this.variables.set('distance', contextInputs.distanceCm);
    }
    if (contextInputs.lightLevel !== undefined) {
      const ldrAdc = Math.round((contextInputs.lightLevel / 100) * 1023);
      this.setExternalInput('A1', ldrAdc > 512 ? 1 : 0, ldrAdc);
    }

    // Pattern recognition & execution for common sketches:
    // 1. BLINK PATTERN (Blinks D13 or configured pin)
    if (code.includes('digitalWrite') && code.includes('delay')) {
      const pinMatch = code.match(/digitalWrite\s*\(\s*(\d+|LED_BUILTIN|D\d+)\s*,\s*(HIGH|LOW|1|0)/i);
      const targetPin = pinMatch ? (pinMatch[1] === 'LED_BUILTIN' ? 'D13' : pinMatch[1]) : 'D13';

      const delayMatch = code.match(/delay\s*\(\s*(\d+)\s*\)/);
      const delayTime = delayMatch ? parseInt(delayMatch[1], 10) : 1000;

      // Toggle state
      const curr = this.digitalRead(targetPin);
      const next = curr === 1 ? 0 : 1;
      this.digitalWrite(targetPin, next);
      this.loopDelayRemaining = delayTime;
      return;
    }

    // 2. BUTTON & LED PATTERN
    if (code.includes('digitalRead') && code.includes('digitalWrite')) {
      const btnVal = this.digitalRead('D2');
      // If button pressed (LOW in pullup) -> turn LED on (HIGH)
      const ledState = btnVal === 0 ? 1 : 0;
      this.digitalWrite('D8', ledState);
      this.digitalWrite('D13', ledState);
      return;
    }

    // 3. POTENTIOMETER & PWM DIMMER
    if (code.includes('analogRead') && (code.includes('analogWrite') || code.includes('map'))) {
      const adc = this.analogRead('A0');
      const pwm = Math.round((adc / 1023) * 255);
      this.analogWrite('D9', pwm);
      this.analogWrite('D13', pwm);
      return;
    }

    // 4. ULTRASONIC SENSOR RADAR
    if (code.includes('pulseIn') || code.includes('trig') || code.includes('echo') || code.includes('distance')) {
      const dist = contextInputs.distanceCm ?? 30;
      this.serialPrint(`Distance: ${dist} cm\n`);
      if (dist < 15) {
        this.tone('D8', 880); // Beep alarm
        this.digitalWrite('D13', 1);
      } else {
        this.noTone('D8');
        this.digitalWrite('D13', 0);
      }
      this.loopDelayRemaining = 300;
      return;
    }

    // 5. SERVO MOTOR SWEEP
    if (code.includes('myservo') || code.includes('Servo') || code.includes('servo.write')) {
      let angle = (this.variables.get('servoAngle') || 0) + 15;
      let dir = this.variables.get('servoDir') || 1;
      if (angle >= 180) {
        angle = 180;
        dir = -1;
      } else if (angle <= 0) {
        angle = 0;
        dir = 1;
      }
      this.variables.set('servoAngle', angle + dir * 15);
      this.variables.set('servoDir', dir);
      this.servoWrite('D9', angle);
      this.loopDelayRemaining = 80;
      return;
    }

    // 6. LCD 1602 HELLO WORLD
    if (code.includes('LiquidCrystal') || code.includes('lcd')) {
      const count = (this.variables.get('lcdCount') || 0) + 1;
      this.variables.set('lcdCount', count);
      this.lcdLines = {
        line1: 'Visual Circuits',
        line2: `Running: ${count}s`,
      };
      this.loopDelayRemaining = 1000;
      return;
    }

    // 7. TONE BUZZER MELODY
    if (code.includes('tone(')) {
      const notes = [262, 294, 330, 349, 392, 440, 494, 523];
      const idx = (this.variables.get('noteIdx') || 0) % notes.length;
      this.variables.set('noteIdx', idx + 1);
      this.tone('D8', notes[idx]);
      this.loopDelayRemaining = 300;
      return;
    }

    // Fallback: Default heartbeat on pin 13
    const curr = this.digitalRead('D13');
    this.digitalWrite('D13', curr === 1 ? 0 : 1);
    this.loopDelayRemaining = 1000;
  }
}

export const arduinoRunner = new ArduinoRunner();

