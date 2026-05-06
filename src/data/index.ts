import { Character, Relation, RelationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const demoCharacters: Character[] = [];

export const demoRelations: Relation[] = [];

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
