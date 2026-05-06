import { memo, useState, useRef, useEffect, useMemo } from 'react';
import { Character, RelationType, RELATION_CONFIG } from '../../types';
import { createCharacter, createRelation } from '../../data';

interface AddCharacterPanelProps {
  allCharacters: Character[];
  onAdd: (character: Character, relation?: ReturnType<typeof createRelation>) => void;
  onClose: () => void;
}

const AddCharacterPanel = memo(function AddCharacterPanel({
  allCharacters,
  onAdd,
  onClose,
}: AddCharacterPanelProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '社众',
    description: '',
  });
  const [linkTo, setLinkTo] = useState('');
  const [linkType, setLinkType] = useState<RelationType>(RelationType.MASTER_APPRENTICE);
  const [customLabel, setCustomLabel] = useState('');
  const [masterDirection, setMasterDirection] = useState<'new_is_apprentice' | 'new_is_master'>('new_is_apprentice');
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredCharacters = useMemo(() => {
    if (!searchText.trim()) return allCharacters;
    const q = searchText.toLowerCase();
    return allCharacters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }, [allCharacters, searchText]);

  const selectedChar = allCharacters.find((c) => c.id === linkTo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const character = createCharacter(formData);

    let relation;
    if (linkTo) {
      if (linkType === RelationType.MASTER_APPRENTICE && masterDirection === 'new_is_master') {
        relation = createRelation(character.id, linkTo, linkType, customLabel || undefined);
      } else {
        relation = createRelation(linkTo, character.id, linkType, customLabel || undefined);
      }
    }

    onAdd(character, relation);
    onClose();
  };

  const inputStyle = {
    fontFamily: 'var(--font-family-serif)',
    background: 'rgba(240, 219, 184, 0.6)',
    border: '1px solid rgba(139, 94, 0, 0.2)',
  };

  const linkedName = selectedChar?.name || '已有角色';
  const newName = formData.name.trim() || '新角色';

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
            添加新角色
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
          <div>
            <label className="text-[10px] text-ink-muted font-bold block mb-1 tracking-wide">姓名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入角色姓名"
              required
              className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                         outline-none focus:ring-2 focus:ring-gold/30 placeholder-ink-faint transition-shadow"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] text-ink-muted font-bold block mb-1 tracking-wide">头衔</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="如：剑圣、飞花仙子"
              className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                         outline-none focus:ring-2 focus:ring-gold/30 placeholder-ink-faint transition-shadow"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[10px] text-ink-muted font-bold block mb-1 tracking-wide">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="角色简介..."
              rows={2}
              className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                         outline-none focus:ring-2 focus:ring-gold/30 resize-none placeholder-ink-faint transition-shadow"
              style={inputStyle}
            />
          </div>

          <div
            className="pt-2"
            style={{ borderTop: '1px dashed rgba(139, 94, 0, 0.15)' }}
          >
            <label className="text-[10px] text-ink-muted font-bold block mb-2 tracking-wide">
              关联已有角色（选填）
            </label>
            <div ref={dropdownRef} className="relative mb-2">
              {linkTo ? (
                <div
                  className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold flex items-center justify-between"
                  style={inputStyle}
                >
                  <span>
                    <span style={{ fontFamily: 'var(--font-family-brush)', letterSpacing: '0.05em' }}>
                      {selectedChar?.name}
                    </span>
                    <span className="text-ink-muted ml-1.5 font-medium text-xs">
                      {selectedChar?.title}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setLinkTo(''); setSearchText(''); }}
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
                  {showDropdown && filteredCharacters.length > 0 && (
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
                      {filteredCharacters.map((c) => (
                        <div
                          key={c.id}
                          onMouseDown={() => {
                            setLinkTo(c.id);
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
                  {showDropdown && searchText.trim() && filteredCharacters.length === 0 && (
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

            {linkTo && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <div className="flex gap-1.5">
                  {Object.values(RELATION_CONFIG).map((config) => {
                    const isActive = linkType === config.type;
                    return (
                      <button
                        key={config.type}
                        type="button"
                        onClick={() => setLinkType(config.type)}
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

                {linkType === RelationType.MASTER_APPRENTICE && (
                  <div className="animate-fade-in">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMasterDirection('new_is_apprentice')}
                        className="flex-1 px-2 py-2 rounded-md text-[11px] font-bold transition-all duration-200"
                        style={{
                          color: masterDirection === 'new_is_apprentice' ? '#fef3dc' : '#1565c0',
                          background: masterDirection === 'new_is_apprentice' ? '#1565c0' : '#1565c00a',
                          border: masterDirection === 'new_is_apprentice' ? '2px solid #1565c0' : '1px solid #1565c025',
                          boxShadow: masterDirection === 'new_is_apprentice' ? '0 2px 8px #1565c040' : 'none',
                        }}
                      >
                        {newName} → 徒
                      </button>
                      <button
                        type="button"
                        onClick={() => setMasterDirection('new_is_master')}
                        className="flex-1 px-2 py-2 rounded-md text-[11px] font-bold transition-all duration-200"
                        style={{
                          color: masterDirection === 'new_is_master' ? '#fef3dc' : '#1565c0',
                          background: masterDirection === 'new_is_master' ? '#1565c0' : '#1565c00a',
                          border: masterDirection === 'new_is_master' ? '2px solid #1565c0' : '1px solid #1565c025',
                          boxShadow: masterDirection === 'new_is_master' ? '0 2px 8px #1565c040' : 'none',
                        }}
                      >
                        {newName} → 师
                      </button>
                    </div>
                    <div className="text-[9px] text-ink-faint mt-1.5 text-center">
                      {masterDirection === 'new_is_apprentice'
                        ? `${linkedName} 是 ${newName} 的师傅`
                        : `${newName} 是 ${linkedName} 的师傅`}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="自定义备注（选填）"
                  className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                             outline-none focus:ring-2 focus:ring-gold/30 placeholder-ink-faint transition-shadow"
                  style={inputStyle}
                />
              </div>
            )}
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

export default AddCharacterPanel;
