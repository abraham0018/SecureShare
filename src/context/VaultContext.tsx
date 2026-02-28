import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface VaultFile {
  id: string;
  name: string;
  size: number;
  date: Date;
  encrypted: boolean;
  data: Uint8Array;
  originalName?: string;
}

interface VaultContextType {
  files: VaultFile[];
  addFile: (file: VaultFile) => void;
  removeFile: (id: string) => void;
  clearAll: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<VaultFile[]>(() => {
    try {
      const stored = localStorage.getItem('secureshare-vault');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((f: any) => ({
          ...f,
          date: new Date(f.date),
          data: new Uint8Array(f.data),
        }));
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      const serializable = files.map(f => ({
        ...f,
        date: f.date.toISOString(),
        data: Array.from(f.data),
      }));
      localStorage.setItem('secureshare-vault', JSON.stringify(serializable));
    } catch {}
  }, [files]);

  const addFile = useCallback((file: VaultFile) => {
    setFiles(prev => [file, ...prev]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    localStorage.removeItem('secureshare-vault');
  }, []);

  return (
    <VaultContext.Provider value={{ files, addFile, removeFile, clearAll }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
};
