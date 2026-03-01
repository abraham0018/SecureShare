import { CheckCircle, XCircle } from 'lucide-react';
import type { TransferResult } from '@/plugins/WifiPeerDiscovery';

interface TransferProgressProps {
  progress: number;
  fileName: string;
  result: TransferResult | null;
  isTransferring: boolean;
}

const TransferProgressBar = ({ progress, fileName, result, isTransferring }: TransferProgressProps) => {
  if (!isTransferring && !result) return null;

  return (
    <div className="w-full mb-6">
      {isTransferring && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium truncate">{fileName || 'Transferring...'}</p>
            <span className="text-xs text-teal font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {result && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          result.success
            ? 'bg-teal/10 border-teal/30'
            : 'bg-destructive/10 border-destructive/30'
        }`}>
          {result.success ? (
            <CheckCircle size={20} className="text-teal shrink-0" />
          ) : (
            <XCircle size={20} className="text-destructive shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium">
              {result.success ? 'Transfer complete!' : 'Transfer failed'}
            </p>
            {result.error && (
              <p className="text-xs text-muted-foreground mt-0.5">{result.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferProgressBar;
