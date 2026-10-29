import React, { useState } from 'react';
import { 
  FileCode, Cpu, Search, Plus, 
  Layers, HardDrive, Radio, 
  Folder, LayoutGrid, List
} from 'lucide-react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { COMPONENT_CATALOG } from '../../simulation/componentCatalog';
import { ComponentThumbnail } from './ComponentThumbnail';

interface SidebarProps {
  activeTab: string | null;
  onSelectTab: (tab: 'editor' | 'serial' | 'inspector' | 'ai') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const store = useCircuitStore();
  const [sidebarMode, setSidebarMode] = useState<'files' | 'components'>('components');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'microcontroller', label: 'MCUs' },
    { id: 'passive', label: 'Passives' },
    { id: 'input', label: 'Inputs' },
    { id: 'output', label: 'Outputs' },
    { id: 'sensor', label: 'Sensors' },
    { id: 'display', label: 'Displays' },
  ];

  const filteredComponents = COMPONENT_CATALOG.filter((c) => {
    const matchesSearch = c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesCategory = selectedCategory === 'all';
    if (!matchesCategory) {
      if (selectedCategory === 'microcontroller') {
        matchesCategory = c.category === 'microcontroller';
      } else if (selectedCategory === 'passive') {
        matchesCategory = c.category === 'passive' || c.category === 'breadboard';
      } else if (selectedCategory === 'input') {
        matchesCategory = c.category === 'input';
      } else if (selectedCategory === 'output') {
        matchesCategory = c.category === 'output' || c.category === 'led' || c.category === 'actuator';
      } else if (selectedCategory === 'sensor') {
        matchesCategory = c.category === 'sensor';
      } else if (selectedCategory === 'display') {
        matchesCategory = c.category === 'display';
      } else {
        matchesCategory = c.category === selectedCategory;
      }
    }
    return matchesSearch && matchesCategory;
  });

  const handleAddComponent = (definitionId: string) => {
    const x = Math.floor(250 + Math.random() * 80);
    const y = Math.floor(180 + Math.random() * 80);
    circuitStore.addComponent(definitionId, x, y);
  };

  return (
    <aside className="sb-root" aria-label="Sidebar navigation">
      {/* Sidebar Mode Tabs (Parts / Files) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '4px',
        background: 'var(--bg-panel)'
      }}>
        <button
          type="button"
          onClick={() => setSidebarMode('components')}
          className={`mode-switch-segment ${sidebarMode === 'components' ? 'mode-switch-segment--active' : 'mode-switch-segment--inactive'}`}
          style={{ flex: 1, height: '24px', fontSize: '11px', borderRadius: '4px' }}
        >
          <Cpu size={12} />
          <span>Parts</span>
        </button>
        <button
          type="button"
          onClick={() => setSidebarMode('files')}
          className={`mode-switch-segment ${sidebarMode === 'files' ? 'mode-switch-segment--active' : 'mode-switch-segment--inactive'}`}
          style={{ flex: 1, height: '24px', fontSize: '11px', borderRadius: '4px' }}
        >
          <Folder size={12} />
          <span>Files</span>
        </button>
      </div>

      {sidebarMode === 'components' ? (
        /* ================= COMPONENT PALETTE ================= */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Search Bar + Grid/List View Toggle */}
          <div style={{ padding: '8px 8px 4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
            }}>
              <Search size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  width: '100%',
                  fontFamily: 'var(--font-ui)',
                }}
              />
            </div>

            {/* Grid / List Layout Toggle */}
            <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-input)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className="sb-icon-btn"
                style={{
                  width: '20px',
                  height: '20px',
                  background: viewLayout === 'grid' ? 'var(--bg-active)' : 'transparent',
                  color: viewLayout === 'grid' ? '#ffffff' : '#71717a',
                }}
                title="Grid View (Visual Previews)"
              >
                <LayoutGrid size={12} />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                className="sb-icon-btn"
                style={{
                  width: '20px',
                  height: '20px',
                  background: viewLayout === 'list' ? 'var(--bg-active)' : 'transparent',
                  color: viewLayout === 'list' ? '#ffffff' : '#71717a',
                }}
                title="List View (Compact)"
              >
                <List size={12} />
              </button>
            </div>
          </div>

          {/* Minimal Category Chips */}
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '4px',
            padding: '4px 8px',
            scrollbarWidth: 'none',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  fontSize: '10px',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  border: selectedCategory === cat.id ? '1px solid #ffffff' : '1px solid transparent',
                  background: selectedCategory === cat.id ? 'var(--bg-active)' : 'transparent',
                  color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Component Catalog Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
            {viewLayout === 'grid' ? (
              /* --- GRID VIEW (Large Visual Preview Cards) --- */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {filteredComponents.map((comp) => (
                  <div
                    key={comp.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', comp.id);
                      e.dataTransfer.setData('application/json', JSON.stringify({ definitionId: comp.id }));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => handleAddComponent(comp.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: '#121214',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '8px 6px',
                      cursor: 'grab',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                    className="sb-part-card"
                    title={`Drag onto canvas or click to add: ${comp.description}`}
                  >
                    <div style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                      <ComponentThumbnail definitionId={comp.id} size={44} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#f4f4f5', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comp.label}
                    </span>
                    <span style={{ fontSize: '9px', color: '#71717a', fontFamily: 'var(--font-mono)', marginTop: '2px', textTransform: 'uppercase' }}>
                      {comp.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* --- LIST VIEW (Compact with Thumbnails) --- */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {filteredComponents.map((comp) => (
                  <div
                    key={comp.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', comp.id);
                      e.dataTransfer.setData('application/json', JSON.stringify({ definitionId: comp.id }));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => handleAddComponent(comp.id)}
                    className="sb-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      cursor: 'grab',
                      userSelect: 'none'
                    }}
                    title={`Drag onto canvas or click to add: ${comp.description}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <ComponentThumbnail definitionId={comp.id} size={26} />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ 
                          fontSize: '11.5px', 
                          fontWeight: 500, 
                          color: 'var(--text-primary)', 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {comp.label}
                        </span>
                        <span style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                          {comp.category}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="sb-icon-btn"
                      title={`Add ${comp.label}`}
                      style={{ width: '18px', height: '18px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddComponent(comp.id);
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= FILES VIEW ================= */
        <div className="sb-files">
          <div className="sb-files-divider">
            <span className="sb-files-divider-label">Project Files</span>
            <button className="sb-icon-btn" title="New file">
              <Plus size={13} />
            </button>
          </div>

          <button
            type="button"
            className={`sb-nav-item sb-nav-file ${activeTab === 'editor' ? 'sb-nav-file--active' : ''}`}
            onClick={() => onSelectTab('editor')}
          >
            <FileCode size={13} style={{ color: '#ffffff' }} />
            <span className="truncate-text">sketch.ino</span>
          </button>
        </div>
      )}
    </aside>
  );
};
