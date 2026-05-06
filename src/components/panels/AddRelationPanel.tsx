import { memo, useState, useRef, useEffect, useMemo } from 'react';
import type { Character } from '../../types';
import { RelationType, RELATION_CONFIG } from '../../types';
import { createRelation } from '../../data';

interface AddRelationPanelProps {
  allCharacters: Character[];
  onAdd: (relation: ReturnType<typeof createRelation>) => void;
  onClose: () => void;
}

function SearchableSelect({
  label,
  characters,
  selectedId,
  onSelect,
  excludeId,
}: {
  label: string;
  characters: Character[];
  selectedId: string;
  onSelect: (id: string) => void;
  excludeId?: string;
}) {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    const list = excludeId ? characters.filter((c) => c.id !== excludeId) : characters;
    if (!searchText.trim()) return list;
    const q = searchText.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );
  }, [characters, searchText, excludeId]);

  const selected = characters.find((c) => c.id === selectedId);

  const inputStyle = {
    fontFamily: 'var(--font-family-serif)',
    background: 'rgba(240, 219, 184, 0.6)',
    border: '1px solid rgba(139, 94, 0, 0.2)',
  };

  return (
    <div>
      <label className="text-[10px] text-ink-muted font-bold block mb-1 tracking-wide">{label} *</label>
      <div ref={ref} className="relative">
        {selectedId ? (
          <div
            className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold flex items-center justify-between"
            style={inputStyle}
          >
            <span>
              <span style={{ fontFamily: 'var(--font-family-brush)', letterSpacing: '0.05em' }}>
                {selected?.name}
              </span>
              <span className="text-ink-muted ml-1.5 font-medium text-xs">{selected?.title}</span>
            </span>
            <button
              type="button"
              onClick={() => { onSelect(''); setSearchText(''); }}
              className="text-ink-muted hover:text-crimson text-xs ml-2"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="搜索角色名或头衔..."
              className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                         outline-none focus:ring-2 focus:ring-gold/30 placeholder-ink-faint transition-shadow"
              style={inputStyle}
            />
            {showDropdown && filtered.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-md overflow-hidden z-10 animate-fade-in"
                style={{
                  background: 'rgba(240, 219, 184, 0.97)',
                  border: '1px solid rgba(139, 94, 0, 0.2)',
                  boxShadow: '0 4px 16px rgba(26, 14, 8, 0.15)',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}
              >
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    onMouseDown={() => {
                      onSelect(c.id);
                      setSearchText('');
                      setShowDropdown(false);
                    }}
                    className="px-3 py-1.5 text-[11px] font-bold cursor-pointer
                               transition-all duration-100 hover:bg-gold-dark/10 active:bg-gold-dark/20
                               border-b last:border-b-0"
                    style={{
                      fontFamily: 'var(--font-family-serif)',
                      color: '#3a2e00',
                      borderColor: 'rgba(139, 94, 0, 0.08)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-family-brush)', letterSpacing: '0.05em' }}>
                      {c.name}
                    </span>
                    <span className="text-ink-muted ml-1.5 font-medium">{c.title}</span>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && searchText.trim() && filtered.length === 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-md z-10 animate-fade-in"
                style={{
                  background: 'rgba(240, 219, 184, 0.9)',
                  border: '1px solid rgba(139, 94, 0, 0.15)',
                }}
              >
                <div className="px-3 py-2 text-[10px] text-ink-faint text-center">未找到匹配角色</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const AddRelationPanel = memo(function AddRelationPanel({
  allCharacters,
  onAdd,
  onClose,
}: AddRelationPanelProps) {
  const [formData, setFormData] = useState({
    source: '',
    target: '',
    type: RelationType.MASTER_APPRENTICE as RelationType,
    customLabel: '',
  });
  const [masterDirection, setMasterDirection] = useState<'source_is_master' | 'target_is_master'>('source_is_master');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source || !formData.target || formData.source === formData.target) return;

    let source = formData.source;
    let target = formData.target;

    if (formData.type === RelationType.MASTER_APPRENTICE && masterDirection === 'target_is_master') {
      [source, target] = [target, source];
    }

    const relation = createRelation(
      source,
      target,
      formData.type,
      formData.customLabel || undefined
    );
    onAdd(relation);
    onClose();
  };

  const inputStyle = {
    fontFamily: 'var(--font-family-serif)',
    background: 'rgba(240, 219, 184, 0.6)',
    border: '1px solid rgba(139, 94, 0, 0.2)',
  };

  const sourceName = allCharacters.find((c) => c.id === formData.source)?.name || '角色一';
  const targetName = allCharacters.find((c) => c.id === formData.target)?.name || '角色二';

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
      <div
        className="rounded-lg overflow-hidden w-[340px]"
        style={{
          background: 'linear-gradient(180deg, rgba(240, 219, 184, 0.97) 0%, rgba(217, 196, 154, 0.97) 100%)',
          boxShadow: 'var(--shadow-panel)',
          border: '1px solid rgba(139, 94, 0, 0.2)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            background: 'rgba(107, 79, 29, 0.1)',
            borderBottom: '1px solid rgba(139, 94, 0, 0.12)',
          }}
        >
          <span
            className="text-sm font-bold text-gold-dark tracking-wider"
            style={{ fontFamily: 'var(--font-family-brush)' }}
          >
            添加新关系
          </span>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-ink-muted
                       hover:text-crimson hover:bg-crimson/8 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <SearchableSelect
            label="角色一"
            characters={allCharacters}
            selectedId={formData.source}
            onSelect={(id) => setFormData({ ...formData, source: id })}
            excludeId={formData.target}
          />
          <SearchableSelect
            label="角色二"
            characters={allCharacters}
            selectedId={formData.target}
            onSelect={(id) => setFormData({ ...formData, target: id })}
            excludeId={formData.source}
          />
          <div>
            <label className="text-[10px] text-ink-muted font-bold block mb-1.5 tracking-wide">关系类型 *</label>
            <div className="flex gap-1.5">
              {Object.values(RELATION_CONFIG).map((config) => {
                const isActive = formData.type === config.type;
                return (
                  <button
                    key={config.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: config.type })}
                    className="flex-1 px-2 py-2 rounded-md text-[11px] font-bold
                               transition-all duration-200"
                    style={{
                      color: isActive ? '#fef3dc' : config.color,
                      background: isActive ? config.color : `${config.color}0a`,
                      border: isActive ? `2px solid ${config.color}` : `1px solid ${config.color}25`,
                      boxShadow: isActive ? `0 2px 8px ${config.color}40` : 'none',
                      transform: isActive ? 'scale(1.03)' : 'scale(1)',
                    }}
                  >
                    {config.icon} {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {formData.type === RelationType.MASTER_APPRENTICE && (
            <div className="animate-fade-in">
              <label className="text-[10px] text-ink-muted font-bold block mb-1.5 tracking-wide">代际方向 *</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setMasterDirection('source_is_master')}
                  className="flex-1 px-2 py-2 rounded-md text-[11px] font-bold transition-all duration-200"
                  style={{
                    color: masterDirection === 'source_is_master' ? '#fef3dc' : '#1565c0',
                    background: masterDirection === 'source_is_master' ? '#1565c0' : '#1565c00a',
                    border: masterDirection === 'source_is_master' ? '2px solid #1565c0' : '1px solid #1565c025',
                    boxShadow: masterDirection === 'source_is_master' ? '0 2px 8px #1565c040' : 'none',
                  }}
                >
                  {sourceName} → 师
                </button>
                <button
                  type="button"
                  onClick={() => setMasterDirection('target_is_master')}
                  className="flex-1 px-2 py-2 rounded-md text-[11px] font-bold transition-all duration-200"
                  style={{
                    color: masterDirection === 'target_is_master' ? '#fef3dc' : '#1565c0',
                    background: masterDirection === 'target_is_master' ? '#1565c0' : '#1565c00a',
                    border: masterDirection === 'target_is_master' ? '2px solid #1565c0' : '1px solid #1565c025',
                    boxShadow: masterDirection === 'target_is_master' ? '0 2px 8px #1565c040' : 'none',
                  }}
                >
                  {targetName} → 师
                </button>
              </div>
              <div className="text-[9px] text-ink-faint mt-1.5 text-center">
                {masterDirection === 'source_is_master'
                  ? `${sourceName} 是 ${targetName} 的师傅`
                  : `${targetName} 是 ${sourceName} 的师傅`}
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] text-ink-muted font-bold block mb-1 tracking-wide">自定义备注（选填）</label>
            <input
              type="text"
              value={formData.customLabel}
              onChange={(e) => setFormData({ ...formData, customLabel: e.target.value })}
              placeholder="如：论剑之交、金兰姐妹"
              className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                         outline-none focus:ring-2 focus:ring-gold/30 placeholder-ink-faint transition-shadow"
              style={inputStyle}
            />
            <div className="text-[9px] text-ink-faint mt-1">选中连线时显示此备注</div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 rounded-md text-xs font-bold
                         transition-all duration-150 hover:shadow-md"
              style={{
                background: 'rgba(107, 79, 29, 0.85)',
                color: '#fef3dc',
                border: 'none',
              }}
            >
              确认添加
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-1.5 rounded-md text-xs font-bold
                         transition-all duration-150"
              style={{
                background: 'rgba(240, 219, 184, 0.6)',
                color: '#4a2e1a',
                border: '1px solid rgba(139, 94, 0, 0.2)',
              }}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AddRelationPanel;
