import { useState, useRef } from 'react';
import { Download, FileText, Radio } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import InputOTP from '@/components/InputOTPCustom';
import { toast } from 'sonner';

const ReceivePage = () => {
  const [code, setCode] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleConnect = () => {
    if (code.length < 6) return toast.error('Enter the full 6-digit share code');
    toast.info('Looking for devices on the network...');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`File "${file.name}" imported`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader title="Receive Files" />

      <div className="flex-1 px-5 py-8 flex flex-col items-center">
        <div className="icon-circle-xl mb-4">
          <Download size={32} className="text-teal" />
        </div>
        <h2 className="text-xl font-bold mb-1">Receive Files</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Enter the share code or import an encrypted file
        </p>

        <div className="w-full">
          <h3 className="text-sm font-semibold mb-3 text-center">Enter Share Code</h3>
          <InputOTP value={code} onChange={setCode} />

          <button
            onClick={handleConnect}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-accent text-accent-foreground transition-all hover:opacity-90 mt-4 flex items-center justify-center gap-2"
          >
            <Radio size={16} />
            Connect
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <h3 className="text-sm font-semibold mb-2 text-center">Import Encrypted File</h3>
          <p className="text-xs text-muted-foreground text-center mb-3">
            If you received an encrypted file via other means (email, messaging, etc.)
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".encrypted"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-border bg-card transition-all hover:opacity-90 flex items-center justify-center gap-2"
          >
            <FileText size={16} className="text-teal" />
            Select .encrypted file
          </button>

          <div className="bg-card border border-border rounded-xl p-4 mt-6">
            <h3 className="text-sm font-semibold mb-3">How to Receive Files</h3>
            <div className="space-y-3">
              {[
                'Get the share code from sender',
                'Enter the code above and connect',
                'Files will download automatically',
                'Use the decryption password to unlock',
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

export default ReceivePage;
