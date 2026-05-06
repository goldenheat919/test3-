import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import type { Character, Relation, RelationType } from './types';
import { RelationType as RT } from './types';
import { charactersToNodes, relationsToEdges, filterBySearch } from './utils/graphTransform';
import { useForceLayout } from './hooks/useForceLayout';
import { usePersistedGraph } from './hooks/usePersistedGraph';
import { useCloudSync } from './hooks/useCloudSync';
import { demoCharacters, demoRelations } from './data';
import MartialCharacterNode from './components/nodes/MartialCharacterNode';
import { MasterApprenticeEdge, ChivalrousEdge, SwornBrotherEdge } from './components/edges';
import Toolbar from './components/panels/Toolbar';
import CharacterDetailPanel from './components/panels/CharacterDetailPanel';
import AddCharacterPanel from './components/panels/AddCharacterPanel';
import AddRelationPanel from './components/panels/AddRelationPanel';

const nodeTypes: NodeTypes = {
  martialCharacter: MartialCharacterNode,
};

const edgeTypes: EdgeTypes = {
  masterApprentice: MasterApprenticeEdge,
  chivalrous: ChivalrousEdge,
  swornBrother: SwornBrotherEdge,
};

function PasswordModal({ onConfirm, action }: { onConfirm: (success: boolean) => void; action: 'add' | 'reset' }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = action === 'reset' ? 'qietingfengyu' : '4231';
    if (password === correctPassword) {
      onConfirm(true);
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center" onClick={() => onConfirm(false)}>
      <div
        className="rounded-lg overflow-hidden w-[280px] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
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
            {action === 'reset' ? '⚠️ 危险操作' : '🔒 管理认证'}
          </span>
          <button
            onClick={() => onConfirm(false)}
            className="w-5 h-5 flex items-center justify-center rounded text-ink-muted
                       hover:text-crimson transition-colors text-sm"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <div className="text-[11px] text-ink-muted text-center font-medium">
            {action === 'reset' ? '输入管理密码以确认重置所有数据' : '请输入管理密码以添加角色'}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码..."
            autoFocus
            className="w-full px-3 py-2 rounded-md text-sm text-ink font-bold text-center
                       outline-none focus:ring-2 focus:ring-gold/30 placeholder-ink-faint transition-shadow"
            style={{
              fontFamily: 'var(--font-family-serif)',
              background: 'rgba(240, 219, 184, 0.6)',
              border: error ? '2px solid #c2185b' : '1px solid rgba(139, 94, 0, 0.2)',
            }}
          />
          {error && (
            <div className="text-[11px] text-crimson text-center font-bold animate-fade-in">
              密码错误，请重试
            </div>
          )}
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-md text-xs font-bold
                       transition-all duration-150 hover:shadow-md"
            style={{
              background: action === 'reset' ? 'rgba(183, 28, 28, 0.85)' : 'rgba(107, 79, 29, 0.85)',
              color: '#fef3dc',
              border: 'none',
            }}
          >
            {action === 'reset' ? '确认重置' : '确认'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ImportData {
  characters: Character[];
  relations: Relation[];
}

function WuxiaGraph() {
  const { fitView } = useReactFlow();

  const {
    characters,
    relations,
    setCharacters,
    setRelations,
    setBoth,
    resetToDemo,
  } = usePersistedGraph();

  const {
    syncStatus,
    syncMessage,
    isCloudConnected,
    saveToCloud,
    loadFromCloud,
    saveConfig,
    clearConfig,
  } = useCloudSync();

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soloRelationType, setSoloRelationType] = useState<RelationType | null>(null);
  const [passwordAction, setPasswordAction] = useState<'add' | 'reset' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeAllPanels = useCallback(() => {
    setSelectedCharacter(null);
    setShowAddCharacter(false);
    setShowAddRelation(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAllPanels();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAllPanels]);

  const initialNodes = useMemo(() => charactersToNodes(characters, relations), [characters, relations]);
  const initialEdges = useMemo(() => relationsToEdges(relations), [relations]);

  const {
    nodes: layoutNodes,
    setNodes,
    edges: layoutEdges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    resetLayout,
    reinitialize,
    addNodeToSim,
    addEdgeToSim,
    removeNodeFromSim,
    removeEdgeFromSim,
  } = useForceLayout(initialNodes, initialEdges, {
    strength: 0.12,
    distance: 160,
    chargeStrength: -500,
    collideRadius: 80,
  });

  const pinnedCount = useMemo(
    () => layoutNodes.filter((n) => (n.data as Record<string, unknown>)?.isPinned).length,
    [layoutNodes]
  );

  const { displayNodes, displayEdges } = useMemo(() => {
    const { filteredNodes, filteredEdges } = filterBySearch(layoutNodes, layoutEdges, searchQuery);
    const searchOpacityMap = new Map(
      filteredEdges.map((e) => [e.id, Number(e.style?.opacity ?? 1)])
    );

    let soloNodeIds: Set<string> | null = null;
    if (soloRelationType) {
      soloNodeIds = new Set<string>();
      layoutEdges.forEach((e) => {
        if ((e.data?.type as RelationType) === soloRelationType) {
          soloNodeIds!.add(e.source);
          soloNodeIds!.add(e.target);
        }
      });
    }

    const mergedEdges = layoutEdges.map((e) => {
      const searchOp = searchOpacityMap.get(e.id) ?? 1;
      let typeOp = 1;
      let isActive = true;

      if (soloRelationType) {
        const edgeType = e.data?.type as RelationType;
        if (edgeType === soloRelationType) {
          typeOp = 1;
          isActive = true;
        } else {
          typeOp = 0.03;
          isActive = false;
        }
      }

      return {
        ...e,
        style: {
          ...e.style,
          opacity: Math.min(searchOp, typeOp),
        },
        animated: isActive,
      };
    });

    const mergedNodes = filteredNodes.map((n) => {
      const searchOp = Number(n.style?.opacity ?? 1);
      let typeOp = 1;
      if (soloRelationType && soloNodeIds) {
        typeOp = soloNodeIds.has(n.id) ? 1 : 0.06;
      }
      return {
        ...n,
        style: {
          ...n.style,
          opacity: Math.min(searchOp, typeOp),
        },
      };
    });

    return { displayNodes: mergedNodes, displayEdges: mergedEdges };
  }, [layoutNodes, layoutEdges, searchQuery, soloRelationType]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const character = characters.find((c) => c.id === node.id);
      if (character) setSelectedCharacter(character);
    },
    [characters]
  );

  const onPaneClick = useCallback(() => {
    setSelectedCharacter(null);
  }, []);

  const handleToggleRelationType = useCallback((type: RelationType) => {
    setSoloRelationType((prev) => {
      if (prev === type) return null;
      return type;
    });
  }, []);

  const handleExportData = useCallback(() => {
    const data = { characters, relations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [characters, relations]);

  const handleFocusNode = useCallback((nodeId: string) => {
    fitView({ nodes: [{ id: nodeId }], padding: 0.4, duration: 600 });
    const character = characters.find((c) => c.id === nodeId);
    if (character) setSelectedCharacter(character);
  }, [fitView, characters]);

  const handleAddCharacter = useCallback(
    (character: Character, relation?: Relation) => {
      setCharacters((prev) => [...prev, character]);
      const isIsolated = !relation;

      let position = { x: 400 + Math.random() * 200, y: 300 + Math.random() * 200 };

      if (relation) {
        const linkedId = relation.source === character.id ? relation.target : relation.source;
        const linkedNode = layoutNodes.find((n) => n.id === linkedId);
        if (linkedNode) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 120 + Math.random() * 60;
          position = {
            x: linkedNode.position.x + Math.cos(angle) * dist,
            y: linkedNode.position.y + Math.sin(angle) * dist,
          };
        }
      }

      const newNode: Node = {
        id: character.id,
        type: 'martialCharacter',
        position,
        data: { ...character, isIsolated },
      };
      setNodes((prev) => [...prev, newNode]);
      addNodeToSim(newNode);

      if (relation) {
        setRelations((prev) => [...prev, relation]);
        const newEdge: Edge = {
          id: relation.id,
          source: relation.source,
          target: relation.target,
          type: relation.type === RT.MASTER_APPRENTICE
            ? 'masterApprentice'
            : relation.type === RT.CHIVALROUS
              ? 'chivalrous'
              : 'swornBrother',
          data: {
            type: relation.type,
            customLabel: relation.customLabel,
          },
        };
        setEdges((prev) => [...prev, newEdge]);
        addEdgeToSim(newEdge);
      }
    },
    [setNodes, setEdges, setCharacters, setRelations, addNodeToSim, addEdgeToSim, layoutNodes]
  );

  const handleAddRelation = useCallback(
    (relation: Relation) => {
      setRelations((prev) => [...prev, relation]);
      const newEdge: Edge = {
        id: relation.id,
        source: relation.source,
        target: relation.target,
        type: relation.type === RT.MASTER_APPRENTICE
          ? 'masterApprentice'
          : relation.type === RT.CHIVALROUS
            ? 'chivalrous'
            : 'swornBrother',
        data: {
          type: relation.type,
          customLabel: relation.customLabel,
        },
      };
      setEdges((prev) => [...prev, newEdge]);
      addEdgeToSim(newEdge);
    },
    [setEdges, setRelations, addEdgeToSim]
  );

  const handleUpdateCharacter = useCallback(
    (updatedCharacter: Character) => {
      setCharacters((prev) =>
        prev.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c))
      );
      setNodes((prev) =>
        prev.map((n) =>
          n.id === updatedCharacter.id ? { ...n, data: { ...n.data, ...updatedCharacter } } : n
        )
      );
      setSelectedCharacter(updatedCharacter);
    },
    [setNodes, setCharacters]
  );

  const handleDeleteCharacter = useCallback(
    (id: string) => {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      setRelations((prev) => prev.filter((r) => r.source !== id && r.target !== id));
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
      removeNodeFromSim(id);
      setSelectedCharacter(null);
    },
    [setNodes, setEdges, setCharacters, setRelations, removeNodeFromSim]
  );

  const handleDeleteRelation = useCallback(
    (relationId: string) => {
      setRelations((prev) => prev.filter((r) => r.id !== relationId));
      setEdges((prev) => prev.filter((e) => e.id !== relationId));
      removeEdgeFromSim(relationId);
    },
    [setEdges, setRelations, removeEdgeFromSim]
  );

  const handleUpdateRelationLabel = useCallback(
    (relationId: string, customLabel: string) => {
      setRelations((prev) =>
        prev.map((r) =>
          r.id === relationId ? { ...r, customLabel: customLabel || undefined } : r
        )
      );
      setEdges((prev) =>
        prev.map((e) =>
          e.id === relationId ? { ...e, data: { ...e.data, customLabel: customLabel || undefined } } : e
        )
      );
    },
    [setEdges, setRelations]
  );

  const handleImportData = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const raw = evt.target?.result as string;
          const data = JSON.parse(raw) as ImportData;

          if (!Array.isArray(data.characters) || !Array.isArray(data.relations)) {
            alert('数据格式错误：需要包含 characters 和 relations 数组');
            return;
          }

          const validTypes = [RT.MASTER_APPRENTICE, RT.CHIVALROUS, RT.SWORN_BROTHER];
          const validRelations = data.relations.filter(
            (r) => validTypes.includes(r.type) && r.source && r.target
          );

          if (data.characters.length === 0) {
            alert('角色列表为空');
            return;
          }

          setBoth(data.characters, validRelations);
          setSelectedCharacter(null);
          const newNodes = charactersToNodes(data.characters, validRelations);
          const newEdges = relationsToEdges(validRelations);
          reinitialize(newNodes, newEdges);
        } catch {
          alert('文件解析失败，请确认是有效的 JSON 文件');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [setBoth, reinitialize]
  );

  const handleResetData = useCallback(() => {
    setPasswordAction('reset');
    setShowPasswordModal(true);
  }, []);

  const handlePasswordConfirm = useCallback((ok: boolean) => {
    setShowPasswordModal(false);
    if (ok) {
      if (passwordAction === 'add') {
        setIsAuthenticated(true);
        setShowAddCharacter(true);
      } else if (passwordAction === 'reset') {
        resetToDemo();
        setSelectedCharacter(null);
        const newNodes = charactersToNodes(demoCharacters, demoRelations);
        const newEdges = relationsToEdges(demoRelations);
        reinitialize(newNodes, newEdges);
      }
    }
    setPasswordAction(null);
  }, [passwordAction, resetToDemo, reinitialize]);

  const handleSyncToCloud = useCallback(async () => {
    await saveToCloud(characters, relations);
  }, [saveToCloud, characters, relations]);

  const handleSyncFromCloud = useCallback(async () => {
    const data = await loadFromCloud();
    if (data) {
      setBoth(data.characters, data.relations);
      setSelectedCharacter(null);
      const newNodes = charactersToNodes(data.characters, data.relations);
      const newEdges = relationsToEdges(data.relations);
      reinitialize(newNodes, newEdges);
    }
  }, [loadFromCloud, setBoth, reinitialize]);

  const miniMapNodeColor = useCallback(() => '#8b6914', []);

  return (
    <div className="w-full h-full relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
      <Toolbar
        activeRelationTypes={[RT.MASTER_APPRENTICE, RT.CHIVALROUS, RT.SWORN_BROTHER]}
        soloRelationType={soloRelationType}
        onToggleRelationType={handleToggleRelationType}
        onAddCharacter={() => {
          if (!isAuthenticated) {
            setPasswordAction('add');
            setShowPasswordModal(true);
          } else {
            setShowAddCharacter(true);
          }
        }}
        onAddRelation={() => setShowAddRelation(true)}
        onImportData={handleImportData}
        onExportData={handleExportData}
        onResetLayout={resetLayout}
        onResetData={handleResetData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFocusNode={handleFocusNode}
        pinnedCount={pinnedCount}
        isAuthenticated={isAuthenticated}
        characters={characters}
        isCloudConnected={isCloudConnected}
        syncStatus={syncStatus}
        syncMessage={syncMessage}
        onSyncToCloud={handleSyncToCloud}
        onSyncFromCloud={handleSyncFromCloud}
      />

      {selectedCharacter && (
        <CharacterDetailPanel
          character={selectedCharacter}
          relations={relations}
          allCharacters={characters}
          onClose={() => setSelectedCharacter(null)}
          onUpdate={handleUpdateCharacter}
          onDelete={handleDeleteCharacter}
          onDeleteRelation={handleDeleteRelation}
          onUpdateRelationLabel={handleUpdateRelationLabel}
        />
      )}

      {showAddCharacter && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.15)' }}
            onClick={() => setShowAddCharacter(false)}
          />
          <AddCharacterPanel
            allCharacters={characters}
            onAdd={handleAddCharacter}
            onClose={() => setShowAddCharacter(false)}
          />
        </>
      )}

      {showAddRelation && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.15)' }}
            onClick={() => setShowAddRelation(false)}
          />
          <AddRelationPanel
            allCharacters={characters}
            onAdd={handleAddRelation}
            onClose={() => setShowAddRelation(false)}
          />
        </>
      )}

      {showPasswordModal && <PasswordModal onConfirm={handlePasswordConfirm} action={passwordAction || 'add'} />}

      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={3}
        defaultEdgeOptions={{ type: 'default' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(139, 105, 20, 0.15)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(245, 230, 200, 0.7)"
          pannable
          zoomable
        />
      </ReactFlow>

      {characters.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className="text-center px-8 py-6 rounded-xl animate-fade-in"
            style={{
              background: 'rgba(245, 230, 200, 0.85)',
              border: '1px solid rgba(139, 94, 0, 0.15)',
              boxShadow: '0 4px 24px rgba(107, 79, 29, 0.1)',
            }}
          >
            <div
              className="text-2xl mb-3"
              style={{ fontFamily: 'var(--font-family-brush)', color: 'var(--color-ink)' }}
            >
              百业图谱
            </div>
            <div className="text-sm text-ink-muted leading-relaxed">
              点击左上角「添加角色」开始构建人物关系
            </div>
            <div className="text-xs text-ink-faint mt-2">
              添加角色后，可使用「添加关系」连接人物
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <WuxiaGraph />
    </ReactFlowProvider>
  );
}
