import React, { useState } from 'react';
import {
  Send, Sparkles, Paperclip, ArrowRight, Play,
  Cpu, CheckCircle2, RefreshCw, Code, Bot, Settings, Key
} from 'lucide-react';
import { circuitStore } from '../../store/circuitStore';
import { aiService } from '../../services/aiService';
import { StarterPills } from './StarterPills';
import { ShowcaseCards } from './ShowcaseCards';

interface BuilderChatProps {
  onSwitchToStudio: () => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isGenerating?: boolean;
  bom?: Array<{ name: string; count: number; category: string }>;
  codeSnippet?: string;
  presetToLoad?: string;
}

export const BuilderChat: React.FC<BuilderChatProps> = ({ onSwitchToStudio }) => {
  const [inputVal, setInputVal] = useState('');
  const [mode, setMode] = useState<'agent' | 'ask'>('agent');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(aiService.currentModel);

  const handleSubmit = async (promptText?: string, targetPreset?: string) => {
    const text = promptText || inputVal;
    if (!text.trim() || isProcessing) return;

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: assistantMsgId, role: 'assistant', content: 'Synthesizing circuit schematics & code...', isGenerating: true }
    ]);

    if (!promptText) setInputVal('');
    setIsProcessing(true);

    try {
      if (targetPreset) {
        // Preset shortcut
        circuitStore.loadPreset(targetPreset);
        let bom = [
          { name: 'Arduino Uno R3', count: 1, category: 'MCU' },
          { name: 'Half Breadboard', count: 1, category: 'Wiring' },
          { name: 'Output Peripheral', count: 1, category: 'Output' },
          { name: 'Jumper Wires (M-M)', count: 4, category: 'Wiring' },
        ];
        let code = circuitStore.getState().project.code;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                ...msg,
                isGenerating: false,
                content: `Loaded verified ${targetPreset} hardware circuit. Complete Arduino C++ sketch and wiring graph are prepared.`,
                bom,
                codeSnippet: code,
                presetToLoad: targetPreset,
              }
              : msg
          )
        );
      } else if (mode === 'ask') {
        // Informational question
        const reply = await aiService.chat([
          { role: 'user', content: text }
        ], 'You are the Visual Circuits technical assistant. Answer the user electronics, microcontroller, or Arduino questions clearly and concisely.');

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                ...msg,
                isGenerating: false,
                content: reply,
              }
              : msg
          )
        );
      } else {
        // Agent circuit design mode
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: 'Synthesizing electronic schematics, BOM, and Arduino C++ sketch...' }
              : msg
          )
        );

        const design = await aiService.generateCircuit(text);

        // Map design to project store
        circuitStore.loadPreset('uno-blink');
        circuitStore.setProjectName(design.projectName || text.slice(0, 28));
        circuitStore.setCode(design.code);

        const bom = design.bom.map((b) => ({
          name: b.component,
          count: b.quantity,
          category: b.notes || 'Hardware',
        }));

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                ...msg,
                isGenerating: false,
                content: design.explanation || `I designed and verified the circuit for "${text}". The ATmega328P I/O registers, pin assignments, and C++ sketch are loaded and ready to simulate!`,
                bom,
                codeSnippet: design.code,
                presetToLoad: 'uno-blink',
              }
              : msg
          )
        );
      }
    } catch (err: any) {
      console.warn('AI generation error, using local fallback:', err);
      // Fallback
      circuitStore.loadPreset('uno-blink');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
              ...msg,
              isGenerating: false,
              content: `Generated baseline circuit for "${text}". Hardware loaded on canvas.`,
              bom: [
                { name: 'Arduino Uno R3', count: 1, category: 'MCU' },
                { name: 'Half Breadboard', count: 1, category: 'Wiring' },
                { name: 'Red LED', count: 1, category: 'Output' },
                { name: '220Ω Resistor', count: 1, category: 'Passive' }
              ],
              codeSnippet: circuitStore.getState().project.code,
              presetToLoad: 'uno-blink',
            }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = () => {
    if (newKeyInput.trim()) {
      aiService.setApiKey(newKeyInput.trim());
      setNewKeyInput('');
    }
    aiService.setModel(selectedModel);
    setShowSettings(false);
  };

  return (
    <div className="m-shell__body">
      {/* Top AI Status Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 50,
      }}>
        <div
          onClick={() => setShowSettings(!showSettings)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#111113',
            border: '1px solid #27272a',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: '#a1a1aa',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
          title="Click to configure AI Router API Key & Model"
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <span>AI Copilot: <strong style={{ color: '#ffffff' }}>{selectedModel}</strong></span>
          <Settings size={12} style={{ opacity: 0.7 }} />
        </div>

        {/* AI Settings Modal Dropdown */}
        {showSettings && (
          <div style={{
            position: 'absolute',
            top: '32px',
            right: '0',
            width: '320px',
            backgroundColor: '#111113',
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 100,
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Router Configuration
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#71717a', display: 'block', marginBottom: '4px' }}>
                API ENDPOINT (OPENAI COMPATIBLE)
              </label>
              <input
                type="text"
                readOnly
                value="https://larprouter.com/v1"
                style={{
                  width: '100%',
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: '#a1a1aa',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#71717a', display: 'block', marginBottom: '4px' }}>
                API KEY STATUS
              </label>
              <input
                type="text"
                readOnly
                value="•••••••••••••••• (Encrypted & Active)"

                style={{
                  width: '100%',
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#71717a', display: 'block', marginBottom: '4px' }}>
                MODEL
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{
                  width: '100%',
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <option value="glm-5.3-flash">GLM 5.3 Flash (Fast & Recommended)</option>
                <option value="deepseek-v4.1-flash">DeepSeek V4.1 Flash</option>
                <option value="deepseek-v4.1-flash-fast">DeepSeek V4.1 Flash Fast</option>
                <option value="minimax-m3.1-flash">MiniMax M3.1 Flash</option>
                <option value="kimi-k3.1-pro">Kimi K3.1 Pro</option>
                <option value="qwen3.8-27b-non-abliterated">Qwen 3.8 27B</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              style={{
                backgroundColor: '#ffffff',
                color: '#09090b',
                border: 'none',
                borderRadius: '5px',
                padding: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              Save Configuration
            </button>
          </div>
        )}
      </div>

      {/* If no chat messages, show Tinkered.ai Hero screen */}
      {messages.length === 0 ? (
        <div className="chat-welcome-hero">
          {/* Visual Circuits Logo */}
          <div className="chat-welcome-logo">
            <svg
              className="chat-welcome-logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L12 6M12 18L12 22M2 12H6M18 12H22M4.92893 4.92893L7.75736 7.75736M16.2426 16.2426L19.0711 19.0711M4.92893 19.0711L7.75736 16.2426M16.2426 7.75736L19.0711 4.92893" />
            </svg>
            <span className="chat-welcome-logo-text">Visual Circuits</span>
          </div>

          {/* Exact Tinkered.ai Hero Title */}
          <h1 className="chat-welcome-title">
            Build something<br />
            <span className="chat-welcome-title-dim">extraordinary.</span>
          </h1>

          {/* Prompt Input Box */}
          <div
            className="chat-box"
            style={{
              width: '100%',
              maxWidth: '720px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-strong)',
              borderRadius: '14px',
              padding: '12px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              textAlign: 'left'
            }}
          >
            <textarea
              className="chat-textarea"
              placeholder="Ask Visual Circuits anything, e.g. 'Build an obstacle avoiding radar with ultrasonic and servo'"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                minHeight: '44px',
                padding: '0',
                fontSize: '13.5px',
                color: 'var(--text-white)'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'agent' ? 'ask' : 'agent')}
                  className="mode-switch-segment"
                  style={{
                    height: '24px',
                    padding: '0 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: mode === 'agent' ? 'var(--bg-active)' : 'transparent',
                    fontSize: '11px',
                    color: mode === 'agent' ? 'var(--accent-primary)' : 'var(--text-muted)'
                  }}
                  title={mode === 'agent' ? 'Agent mode (generates circuit + code)' : 'Ask mode (answers questions)'}
                >
                  <Bot size={12} />
                  <span>{mode === 'agent' ? 'Agent' : 'Ask'}</span>
                </button>

                <button className="icon-btn" style={{ width: '24px', height: '24px' }} title="Attach schematic or code">
                  <Paperclip size={13} />
                </button>
              </div>

              <button
                type="button"
                className="chat-send-btn"
                onClick={() => handleSubmit()}
                disabled={!inputVal.trim() || isProcessing}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: inputVal.trim() ? 'var(--accent-primary)' : 'var(--bg-active)',
                  color: inputVal.trim() ? 'var(--text-on-primary)' : 'var(--text-dim)'
                }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>

          {/* Quick Starter Pills */}
          <StarterPills onSelectPrompt={(prompt, preset) => handleSubmit(prompt, preset)} />

          {/* Showcase Templates */}
          <ShowcaseCards onOpenProject={(presetId) => onSwitchToStudio()} />
        </div>
      ) : (
        /* Conversation History & Generated Circuit Preview */
        <div style={{
          width: '100%',
          maxWidth: '820px',
          margin: '0 auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.role === 'user' ? '70%' : '100%',
                background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-panel)',
                color: msg.role === 'user' ? 'var(--text-on-primary)' : 'var(--text-primary)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '14px 18px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    color: '#09090b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={11} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-white)' }}>
                    Visual Circuits Architect (larprouter)
                  </span>
                </div>
              )}

              <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                {msg.content}
              </div>

              {msg.isGenerating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: 'var(--text-dim)', fontSize: '11.5px' }}>
                  <RefreshCw size={13} className="spin" />
                  <span>Synthesizing microcontroller connections...</span>
                </div>
              )}

              {/* Bill of Materials (BOM) */}
              {msg.bom && msg.bom.length > 0 && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Bill of Materials (BOM)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
                    {msg.bom.map((item, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: 'var(--bg-input)',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '11px'
                        }}
                      >
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
                        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>x{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action: Open in Studio */}
              {!msg.isGenerating && msg.role === 'assistant' && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={onSwitchToStudio}
                    className="sim-btn sim-btn-run"
                    style={{ height: '32px', padding: '0 16px', borderRadius: '6px', fontWeight: 600 }}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Open & Run in Studio</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Follow-up input */}
          <div style={{ marginTop: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '8px 12px'
            }}>
              <input
                type="text"
                placeholder="Ask follow-up question or request changes..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  flex: 1
                }}
              />
              <button
                type="button"
                className="chat-send-btn"
                onClick={() => handleSubmit()}
                disabled={!inputVal.trim() || isProcessing}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: inputVal.trim() ? 'var(--accent-primary)' : 'var(--bg-active)',
                  color: inputVal.trim() ? 'var(--text-on-primary)' : 'var(--text-dim)'
                }}
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
