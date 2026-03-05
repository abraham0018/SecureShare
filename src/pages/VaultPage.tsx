import { Shield, Lock, Unlock, Wifi, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useVault } from '@/context/VaultContext';
import { formatFileSize, formatDate } from '@/lib/encryption';
import BottomNav from '@/components/BottomNav';
import { Share2, Trash2 } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const VaultPage = () => {
  const navigate = useNavigate();
  const { files, removeFile } = useVault();

  const totalFiles = files.length;
  const encryptedFiles = files.filter(f => f.encrypted).length;

  const actions = [
    { icon: Lock, label: 'Encrypt', desc: 'Secure a file', path: '/encrypt', iconBg: 'bg-navy' },
    { icon: Unlock, label: 'Decrypt', desc: 'Unlock a file', path: '/decrypt', iconBg: '' },
    { icon: Wifi, label: 'Share', desc: 'Send via WiFi', path: '/share', iconBg: '' },
    { icon: Download, label: 'Receive', desc: 'Get files', path: '/receive', iconBg: '' },
  ];

  const handleDownload = async (file: typeof files[0]) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = btoa(
          Array.from(file.data).map(b => String.fromCharCode(b)).join('')
        );
        await Filesystem.writeFile({
          path: 'Download/' + file.name,
          data: base64,
          directory: Directory.ExternalStorage,
          recursive: true,
        });
        toast.success(`Saved to Downloads/${file.name}`);
      } catch (err) {
        // Fallback to Documents if ExternalStorage fails
        try {
          const base64 = btoa(
            Array.from(file.data).map(b => String.fromCharCode(b)).join('')
          );
          await Filesystem.writeFile({
            path: file.name,
            data: base64,
            directory: Directory.Documents,
          });
          toast.success(`Saved to Documents/${file.name}`);
        } catch {
          toast.error('Could not save file to device');
        }
      }
    } else {
      const blob = new Blob([file.data.buffer as ArrayBuffer]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - fixed to top with downward curve */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="bg-navy px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-primary-foreground/20">
              <Shield size={22} className="text-teal" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">SecureShare</h1>
              <p className="text-xs text-primary-foreground/50">Your encrypted vault</p>
            </div>
          </div>
          <div className="bg-navy-mid/40 rounded-xl flex">
            <div className="flex-1 py-3 text-center">
              <p className="text-2xl font-bold text-primary-foreground">{totalFiles}</p>
              <p className="text-[11px] text-primary-foreground/50">Total Files</p>
            </div>
            <div className="w-px bg-primary-foreground/15 my-2" />
            <div className="flex-1 py-3 text-center">
              <p className="text-2xl font-bold text-primary-foreground">{encryptedFiles}</p>
              <p className="text-[11px] text-primary-foreground/50">Encrypted</p>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 200 30" className="w-full block -mt-px" preserveAspectRatio="none" style={{ height: '30px' }}>
          <path d="M0,0 L0,0 Q0,30 30,30 L170,30 Q200,30 200,0 Z" fill="hsl(200,72%,9%)" />
        </svg>
      </div>

      {/* Content - scrolls under the fixed header */}
      <div className="px-5 pt-6" style={{ marginTop: '200px' }}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {actions.map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2.5 text-left transition-all duration-200 active:scale-95"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.iconBg || 'bg-teal-solid'}`}>
                <action.icon size={20} className="text-primary-foreground" />
              </div>
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </button>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-3">Your Vault</h2>
        {files.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-navy/10 mb-3">
              <Lock size={28} className="text-teal" />
            </div>
            <p className="text-sm">No files yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-navy shrink-0">
                  <Lock size={16} className="text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {formatDate(file.date)}
                  </p>
                  {file.encrypted && <span className="encrypted-badge">Encrypted</span>}
                </div>
                <button
                  onClick={async () => {
                    const blob = new Blob([file.data.buffer as ArrayBuffer]);
                    if (Capacitor.isNativePlatform()) {
                      try {
                        // Write file to cache directory
                        const base64 = btoa(
                          Array.from(file.data).map(b => String.fromCharCode(b)).join('')
                        );
                        const result = await Filesystem.writeFile({
                          path: file.name,
                          data: base64,
                          directory: Directory.Cache,
                        });
                        await Share.share({
                          title: file.name,
                          url: result.uri,
                        });
                      } catch {
                        // User cancelled or error
                      }
                    } else {
                      handleDownload(file);
                      toast.info('File downloaded');
                    }
                  }}
                  className="p-2 text-teal hover:bg-muted rounded-lg transition-colors"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-teal hover:bg-muted rounded-lg transition-colors"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-2 text-destructive hover:bg-muted rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default VaultPage;
