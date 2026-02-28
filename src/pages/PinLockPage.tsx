import { useState, useEffect } from 'react';
import { Shield, Delete } from 'lucide-react';

interface PinLockPageProps {
  onUnlock: () => void;
}

const PIN_KEY = 'secureshare-pin';

const PinLockPage = ({ onUnlock }: PinLockPageProps) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');

  const storedPin = localStorage.getItem(PIN_KEY);

  useEffect(() => {
    if (!storedPin) {
      setIsSetup(true);
    }
  }, [storedPin]);

  useEffect(() => {
    if (pin.length === 4) {
      if (isSetup) {
        if (step === 'enter') {
          setConfirmPin(pin);
          setPin('');
          setStep('confirm');
        } else {
          if (pin === confirmPin) {
            localStorage.setItem(PIN_KEY, pin);
            onUnlock();
          } else {
            setError(true);
            setTimeout(() => {
              setPin('');
              setConfirmPin('');
              setStep('enter');
              setError(false);
            }, 600);
          }
        }
      } else {
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
    }
  }, [pin]);

  const handleDigit = (d: string) => {
    if (pin.length < 4) setPin(prev => prev + d);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  const getMessage = () => {
    if (isSetup && step === 'enter') return 'Create a 4-digit PIN';
    if (isSetup && step === 'confirm') return 'Confirm your PIN';
    return 'Enter your PIN to unlock';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'hsl(var(--navy))' }}>
      <div className="icon-circle-xl mb-6">
        <Shield size={36} className="text-teal" />
      </div>
      <h1 className="text-2xl font-bold text-primary-foreground mb-2">SecureShare</h1>
      <p className="text-sm text-primary-foreground/60 mb-8">{getMessage()}</p>

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
        <p className="text-destructive text-sm mb-4 font-medium">
          {isSetup ? "PINs don't match. Try again." : 'Incorrect PIN'}
        </p>
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
    </div>
  );
};

export default PinLockPage;
