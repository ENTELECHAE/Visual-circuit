import React, { useState } from 'react';
import { useCircuitStore, circuitStore } from '../../store/circuitStore';
import { COMPONENT_CATALOG } from '../../simulation/componentCatalog';
import { ComponentCategory } from '../../types/circuit';
import { Search, Plus, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export const ComponentPalette: React.FC = () => {
  const store = useCircuitStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');

  const categories: Array<{ id: ComponentCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'microcontroller', label: 'Boards' },
    { id: 'breadboard', label: 'Breadboards' },
    { id: 'led', label: 'LEDs' },
    { id: 'passive', label: 'Passives' },
    { id: 'sensor', label: 'Sensors' },
    { id: 'actuator', label: 'Motors & Audio' },
    { id: 'display', label: 'Displays' },
  ];

  const filteredComponents = COMPONENT_CATALOG.filter((c) => {
    const matchesSearch =
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <aside
      className={`h-full bg-studio-panel border-r border-studio-border flex flex-col transition-all duration-200 z-20 shrink-0 ${
        store.isPaletteOpen ? 'w-64' : 'w-12'
      }`}
    >
      {/* PALETTE HEADER */}
      <div className="h-11 px-3 border-b border-studio-border flex items-center justify-between">
        {store.isPaletteOpen ? (
          <>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-200 uppercase tracking-wider">
              <Layers size={14} className="text-studio-accent" />
              <span>Components</span>
            </div>
            <button
              onClick={() => circuitStore.togglePalette()}
              className="p-1 text-stone-400 hover:text-stone-200 hover:bg-studio-subtle rounded-md"
              title="Collapse Palette"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={() => circuitStore.togglePalette()}
            className="w-full flex items-center justify-center text-stone-400 hover:text-studio-accent p-1"
            title="Expand Palette"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {store.isPaletteOpen && (
        <>
          {/* SEARCH BOX */}
          <div className="p-2.5 border-b border-studio-border">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components..."
                className="w-full bg-studio-dark/80 border border-studio-border rounded-lg pl-8 pr-2 py-1.5 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-studio-accent font-mono"
              />
            </div>
          </div>

          {/* CATEGORY FILTER CHIPS */}
          <div className="px-2 py-1.5 flex gap-1 overflow-x-auto border-b border-studio-border no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-studio-accent text-white font-semibold'
                    : 'bg-studio-subtle text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* COMPONENT CARDS LIST */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredComponents.map((comp) => (
              <div
                key={comp.id}
                className="group p-2 bg-studio-subtle/50 hover:bg-studio-subtle border border-studio-border/60 hover:border-studio-accent/60 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                onClick={() => {
                  circuitStore.addComponent(comp.id, 280, 180);
                }}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-stone-200 group-hover:text-studio-accent transition-colors truncate">
                      {comp.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{comp.description}</p>
                </div>

                <button
                  className="w-6 h-6 rounded-md bg-studio-panel border border-studio-border flex items-center justify-center text-stone-400 group-hover:text-studio-accent group-hover:border-studio-accent transition-colors shadow-sm shrink-0"
                  title="Add to canvas"
                >
                  <Plus size={13} />
                </button>
              </div>
            ))}

            {filteredComponents.length === 0 && (
              <div className="p-4 text-center text-xs text-stone-500 font-mono">
                No components match "{search}"
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

