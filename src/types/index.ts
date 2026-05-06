// 关系类型
export const RelationType = {
  MASTER_APPRENTICE: 'master_apprentice',
  CHIVALROUS: 'chivalrous',
  SWORN_BROTHER: 'sworn_brother',
} as const;

export type RelationType = (typeof RelationType)[keyof typeof RelationType];

// 关系类型配置
export interface RelationTypeConfig {
  type: RelationType;
  label: string;
  color: string;
  colorLight: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  icon: string;
  description: string;
}

// 关系类型配置映射
export const RELATION_CONFIG: Record<RelationType, RelationTypeConfig> = {
  [RelationType.MASTER_APPRENTICE]: {
    type: RelationType.MASTER_APPRENTICE,
    label: '师徒',
    color: '#1565c0',
    colorLight: '#42a5f5',
    lineStyle: 'solid',
    icon: '📜',
    description: '师徒传承，薪火相传',
  },
  [RelationType.CHIVALROUS]: {
    type: RelationType.CHIVALROUS,
    label: '侠缘',
    color: '#c2185b',
    colorLight: '#f06292',
    lineStyle: 'dashed',
    icon: '⚔️',
    description: '侠义相逢，惺惺相惜',
  },
  [RelationType.SWORN_BROTHER]: {
    type: RelationType.SWORN_BROTHER,
    label: '结义',
    color: '#8b5e00',
    colorLight: '#b8860b',
    lineStyle: 'dotted',
    icon: '🤝',
    description: '义结金兰，生死与共',
  },
};

// 角色数据
export interface Character extends Record<string, unknown> {
  id: string;
  name: string;
  title: string;
  description?: string;
}

// 关系数据
export interface Relation {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  customLabel?: string;
}

// 图谱状态
export interface GraphState {
  characters: Character[];
  relations: Relation[];
}

// 面板状态
export interface PanelState {
  selectedCharacter: Character | null;
  selectedRelation: Relation | null;
  isEditing: boolean;
  showAddCharacter: boolean;
  showAddRelation: boolean;
  searchQuery: string;
  activeRelationTypes: RelationType[];
}
