import { Smartphone } from 'lucide-react';
import type { DiscoveredDevice } from '@/plugins/WifiPeerDiscovery';
import type { ConnectionStatus } from '@/hooks/useWifiPeerDiscovery';

interface DeviceListProps {
  devices: DiscoveredDevice[];
  status: ConnectionStatus;
  onSendToDevice: (device: DiscoveredDevice) => void;
}

const DeviceList = ({ devices, status, onSendToDevice }: DeviceListProps) => {
  const isScanning = status === 'scanning';

  return (
    <div className="w-full mb-6">
      <p className="text-sm font-semibold mb-3">
        {isScanning ? 'Scanning for devices...' : `${devices.length} device(s) found`}
      </p>
      <div className="space-y-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onSendToDevice(device)}
            className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 text-left transition-all hover:border-teal"
          >
            <div className="icon-circle shrink-0">
              <Smartphone size={18} className="text-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{device.name}</p>
              <p className="text-xs text-muted-foreground">{device.ip}:{device.port}</p>
            </div>
            <span className="text-xs text-teal font-medium">Send</span>
          </button>
        ))}
        {isScanning && (
          <div className="flex items-center gap-2 py-2 px-3 text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-teal animate-pulse" />
            <span className="text-xs">Scanning network...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceList;
