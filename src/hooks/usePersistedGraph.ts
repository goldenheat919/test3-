import { useState, useCallback, useEffect, useRef } from 'react';
import type { Character, Relation } from '../types';
import { demoCharacters, demoRelations } from '../data';

const STORAGE_KEY = 'wuxia-graph-data-v2';
const DATA_URL = '/data/graph.json';

interface PersistedData {
  characters: Character[];
  relations: Relation[];
}

function loadFromStorage(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedData;
      if (Array.isArray(parsed.characters) && Array.isArray(parsed.relations)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(data: PersistedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

async function fetchGraphData(): Promise<PersistedData | null> {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data.characters) && Array.isArray(data.relations)) {
      return data as PersistedData;
    }
  } catch {
    // ignore
  }
  return null;
}

export function usePersistedGraph() {
  const stored = loadFromStorage();
  const [characters, setCharacters] = useState<Character[]>(
    stored?.characters ?? demoCharacters
  );
  const [relations, setRelations] = useState<Relation[]>(
    stored?.relations ?? demoRelations
  );
  const [dataLoaded, setDataLoaded] = useState(!!stored);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    if (stored) return;

    fetchGraphData().then((data) => {
      if (data && data.characters.length > 0) {
        setCharacters(data.characters);
        setRelations(data.relations);
        saveToStorage(data);
      }
      setDataLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persistCharacters = useCallback((updater: Character[] | ((prev: Character[]) => Character[])) => {
    setCharacters((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage({ characters: next, relations });
      return next;
    });
  }, [relations]);

  const persistRelations = useCallback((updater: Relation[] | ((prev: Relation[]) => Relation[])) => {
    setRelations((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage({ characters, relations: next });
      return next;
    });
  }, [characters]);

  const persistBoth = useCallback((chars: Character[], rels: Relation[]) => {
    setCharacters(chars);
    setRelations(rels);
    saveToStorage({ characters: chars, relations: rels });
  }, []);

  const resetToDemo = useCallback(() => {
    setCharacters(demoCharacters);
    setRelations(demoRelations);
    saveToStorage({ characters: demoCharacters, relations: demoRelations });
  }, []);

  return {
    characters,
    relations,
    dataLoaded,
    setCharacters: persistCharacters,
    setRelations: persistRelations,
    setBoth: persistBoth,
    resetToDemo,
  };
}
