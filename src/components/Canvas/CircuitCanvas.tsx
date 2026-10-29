import React, { useRef, useState, useEffect } from 'react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { ComponentVisual } from './ComponentVisual';
import { CircuitGraph } from '../../simulation/circuitGraph';
import { COMPONENT_CATALOG } from '../../simulation/componentCatalog';
import { 
  RotateCw, Trash2, ZoomIn, ZoomOut, Maximize2, 
  RotateCcw, Eye, Sparkles 
} from 'lucide-react';

export const CircuitCanvas: React.FC = () => {
  const store = useCircuitStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);

  // Handle Pan and Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    circuitStore.setZoom(store.zoom * zoomFactor);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingCompId && !store.drawingWire) {
      // Clicked on canvas background -> Pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - store.pan.x, y: e.clientY - store.pan.y });
      circuitStore.setSelectedComponent(null);
      circuitStore.setSelectedWire(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - store.pan.x) / store.zoom;
    const rawY = (e.clientY - rect.top - store.pan.y) / store.zoom;
    setMousePos({ x: rawX, y: rawY });

    if (isPanning) {
      circuitStore.setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingCompId) {
      circuitStore.moveComponent(
        draggingCompId,
        Math.round(rawX - dragOffset.x),
        Math.round(rawY - dragOffset.y)
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCompId(null);
  };

  // Keyboard shortcut listener for deleting selected components/wires
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedComponentId) {
          circuitStore.deleteComponent(store.selectedComponentId);
        } else if (store.selectedWireId) {
          circuitStore.deleteWire(store.selectedWireId);
        }
      } else if (e.key === 'Escape') {
        circuitStore.cancelWireDrawing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.selectedComponentId, store.selectedWireId]);

  // Compute world coordinates for wire endpoints
  const getPinPos = (componentId: string, pinId: string) => {
    const comp = store.project.components.find((c) => c.id === componentId);
    if (!comp) return { x: 0, y: 0 };
    const def = COMPONENT_CATALOG.find((d) => d.id === comp.definitionId);
    const pinDef = def?.pins.find((p) => p.id === pinId);
    if (!pinDef) return { x: comp.x, y: comp.y };
    return CircuitGraph.getPinWorldPos(comp, pinDef);
  };

  return (
    <div
      ref={containerRef}
      className="sim-canvas-wrap"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isPanning ? 'grabbing' : 'default',
        background: 'var(--bg-base)',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        circuitStore.cancelWireDrawing();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const defId = e.dataTransfer.getData('text/plain');
        if (!defId || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dropX = (e.clientX - rect.left - store.pan.x) / store.zoom;
        const dropY = (e.clientY - rect.top - store.pan.y) / store.zoom;
        const def = COMPONENT_CATALOG.find((d) => d.id === defId);
        const w = def?.width ?? 60;
        const h = def?.height ?? 60;
        circuitStore.addComponent(defId, Math.round(dropX - w / 2), Math.round(dropY - h / 2));
      }}
    >
      {/* Canvas Transform Layer */}
      <div
        style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${store.pan.x}px, ${store.pan.y}px) scale(${store.zoom})`,
          transition: isPanning ? 'none' : 'transform 0.05s ease-out',
        }}
      >
        {/* Subtle grid pattern background */}
        <svg
          style={{
            position: 'absolute',
            top: -2000,
            left: -2000,
            width: 8000,
            height: 8000,
            pointerEvents: 'none',
            opacity: store.theme === 'dark' ? 0.04 : 0.06,
          }}
        >
          <defs>
            <pattern id="canvas-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#canvas-grid-dots)" />
        </svg>

        {/* SVG WIRING LAYER */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 6000,
            height: 6000,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {store.project.wires.map((wire) => {
            const p1 = getPinPos(wire.from.componentId, wire.from.pinId);
            const p2 = getPinPos(wire.to.componentId, wire.to.pinId);

            // Natural catenary curve offset for realistic wire drape
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 + Math.min(80, Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.22);

            const isSelected = store.selectedWireId === wire.id;
            const isSimActive = store.simulation.isRunning;

            return (
              <g
                key={wire.id}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  circuitStore.setSelectedWire(wire.id);
                }}
              >
                {/* Thick invisible hover hit-area */}
                <path
                  d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                />
                {/* Outer shadow / selection highlight */}
                <path
                  d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={isSelected ? 'var(--accent-primary)' : isSimActive ? `${wire.color}55` : 'rgba(0,0,0,0.35)'}
                  strokeWidth={isSelected ? '6' : isSimActive ? '5' : '4'}
                  strokeLinecap="round"
                />
                {/* Core wire stroke */}
                <path
                  d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={wire.color}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                {/* Terminal ring endpoints */}
                <circle cx={p1.x} cy={p1.y} r="3" fill="#1C1C1C" stroke={wire.color} strokeWidth="1.5" />
                <circle cx={p2.x} cy={p2.y} r="3" fill="#1C1C1C" stroke={wire.color} strokeWidth="1.5" />
              </g>
            );
          })}

          {/* DYNAMIC WIRE BEING DRAWN */}
          {store.drawingWire && (
            <g style={{ pointerEvents: 'none' }}>
              {(() => {
                const p1 = getPinPos(store.drawingWire.from.componentId, store.drawingWire.from.pinId);
                const p2 = mousePos;
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2 + 30;
                return (
                  <>
                    <path
                      d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                      fill="none"
                      stroke={store.drawingWire.color}
                      strokeWidth="3"
                      strokeDasharray="5,4"
                    />
                    <circle cx={p2.x} cy={p2.y} r="4" fill={store.drawingWire.color} />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* COMPONENTS LAYER */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {store.project.components.map((comp) => {
            const isSelected = store.selectedComponentId === comp.id;

            return (
              <div
                key={comp.id}
                style={{
                  position: 'absolute',
                  left: `${comp.x}px`,
                  top: `${comp.y}px`,
                }}
                onMouseDown={(e) => {
                  if (e.button === 0 && !store.drawingWire) {
                    e.stopPropagation();
                    circuitStore.setSelectedComponent(comp.id);
                    setDraggingCompId(comp.id);
                    setDragOffset({
                      x: mousePos.x - comp.x,
                      y: mousePos.y - comp.y,
                    });
                  }
                }}
              >
                <ComponentVisual
                  component={comp}
                  isSelected={isSelected}
                  onPinMouseDown={(pinDef, e) => {
                    e.stopPropagation();
                    if (store.drawingWire) {
                      circuitStore.completeWireDrawing(comp.id, pinDef.id);
                    } else {
                      circuitStore.startWireDrawing(comp.id, pinDef.id);
                    }
                  }}
                  onPinMouseEnter={(pinDef) => {
                    circuitStore.setHoveredPin({ componentId: comp.id, pinId: pinDef.id, pinDef });
                  }}
                  onPinMouseLeave={() => {
                    circuitStore.setHoveredPin(null);
                  }}
                />

                {/* Pin Name Labels overlay when toggled */}
                {showLabels && comp.definitionId === 'arduino-uno' && (
                  <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    {/* Digital Pins Label Header */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '80px',
                      display: 'flex',
                      gap: '5.5px',
                      fontSize: '7.5px',
                      fontFamily: 'var(--font-mono)',
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 600,
                    }}>
                      {['SCL','SDA','AREF','GND','13','12','11','10','9','8'].map(l => (
                        <span key={l} style={{ width: 12, textAlign: 'center' }}>{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floating Quick Actions when component is selected */}
                {isSelected && (
                  <div
                    className="glass-pane"
                    style={{
                      position: 'absolute',
                      top: '-38px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '2px 4px',
                      zIndex: 30,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="sb-icon-btn"
                      title="Rotate 90°"
                      onClick={() => circuitStore.rotateComponent(comp.id)}
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      type="button"
                      className="sb-icon-btn"
                      style={{ color: 'var(--status-error)' }}
                      title="Delete Component"
                      onClick={() => circuitStore.deleteComponent(comp.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING WIRE COLOR PICKER (when wire is selected or drawing) */}
      {(store.selectedWireId || store.drawingWire) && (
        <div
          className="glass-pane"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '24px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 40,
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Wire Color:</span>
          {[
            { label: 'Red (5V/VCC)', color: '#EF4444' },
            { label: 'Black (GND)', color: '#1F2937' },
            { label: 'Yellow (Signal)', color: '#EAB308' },
            { label: 'Green (UART/IO)', color: '#10B981' },
            { label: 'Blue (PWM)', color: '#3B82F6' },
            { label: 'Orange', color: '#F97316' },
            { label: 'Purple', color: '#8B5CF6' },
          ].map((item) => (
            <button
              key={item.color}
              type="button"
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: item.color,
                border: '1.5px solid rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'transform .15s',
              }}
              title={item.label}
              onClick={() => {
                if (store.selectedWireId) {
                  circuitStore.updateWireColor(store.selectedWireId, item.color);
                } else if (store.drawingWire) {
                  store.drawingWire.color = item.color;
                  circuitStore.startWireDrawing(store.drawingWire.from.componentId, store.drawingWire.from.pinId, item.color);
                }
              }}
            />
          ))}
          {store.selectedWireId && (
            <button
              type="button"
              className="sb-icon-btn"
              style={{ color: 'var(--status-error)', marginLeft: '4px' }}
              title="Delete Wire"
              onClick={() => circuitStore.deleteWire(store.selectedWireId!)}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}

      {/* FLOATING NAVIGATION CLUSTER (BOTTOM LEFT) - Exact Tinkered.ai structure */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 30,
        }}
      >
        {/* Undo / Redo */}
        <div className="sim-nav-group">
          <div className="sim-nav-group-row">
            <button 
              type="button" 
              className="sim-nav-btn" 
              title="Undo (Ctrl+Z)"
              onClick={() => {}}
            >
              <RotateCcw size={13} />
            </button>
            <button 
              type="button" 
              className="sim-nav-btn" 
              title="Redo (Ctrl+Y)"
              onClick={() => {}}
            >
              <RotateCw size={13} />
            </button>
          </div>
        </div>

        {/* Zoom Out / Label / Zoom In */}
        <div className="sim-nav-group">
          <div className="sim-nav-group-row">
            <button
              type="button"
              className="sim-nav-btn"
              title="Zoom out"
              onClick={() => circuitStore.setZoom(store.zoom * 0.88)}
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className="sim-nav-zoom-label"
              title="Reset Zoom to 100%"
              onClick={() => {
                circuitStore.setZoom(1.0);
                circuitStore.setPan({ x: 40, y: 30 });
              }}
            >
              {Math.round(store.zoom * 100)}%
            </button>
            <button
              type="button"
              className="sim-nav-btn"
              title="Zoom in"
              onClick={() => circuitStore.setZoom(store.zoom * 1.12)}
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

        {/* Fit all & Labels toggle */}
        <div className="sim-nav-group">
          <div className="sim-nav-group-row">
            <button
              type="button"
              className="sim-nav-btn"
              title="Fit all components into view"
              onClick={() => {
                circuitStore.setZoom(0.95);
                circuitStore.setPan({ x: 50, y: 40 });
              }}
            >
              <Maximize2 size={13} />
            </button>
          </div>

          <button
            type="button"
            className={`sim-nav-toggle ${showLabels ? 'sim-nav-toggle--on' : ''}`}
            onClick={() => setShowLabels(!showLabels)}
            title={showLabels ? 'Hide pin labels' : 'Show pin labels'}
          >
            <span className="sim-nav-toggle-label">Labels</span>
            <span className="sim-nav-toggle-pill">
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: showLabels ? 'var(--text-on-primary)' : 'var(--text-dim)',
                  transition: 'transform .18s ease, background .18s ease',
                  transform: showLabels ? 'translateX(5px)' : 'translateX(-5px)',
                }}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
