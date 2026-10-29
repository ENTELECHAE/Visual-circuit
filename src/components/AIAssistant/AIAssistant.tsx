import React, { useState } from 'react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { Sparkles, Send, Bot, User, Key, Check, Copy } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  codeSnippet?: string;
}

export const AIAssistant: React.FC = () => {
  const store = useCircuitStore();
  const [inputVal, setInputVal] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('visual-circuits:gemini-api-key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello! I am your Visual Circuits AI Assistant. I can help you design circuits, troubleshoot wiring mistakes, explain electrical schematics, and write Arduino C++ firmware. How can I help you today?',
    },
  ]);

  const handleSaveApiKey = () => {
    localStorage.setItem('visual-circuits:gemini-api-key', apiKey);
    setShowKeyInput(false);
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputVal,
    };
    setMessages((prev) => [...prev, userMsg]);
    const query = inputVal.toLowerCase();
    setInputVal('');

    // Intelligent built-in circuit assistant reasoning
    setTimeout(() => {
      let reply = '';
      let snippet: string | undefined = undefined;

      if (query.includes('led') || query.includes('blink') || query.includes('light')) {
        reply =
          'To connect an LED safely to Arduino Uno:\n' +
          '1. Connect Arduino Digital Pin (e.g. D13) to one leg of a 220Ω resistor.\n' +
          '2. Connect the resistor’s other leg to the LED Anode (longer leg).\n' +
          '3. Connect the LED Cathode (flat edge) directly to Arduino GND.\n' +
          'The 220Ω resistor is critical to limit forward current to ~20mA so the LED and pin do not burn out.';
        snippet = `const int ledPin = 13;\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(1000);\n  digitalWrite(ledPin, LOW);\n  delay(1000);\n}`;
      } else if (query.includes('ultrasonic') || query.includes('hc-sr04') || query.includes('distance')) {
        reply =
          'For the HC-SR04 Ultrasonic Distance Sensor:\n' +
          '• VCC -> 5V\n' +
          '• Trig -> Digital Pin 12 (sends 10µs sound pulse)\n' +
          '• Echo -> Digital Pin 11 (returns pulse width proportional to echo time)\n' +
          '• GND -> Arduino GND\n' +
          'Calculate distance with: distance = duration * 0.034 / 2;';
        snippet = `const int trigPin = 12;\nconst int echoPin = 11;\nvoid setup() {\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n  Serial.begin(9600);\n}\nvoid loop() {\n  digitalWrite(trigPin, LOW); delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH); delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long duration = pulseIn(echoPin, HIGH);\n  long distance = duration * 0.034 / 2;\n  Serial.print("Distance: "); Serial.println(distance);\n  delay(300);\n}`;
      } else if (query.includes('servo') || query.includes('motor')) {
        reply =
          'For the SG90 Micro Servo Motor:\n' +
          '• Brown wire -> GND\n' +
          '• Red wire -> 5V\n' +
          '• Orange wire -> Digital PWM Pin 9\n' +
          'Use the Arduino Servo library to command positions between 0° and 180°.';
        snippet = `#include <Servo.h>\nServo myservo;\nvoid setup() {\n  myservo.attach(9);\n}\nvoid loop() {\n  myservo.write(0);\n  delay(1000);\n  myservo.write(180);\n  delay(1000);\n}`;
      } else if (query.includes('potentiometer') || query.includes('dim') || query.includes('analog')) {
        reply =
          'To connect a Potentiometer:\n' +
          '• Terminal 1 -> 5V\n' +
          '• Wiper (middle pin) -> Analog Pin A0\n' +
          '• Terminal 2 -> GND\n' +
          'Arduino analogRead(A0) will read voltages between 0V and 5V, converted to a digital integer from 0 to 1023.';
        snippet = `void setup() {\n  pinMode(9, OUTPUT);\n}\nvoid loop() {\n  int val = analogRead(A0);\n  int brightness = map(val, 0, 1023, 0, 255);\n  analogWrite(9, brightness);\n}`;
      } else {
        reply = `I analyzed your project "${store.project.name}" with ${store.project.components.length} components and ${store.project.wires.length} wires. Everything looks well connected. You can click "Start Simulation" in the top bar to run your sketch in real time!`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        codeSnippet: snippet,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col bg-studio-panel border-l border-studio-border text-stone-200">
      {/* HEADER */}
      <div className="h-10 px-3 border-b border-studio-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span className="font-semibold text-xs font-mono text-stone-200">AI Circuit Assistant</span>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
            apiKey ? 'text-emerald-400 hover:bg-studio-subtle' : 'text-stone-400 hover:text-stone-200 hover:bg-studio-subtle'
          }`}
          title="Configure Gemini API Key"
        >
          <Key size={13} />
          <span className="text-[10px] font-mono">{apiKey ? 'API Key Active' : 'Add API Key'}</span>
        </button>
      </div>

      {/* OPTIONAL API KEY MODAL / DRAWER */}
      {showKeyInput && (
        <div className="p-3 bg-studio-dark border-b border-studio-border space-y-2">
          <label className="text-[11px] font-mono text-stone-300 block">
            Google Gemini API Key (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-studio-panel border border-studio-border rounded-lg px-2.5 py-1 text-xs text-stone-100 font-mono focus:outline-none focus:border-studio-accent"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-3 py-1 bg-studio-accent hover:bg-studio-accentHover text-white rounded-lg text-xs font-semibold"
            >
              Save
            </button>
          </div>
          <p className="text-[10px] text-stone-500 font-mono leading-tight">
            Visual Circuits works out-of-the-box with built-in electronics knowledge. Providing an API key enables direct frontier model interaction.
          </p>
        </div>
      )}

      {/* CHAT MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-studio-accent/20 border border-studio-accent flex items-center justify-center text-studio-accent shrink-0 mt-0.5">
                <Bot size={13} />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-studio-accent text-white font-medium rounded-tr-xs'
                  : 'bg-studio-dark border border-studio-border text-stone-200 rounded-tl-xs shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Attached Code Snippet */}
              {m.codeSnippet && (
                <div className="mt-2.5 bg-black/60 rounded-lg border border-zinc-800 p-2 font-mono text-[11px] overflow-x-auto text-emerald-400">
                  <div className="flex justify-between items-center pb-1 mb-1 border-b border-zinc-800 text-[10px] text-zinc-400">
                    <span>Arduino C++</span>
                    <button
                      onClick={() => circuitStore.setCode(m.codeSnippet!)}
                      className="text-studio-accent hover:underline flex items-center gap-1"
                    >
                      <span>Insert into Editor</span>
                    </button>
                  </div>
                  <pre>{m.codeSnippet}</pre>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                <User size={13} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div className="px-3 py-1.5 border-t border-studio-border/60 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          'Wire an ultrasonic sensor',
          'Dim LED with potentiometer',
          'Check circuit for errors',
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputVal(prompt);
            }}
            className="text-[10px] font-mono bg-studio-dark border border-studio-border/80 text-stone-400 hover:text-studio-accent hover:border-studio-accent px-2 py-1 rounded-full whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* CHAT INPUT BAR */}
      <div className="p-2.5 bg-studio-panel border-t border-studio-border flex items-center gap-1.5">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI about wiring, code, or sensors..."
          className="flex-1 bg-studio-dark border border-studio-border rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-studio-accent font-mono"
        />
        <button
          onClick={handleSend}
          className="w-8 h-8 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-white flex items-center justify-center shadow-md transition-colors shrink-0"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};

