import React from 'react';
import { CheckCircle2, AlertCircle, Cpu, Clock, Terminal } from 'lucide-react';
import { useCircuitStore } from '../../store/circuitStore';

export const Statusbar: React.FC = () => {
  const store = useCircuitStore();
  const isRunning = store.simulation.isRunning;

  return (
    <footer className="statusbar" role="contentinfo">
      {/* Simulation status */}
      <div className="statusbar-item">
        {isRunning ? (
          <>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--status-success)',
              boxShadow: '0 0 6px var(--status-success)',
              display: 'inline-block'
            }} />
            <span style={{ color: 'var(--text-white)', fontWeight: 500 }}>Running</span>
            <span style={{ color: 'var(--text-dim)' }}>@ 16.00 MHz</span>
          </>
        ) : (
          <>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--text-dim)',
              display: 'inline-block'
            }} />
            <span>Ready</span>
          </>
        )}
      </div>

      <div style={{ height: '10px', width: '1px', background: 'var(--border-statusbar)' }} />

      {/* Target Board */}
      <div className="statusbar-item" title="Target Microcontroller">
        <Cpu size={11} style={{ opacity: 0.7 }} />
        <span>Arduino Uno (ATmega328P)</span>
      </div>

      <div style={{ height: '10px', width: '1px', background: 'var(--border-statusbar)' }} />

      {/* Compiler status */}
      <div className="statusbar-item statusbar-item--success">
        <CheckCircle2 size={11} />
        <span>Compiled OK (924 B)</span>
      </div>

      {isRunning && (
        <>
          <div style={{ height: '10px', width: '1px', background: 'var(--border-statusbar)' }} />
          <div className="statusbar-item">
            <Clock size={11} style={{ opacity: 0.7 }} />
            <span>{(store.simulation.timeElapsedMs / 1000).toFixed(1)}s</span>
          </div>
        </>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Serial port & encoding */}
      <div className="statusbar-item" style={{ fontFamily: 'var(--font-mono)' }}>
        <Terminal size={11} style={{ opacity: 0.7 }} />
        <span>COM3: 9600</span>
      </div>

      <div style={{ height: '10px', width: '1px', background: 'var(--border-statusbar)' }} />

      <div className="statusbar-item" style={{ fontFamily: 'var(--font-mono)' }}>
        <span>UTF-8</span>
      </div>

      <div className="statusbar-item" style={{ fontFamily: 'var(--font-mono)' }}>
        <span>Spaces: 2</span>
      </div>
    </footer>
  );
};

