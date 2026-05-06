import { useCallback, useState } from 'react';
import type { Character, Relation } from '../types';

interface CloudData {
  characters: Character[];
  relations: Relation[];
  updatedAt: string;
}

const BIN_KEY = 'wuxia-graph-bin-id';
const API_KEY = 'wuxia-graph-api-key';

export function useCloudSync() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'loading' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [isCloudConnected, setIsCloudConnected] = useState(() => !!localStorage.getItem(BIN_KEY));

  const getApiKey = useCallback((): string | null => {
    return localStorage.getItem(API_KEY);
  }, []);

  const getBinId = useCallback((): string | null => {
    return localStorage.getItem(BIN_KEY);
  }, []);

  const saveConfig = useCallback((binId: string, apiKey: string) => {
    localStorage.setItem(BIN_KEY, binId);
    localStorage.setItem(API_KEY, apiKey);
    setIsCloudConnected(true);
  }, []);

  const clearConfig = useCallback(() => {
    localStorage.removeItem(BIN_KEY);
    localStorage.removeItem(API_KEY);
    setIsCloudConnected(false);
  }, []);

  const saveToCloud = useCallback(async (characters: Character[], relations: Relation[]) => {
    const binId = getBinId();
    const apiKey = getApiKey();
    if (!binId || !apiKey) {
      setSyncStatus('error');
      setSyncMessage('请先配置云端同步');
      return false;
    }

    setSyncStatus('saving');
    setSyncMessage('正在保存到云端...');

    try {
      const data: CloudData = {
        characters,
        relations,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('保存失败');

      setSyncStatus('success');
      setSyncMessage('已同步到云端');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return true;
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('云端保存失败，请检查配置');
      setTimeout(() => setSyncStatus('idle'), 5000);
      return false;
    }
  }, [getBinId, getApiKey]);

  const loadFromCloud = useCallback(async (): Promise<{ characters: Character[]; relations: Relation[] } | null> => {
    const binId = getBinId();
    const apiKey = getApiKey();
    if (!binId || !apiKey) {
      setSyncStatus('error');
      setSyncMessage('请先配置云端同步');
      return null;
    }

    setSyncStatus('loading');
    setSyncMessage('正在从云端加载...');

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: {
          'X-Master-Key': apiKey,
        },
      });

      if (!response.ok) throw new Error('加载失败');

      const result = await response.json();
      const data: CloudData = result.record;

      if (!data.characters || !data.relations) {
        throw new Error('数据格式错误');
      }

      setSyncStatus('success');
      setSyncMessage(`已从云端加载（${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : ''}）`);
      setTimeout(() => setSyncStatus('idle'), 4000);

      return { characters: data.characters, relations: data.relations };
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('云端加载失败，请检查配置');
      setTimeout(() => setSyncStatus('idle'), 5000);
      return null;
    }
  }, [getBinId, getApiKey]);

  const createNewBin = async (apiKey: string): Promise<string | null> => {
    try {
      const emptyData: CloudData = {
        characters: [],
        relations: [],
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch('https://api.jsonbin.io/v3/b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey,
          'X-Bin-Name': 'baiye-graph-data',
        },
        body: JSON.stringify(emptyData),
      });

      if (!response.ok) throw new Error('创建失败');

      const result = await response.json();
      return result.metadata.id;
    } catch {
      return null;
    }
  };

  return {
    syncStatus,
    syncMessage,
    isCloudConnected,
    saveToCloud,
    loadFromCloud,
    saveConfig,
    clearConfig,
    createNewBin,
    getApiKey,
    getBinId,
  };
}
