import React, { useState } from 'react';
import { 
  Play, Square, Share2, Sun, Moon, Cpu, Plus, 
  RotateCcw, Sparkles, Check, ChevronDown, Edit2 
} from 'lucide-react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { PRESET_CIRCUITS } from '../../simulation/presets';

interface TitlebarProps {
  onTogglePalette?: () => void;
  isPaletteOpen?: boolean;
}

export const Titlebar: React.FC<TitlebarProps> = ({ onTogglePalette, isPaletteOpen }) => {
  const store = useCircuitStore();
  const isRunning = store.simulation.isRunning;
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(store.project.name);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (projectName.trim()) {
      circuitStore.setProjectName(projectName.trim());
    } else {
      setProjectName(store.project.name);
    }
  };

  const handleToggleTheme = () => {
    circuitStore.setTheme(store.theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="titlebar" role="banner">
      {/* LEFT: Logo & Project Name */}
      <div className="titlebar__left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '6px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: '#18181b',
            border: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={13} color="#ffffff" />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 700, 
            fontSize: '13px', 
            letterSpacing: '-0.01em',
            color: 'var(--text-white)' 
          }}>
            Visual Circuits
          </span>
        </div>

        <div style={{ height: '14px', width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Project Name Editor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isEditingName ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              autoFocus
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                background: 'var(--bg-input)',
                border: '1px solid var(--accent-blue)',
                borderRadius: '4px',
                padding: '2px 6px',
                outline: 'none',
                width: '160px'
              }}
            />
          ) : (
            <div 
              onClick={() => setIsEditingName(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              className="sb-row"
              title="Click to rename project"
            >
              <span className="titlebar__project-name">{store.project.name}</span>
              <Edit2 size={11} style={{ color: 'var(--text-dim)', opacity: 0.6 }} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px', color: 'var(--status-success)', fontSize: '11px' }}>
            <Check size={12} strokeWidth={2.5} />
            <span style={{ color: 'var(--text-dim)', fontSize: '10.5px' }}>Saved</span>
          </div>
        </div>
      </div>

      {/* CENTER: Simulation Run/Stop, View Mode Switch, Presets */}
      <div className="titlebar__center">
        {/* Run / Stop Simulation Button */}
        {!isRunning ? (
          <button 
            className="sim-btn sim-btn-run" 
            onClick={() => circuitStore.startSimulation()}
            title="Start circuit simulation"
          >
            <Play size={13} fill="currentColor" />
            <span>Simulate</span>
          </button>
        ) : (
          <button 
            className="sim-btn sim-btn-stop" 
            onClick={() => circuitStore.stopSimulation()}
            title="Stop simulation"
          >
            <Square size={12} fill="currentColor" />
            <span>Stop</span>
          </button>
        )}

        {/* 2D / 3D Mode Switch */}
        <div className="mode-switch">
          <button
            type="button"
            className={`mode-switch-segment ${store.viewMode === '2d' ? 'mode-switch-segment--active' : 'mode-switch-segment--inactive'}`}
            onClick={() => circuitStore.setViewMode('2d')}
            title="Switch to 2D Breadboard View"
          >
            <svg className="mode-switch-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
              <line x1="2.5" y1="8" x2="13.5" y2="8" />
              <line x1="8" y1="2.5" x2="8" y2="13.5" />
            </svg>
            <span>2D</span>
          </button>
          <button
            type="button"
            className={`mode-switch-segment ${store.viewMode === '3d' ? 'mode-switch-segment--active' : 'mode-switch-segment--inactive'}`}
            onClick={() => circuitStore.setViewMode('3d')}
            title="Switch to Realistic 3D View"
          >
            <svg className="mode-switch-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8 1.5L14.5 5.2V11.2L8 14.8L1.5 11.2V5.2L8 1.5Z" />
              <path d="M8 14.8V8" />
              <path d="M14.5 5.2L8 8L1.5 5.2" />
            </svg>
            <span>3D</span>
          </button>
        </div>

        {/* Presets dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="sim-btn sim-btn-secondary"
            onClick={() => setIsPresetsOpen(!isPresetsOpen)}
            style={{ padding: '0 10px', height: '28px' }}
          >
            <Cpu size={12} style={{ color: 'var(--accent-blue)' }} />
            <span>Examples</span>
            <ChevronDown size={11} style={{ opacity: 0.7 }} />
          </button>

          {isPresetsOpen && (
            <div 
              className="glass-pane"
              style={{
                position: 'absolute',
                top: '34px',
                left: '0',
                zIndex: 100,
                minWidth: '220px',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-strong)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ 
                padding: '4px 8px', 
                fontSize: '10px', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                color: 'var(--text-dim)', 
                letterSpacing: '0.05em' 
              }}>
                Starter Circuits
              </div>
              {PRESET_CIRCUITS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    circuitStore.loadPreset(preset.id);
                    setIsPresetsOpen(false);
                  }}
                  className={`sb-nav-item ${store.project.id === preset.id ? 'sb-nav-file--active' : ''}`}
                  style={{ textAlign: 'left', padding: '6px 10px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{preset.name}</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>{preset.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Add Component, Share, Theme, Board */}
      <div className="titlebar__right">
        {/* Add Component button */}
        <button
          type="button"
          className={`sim-btn ${isPaletteOpen ? 'sim-btn--active' : 'sim-btn-secondary'}`}
          onClick={onTogglePalette}
          title="Toggle Component Palette"
        >
          <Plus size={13} />
          <span>Components</span>
        </button>

        {/* Board badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '0 8px',
          height: '24px',
          borderRadius: '4px',
          background: 'var(--bg-active)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
          <span>Uno</span>
        </div>

        {/* Share Button */}
        <button 
          type="button" 
          className="sim-btn sim-btn-share"
          onClick={() => {
            const json = JSON.stringify(store.project, null, 2);
            navigator.clipboard.writeText(json);
            alert('Project JSON copied to clipboard!');
          }}
          title="Export / Share Circuit"
        >
          <Share2 size={12} />
          <span>Share</span>
        </button>

        {/* Reset Circuit Button */}
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            if (confirm('Reset circuit to default template?')) {
              circuitStore.loadPreset('uno-blink');
            }
          }}
          title="Reset Circuit"
        >
          <RotateCcw size={14} />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="icon-btn"
          onClick={handleToggleTheme}
          title={`Switch to ${store.theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {store.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};

