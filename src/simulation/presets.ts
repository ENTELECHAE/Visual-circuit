import { CircuitProject } from '../types/circuit';

export const PRESET_CIRCUITS: CircuitProject[] = [
  // 1. ARDUINO UNO BLINK
  {
    id: 'uno-blink',
    name: 'Arduino Uno LED Blink',
    description: 'The classic Arduino "Hello, world." with external 220Ω current-limited LED.',
    board: 'arduino-uno',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    components: [
      {
        id: 'uno-1',
        definitionId: 'arduino-uno',
        label: 'Arduino Uno R3',
        x: 60,
        y: 100,
        rotation: 0,
        properties: {},
      },
      {
        id: 'bb-1',
        definitionId: 'breadboard-half',
        label: 'Half Breadboard',
        x: 390,
        y: 100,
        rotation: 0,
        properties: {},
      },
      {
        id: 'res-1',
        definitionId: 'resistor-220',
        label: 'Resistor 220Ω',
        x: 440,
        y: 170,
        rotation: 0,
        properties: { resistance: 220 },
      },
      {
        id: 'led-1',
        definitionId: 'led-red',
        label: 'Red LED 5mm',
        x: 560,
        y: 160,
        rotation: 0,
        properties: { color: '#EF4444' },
      },
    ],
    wires: [
      // Uno D13 to Resistor
      { id: 'w1', color: '#E4E4E7', from: { componentId: 'uno-1', pinId: 'D13' }, to: { componentId: 'res-1', pinId: 'pin1' } },
      // Resistor to LED Anode
      { id: 'w2', color: '#EF4444', from: { componentId: 'res-1', pinId: 'pin2' }, to: { componentId: 'led-1', pinId: 'anode' } },
      // LED Cathode to Uno GND
      { id: 'w3', color: '#71717A', from: { componentId: 'led-1', pinId: 'cathode' }, to: { componentId: 'uno-1', pinId: 'GND3' } },
    ],
    code: `// Visual Circuits - Classic Arduino Blink
// Blinks built-in Pin 13 and external breadboard LED.

const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Visual Circuits: Arduino Online");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED: HIGH (5.0V)");
  delay(1000);
  
  digitalWrite(ledPin, LOW);
  Serial.println("LED: LOW (0.0V)");
  delay(1000);
}
`,
  },

  // 2. PUSH BUTTON & LED
  {
    id: 'uno-button',
    name: 'Push Button & LED Control',
    description: 'Digital input using internal pullup resistor toggles LED output.',
    board: 'arduino-uno',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    components: [
      {
        id: 'uno-1',
        definitionId: 'arduino-uno',
        label: 'Arduino Uno R3',
        x: 60,
        y: 100,
        rotation: 0,
        properties: {},
      },
      {
        id: 'bb-1',
        definitionId: 'breadboard-half',
        label: 'Half Breadboard',
        x: 390,
        y: 100,
        rotation: 0,
        properties: {},
      },
      {
        id: 'btn-1',
        definitionId: 'push-button',
        label: 'Push Button 6mm',
        x: 450,
        y: 170,
        rotation: 0,
        properties: { isPressed: false },
      },
      {
        id: 'led-1',
        definitionId: 'led-green',
        label: 'Green LED 5mm',
        x: 580,
        y: 160,
        rotation: 0,
        properties: { color: '#22C55E' },
      },
    ],
    wires: [
      { id: 'w1', color: '#E4E4E7', from: { componentId: 'uno-1', pinId: 'D2' }, to: { componentId: 'btn-1', pinId: '1a' } },
      { id: 'w2', color: '#71717A', from: { componentId: 'btn-1', pinId: '2a' }, to: { componentId: 'uno-1', pinId: 'GND3' } },
      { id: 'w3', color: '#22C55E', from: { componentId: 'uno-1', pinId: 'D8' }, to: { componentId: 'led-1', pinId: 'anode' } },
      { id: 'w4', color: '#71717A', from: { componentId: 'led-1', pinId: 'cathode' }, to: { componentId: 'uno-1', pinId: 'GND1' } },
    ],
    code: `// Push Button with Arduino internal pullup
const int buttonPin = 2;
const int ledPin = 8;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Pushbutton Controller Ready");
}

void loop() {
  int buttonState = digitalRead(buttonPin);
  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Button Pressed -> LED ON");
  } else {
    digitalWrite(ledPin, LOW);
  }
}
`,
  },

  // 3. POTENTIOMETER & PWM
  {
    id: 'uno-potentiometer',
    name: 'Potentiometer PWM LED Dimmer',
    description: 'Analog read from ADC pin A0 controlling PWM brightness output on Pin 9.',
    board: 'arduino-uno',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    components: [
      {
        id: 'uno-1',
        definitionId: 'arduino-uno',
        label: 'Arduino Uno R3',
        x: 60,
        y: 100,
        rotation: 0,
        properties: {},
      },
      {
        id: 'pot-1',
        definitionId: 'potentiometer',
        label: '10k Potentiometer',
        x: 430,
        y: 160,
        rotation: 0,
        properties: { value: 65 },
      },
      {
        id: 'led-1',
        definitionId: 'led-blue',
        label: 'Blue LED (PWM)',
        x: 580,
        y: 160,
        rotation: 0,
        properties: { color: '#3B82F6' },
      },
    ],
    wires: [
      { id: 'w1', color: '#EF4444', from: { componentId: 'uno-1', pinId: '5V' }, to: { componentId: 'pot-1', pinId: 't1' } },
      { id: 'w2', color: '#E4E4E7', from: { componentId: 'uno-1', pinId: 'A0' }, to: { componentId: 'pot-1', pinId: 'wiper' } },
      { id: 'w3', color: '#71717A', from: { componentId: 'uno-1', pinId: 'GND2' }, to: { componentId: 'pot-1', pinId: 't2' } },
      { id: 'w4', color: '#3B82F6', from: { componentId: 'uno-1', pinId: 'D9' }, to: { componentId: 'led-1', pinId: 'anode' } },
      { id: 'w5', color: '#71717A', from: { componentId: 'led-1', pinId: 'cathode' }, to: { componentId: 'uno-1', pinId: 'GND3' } },
    ],
    code: `const int potPin = A0;
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(potPin);
  int brightness = map(sensorValue, 0, 1023, 0, 255);
  analogWrite(ledPin, brightness);
  Serial.print("Potentiometer ADC: ");
  Serial.print(sensorValue);
  Serial.print(" | PWM: ");
  Serial.println(brightness);
  delay(80);
}
`,
  },

  // 4. ULTRASONIC RANGEFINDER
  {
    id: 'uno-ultrasonic',
    name: 'HC-SR04 Ultrasonic Rangefinder',
    description: 'Measures distance via sound echo time-of-flight pulses.',
    board: 'arduino-uno',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    components: [
      {
        id: 'uno-1',
        definitionId: 'arduino-uno',
        label: 'Arduino Uno R3',
        x: 60,
        y: 100,
        rotation: 0,
        properties: {},
      },
      {
        id: 'sonar-1',
        definitionId: 'hc-sr04',
        label: 'HC-SR04 Sensor',
        x: 420,
        y: 130,
        rotation: 0,
        properties: { distanceCm: 35 },
      },
      {
        id: 'buzzer-1',
        definitionId: 'piezo-buzzer',
        label: 'Piezo Buzzer',
        x: 620,
        y: 140,
        rotation: 0,
        properties: {},
      },
    ],
    wires: [
      { id: 'w1', color: '#EF4444', from: { componentId: 'uno-1', pinId: '5V' }, to: { componentId: 'sonar-1', pinId: 'vcc' } },
      { id: 'w2', color: '#E4E4E7', from: { componentId: 'uno-1', pinId: 'D12' }, to: { componentId: 'sonar-1', pinId: 'trig' } },
      { id: 'w3', color: '#E4E4E7', from: { componentId: 'uno-1', pinId: 'D11' }, to: { componentId: 'sonar-1', pinId: 'echo' } },
      { id: 'w4', color: '#71717A', from: { componentId: 'uno-1', pinId: 'GND2' }, to: { componentId: 'sonar-1', pinId: 'gnd' } },
    ],
    code: `const int trigPin = 12;
const int echoPin = 11;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  long distanceCm = duration * 0.034 / 2;
  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(200);
}
`,
  },

  // 5. SG90 SERVO MOTOR
  {
    id: 'uno-servo',
    name: 'SG90 Micro Servo Sweep',
    description: 'PWM servo position control rotating 180° back and forth.',
    board: 'arduino-uno',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    components: [
      {
        id: 'uno-1',
        definitionId: 'arduino-uno',
        label: 'Arduino Uno R3',
        x: 60,
        y: 100,
        rotation: 0,
        properties: {},
      },
      {
        id: 'servo-1',
        definitionId: 'servo-sg90',
        label: 'SG90 Servo',
        x: 440,
        y: 140,
        rotation: 0,
        properties: { angle: 90 },
      },
    ],
    wires: [
      { id: 'w1', color: '#EF4444', from: { componentId: 'uno-1', pinId: '5V' }, to: { componentId: 'servo-1', pinId: 'vcc' } },
      { id: 'w2', color: '#71717A', from: { componentId: 'uno-1', pinId: 'GND1' }, to: { componentId: 'servo-1', pinId: 'gnd' } },
      { id: 'w3', color: '#E4E4E7', from: { componentId: 'uno-1', pinId: 'D9' }, to: { componentId: 'servo-1', pinId: 'pwm' } },
    ],
    code: `#include <Servo.h>
Servo myServo;

void setup() {
  myServo.attach(9);
  Serial.begin(9600);
  Serial.println("Servo Controller Initialized");
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 15) {
    myServo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.println(pos);
    delay(40);
  }
  for (int pos = 180; pos >= 0; pos -= 15) {
    myServo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.println(pos);
    delay(40);
  }
}
`,
  },
];
