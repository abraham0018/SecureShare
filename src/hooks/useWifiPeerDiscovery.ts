import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import WifiPeerDiscovery, {
  type DiscoveredDevice,
  type TransferProgress,
  type TransferResult,
} from '@/plugins/WifiPeerDiscovery';

export type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'transferring' | 'error';

export interface UseWifiPeerDiscoveryReturn {
  devices: DiscoveredDevice[];
  status: ConnectionStatus;
  transferProgress: number;
  transferFileName: string;
  lastResult: TransferResult | null;
  isNative: boolean;
  startDiscovery: () => Promise<void>;
  stopDiscovery: () => Promise<void>;
  startServer: () => Promise<void>;
  sendFile: (ip: string, port: number, filePath: string) => Promise<void>;
}

export function useWifiPeerDiscovery(): UseWifiPeerDiscoveryReturn {
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferFileName, setTransferFileName] = useState('');
  const [lastResult, setLastResult] = useState<TransferResult | null>(null);
  const listenersRef = useRef<Array<{ remove: () => void }>>([]);

  const isNative = Capacitor.isNativePlatform();

  const cleanup = useCallback(async () => {
    for (const listener of listenersRef.current) {
      listener.remove();
    }
    listenersRef.current = [];
  }, []);

  const startDiscovery = useCallback(async () => {
    if (!isNative) return;
    setDevices([]);
    setStatus('scanning');

    const l1 = await WifiPeerDiscovery.addListener('deviceFound', (device) => {
      setDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

    const l2 = await WifiPeerDiscovery.addListener('deviceLost', ({ id }) => {
      setDevices((prev) => prev.filter((d) => d.id !== id));
    });

    const l3 = await WifiPeerDiscovery.addListener('transferProgress', (p) => {
      setTransferProgress(p.progress);
      setTransferFileName(p.fileName);
    });

    const l4 = await WifiPeerDiscovery.addListener('transferComplete', (result) => {
      setLastResult(result);
      setStatus(result.success ? 'idle' : 'error');
      setTransferProgress(0);
    });

    listenersRef.current = [l1, l2, l3, l4];

    await WifiPeerDiscovery.startDiscovery();
  }, [isNative]);

  const stopDiscovery = useCallback(async () => {
    if (!isNative) return;
    await WifiPeerDiscovery.stopDiscovery();
    await cleanup();
    setStatus('idle');
    setDevices([]);
  }, [isNative, cleanup]);

  const startServer = useCallback(async () => {
    if (!isNative) return;
    await WifiPeerDiscovery.startServer();
  }, [isNative]);

  const sendFile = useCallback(
    async (ip: string, port: number, filePath: string) => {
      if (!isNative) return;
      setStatus('transferring');
      setTransferProgress(0);
      setLastResult(null);
      await WifiPeerDiscovery.sendFile({ ip, port, filePath });
    },
    [isNative]
  );

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    devices,
    status,
    transferProgress,
    transferFileName,
    lastResult,
    isNative,
    startDiscovery,
    stopDiscovery,
    startServer,
    sendFile,
  };
}
