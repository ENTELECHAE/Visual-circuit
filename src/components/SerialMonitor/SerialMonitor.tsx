import React, { useState, useRef, useEffect } from 'react';
import { useCircuitStore } from '../../store/circuitStore';
import { arduinoRunner } from '../../simulation/arduinoRunner';
import { Terminal, Send, Trash2 } from 'lucide-react';

export const SerialMonitor: React.FC = () => {
  const store = useCircuitStore();
  const [inputVal, setInputVal] = useState('');
  const [baud, setBaud] = useState(9600);
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [store.simulation.serialOutput, autoScroll]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    arduinoRunner.serialPrint(`> ${inputVal}\n`);
    setInputVal('');
  };

  return (
    <div className="h-full flex flex-col bg-[#111111] text-stone-200 border-l border-studio-border font-mono text-xs">
      {/* HEADER & BAUD SELECTOR */}
      <div className="h-10 px-3 bg-studio-panel border-b border-studio-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-studio-accent" />
          <span className="font-semibold text-stone-200">Serial Monitor</span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <select
            value={baud}
            onChange={(e) => setBaud(parseInt(e.target.value, 10))}
            className="bg-studio-dark border border-studio-border rounded px-1.5 py-0.5 text-stone-300 focus:outline-none"
          >
            <option value="9600">9600 baud</option>
            <option value="19200">19200 baud</option>
            <option value="38400">38400 baud</option>
            <option value="57600">57600 baud</option>
            <option value="115200">115200 baud</option>
          </select>

          <label className="flex items-center gap-1 text-stone-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-studio-accent rounded"
            />
            <span className="text-[10px]">Autoscroll</span>
          </label>

          <button
            onClick={() => arduinoRunner.clearSerialOutput()}
            className="p-1 text-stone-400 hover:text-red-400 hover:bg-studio-subtle rounded transition-colors"
            title="Clear output"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* TERMINAL LOG OUTPUT */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-xs selection:bg-studio-accent/30 selection:text-white">
        {store.simulation.serialOutput.length === 0 ? (
          <div className="text-stone-600 text-[11px] italic">
            {store.simulation.isRunning
              ? 'Simulation active. Waiting for Serial.print() statements...'
              : 'Simulation stopped. Click "Start Simulation" to stream serial output.'}
          </div>
        ) : (
          store.simulation.serialOutput.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap text-emerald-400/90 leading-tight">
              {line}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* INPUT COMMAND BAR */}
      <div className="p-2 bg-studio-panel border-t border-studio-border flex items-center gap-1.5">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send text to Serial.read()..."
          className="flex-1 bg-studio-dark border border-studio-border rounded-md px-2.5 py-1 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-studio-accent"
        />
        <button
          onClick={handleSend}
          className="px-3 py-1 bg-studio-accent hover:bg-studio-accentHover text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-sm"
        >
          <Send size={12} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

