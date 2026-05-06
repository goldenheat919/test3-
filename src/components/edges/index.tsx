import { getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { RelationType, RELATION_CONFIG, type RelationTypeConfig } from '../../types';

interface EdgeStyleOptions {
  strokeDasharray?: string;
  strokeWidth?: { normal: number; selected: number };
}

function computeCurvedPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  edgeIndex: number,
  totalEdges: number
) {
  const offset = edgeIndex - (totalEdges - 1) / 2;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const offsetX = offset * 30;
  const ctrlX = midX + nx * offsetX;
  const ctrlY = midY + ny * offsetX;
  return `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;
}

function BaseWuxiaEdge(
  { sourceX, sourceY, targetX, targetY, selected, data }: EdgeProps,
  config: RelationTypeConfig,
  styleOptions: EdgeStyleOptions = {}
) {
  const edgeIndex = Number((data?.edgeIndex as number) || 0);
  const totalEdges = Number((data?.totalEdges as number) || 1);

  const pathD = totalEdges > 1
    ? computeCurvedPath(sourceX, sourceY, targetX, targetY, edgeIndex, totalEdges)
    : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  const normalWidth = styleOptions.strokeWidth?.normal ?? 2;
  const selectedWidth = styleOptions.strokeWidth?.selected ?? 3;

  return (
    <>
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />
      <path
        d={pathD}
        fill="none"
        stroke={selected ? config.colorLight : config.color}
        strokeWidth={selected ? selectedWidth : normalWidth}
        strokeDasharray={styleOptions.strokeDasharray}
        opacity={0.9}
      />
    </>
  );
}

export function MasterApprenticeEdge(props: EdgeProps) {
  return BaseWuxiaEdge(props, RELATION_CONFIG[RelationType.MASTER_APPRENTICE], {
    strokeWidth: { normal: 2.5, selected: 3.5 },
  });
}

export function ChivalrousEdge(props: EdgeProps) {
  return BaseWuxiaEdge(props, RELATION_CONFIG[RelationType.CHIVALROUS], {
    strokeDasharray: '10 5',
    strokeWidth: { normal: 2, selected: 3 },
  });
}

export function SwornBrotherEdge(props: EdgeProps) {
  return BaseWuxiaEdge(props, RELATION_CONFIG[RelationType.SWORN_BROTHER], {
    strokeDasharray: '4 4',
    strokeWidth: { normal: 2, selected: 3 },
  });
}
