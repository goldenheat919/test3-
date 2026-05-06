import { Character, Relation, RelationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const demoCharacters: Character[] = [
  { id: 'c1', name: '玄清真人', title: '天剑宗掌门', description: '天剑宗开山祖师，剑术通神，德高望重' },
  { id: 'c2', name: '萧远山', title: '大弟子·剑痴', description: '天剑宗大弟子，痴迷剑道，剑法凌厉' },
  { id: 'c3', name: '柳如烟', title: '二弟子·飞花', description: '天剑宗二弟子，轻功绝顶，身法飘逸' },
  { id: 'c4', name: '铁面生', title: '三弟子·铁掌', description: '天剑宗三弟子，外功深厚，刚猛无匹' },
  { id: 'c5', name: '白云飞', title: '四弟子·云游', description: '天剑宗四弟子，云游四方，见闻广博' },
  { id: 'c6', name: '苏婉清', title: '五弟子·琴心', description: '天剑宗五弟子，以琴入道，内力深厚' },
  { id: 'c7', name: '萧云天', title: '萧远山之徒', description: '萧远山独子，继承父志，剑法出众' },
  { id: 'c8', name: '林若风', title: '萧远山之徒', description: '孤儿出身，被萧远山收为弟子' },
  { id: 'c9', name: '花无缺', title: '柳如烟之徒', description: '柳如烟亲传弟子，轻功得其真传' },
  { id: 'c10', name: '赵铁柱', title: '铁面生之徒', description: '铁面生弟子，外功刚猛' },
  { id: 'c11', name: '王大力', title: '铁面生之徒', description: '铁面生弟子，力大无穷' },
  { id: 'c12', name: '陈逍遥', title: '白云飞之徒', description: '白云飞弟子，性格洒脱' },
  { id: 'c13', name: '苏小婉', title: '苏婉清之徒', description: '苏婉清侄女，擅长音律' },
  { id: 'c14', name: '令狐冲', title: '华山弟子', description: '华山派大弟子，性情豪爽' },
  { id: 'c15', name: '任盈盈', title: '圣姑', description: '日月神教圣姑，聪慧过人' },
  { id: 'c16', name: '张无忌', title: '明教教主', description: '明教教主，武功盖世' },
  { id: 'c17', name: '独孤求败', title: '剑魔', description: '纵横江湖三十余载，无敌于天下' },
  { id: 'c18', name: '黄药师', title: '桃花岛主', description: '天下五绝之一，才华横溢' },
  { id: 'c19', name: '东方不败', title: '神教教主', description: '武功天下第一' },
];

export const demoRelations: Relation[] = [
  { id: 'r1', source: 'c1', target: 'c2', type: RelationType.MASTER_APPRENTICE },
  { id: 'r2', source: 'c1', target: 'c3', type: RelationType.MASTER_APPRENTICE },
  { id: 'r3', source: 'c1', target: 'c4', type: RelationType.MASTER_APPRENTICE },
  { id: 'r4', source: 'c1', target: 'c5', type: RelationType.MASTER_APPRENTICE },
  { id: 'r5', source: 'c1', target: 'c6', type: RelationType.MASTER_APPRENTICE },
  { id: 'r6', source: 'c2', target: 'c7', type: RelationType.MASTER_APPRENTICE },
  { id: 'r7', source: 'c2', target: 'c8', type: RelationType.MASTER_APPRENTICE },
  { id: 'r8', source: 'c3', target: 'c9', type: RelationType.MASTER_APPRENTICE },
  { id: 'r9', source: 'c4', target: 'c10', type: RelationType.MASTER_APPRENTICE },
  { id: 'r10', source: 'c4', target: 'c11', type: RelationType.MASTER_APPRENTICE },
  { id: 'r11', source: 'c5', target: 'c12', type: RelationType.MASTER_APPRENTICE },
  { id: 'r12', source: 'c6', target: 'c13', type: RelationType.MASTER_APPRENTICE },
  { id: 'r13', source: 'c2', target: 'c14', type: RelationType.CHIVALROUS, customLabel: '论剑之交' },
  { id: 'r14', source: 'c3', target: 'c15', type: RelationType.CHIVALROUS, customLabel: '惺惺相惜' },
  { id: 'r15', source: 'c5', target: 'c16', type: RelationType.CHIVALROUS, customLabel: '江湖知己' },
  { id: 'r16', source: 'c7', target: 'c14', type: RelationType.CHIVALROUS, customLabel: '切磋武艺' },
  { id: 'r17', source: 'c2', target: 'c4', type: RelationType.SWORN_BROTHER, customLabel: '结义兄弟' },
  { id: 'r18', source: 'c3', target: 'c6', type: RelationType.SWORN_BROTHER, customLabel: '金兰姐妹' },
  { id: 'r19', source: 'c14', target: 'c16', type: RelationType.SWORN_BROTHER, customLabel: '八拜之交' },
  { id: 'r20', source: 'c7', target: 'c12', type: RelationType.SWORN_BROTHER, customLabel: '少年结义' },
  { id: 'r21', source: 'c2', target: 'c14', type: RelationType.SWORN_BROTHER, customLabel: '亦师亦友' },
  { id: 'r22', source: 'c5', target: 'c16', type: RelationType.SWORN_BROTHER, customLabel: '忘年之交' },
  { id: 'r23', source: 'c14', target: 'c15', type: RelationType.CHIVALROUS, customLabel: '知音之情' },
  { id: 'r24', source: 'c14', target: 'c15', type: RelationType.SWORN_BROTHER, customLabel: '生死相随' },
];

export const generateId = (): string => uuidv4();

export const createCharacter = (partial: Partial<Character> & { name: string }): Character => ({
  id: generateId(),
  title: '社众',
  description: '',
  ...partial,
});

export const createRelation = (
  source: string,
  target: string,
  type: RelationType,
  customLabel?: string
): Relation => ({
  id: generateId(),
  source,
  target,
  type,
  customLabel,
});
