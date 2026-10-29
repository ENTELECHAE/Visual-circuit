import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { 
  Code, Terminal, Sliders, Sparkles, Send, 
  Trash2, RotateCw, X, Play, RefreshCw, Check
} from 'lucide-react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { COMPONENT_CATALOG } from '../../simulation/componentCatalog';
import { aiService } from '../../services/aiService';

interface RightPanelProps {
  activeTab: 'editor' | 'serial' | 'inspector' | 'ai';
  onTabChange: (tab: 'editor' | 'serial' | 'inspector' | 'ai') => void;
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ activeTab, onTabChange, onClose }) => {
  const store = useCircuitStore();

  // Serial Monitor state
  const [serialInput, setSerialInput] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; codeSnippet?: string }>>([
    {
      role: 'assistant',
      text: "👋 Hi! I'm your Visual Circuits AI Assistant. Ask me how to wire components, generate Arduino sketches, or debug your circuit logic."
    }
  ]);

  // Selected item details
  const selectedComp = store.project.components.find((c) => c.id === store.selectedComponentId);
  const compDef = COMPONENT_CATALOG.find((d) => d.id === selectedComp?.definitionId);
  const selectedWire = store.project.wires.find((w) => w.id === store.selectedWireId);

  // Auto-scroll serial monitor
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [store.simulation.serialOutput, autoScroll]);

  const handleSendSerial = () => {
    if (!serialInput.trim()) return;
    store.simulation.serialOutput.push(`> ${serialInput}`);
    setSerialInput('');
  };

  const handleSendChat = async (promptText?: string) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim() || isTyping) return;

    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    if (!promptText) setChatInput('');
    setIsTyping(true);

    try {
      const systemPrompt = `You are the Visual Circuits AI assistant embedded in the studio IDE. The user is currently inspecting circuit: "${store.project.name}".
Components in circuit: ${store.project.components.map((c) => c.definitionId).join(', ')}.
Wires in circuit: ${store.project.wires.length}.
Current Arduino code:
\`\`\`cpp
${store.project.code}
\`\`\`
Give clear, concise hardware engineering advice, pin wiring guidance, or Arduino C++ code snippets. When providing Arduino code, enclose it in \`\`\`cpp ... \`\`\`. Keep responses concise, direct, and actionable.`;

      const aiReply = await aiService.chat(
        newMessages.map((m) => ({ role: m.role, content: m.text })),
        systemPrompt
      );

      let snippet: string | undefined = undefined;
      const codeMatch = aiReply.match(/```(?:cpp|arduino|c)?\n([\s\S]*?)```/);
      if (codeMatch) {
        snippet = codeMatch[1].trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiReply.replace(/```(?:cpp|arduino|c)?\n[\s\S]*?```/g, '').trim() || aiReply,
          codeSnippet: snippet,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Connected to larprouter (${aiService.currentModel}). Error: ${err.message || 'Request timeout'}.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const wireColors = [
    { label: 'Green', value: '#3ecf8e' },
    { label: 'Red (VCC)', value: '#f87171' },
    { label: 'Black (GND)', value: '#333333' },
    { label: 'Blue', value: '#58a6ff' },
    { label: 'Yellow', value: '#f5a623' },
    { label: 'Orange', value: '#fb923c' },
    { label: 'Purple', value: '#c084fc' },
    { label: 'White', value: '#f3f4f6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div className="editor-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <button
            type="button"
            className={`editor-tab ${activeTab === 'editor' ? 'editor-tab--active' : ''}`}
            onClick={() => onTabChange('editor')}
          >
            <Code size={13} style={{ color: 'var(--fi-code)' }} />
            <span className="editor-tab-name">sketch.ino</span>
          </button>

          <button
            type="button"
            className={`editor-tab ${activeTab === 'serial' ? 'editor-tab--active' : ''}`}
            onClick={() => onTabChange('serial')}
          >
            <Terminal size={13} style={{ color: 'var(--accent-blue)' }} />
            <span>Serial Monitor</span>
          </button>

          <button
            type="button"
            className={`editor-tab ${activeTab === 'inspector' ? 'editor-tab--active' : ''}`}
            onClick={() => onTabChange('inspector')}
          >
            <Sliders size={13} style={{ color: 'var(--accent-green)' }} />
            <span>Inspector</span>
          </button>

          <button
            type="button"
            className={`editor-tab ${activeTab === 'ai' ? 'editor-tab--active' : ''}`}
            onClick={() => onTabChange('ai')}
          >
            <Sparkles size={13} style={{ color: 'var(--accent-orange)' }} />
            <span>AI Assist</span>
          </button>
        </div>

        <button
          type="button"
          className="sb-icon-btn"
          onClick={onClose}
          title="Close Panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tab Content Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* ================= CODE EDITOR ================= */}
        {activeTab === 'editor' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 10px',
              background: 'var(--bg-panel)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-dim)'
            }}>
              <span>Arduino C++ (AVR-GCC)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="sim-btn sim-btn-run"
                  style={{ height: '22px', fontSize: '11px', padding: '0 8px' }}
                  onClick={() => circuitStore.startSimulation()}
                >
                  <Play size={10} fill="currentColor" />
                  <span>Run</span>
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MonacoEditor
                height="100%"
                language="cpp"
                theme={store.theme === 'dark' ? 'vs-dark' : 'light'}
                value={store.project.code}
                onChange={(newVal) => circuitStore.setCode(newVal || '')}
                options={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12.5,
                  lineHeight: 19,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 8, bottom: 8 },
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>
        )}

        {/* ================= SERIAL MONITOR ================= */}
        {activeTab === 'serial' && (
          <div className="terminal-root">
            <div className="terminal-header">
              <div className="terminal-header__left">
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  PORT: COM3
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Baud: 9600
                </span>
              </div>
              <div className="terminal-header__right">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: 'var(--text-dim)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                  />
                  <span>Autoscroll</span>
                </label>
                <button
                  type="button"
                  className="sb-icon-btn"
                  onClick={() => { store.simulation.serialOutput = []; }}
                  title="Clear Terminal"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="terminal-body" style={{ flex: 1, overflowY: 'auto' }}>
              {store.simulation.serialOutput.length === 0 ? (
                <div className="terminal-empty">
                  No serial output yet. Click "Simulate" to run your sketch.
                </div>
              ) : (
                store.simulation.serialOutput.map((msg, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      lineHeight: '1.6',
                      color: msg.startsWith('>') ? 'var(--accent-primary)' :
                             msg.includes('ERR') || msg.includes('Error') ? 'var(--term-stderr)' :
                             msg.includes('WARN') ? 'var(--term-warn)' : 'var(--term-stdout)'
                    }}
                  >
                    {msg}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>

            <div className="terminal-input-row">
              <input
                type="text"
                className="terminal-input"
                placeholder="Send message to Arduino serial..."
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSerial()}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={handleSendSerial}
                title="Send"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ================= PROPERTY INSPECTOR ================= */}
        {activeTab === 'inspector' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {selectedComp ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-white)' }}>{selectedComp.label}</h3>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{selectedComp.id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className="sb-icon-btn"
                      onClick={() => circuitStore.rotateComponent(selectedComp.id)}
                      title="Rotate 90 degrees"
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      type="button"
                      className="sb-icon-btn"
                      style={{ color: 'var(--status-error)' }}
                      onClick={() => circuitStore.deleteComponent(selectedComp.id)}
                      title="Delete component"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Specific Configurable Properties */}
                {selectedComp.definitionId.startsWith('led') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>LED Color</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['red', 'green', 'blue', 'yellow', 'white'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => circuitStore.updateComponentProperty(selectedComp.id, 'color', col)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: col === 'red' ? '#e53935' : col === 'green' ? '#4caf50' : col === 'blue' ? '#2196f3' : col === 'yellow' ? '#ffeb3b' : '#ffffff',
                            border: (selectedComp.properties.color || 'red') === col ? '2px solid var(--accent-primary)' : '1px solid rgba(0,0,0,0.2)',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedComp.definitionId === 'resistor' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Resistance (Ohms)</label>
                    <select
                      value={selectedComp.properties.resistance || 220}
                      onChange={(e) => circuitStore.updateComponentProperty(selectedComp.id, 'resistance', Number(e.target.value))}
                      style={{
                        padding: '6px 8px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px'
                      }}
                    >
                      <option value={100}>100 Ω</option>
                      <option value={220}>220 Ω (Standard LED)</option>
                      <option value={330}>330 Ω</option>
                      <option value={1000}>1 kΩ</option>
                      <option value={4700}>4.7 kΩ</option>
                      <option value={10000}>10 kΩ (Pull-up)</option>
                      <option value={100000}>100 kΩ</option>
                    </select>
                  </div>
                )}

                {selectedComp.definitionId === 'potentiometer' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Analog Value</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-white)' }}>{selectedComp.properties.value ?? 512}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1023}
                      value={selectedComp.properties.value ?? 512}
                      onChange={(e) => circuitStore.updateComponentProperty(selectedComp.id, 'value', Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                  </div>
                )}

                {selectedComp.definitionId === 'hc-sr04' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Distance</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-white)' }}>{selectedComp.properties.distanceCm ?? 50} cm</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={400}
                      value={selectedComp.properties.distanceCm ?? 50}
                      onChange={(e) => circuitStore.updateComponentProperty(selectedComp.id, 'distanceCm', Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                  </div>
                )}

                {selectedComp.definitionId === 'push-button' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Interactive Test</label>
                    <button
                      type="button"
                      onMouseDown={() => circuitStore.updateComponentProperty(selectedComp.id, 'isPressed', true)}
                      onMouseUp={() => circuitStore.updateComponentProperty(selectedComp.id, 'isPressed', false)}
                      onMouseLeave={() => circuitStore.updateComponentProperty(selectedComp.id, 'isPressed', false)}
                      style={{
                        padding: '10px',
                        background: selectedComp.properties.isPressed ? 'var(--accent-primary)' : 'var(--bg-active)',
                        color: selectedComp.properties.isPressed ? 'var(--text-on-primary)' : 'var(--text-primary)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {selectedComp.properties.isPressed ? 'Pressed (HIGH)' : 'Press and Hold Button'}
                    </button>
                  </div>
                )}

                {/* Pins Information */}
                {compDef?.pins && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Pins ({compDef.pins.length})</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: 'var(--bg-input)', padding: '6px', borderRadius: '6px' }}>
                      {compDef.pins.map((p) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{p.label || p.id}</span>
                          <span style={{ color: p.type === 'power' ? 'var(--status-error)' : p.type === 'ground' ? 'var(--text-dim)' : 'var(--accent-blue)' }}>
                            {p.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedWire ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-white)' }}>Jumper Wire</h3>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{selectedWire.id}</span>
                  </div>
                  <button
                    type="button"
                    className="sb-icon-btn"
                    style={{ color: 'var(--status-error)' }}
                    onClick={() => circuitStore.deleteWire(selectedWire.id)}
                    title="Delete Wire"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div>From: <strong style={{ color: 'var(--text-primary)' }}>{selectedWire.from.componentId}:{selectedWire.from.pinId}</strong></div>
                  <div>To: <strong style={{ color: 'var(--text-primary)' }}>{selectedWire.to.componentId}:{selectedWire.to.pinId}</strong></div>
                </div>

                {/* Wire Color Palette */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Wire Color</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {wireColors.map((wc) => (
                      <button
                        key={wc.value}
                        type="button"
                        onClick={() => circuitStore.updateWireColor(selectedWire.id, wc.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 6px',
                          background: 'var(--bg-input)',
                          border: selectedWire.color === wc.value ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '10.5px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: wc.value, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px 16px', fontSize: '12px' }}>
                <Sliders size={28} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                <div>Select any component or wire on the canvas to inspect and edit its properties.</div>
              </div>
            )}
          </div>
        )}

        {/* ================= AI CIRCUIT ASSISTANT ================= */}
        {activeTab === 'ai' && (
          <div className="chat-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Live AI Status Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-panel)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span>AI Assistant</span>
              </div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{aiService.currentModel}</span>
            </div>
            {/* Messages Area */}
            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: m.role === 'user' ? 'var(--text-on-primary)' : 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <div>{m.text}</div>
                  {m.codeSnippet && (
                    <div style={{ marginTop: '8px' }}>
                      <pre style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        overflowX: 'auto',
                        color: '#ECEBE6'
                      }}>
                        {m.codeSnippet}
                      </pre>
                      <button
                        type="button"
                        onClick={() => {
                          circuitStore.setCode(m.codeSnippet!);
                          onTabChange('editor');
                        }}
                        style={{
                          marginTop: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          background: 'var(--accent-blue)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Code size={11} />
                        <span>Insert into sketch.ino</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', color: 'var(--text-dim)', fontSize: '11px' }}>
                  <RefreshCw size={12} className="spin" />
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '4px 8px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}>
              {['Blink LED', 'Sweep Servo', 'Ultrasonic Radar'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chat-starter-pill"
                  style={{ padding: '3px 8px', fontSize: '10.5px' }}
                  onClick={() => handleSendChat(s)}
                >
                  <Sparkles size={10} style={{ color: 'var(--accent-orange)' }} />
                  <span>{s}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="chat-box" style={{ padding: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="chat-textarea"
                  style={{ minHeight: '32px', height: '32px', padding: '6px 10px', fontSize: '12px' }}
                  placeholder="Ask circuit question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <button
                  type="button"
                  className="chat-send-btn"
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim()}
                  style={{ width: '32px', height: '32px', flexShrink: 0 }}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

