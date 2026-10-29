import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useCircuitStore, circuitStore } from './store/circuitStore';
import { AppHeader } from './components/Navigation/AppHeader';
import { BuilderChat } from './components/Builder/BuilderChat';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CircuitCanvas } from './components/Canvas/CircuitCanvas';
import { CircuitView3D } from './components/View3D/CircuitView3D';
import { RightPanel } from './components/RightPanel/RightPanel';
import { Statusbar } from './components/Statusbar/Statusbar';
import { Code, Terminal, Sliders, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const store = useCircuitStore();

  // Active section: 'builder' | 'studio'
  const [currentSection, setCurrentSection] = useState<'builder' | 'studio'>('builder');

  // Studio Panel widths
  const [leftWidth, setLeftWidth] = useState(210);
  const [rightWidth, setRightWidth] = useState(420);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  // Resizing logic with pointer events
  const resizerRef = useRef<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizerDown = useCallback((side: 'left' | 'right', e: React.PointerEvent) => {
    e.preventDefault();
    resizerRef.current = side;
    startXRef.current = e.clientX;
    startWidthRef.current = side === 'left' ? leftWidth : rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startXRef.current;
      if (resizerRef.current === 'left') {
        setLeftWidth(Math.max(170, Math.min(380, startWidthRef.current + dx)));
      } else if (resizerRef.current === 'right') {
        setRightWidth(Math.max(300, Math.min(750, startWidthRef.current - dx)));
      }
    };

    const onUp = () => {
      resizerRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [leftWidth, rightWidth]);

  // Keep theme attribute updated on html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.theme);
  }, [store.theme]);

  return (
    <div 
      className={`m-shell ${currentSection === 'builder' ? 'm-shell--builder' : 'ide-root'}${store.simulation.isRunning ? ' is-running' : ''}`}
      data-theme={store.theme}
    >
      {/* 1. TOP HEADER WITH [ BUILDER | STUDIO ] SWITCHER */}
      <AppHeader
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        isPaletteOpen={isPaletteOpen}
        onTogglePalette={() => setIsPaletteOpen(!isPaletteOpen)}
      />

      {/* 2. BODY CONTENT: BUILDER OR STUDIO */}
      {currentSection === 'builder' ? (
        /* ================= BUILDER SECTION ================= */
        <BuilderChat onSwitchToStudio={() => setCurrentSection('studio')} />
      ) : (
        /* ================= STUDIO SECTION ================= */
        <div className="ide-body">
          {/* Left Sidebar (Parts drawer & Files) */}
          <div
            className="ide-panel ide-panel--left"
            style={{
              width: leftWidth,
              minWidth: leftWidth,
              maxWidth: leftWidth,
              display: isPaletteOpen ? 'flex' : 'none',
            }}
          >
            <Sidebar
              activeTab={store.activeRightTab}
              onSelectTab={(tab) => {
                if (store.activeRightTab !== tab) {
                  circuitStore.toggleRightTab(tab);
                }
              }}
            />
          </div>

          {/* Left Resizer */}
          {isPaletteOpen && (
            <div
              className="ide-resizer ide-resizer--vertical"
              onPointerDown={(e) => handleResizerDown('left', e)}
              title="Drag to resize sidebar"
            />
          )}

          {/* Central Circuit Canvas Viewport (2D / 3D) */}
          <main className="ide-center">
            <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', minHeight: 0, display: store.viewMode === '2d' ? 'flex' : 'none', flexDirection: 'column' }}>
              <CircuitCanvas />
            </div>
            <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', minHeight: 0, display: store.viewMode === '3d' ? 'flex' : 'none', flexDirection: 'column' }}>
              <CircuitView3D />
            </div>

            {/* Quick tab trigger buttons on top-right of canvas */}
            <div
              className="glass-pane"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '3px',
                borderRadius: '8px',
                zIndex: 30,
              }}
            >
              <button
                type="button"
                onClick={() => circuitStore.toggleRightTab('editor')}
                className={`icon-btn ${store.activeRightTab === 'editor' ? 'icon-btn--active' : ''}`}
                title="Toggle Code Editor"
                style={{ width: '28px', height: '28px' }}
              >
                <Code size={13} />
              </button>
              <button
                type="button"
                onClick={() => circuitStore.toggleRightTab('serial')}
                className={`icon-btn ${store.activeRightTab === 'serial' ? 'icon-btn--active' : ''}`}
                title="Toggle Serial Terminal"
                style={{ width: '28px', height: '28px' }}
              >
                <Terminal size={13} />
              </button>
              <button
                type="button"
                onClick={() => circuitStore.toggleRightTab('inspector')}
                className={`icon-btn ${store.activeRightTab === 'inspector' ? 'icon-btn--active' : ''}`}
                title="Toggle Property Inspector"
                style={{ width: '28px', height: '28px' }}
              >
                <Sliders size={13} />
              </button>
              <button
                type="button"
                onClick={() => circuitStore.toggleRightTab('ai')}
                className={`icon-btn ${store.activeRightTab === 'ai' ? 'icon-btn--active' : ''}`}
                title="Toggle AI Circuit Assistant"
                style={{ width: '28px', height: '28px' }}
              >
                <Sparkles size={13} style={{ color: 'var(--accent-orange)' }} />
              </button>
            </div>
          </main>

          {/* Right Resizer and Panel */}
          {store.activeRightTab && (
            <>
              <div
                className="ide-resizer ide-resizer--vertical"
                onPointerDown={(e) => handleResizerDown('right', e)}
                title="Drag to resize panel"
              />
              <aside
                className="ide-panel ide-panel--right"
                style={{
                  width: rightWidth,
                  minWidth: rightWidth,
                  maxWidth: rightWidth,
                }}
              >
                <RightPanel
                  activeTab={store.activeRightTab}
                  onTabChange={(tab) => {
                    circuitStore.toggleRightTab(tab);
                  }}
                  onClose={() => {
                    circuitStore.toggleRightTab(store.activeRightTab!);
                  }}
                />
              </aside>
            </>
          )}
        </div>
      )}

      {/* 3. BOTTOM STATUSBAR (24px) */}
      <Statusbar />
    </div>
  );
};
