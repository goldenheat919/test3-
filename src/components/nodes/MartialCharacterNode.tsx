import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { Character } from '../../types';

export type MartialCharacterNode = Node<Character, 'martialCharacter'>;

const NODE_STYLE = {
  borderColor: '#6b4f1d',
  bgColor: 'linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 50%, #ede0c0 100%)',
  size: 'w-[168px] h-[82px]',
  glowColor: 'rgba(139, 94, 0, 0.35)',
  textColor: '#3a2e00',
  accentLine: '#b8860b',
  stripeColor: '#b8860b',
};

function MartialCharacterNodeComponent({ data, selected }: NodeProps<MartialCharacterNode>) {
  const { name, title } = data;

  return (
    <div
      className={`
        ${NODE_STYLE.size} relative rounded-md cursor-pointer
        border transition-all duration-200 overflow-hidden
        ${selected ? 'scale-105' : 'hover:scale-[1.02]'}
      `}
      style={{
        background: NODE_STYLE.bgColor,
        borderColor: selected ? NODE_STYLE.accentLine : NODE_STYLE.borderColor,
        borderWidth: selected ? '2px' : '1.5px',
        boxShadow: selected
          ? `0 0 0 3px ${NODE_STYLE.glowColor}, 0 4px 16px rgba(26, 14, 8, 0.15)`
          : `0 1px 4px rgba(26, 14, 8, 0.08), 0 2px 8px rgba(26, 14, 8, 0.06)`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-0 !h-0 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!w-0 !h-0 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Left} id="left" className="!w-0 !h-0 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-0 !h-0 !border-0 !opacity-0" />

      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-md"
        style={{ backgroundColor: NODE_STYLE.stripeColor, opacity: 0.5 }}
      />

      <div className="flex flex-col items-center justify-center h-full pl-4 pr-2 py-2 overflow-hidden">
        <div
          className="text-[19px] font-bold leading-tight text-center w-full truncate"
          style={{
            color: NODE_STYLE.textColor,
            fontFamily: 'var(--font-family-brush)',
            letterSpacing: '0.12em',
          }}
          title={name}
        >
          {name}
        </div>
        <div
          className="w-5 h-px my-1 rounded-full opacity-30"
          style={{ backgroundColor: NODE_STYLE.accentLine }}
        />
        <div
          className="text-[10px] text-ink-muted text-center leading-tight font-medium w-full truncate"
          style={{ fontFamily: 'var(--font-family-serif)' }}
          title={title}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

export default memo(MartialCharacterNodeComponent);
