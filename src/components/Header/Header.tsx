import React, { useState } from 'react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { PRESET_CIRCUITS } from '../../simulation/presets';
import {
  Cpu,
  Play,
  Square,
  Code,
  Terminal,
  Sparkles,
  Sun,
  Moon,
  FolderOpen,
  Trash2,
  Download,
  Box,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const store = useCircuitStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(store.project.name);
  const [showPresets, setShowPresets] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Format simulation time
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    const centi = Math.floor((ms % 1000) / 10)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}.${centi}`;
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.project, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${store.project.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    setShowExport(false);
  };

  const handleExportIno = () => {
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(store.project.code);
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${store.project.name.toLowerCase().replace(/\s+/g, '-')}.ino`;
    a.click();
    setShowExport(false);
  };

  return (
    <header className="h-[48px] bg-studio-panel border-b border-studio-border px-3 flex items-center justify-between text-stone-200 select-none z-30 shrink-0">
      {/* 1. BRAND & PROJECT TITLE */}
      <div className="flex items-center gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-studio-accent/20 border border-studio-accent/40 flex items-center justify-center text-studio-accent shadow-sm">
            <Cpu size={18} />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-stone-100 hidden sm:inline">
            Visual Circuits
          </span>
        </div>

        <div className="h-5 w-px bg-studio-border hidden sm:block" />

        {/* Project Name (Editable) */}
        {isEditingTitle ? (
          <input
            type="text"
            className="bg-studio-dark border border-studio-accent rounded px-2 py-0.5 text-xs font-mono text-stone-100 focus:outline-none w-48"
            value={titleText}
            autoFocus
            onChange={(e) => setTitleText(e.target.value)}
            onBlur={() => {
              setIsEditingTitle(false);
              circuitStore.setProjectName(titleText);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingTitle(false);
                circuitStore.setProjectName(titleText);
              }
            }}
          />
        ) : (
          <button
            onClick={() => {
              setTitleText(store.project.name);
              setIsEditingTitle(true);
            }}
            className="text-xs font-mono text-stone-300 hover:text-stone-100 hover:bg-studio-subtle px-2 py-1 rounded flex items-center gap-1.5 transition-colors max-w-[200px] truncate"
            title="Click to rename project"
          >
            <span className="truncate">{store.project.name}</span>
          </button>
        )}

        {/* Board Selector */}
        <div className="relative hidden md:block">
          <select
            value={store.project.board}
            onChange={(e) => circuitStore.setBoard(e.target.value)}
            className="bg-studio-dark/80 border border-studio-border text-[11px] font-mono text-stone-300 rounded px-2 py-1 focus:outline-none focus:border-studio-accent cursor-pointer"
          >
            <option value="arduino-uno">Arduino Uno R3</option>
            <option value="arduino-mega">Arduino Mega 2560</option>
            <option value="arduino-nano">Arduino Nano V3</option>
            <option value="esp32-devkit">ESP32 NodeMCU-32S</option>
          </select>
        </div>
      </div>

      {/* 2. CENTER: VIEW SWITCHER & SIMULATION CONTROLS */}
      <div className="flex items-center gap-3">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-studio-dark/80 border border-studio-border rounded-lg p-0.5">
          <button
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              store.viewMode === '2d'
                ? 'bg-studio-panel text-studio-accent font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            onClick={() => circuitStore.setViewMode('2d')}
          >
            <Layers size={13} />
            <span>2D Studio</span>
          </button>
          <button
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              store.viewMode === '3d'
                ? 'bg-studio-panel text-studio-accent font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            onClick={() => circuitStore.setViewMode('3d')}
          >
            <Box size={13} />
            <span>3D View</span>
          </button>
        </div>

        {/* SIMULATION RUN/STOP BUTTON */}
        <div className="flex items-center gap-1.5">
          {store.simulation.isRunning ? (
            <button
              onClick={() => circuitStore.stopSimulation()}
              className="flex items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white px-3.5 py-1 rounded-lg text-xs font-semibold shadow-lg shadow-red-600/20 transition-all border border-red-500"
            >
              <Square size={13} className="fill-white" />
              <span>Stop</span>
              <span className="font-mono text-[11px] bg-red-950/60 px-1.5 py-0.5 rounded border border-red-400/30">
                {formatTime(store.simulation.timeElapsedMs)}
              </span>
            </button>
          ) : (
            <button
              onClick={() => circuitStore.startSimulation()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all border border-emerald-400/30"
            >
              <Play size={13} className="fill-white" />
              <span>Start Simulation</span>
            </button>
          )}

          {/* Speed Selector */}
          <select
            value={store.simulation.speed}
            onChange={(e) => circuitStore.setSimulationSpeed(parseFloat(e.target.value))}
            className="bg-studio-dark/80 border border-studio-border text-[11px] font-mono text-stone-300 rounded px-1.5 py-1 focus:outline-none"
            title="Simulation Speed"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1.0x</option>
            <option value="2">2.0x</option>
          </select>
        </div>
      </div>

      {/* 3. RIGHT: PRESETS, DRAWERS & UTILITIES */}
      <div className="flex items-center gap-1.5">
        {/* Examples / Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1 text-xs text-stone-300 hover:text-stone-100 hover:bg-studio-subtle px-2 py-1.5 rounded-lg border border-studio-border transition-colors"
          >
            <FolderOpen size={13} />
            <span className="hidden lg:inline">Examples</span>
            <ChevronDown size={11} />
          </button>

          {showPresets && (
            <div className="absolute right-0 top-10 w-64 bg-studio-panel border border-studio-border rounded-xl shadow-2xl p-1 z-50">
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400 px-2 py-1">
                Load Preset Circuit
              </div>
              {PRESET_CIRCUITS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    circuitStore.loadPreset(p.id);
                    setShowPresets(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-stone-200 hover:bg-studio-subtle hover:text-studio-accent rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Code Editor Toggle */}
        <button
          onClick={() => circuitStore.toggleRightTab('editor')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            store.activeRightTab === 'editor'
              ? 'bg-studio-accent/20 border-studio-accent text-studio-accent shadow-sm'
              : 'border-studio-border text-stone-300 hover:bg-studio-subtle'
          }`}
          title="Toggle Arduino Code Editor"
        >
          <Code size={13} />
          <span className="hidden xl:inline">Code</span>
        </button>

        {/* Serial Monitor Toggle */}
        <button
          onClick={() => circuitStore.toggleRightTab('serial')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            store.activeRightTab === 'serial'
              ? 'bg-studio-accent/20 border-studio-accent text-studio-accent shadow-sm'
              : 'border-studio-border text-stone-300 hover:bg-studio-subtle'
          }`}
          title="Toggle Serial Terminal"
        >
          <Terminal size={13} />
          <span className="hidden xl:inline">Serial</span>
        </button>

        {/* AI Assistant Toggle */}
        <button
          onClick={() => circuitStore.toggleRightTab('ai')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
            store.activeRightTab === 'ai'
              ? 'bg-studio-accent/20 border-studio-accent text-studio-accent shadow-sm'
              : 'border-studio-border text-stone-300 hover:bg-studio-subtle'
          }`}
          title="Toggle AI Circuit Assistant"
        >
          <Sparkles size={13} className="text-amber-400" />
          <span className="hidden xl:inline">AI Help</span>
        </button>

        {/* Clear Circuit */}
        <button
          onClick={() => {
            if (confirm('Clear the entire circuit canvas?')) {
              circuitStore.clearCircuit();
            }
          }}
          className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-studio-subtle rounded-lg border border-studio-border"
          title="Clear Canvas"
        >
          <Trash2 size={14} />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-studio-subtle rounded-lg border border-studio-border"
            title="Export Circuit or Firmware"
          >
            <Download size={14} />
          </button>
          {showExport && (
            <div className="absolute right-0 top-10 w-44 bg-studio-panel border border-studio-border rounded-xl shadow-2xl p-1 z-50">
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-2.5 py-1.5 text-xs text-stone-200 hover:bg-studio-subtle rounded-lg"
              >
                Export JSON Project
              </button>
              <button
                onClick={handleExportIno}
                className="w-full text-left px-2.5 py-1.5 text-xs text-stone-200 hover:bg-studio-subtle rounded-lg"
              >
                Export Arduino (.ino)
              </button>
            </div>
          )}
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={() => circuitStore.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-studio-subtle rounded-lg border border-studio-border"
          title="Toggle Dark/Light Mode"
        >
          {store.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
};

