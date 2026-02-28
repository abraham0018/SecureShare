import { useState, useRef } from 'react';
import { Lock, FileText, Eye, EyeOff } from 'lucide-react';
import { xorEncrypt } from '@/lib/encryption';
import { useVault } from '@/context/VaultContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

const EncryptPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addFile } = useVault();
  const navigate = useNavigate();

  const handleEncrypt = async () => {
    if (!file) return toast.error('Please select a file');
    if (!password) return toast.error('Please enter a password');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 4) return toast.error('Password must be at least 4 characters');

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const encrypted = xorEncrypt(data, password);

      addFile({
        id: crypto.randomUUID(),
        name: file.name + '.encrypted',
        originalName: file.name,
        size: encrypted.length,
        date: new Date(),
        encrypted: true,
        data: encrypted,
      });

      toast.success('File encrypted and saved to vault!');
      navigate('/');
    } catch {
      toast.error('Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader title="Encrypt File" />

      <div className="flex-1 px-5 py-8 flex flex-col items-center">
        <div className="icon-circle-xl mb-4">
          <Lock size={32} className="text-teal" />
        </div>
        <h2 className="text-xl font-bold mb-1">Encrypt a File</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Select a file and set a password to encrypt it
        </p>

        {/* File select */}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="file-drop-zone w-full mb-6"
        >
          <FileText size={32} className="text-teal" />
          <p className="text-sm font-medium">
            {file ? file.name : 'Tap to select a file'}
          </p>
          <p className="text-xs text-muted-foreground">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Any file type supported'}
          </p>
        </button>

        {/* Password */}
        <div className="w-full space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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

          <div>
            <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            onClick={handleEncrypt}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-accent text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            {loading ? 'Encrypting...' : 'Encrypt File'}
          </button>

          <p className="text-xs text-center flex items-center justify-center gap-1.5">
            <span>🔒</span>
            <span className="text-teal">Remember your password! There is no way to recover it.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EncryptPage;
