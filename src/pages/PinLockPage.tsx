import { useState, useEffect } from 'react';
import { Shield, Delete } from 'lucide-react';

interface PinLockPageProps {
  onUnlock: () => void;
}

const DEFAULT_PIN = '1234';

const PinLockPage = ({ onUnlock }: PinLockPageProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const storedPin = localStorage.getItem('secureshare-pin') || DEFAULT_PIN;

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === storedPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  }, [pin, storedPin, onUnlock]);

  const handleDigit = (d: string) => {
    if (pin.length < 4) setPin(prev => prev + d);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center header-gradient px-6">
      <div className="icon-circle-xl mb-6">
        <Shield size={36} className="text-teal" />
      </div>
      <h1 className="text-2xl font-bold text-primary-foreground mb-2">SecureShare</h1>
      <p className="text-sm text-primary-foreground/60 mb-8">Enter your PIN to unlock</p>

      {/* PIN dots */}
      <div className="flex gap-4 mb-10">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              error
                ? 'bg-destructive animate-pulse'
                : pin.length > i
                  ? 'bg-teal scale-110'
                  : 'bg-primary-foreground/20'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-destructive text-sm mb-4 font-medium">Incorrect PIN</p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {digits.map((d, i) => {
          if (d === '') return <div key={i} />;
          if (d === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="h-16 rounded-2xl flex items-center justify-center text-primary-foreground/70 active:bg-primary-foreground/10 transition-colors"
              >
                <Delete size={24} />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              className="h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold text-primary-foreground bg-primary-foreground/10 active:bg-primary-foreground/20 transition-colors"
            >
              {d}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-primary-foreground/40 mt-8">Default PIN: 1234</p>
    </div>
  );
};

export default PinLockPage;
