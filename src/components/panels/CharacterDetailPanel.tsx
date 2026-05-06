import { memo, useState } from 'react';
import { Character, Relation, RELATION_CONFIG } from '../../types';

interface CharacterDetailPanelProps {
  character: Character;
  relations: Relation[];
  allCharacters: Character[];
  onClose: () => void;
  onUpdate: (character: Character) => void;
  onDelete: (id: string) => void;
  onDeleteRelation: (relationId: string) => void;
  onUpdateRelationLabel: (relationId: string, customLabel: string) => void;
  isStatic?: boolean;
}

const CharacterDetailPanel = memo(function CharacterDetailPanel({
  character,
  relations,
  allCharacters,
  onClose,
  onUpdate,
  onDelete,
  onDeleteRelation,
  onUpdateRelationLabel,
  isStatic,
}: CharacterDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...character });
  const [editingRelationId, setEditingRelationId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...character });
    setIsEditing(false);
  };

  const startEditLabel = (relId: string, currentLabel: string) => {
    setEditingRelationId(relId);
    setEditingLabel(currentLabel);
  };

  const saveLabel = () => {
    if (editingRelationId) {
      onUpdateRelationLabel(editingRelationId, editingLabel);
      setEditingRelationId(null);
      setEditingLabel('');
    }
  };

  const cancelEditLabel = () => {
    setEditingRelationId(null);
    setEditingLabel('');
  };

  const relatedRelations = relations.filter(
    (r) => r.source === character.id || r.target === character.id
  );

  const getRelatedCharacterName = (id: string) => {
    return allCharacters.find((c) => c.id === id)?.name || '未知';
  };

  const getRelationInfo = (relation: typeof relatedRelations[0]) => {
    const isSource = relation.source === character.id;
    const otherName = getRelatedCharacterName(
      isSource ? relation.target : relation.source
    );
    const config = RELATION_CONFIG[relation.type];
    return {
      icon: config.icon,
      label: config.label,
      customLabel: relation.customLabel || '',
      otherName,
      direction: isSource ? '→' : '←',
    };
  };

  const panelBg = 'linear-gradient(180deg, rgba(240, 219, 184, 0.97) 0%, rgba(217, 196, 154, 0.97) 100%)';

  return (
    <div className="absolute top-4 right-4 z-10 w-[280px] max-h-[calc(100vh-2rem)] overflow-y-auto animate-slide-in">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: panelBg,
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
            角色详情
          </span>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-ink-muted
                       hover:text-crimson hover:bg-crimson/8 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {isEditing ? (
            <div className="flex flex-col gap-3 animate-fade-in">
              {[
                { label: '姓名', key: 'name' as const, type: 'text' },
                { label: '头衔', key: 'title' as const, type: 'text' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-[10px] text-ink-muted font-bold block mb-1 tracking-wide">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={editData[field.key]}
                    onChange={(e) => setEditData({
                      ...editData,
                      [field.key]: e.target.value,
                    })}
                    className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                               outline-none focus:ring-2 focus:ring-gold/30 transition-shadow"
                    style={{
                      fontFamily: 'var(--font-family-serif)',
                      background: 'rgba(240, 219, 184, 0.6)',
                      border: '1px solid rgba(139, 94, 0, 0.2)',
                    }}
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] text-ink-muted font-bold block mb-1 tracking-wide">描述</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-1.5 rounded-md text-sm text-ink font-bold
                             outline-none focus:ring-2 focus:ring-gold/30 resize-none transition-shadow"
                  style={{
                    fontFamily: 'var(--font-family-serif)',
                    background: 'rgba(240, 219, 184, 0.6)',
                    border: '1px solid rgba(139, 94, 0, 0.2)',
                  }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-1.5 rounded-md text-xs font-bold
                             transition-all duration-150 hover:shadow-md"
                  style={{
                    background: 'rgba(107, 79, 29, 0.85)',
                    color: '#fef3dc',
                    border: 'none',
                  }}
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
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
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="text-center mb-4">
                <div
                  className="text-2xl font-bold text-gold-dark tracking-widest"
                  style={{ fontFamily: 'var(--font-family-brush)' }}
                >
                  {character.name}
                </div>
                <div
                  className="text-[11px] text-ink-light mt-1 font-medium"
                  style={{ fontFamily: 'var(--font-family-serif)' }}
                >
                  {character.title}
                </div>
              </div>

              {character.description && (
                <div
                  className="text-[11px] text-ink-light mb-4 p-3 rounded-md leading-relaxed font-medium"
                  style={{
                    background: 'rgba(196, 168, 120, 0.25)',
                    border: '1px solid rgba(139, 94, 0, 0.1)',
                  }}
                >
                  {character.description}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-2 py-1.5 rounded-md text-[11px] font-bold
                             transition-all duration-150 hover:shadow-sm"
                  style={{
                    color: '#6b4f1d',
                    background: 'rgba(184, 134, 11, 0.08)',
                    border: '1px solid rgba(184, 134, 11, 0.2)',
                  }}
                >
                  ✏️ 编辑
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定要删除角色「${character.name}」吗？相关关系也会一并删除。`)) {
                      onDelete(character.id);
                    }
                  }}
                  className="flex-1 px-2 py-1.5 rounded-md text-[11px] font-bold
                             transition-all duration-150 hover:shadow-sm"
                  style={{
                    color: '#880e4f',
                    background: 'rgba(194, 24, 91, 0.05)',
                    border: '1px solid rgba(194, 24, 91, 0.15)',
                  }}
                >
                  🗑️ 删除
                </button>
              </div>

              <div>
                <div className="text-[10px] text-ink-muted font-bold mb-2 tracking-wider uppercase">人物关系</div>
                {relatedRelations.length === 0 ? (
                  <div
                    className="text-[11px] text-ink-faint text-center py-3 rounded-md font-medium"
                    style={{ background: 'rgba(196, 168, 120, 0.15)' }}
                  >
                    暂无关系
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {relatedRelations.map((rel) => {
                      const info = getRelationInfo(rel);
                      const relConfig = RELATION_CONFIG[rel.type];
                      const isEditingThis = editingRelationId === rel.id;
                      return (
                        <div
                          key={rel.id}
                          className="px-2.5 py-2 rounded-md text-xs group"
                          style={{
                            background: 'rgba(240, 219, 184, 0.5)',
                            border: `1px solid ${relConfig.color}18`,
                          }}
                        >
                          {isEditingThis ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingLabel}
                                onChange={(e) => setEditingLabel(e.target.value)}
                                placeholder="输入自定义备注..."
                                className="flex-1 px-2 py-1 rounded text-[10px]
                                           text-ink outline-none focus:ring-1 focus:ring-gold/30"
                                style={{
                                  fontFamily: 'var(--font-family-serif)',
                                  background: 'rgba(240, 219, 184, 0.8)',
                                  border: '1px solid rgba(139, 94, 0, 0.2)',
                                }}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveLabel();
                                  if (e.key === 'Escape') cancelEditLabel();
                                }}
                              />
                              <button
                                onClick={saveLabel}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold
                                           transition-colors"
                                style={{
                                  background: 'rgba(107, 79, 29, 0.8)',
                                  color: '#fef3dc',
                                }}
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEditLabel}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold
                                           transition-colors"
                                style={{
                                  background: 'rgba(217, 196, 154, 0.6)',
                                  border: '1px solid rgba(139, 94, 0, 0.2)',
                                  color: '#4a2e1a',
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px]">{info.icon}</span>
                              <span className="text-ink font-bold text-[11px]">{info.direction}</span>
                              <span
                                className="font-bold text-[11px]"
                                style={{ color: relConfig.color }}
                              >
                                {info.otherName}
                              </span>
                              <span
                                className="text-[9px] text-ink-muted ml-auto font-medium truncate max-w-[72px]"
                              >
                                [{info.label}]{info.customLabel ? ` ${info.customLabel}` : ''}
                              </span>
                              <button
                                onClick={() => startEditLabel(rel.id, info.customLabel)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity
                                           w-4 h-4 flex items-center justify-center rounded
                                           text-ink-faint hover:text-gold-dark hover:bg-gold-dark/8
                                           text-[9px] flex-shrink-0"
                                title="编辑备注"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`确定要删除与「${info.otherName}」的${info.label}关系吗？`)) {
                                    onDeleteRelation(rel.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity
                                           w-4 h-4 flex items-center justify-center rounded
                                           text-crimson/40 hover:text-crimson hover:bg-crimson/8
                                           text-[9px] font-bold flex-shrink-0"
                                title="删除此关系"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CharacterDetailPanel;
