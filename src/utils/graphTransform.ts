import type { Node, Edge } from '@xyflow/react';
import type { Character, Relation, RelationType } from '../types';

// 将角色数据转换为 React Flow 节点
export function charactersToNodes(characters: Character[], relations: Relation[]): Node[] {
  // 找出所有有关系的角色 ID
  const connectedIds = new Set<string>();
  relations.forEach((r) => {
    connectedIds.add(r.source);
    connectedIds.add(r.target);
  });

  return characters.map((character) => ({
    id: character.id,
    type: 'martialCharacter',
    position: { x: Math.random() * 800, y: Math.random() * 600 },
    data: {
      ...character,
      isIsolated: !connectedIds.has(character.id),
    },
  }));
}

// 将关系数据转换为 React Flow 边，处理同一对节点间的多条边偏移
export function relationsToEdges(relations: Relation[]): Edge[] {
  // 统计同一对节点间的边数量
  const pairCount: Record<string, number> = {};
  const pairIndex: Record<string, number> = {};

  relations.forEach((r) => {
    const key = [r.source, r.target].sort().join('-');
    pairCount[key] = (pairCount[key] || 0) + 1;
  });

  // 分配索引
  const tempIndex: Record<string, number> = {};
  relations.forEach((r) => {
    const key = [r.source, r.target].sort().join('-');
    tempIndex[key] = (tempIndex[key] || 0);
    pairIndex[r.id] = tempIndex[key];
    tempIndex[key]++;
  });

  return relations.map((relation) => {
    const key = [relation.source, relation.target].sort().join('-');
    const totalEdges = pairCount[key] || 1;
    const edgeIndex = pairIndex[relation.id] || 0;

    return {
      id: relation.id,
      source: relation.source,
      target: relation.target,
      type: relation.type === 'master_apprentice'
        ? 'masterApprentice'
        : relation.type === 'chivalrous'
          ? 'chivalrous'
          : 'swornBrother',
      data: {
        type: relation.type,
        customLabel: relation.customLabel,
        totalEdges,
        edgeIndex,
      },
    };
  });
}

// 根据搜索词过滤节点
export function filterBySearch(
  nodes: Node[],
  edges: Edge[],
  searchQuery: string
): { filteredNodes: Node[]; filteredEdges: Edge[] } {
  if (!searchQuery.trim()) return { filteredNodes: nodes, filteredEdges: edges };

  const query = searchQuery.toLowerCase();
  const matchedNodeIds = new Set(
    nodes
      .filter((n) => {
        const data = n.data as Character;
        return (
          data.name?.toLowerCase().includes(query) ||
          data.title?.toLowerCase().includes(query) ||
          data.description?.toLowerCase().includes(query)
        );
      })
      .map((n) => n.id)
  );

  // 也包含与匹配节点有关系的节点
  const relatedNodeIds = new Set<string>();
  edges.forEach((e) => {
    if (matchedNodeIds.has(e.source)) relatedNodeIds.add(e.target);
    if (matchedNodeIds.has(e.target)) relatedNodeIds.add(e.source);
  });

  const allVisibleIds = new Set([...matchedNodeIds, ...relatedNodeIds]);

  return {
    filteredNodes: nodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: allVisibleIds.has(n.id) ? 1 : 0.2,
      },
    })),
    filteredEdges: edges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity:
          allVisibleIds.has(e.source) && allVisibleIds.has(e.target) ? 1 : 0.1,
      },
    })),
  };
}

// 根据关系类型过滤边
export function filterByRelationType(
  edges: Edge[],
  activeTypes: RelationType[]
): Edge[] {
  if (activeTypes.length === 3) return edges; // 全部显示

  return edges.map((e) => {
    const isActive = activeTypes.includes(e.data?.type as RelationType);
    return {
      ...e,
      style: {
        ...e.style,
        opacity: isActive ? 1 : 0.05,
      },
      animated: isActive,
    };
  });
}
