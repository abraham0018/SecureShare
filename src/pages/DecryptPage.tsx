import { useState, useRef } from 'react';
import { Unlock, FileText, Eye, EyeOff, Download, Save } from 'lucide-react';
import { xorDecrypt } from '@/lib/encryption';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';
import { useVault } from '@/context/VaultContext';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

const DecryptPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [decryptedData, setDecryptedData] = useState<Uint8Array | null>(null);
  const [decryptedName, setDecryptedName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { addFile } = useVault();

  const handleDecrypt = async () => {
    if (!file) return toast.error('Please select an encrypted file');
    if (!password) return toast.error('Please enter the decryption password');

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const decrypted = xorDecrypt(data, password);
      const originalName = file.name.replace('.encrypted', '');

      setDecryptedData(decrypted);
      setDecryptedName(originalName);
      toast.success('File decrypted! Choose where to save it.');
    } catch (err: any) {
      const msg = err?.message === 'Incorrect password' ? 'Incorrect password' : 'Decryption failed';
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleSaveToDevice = async () => {
    if (!decryptedData || !decryptedName) return;

    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = btoa(
          Array.from(decryptedData).map(b => String.fromCharCode(b)).join('')
        );
        await Filesystem.writeFile({
          path: 'Download/' + decryptedName,
          data: base64,
          directory: Directory.ExternalStorage,
          recursive: true,
        });
        toast.success(`Saved to Downloads/${decryptedName}`);
      } catch {
        try {
          const base64 = btoa(
            Array.from(decryptedData).map(b => String.fromCharCode(b)).join('')
          );
          await Filesystem.writeFile({
            path: decryptedName,
            data: base64,
            directory: Directory.Documents,
          });
          toast.success(`Saved to Documents/${decryptedName}`);
        } catch {
          toast.error('Could not save file to device');
        }
      }
    } else {
      const blob = new Blob([decryptedData.buffer as ArrayBuffer]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = decryptedName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('File downloaded!');
    }
  };

  const handleSaveToVault = () => {
    if (!decryptedData || !decryptedName) return;
    addFile({
      id: crypto.randomUUID(),
      name: decryptedName,
      size: decryptedData.length,
      date: new Date(),
      encrypted: false,
      data: decryptedData,
    });
    toast.success('Saved to vault!');
    setDecryptedData(null);
    setDecryptedName('');
    setFile(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader title="Decrypt File" />

      <div className="flex-1 px-5 py-8 flex flex-col items-center">
        <div className="icon-circle-xl mb-4">
          <Unlock size={32} className="text-teal" />
        </div>
        <h2 className="text-xl font-bold mb-1">Decrypt a File</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Select an encrypted file and enter password
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".encrypted"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="file-drop-zone w-full mb-6"
        >
          <FileText size={32} className="text-teal" />
          <p className="text-sm font-medium">
            {file ? file.name : 'Tap to select encrypted file'}
          </p>
          <p className="text-xs text-muted-foreground">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Select a .encrypted file'}
          </p>
        </button>

        <div className="w-full space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Decryption Password</label>
            <div className="relative">
              <Unlock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!decryptedData ? (
            <button
              onClick={handleDecrypt}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-accent text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Unlock size={16} />
              {loading ? 'Decrypting...' : 'Decrypt File'}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center text-teal font-medium">✓ Decrypted: {decryptedName}</p>
              <button
                onClick={handleSaveToDevice}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-accent text-accent-foreground transition-all hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Save to Phone Storage
              </button>
              <button
                onClick={handleSaveToVault}
                className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-border bg-card transition-all hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Save size={16} className="text-teal" />
                Save to Vault
              </button>
            </div>
          )}

          <p className="text-xs text-center flex items-center justify-center gap-1.5">
            <span>🔑</span>
            <span className="text-teal">Use the same password that was used to encrypt the file</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DecryptPage;
