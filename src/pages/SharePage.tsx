import { useState, useEffect } from 'react';
import { Wifi, FileText, Lock, Copy, WifiOff } from 'lucide-react';
import { useVault } from '@/context/VaultContext';
import { generateShareCode, formatFileSize, formatDate } from '@/lib/encryption';
import { useWifiPeerDiscovery } from '@/hooks/useWifiPeerDiscovery';
import PageHeader from '@/components/PageHeader';
import DeviceList from '@/components/share/DeviceList';
import TransferProgressBar from '@/components/share/TransferProgress';
import { toast } from 'sonner';
import type { DiscoveredDevice } from '@/plugins/WifiPeerDiscovery';

const FAKE_DEVICES: DiscoveredDevice[] = [
  { id: '1', name: 'iPhone 15 Pro', ip: '192.168.1.42', port: 8080 },
  { id: '2', name: 'Galaxy S24', ip: '192.168.1.58', port: 8080 },
  { id: '3', name: 'MacBook Air', ip: '192.168.1.23', port: 8080 },
];

const SharePage = () => {
  const { files } = useVault();
  const encryptedFiles = files.filter(f => f.encrypted);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState(false);
  const [shareCode, setShareCode] = useState('');

  // Native plugin
  const wifi = useWifiPeerDiscovery();

  // Web simulation state
  const [webScanning, setWebScanning] = useState(false);
  const [webDevices, setWebDevices] = useState<DiscoveredDevice[]>([]);

  const devices = wifi.isNative ? wifi.devices : webDevices;
  const scanning = wifi.isNative ? wifi.status === 'scanning' : webScanning;

  const toggleFile = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startSharing = async () => {
    if (selectedIds.size === 0) return toast.error('Select files to share');
    setShareCode(generateShareCode());
    setSharing(true);

    if (wifi.isNative) {
      await wifi.startServer();
      await wifi.startDiscovery();
    } else {
      // Web simulation
      setWebScanning(true);
      setWebDevices([]);
    }
  };

  // Web simulation: discover fake devices
  useEffect(() => {
    if (!webScanning || wifi.isNative) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    FAKE_DEVICES.forEach((device, i) => {
      timers.push(setTimeout(() => {
        setWebDevices(prev => [...prev, device]);
        if (i === FAKE_DEVICES.length - 1) setWebScanning(false);
      }, 1500 + i * 1200));
    });
    return () => timers.forEach(clearTimeout);
  }, [webScanning, wifi.isNative]);

  const stopSharing = async () => {
    setSharing(false);
    setShareCode('');
    setSelectedIds(new Set());

    if (wifi.isNative) {
      await wifi.stopDiscovery();
    } else {
      setWebDevices([]);
      setWebScanning(false);
    }
  };

  const sendToDevice = async (device: DiscoveredDevice) => {
    if (wifi.isNative) {
      // Send actual file via native plugin
      const selectedFiles = files.filter(f => selectedIds.has(f.id));
      for (const file of selectedFiles) {
        // In native, filePath would come from the file system
        await wifi.sendFile(device.ip, device.port, file.name);
      }
    } else {
      toast.success(`Sending ${selectedIds.size} file(s) to ${device.name}...`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shareCode);
    toast.success('Code copied!');
  };

  if (sharing) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PageHeader title="Share Files" />
        <div className="flex-1 px-5 py-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="icon-circle-xl">
              <Wifi size={36} className="text-teal" />
            </div>
            {scanning && (
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-teal animate-spin" style={{ animationDuration: '3s' }} />
            )}
          </div>

          <h2 className="text-xl font-bold mb-1">Sharing Active</h2>
          <p className="text-sm text-muted-foreground mb-1">
            {selectedIds.size} file{selectedIds.size > 1 ? 's' : ''} ready to share
          </p>
          {!wifi.isNative && (
            <p className="text-xs text-amber-500 mb-4 flex items-center gap-1">
              <WifiOff size={12} />
              <span>Web preview — install on device for real transfers</span>
            </p>
          )}

          <p className="text-xs text-muted-foreground mb-2">Share Code</p>
          <div className="share-code flex items-center gap-3 mb-2">
            <span>{shareCode}</span>
            <button onClick={copyCode}><Copy size={18} className="text-teal" /></button>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Share this code with the recipient</p>

          {/* Transfer progress (native only) */}
          <TransferProgressBar
            progress={wifi.transferProgress}
            fileName={wifi.transferFileName}
            result={wifi.lastResult}
            isTransferring={wifi.status === 'transferring'}
          />

          {/* Device list */}
          <DeviceList
            devices={devices}
            status={scanning ? 'scanning' : 'idle'}
            onSendToDevice={sendToDevice}
          />

          <button
            onClick={stopSharing}
            className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-border transition-all hover:opacity-90"
          >
            Stop Sharing
          </button>

          <p className="text-xs text-center mt-4 flex items-center justify-center gap-1.5">
            <span>⚠️</span>
            <span className="text-amber-500">Remember to share the decryption password separately!</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader title="Share Files" />

      <div className="flex-1 px-5 py-8 flex flex-col items-center">
        <div className="icon-circle-xl mb-4">
          <Wifi size={32} className="text-teal" />
        </div>
        <h2 className="text-xl font-bold mb-1">Share via WiFi</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Share encrypted files with nearby devices on the same network
        </p>

        <div className="w-full">
          <h3 className="text-sm font-semibold mb-3">Select Files to Share</h3>
          {encryptedFiles.length === 0 ? (
            <div className="file-drop-zone mb-6">
              <FileText size={32} className="text-teal" />
              <p className="text-sm font-medium">No encrypted files</p>
              <p className="text-xs text-muted-foreground">Encrypt some files first</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {encryptedFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => toggleFile(file.id)}
                  className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 text-left"
                >
                  <div className="icon-circle shrink-0">
                    <Lock size={18} className="text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDate(file.date)}
                    </p>
                    <span className="encrypted-badge">Encrypted</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedIds.has(file.id) ? 'bg-teal border-teal' : 'border-border'
                  }`} />
                </button>
              ))}
            </div>
          )}

          {encryptedFiles.length > 0 && (
            <button
              onClick={startSharing}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-accent text-accent-foreground transition-all hover:opacity-90 mb-6"
            >
              Start Sharing
            </button>
          )}

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">How WiFi Sharing Works</h3>
            <div className="space-y-3">
              {[
                'Select files and start sharing',
                'Share the code with the recipient',
                'Recipient enters code to receive files',
                'Share password separately for decryption',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="step-circle">{i + 1}</div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
