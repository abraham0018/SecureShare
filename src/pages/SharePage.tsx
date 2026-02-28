import { useState } from 'react';
import { Wifi, FileText, Lock, Copy } from 'lucide-react';
import { useVault } from '@/context/VaultContext';
import { generateShareCode, formatFileSize, formatDate } from '@/lib/encryption';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

const SharePage = () => {
  const { files } = useVault();
  const encryptedFiles = files.filter(f => f.encrypted);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState(false);
  const [shareCode, setShareCode] = useState('');

  const toggleFile = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startSharing = () => {
    if (selectedIds.size === 0) return toast.error('Select files to share');
    setShareCode(generateShareCode());
    setSharing(true);
  };

  const stopSharing = () => {
    setSharing(false);
    setShareCode('');
    setSelectedIds(new Set());
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
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-teal animate-pulse-ring" />
          </div>

          <h2 className="text-xl font-bold mb-1">Sharing Active</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {selectedIds.size} file{selectedIds.size > 1 ? 's' : ''} ready to share
          </p>

          <p className="text-xs text-muted-foreground mb-2">Share Code</p>
          <div className="share-code flex items-center gap-3 mb-2">
            <span>{shareCode}</span>
            <button onClick={copyCode}><Copy size={18} className="text-teal" /></button>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Share this code with the recipient</p>

          <p className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-muted rounded" />
            Waiting for devices on the same WiFi network...
          </p>

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
