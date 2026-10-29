import React from 'react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { Play, RotateCcw, Copy, Check } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const store = useCircuitStore();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(store.project.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lineCount = store.project.code.split('\n').length;

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E] text-stone-200 border-l border-studio-border">
      {/* EDITOR TOOLBAR */}
      <div className="h-10 px-3 bg-[#252526] border-b border-zinc-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-studio-accent">sketch.ino</span>
          <span className="text-[10px] text-zinc-500 font-mono">C++ / Arduino Uno</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-700 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
          <button
            onClick={() => {
              if (store.simulation.isRunning) {
                circuitStore.stopSimulation();
              } else {
                circuitStore.startSimulation();
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
              store.simulation.isRunning
                ? 'bg-red-600/80 hover:bg-red-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Play size={11} className="fill-white" />
            <span>{store.simulation.isRunning ? 'Running' : 'Upload'}</span>
          </button>
        </div>
      </div>

      {/* CODE TEXTAREA WITH LINE NUMBERS */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs relative">
        {/* Line Numbers */}
        <div className="w-10 bg-[#1A1A1A] text-zinc-600 py-3 pr-2 text-right select-none font-mono text-[11px] border-r border-zinc-800">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Input */}
        <textarea
          value={store.project.code}
          onChange={(e) => circuitStore.setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-stone-100 font-mono text-xs leading-5 resize-none focus:outline-none overflow-y-auto selection:bg-studio-accent/30 selection:text-white"
          placeholder="// Type Arduino sketch code here..."
        />
      </div>

      {/* STATUS BAR */}
      <div className="h-6 px-3 bg-[#007ACC] text-white flex items-center justify-between text-[10px] font-mono select-none">
        <div className="flex items-center gap-2">
          <span>Arduino AVR (ATmega328P)</span>
          <span>•</span>
          <span>16 MHz</span>
        </div>
        <div>UTF-8</div>
      </div>
    </div>
  );
};

