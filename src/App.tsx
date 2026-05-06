import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '@xyflow/react';
import type { RelationType } from './types';
import { RelationType as RT } from './types';
import { charactersToNodes, relationsToEdges, filterBySearch } from './utils/graphTransform';
import { useForceLayout } from './hooks/useForceLayout';
import { demoCharacters, demoRelations } from './data';
import MartialCharacterNode from './components/nodes/MartialCharacterNode';
import { MasterApprenticeEdge, ChivalrousEdge, SwornBrotherEdge } from './components/edges';
import Toolbar from './components/panels/Toolbar';
import CharacterDetailPanel from './components/panels/CharacterDetailPanel';

const nodeTypes: NodeTypes = {
  martialCharacter: MartialCharacterNode,
};

const edgeTypes: EdgeTypes = {
  masterApprentice: MasterApprenticeEdge,
  chivalrous: ChivalrousEdge,
  swornBrother: SwornBrotherEdge,
};

function WuxiaGraph() {
  const { fitView } = useReactFlow();
  const characters = demoCharacters;
  const relations = demoRelations;

  const [selectedCharacter, setSelectedCharacter] = useState<typeof demoCharacters[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [soloRelationType, setSoloRelationType] = useState<RelationType | null>(null);

  const closeAllPanels = useCallback(() => {
    setSelectedCharacter(null);
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

  const handleFocusNode = useCallback((nodeId: string) => {
    fitView({ nodes: [{ id: nodeId }], padding: 0.4, duration: 600 });
    const character = characters.find((c) => c.id === nodeId);
    if (character) setSelectedCharacter(character);
  }, [fitView, characters]);

  const miniMapNodeColor = useCallback(() => '#8b6914', []);

  return (
    <div className="w-full h-full relative">
      <Toolbar
        activeRelationTypes={[RT.MASTER_APPRENTICE, RT.CHIVALROUS, RT.SWORN_BROTHER]}
        soloRelationType={soloRelationType}
        onToggleRelationType={handleToggleRelationType}
        onAddCharacter={() => {}}
        onAddRelation={() => {}}
        onImportData={() => {}}
        onExportData={() => {}}
        onResetLayout={resetLayout}
        onResetData={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFocusNode={handleFocusNode}
        pinnedCount={pinnedCount}
        isAuthenticated={false}
        characters={characters}
        isStatic
      />

      {selectedCharacter && (
        <CharacterDetailPanel
          character={selectedCharacter}
          relations={relations}
          allCharacters={characters}
          onClose={() => setSelectedCharacter(null)}
          onUpdate={() => {}}
          onDelete={() => {}}
          onDeleteRelation={() => {}}
          onUpdateRelationLabel={() => {}}
          isStatic
        />
      )}

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
