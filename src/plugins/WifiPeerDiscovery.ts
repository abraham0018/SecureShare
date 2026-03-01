import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface DiscoveredDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
}

export interface TransferProgress {
  deviceId: string;
  progress: number; // 0-100
  fileName: string;
}

export interface TransferResult {
  success: boolean;
  deviceId: string;
  fileName: string;
  error?: string;
}

export interface SendFileOptions {
  ip: string;
  port: number;
  filePath: string;
}

export interface WifiPeerDiscoveryPlugin {
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  startServer(): Promise<{ port: number }>;
  sendFile(options: SendFileOptions): Promise<TransferResult>;

  addListener(
    eventName: 'deviceFound',
    listenerFunc: (device: DiscoveredDevice) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'deviceLost',
    listenerFunc: (device: { id: string }) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'transferProgress',
    listenerFunc: (progress: TransferProgress) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'transferComplete',
    listenerFunc: (result: TransferResult) => void
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'fileReceived',
    listenerFunc: (data: { fileName: string; fromDevice: string; sessionToken: string }) => void
  ): Promise<PluginListenerHandle>;

  removeAllListeners(): Promise<void>;
}

const WifiPeerDiscovery = registerPlugin<WifiPeerDiscoveryPlugin>('WifiPeerDiscovery');

export default WifiPeerDiscovery;
