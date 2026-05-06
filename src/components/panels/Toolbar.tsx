import { memo, useState, useMemo } from 'react';
import { RelationType, RELATION_CONFIG, Character } from '../../types';

interface ToolbarProps {
  activeRelationTypes: RelationType[];
  soloRelationType: RelationType | null;
  onToggleRelationType: (type: RelationType) => void;
  onAddCharacter: () => void;
  onAddRelation: () => void;
  onImportData: () => void;
  onExportData: () => void;
  onResetLayout: () => void;
  onResetData: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFocusNode: (nodeId: string) => void;
  pinnedCount: number;
  isAuthenticated: boolean;
  characters: Character[];
  isStatic?: boolean;
  isCloudConnected?: boolean;
  syncStatus?: 'idle' | 'saving' | 'loading' | 'success' | 'error';
  syncMessage?: string;
  onSyncToCloud?: () => Promise<void>;
  onSyncFromCloud?: () => Promise<void>;
}

const Toolbar = memo(function Toolbar({
  activeRelationTypes,
  soloRelationType,
  onToggleRelationType,
  onAddCharacter,
  onAddRelation,
  onImportData,
  onExportData,
  onResetLayout,
  onResetData,
  searchQuery,
  onSearchChange,
  onFocusNode,
  pinnedCount,
  isAuthenticated,
  characters,
  isStatic,
  isCloudConnected,
  syncStatus = 'idle',
  syncMessage = '',
  onSyncToCloud,
  onSyncFromCloud,
}: ToolbarProps) {
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [searchQuery, characters]);

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 animate-fade-in w-[200px]">
      <div
        className="px-5 py-4 rounded-lg text-center"
        style={{
          background: 'rgba(240, 219, 184, 0.92)',
          boxShadow: '0 4px 20px rgba(26, 14, 8, 0.12)',
          border: '1px solid rgba(139, 94, 0, 0.18)',
        }}
      >
        <h1
          className="text-xl font-bold text-gold-dark tracking-[0.15em]"
          style={{ fontFamily: 'var(--font-family-brush)' }}
        >
          百业图谱
        </h1>
        <p
          className="text-[11px] text-ink-muted mt-1 tracking-widest"
          style={{ fontFamily: 'var(--font-family-serif)' }}
        >
          且听风雨人物关系一览
        </p>
      </div>

      <div
        className="px-4 py-3 rounded-lg"
        style={{
          background: 'rgba(240, 219, 184, 0.88)',
          boxShadow: '0 2px 12px rgba(26, 14, 8, 0.08)',
          border: '1px solid rgba(139, 94, 0, 0.14)',
        }}
      >
        <div
          className="text-[11px] text-ink-light mb-2.5 tracking-[0.2em] font-bold text-center"
          style={{ fontFamily: 'var(--font-family-serif)' }}
        >
          关系图例
        </div>
        <div className="flex flex-col gap-1.5">
          {Object.values(RELATION_CONFIG).map((config) => {
            const isSolo = soloRelationType === config.type;
            return (
              <button
                key={config.type}
                onClick={() => onToggleRelationType(config.type)}
                className={`
                  flex items-center justify-center gap-2.5 px-3 py-2 rounded-md text-[12px]
                  transition-all duration-150
                  ${isSolo ? '' : soloRelationType ? 'opacity-25 hover:opacity-45' : ''}
                `}
                style={{
                  color: isSolo ? config.color : '#7a5a3a',
                  background: isSolo ? `${config.color}12` : 'transparent',
                  border: isSolo ? `1.5px solid ${config.color}40` : '1px solid transparent',
                  boxShadow: isSolo ? `0 0 8px ${config.color}20` : 'none',
                  fontFamily: 'var(--font-family-serif)',
                }}
              >
                <span
                  className="w-8 h-[2.5px] flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: config.lineStyle === 'solid' ? config.color : 'transparent',
                    borderTop: config.lineStyle !== 'solid' ? `2.5px ${config.lineStyle}` : 'none',
                    borderColor: config.color,
                  }}
                />
                <span className="font-bold">{config.icon} {config.label}</span>
                {isSolo && (
                  <span className="text-[9px] ml-auto opacity-60">✓</span>
                )}
              </button>
            );
          })}
          {soloRelationType && (
            <button
              onClick={() => onToggleRelationType(soloRelationType)}
              className="text-[10px] text-ink-faint text-center py-1 hover:text-ink-muted transition-colors"
              style={{ fontFamily: 'var(--font-family-serif)' }}
            >
              点击再次取消筛选
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="px-4 py-2.5 rounded-md text-[12px] text-ink font-bold tracking-wide text-center
                     transition-all duration-150 hover:shadow-md"
          style={{
            fontFamily: 'var(--font-family-serif)',
            background: 'rgba(240, 219, 184, 0.82)',
            border: '1px solid rgba(139, 94, 0, 0.15)',
            boxShadow: '0 1px 6px rgba(26, 14, 8, 0.06)',
          }}
        >
          🔍 {showSearch ? '收起搜索' : '搜索角色'}
        </button>
        {showSearch && (
          <>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="输入角色名..."
              className="px-4 py-2.5 rounded-md text-[12px] text-ink font-bold placeholder-ink-faint
                         outline-none focus:ring-2 focus:ring-gold/30 animate-fade-in text-center"
              style={{
                fontFamily: 'var(--font-family-serif)',
                background: 'rgba(240, 219, 184, 0.92)',
                border: '1px solid rgba(139, 94, 0, 0.2)',
              }}
              autoFocus
            />
            {searchResults.length > 0 && (
              <div
                className="flex flex-col gap-0.5 rounded-md overflow-hidden animate-fade-in"
                style={{
                  background: 'rgba(240, 219, 184, 0.85)',
                  border: '1px solid rgba(139, 94, 0, 0.15)',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((c) => (
                  <div
                    key={c.id}
                    onDoubleClick={() => onFocusNode(c.id)}
                    className="px-3 py-1.5 text-[11px] font-bold cursor-pointer
                               transition-all duration-100 hover:bg-gold-dark/10 active:bg-gold-dark/20
                               border-b last:border-b-0"
                    style={{
                      fontFamily: 'var(--font-family-serif)',
                      color: '#3a2e00',
                      borderColor: 'rgba(139, 94, 0, 0.08)',
                    }}
                    title="双击定位"
                  >
                    <span style={{ fontFamily: 'var(--font-family-brush)', letterSpacing: '0.05em' }}>
                      {c.name}
                    </span>
                    <span className="text-ink-muted ml-1.5 font-medium">{c.title}</span>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div
                className="text-[10px] text-ink-faint text-center py-1.5 rounded-md animate-fade-in"
                style={{
                  background: 'rgba(240, 219, 184, 0.6)',
                  border: '1px solid rgba(139, 94, 0, 0.1)',
                }}
              >
                未找到匹配角色
              </div>
            )}
          </>
        )}
        <button
          onClick={onAddCharacter}
          className="px-4 py-2.5 rounded-md text-[12px] font-bold tracking-wide text-center
                     transition-all duration-150 hover:shadow-md"
          style={{
            fontFamily: 'var(--font-family-serif)',
            color: isAuthenticated ? '#2e7d32' : '#6b4f1d',
            background: isAuthenticated ? 'rgba(46, 125, 50, 0.08)' : 'rgba(184, 134, 11, 0.08)',
            border: isAuthenticated ? '1px solid rgba(46, 125, 50, 0.22)' : '1px solid rgba(184, 134, 11, 0.22)',
            boxShadow: '0 1px 6px rgba(26, 14, 8, 0.06)',
          }}
        >
          {isAuthenticated ? '🔓 添加角色' : '🔒 添加角色'}
        </button>
        <button
          onClick={onImportData}
          className="px-4 py-2.5 rounded-md text-[12px] font-bold tracking-wide text-center
                     transition-all duration-150 hover:shadow-md"
          style={{
            fontFamily: 'var(--font-family-serif)',
            color: '#6b4f1d',
            background: 'rgba(184, 134, 11, 0.08)',
            border: '1px solid rgba(184, 134, 11, 0.22)',
            boxShadow: '0 1px 6px rgba(26, 14, 8, 0.06)',
          }}
        >
          📂 导入数据
        </button>
        <button
          onClick={onExportData}
          className="px-4 py-2.5 rounded-md text-[12px] font-bold tracking-wide text-center
                     transition-all duration-150 hover:shadow-md"
          style={{
            fontFamily: 'var(--font-family-serif)',
            color: '#6b4f1d',
            background: 'rgba(184, 134, 11, 0.08)',
            border: '1px solid rgba(184, 134, 11, 0.22)',
            boxShadow: '0 1px 6px rgba(26, 14, 8, 0.06)',
          }}
        >
          💾 导出数据
        </button>
        {onSyncToCloud && (
          <>
            <button
              onClick={onSyncToCloud}
              disabled={syncStatus === 'saving' || syncStatus === 'loading'}
              className="px-4 py-2.5 rounded-md text-[12px] font-bold tracking-wide text-center
                         transition-all duration-150 hover:shadow-md disabled:opacity-50"
              style={{
                fontFamily: 'var(--font-family-serif)',
                color: '#1565c0',
                background: 'rgba(21, 101, 192, 0.06)',
                border: '1px solid rgba(21, 101, 192, 0.18)',
                boxShadow: '0 1px 6px rgba(26, 14, 8, 0.06)',
              }}
            >
              {syncStatus === 'saving' ? '⏳ 同步中...' : '☁️ 上传云端'}
            </button>
            <button
              onClick={onSyncFromCloud}
              disabled={syncStatus === 'saving' || syncStatus === 'loading'}
              className="px-4 py-2.5 rounded-md text-[12px] font-bold tracking-wide text-center
                         transition-all duration-150 hover:shadow-md disabled:opacity-50"
              style={{
                fontFamily: 'var(--font-family-serif)',
                color: '#2e7d32',
                background: 'rgba(46, 125, 50, 0.06)',
                border: '1px solid rgba(46, 125, 50, 0.18)',
                boxShadow: '0 1px 6px rgba(26, 14, 8, 0.06)',
              }}
            >
              {syncStatus === 'loading' ? '⏳ 加载中...' : '📥 拉取云端'}
            </button>
          </>
        )}
        {(syncStatus === 'success' || syncStatus === 'error') && (
          <div
            className={`text-[10px] px-3 py-1.5 rounded-md text-center animate-fade-in ${
              syncStatus === 'success' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
            }`}
            style={{ fontFamily: 'var(--font-family-serif)' }}
          >
            {syncMessage}
          </div>
        )}
        <button
          onClick={onAddRelation}
          className="px-4 py-2.5 rounded-md text-[12px] font-bold tracking-wide text-center
                     transition-all duration-150 hover:shadow-md"
          style={{
            fontFamily: 'var(--font-family-serif)',
            color: '#880e4f',
            background: 'rgba(194, 24, 91, 0.05)',
            border: '1px solid rgba(194, 24, 91, 0.18)',
            boxShadow: '0 1px 6px rgba(26, 14, 8, 0.06)',
          }}
        >
          🔗 添加关系
        </button>
        <button
          onClick={onResetLayout}
          className={`px-4 py-2.5 rounded-md text-[12px] font-bold tracking-wide text-center
                     transition-all duration-150 ${
                       pinnedCount > 0 ? 'hover:shadow-md' : 'opacity-35 cursor-not-allowed'
                     }`}
          style={{
            fontFamily: 'var(--font-family-serif)',
            color: pinnedCount > 0 ? '#8b5e00' : '#7a5a3a',
            background: pinnedCount > 0 ? 'rgba(139, 94, 0, 0.05)' : 'rgba(240, 219, 184, 0.5)',
            border: pinnedCount > 0 ? '1px solid rgba(139, 94, 0, 0.15)' : '1px solid rgba(139, 94, 0, 0.08)',
            boxShadow: pinnedCount > 0 ? '0 1px 6px rgba(26, 14, 8, 0.06)' : 'none',
          }}
          disabled={pinnedCount === 0}
          title={pinnedCount > 0 ? `重置 ${pinnedCount} 个固定节点` : '没有固定节点'}
        >
          🔄 重置布局{pinnedCount > 0 ? ` (${pinnedCount})` : ''}
        </button>
        <button
          onClick={onResetData}
          className="px-4 py-2.5 rounded-md text-[12px] text-ink-muted font-bold tracking-wide text-center
                     transition-all duration-150 hover:text-ink-light hover:shadow-md"
          style={{
            fontFamily: 'var(--font-family-serif)',
            background: 'rgba(240, 219, 184, 0.45)',
            border: '1px solid rgba(139, 94, 0, 0.08)',
          }}
        >
          🗑️ 重置数据
        </button>
      </div>

      <div
        className="px-4 py-2.5 rounded-md text-center"
        style={{
          background: 'rgba(240, 219, 184, 0.4)',
          border: '1px solid rgba(139, 94, 0, 0.06)',
        }}
      >
        <div
          className="text-[10px] text-ink-faint leading-[1.8] font-medium"
          style={{ fontFamily: 'var(--font-family-serif)' }}
        >
          💡 拖拽节点可固定位置<br/>
          📂 导入 JSON 数据文件<br/>
          🏷️ 选中连线查看备注<br/>
          ⌨️ 按 Esc 关闭面板
        </div>
      </div>
    </div>
  );
});

export default Toolbar;
