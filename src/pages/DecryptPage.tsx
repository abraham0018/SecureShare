import { useState, useRef } from 'react';
import { Unlock, FileText, Eye, EyeOff } from 'lucide-react';
import { xorDecrypt } from '@/lib/encryption';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

const DecryptPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDecrypt = async () => {
    if (!file) return toast.error('Please select an encrypted file');
    if (!password) return toast.error('Please enter the decryption password');

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const decrypted = xorDecrypt(data, password);

      const originalName = file.name.replace('.encrypted', '');
      const blob = new Blob([decrypted.buffer as ArrayBuffer]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('File decrypted and downloaded!');
    } catch {
      toast.error('Decryption failed');
    } finally {
      setLoading(false);
    }
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

          <button
            onClick={handleDecrypt}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-accent text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Unlock size={16} />
            {loading ? 'Decrypting...' : 'Decrypt File'}
          </button>

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
