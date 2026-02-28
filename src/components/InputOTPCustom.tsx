import { useState } from 'react';

interface InputOTPProps {
  value: string;
  onChange: (value: string) => void;
}

const InputOTPCustom = ({ value, onChange }: InputOTPProps) => {
  const handleInput = (index: number, char: string) => {
    const upper = char.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!upper) return;
    const arr = value.split('');
    arr[index] = upper;
    const next = arr.join('').slice(0, 6);
    onChange(next);

    // Auto-focus next
    if (index < 5) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevEl = document.getElementById(`otp-${index - 1}`);
      prevEl?.focus();
      const arr = value.split('');
      arr[index - 1] = '';
      onChange(arr.join(''));
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleInput(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-12 h-14 rounded-xl border-2 border-border bg-card text-center text-lg font-bold focus:outline-none focus:border-teal transition-colors"
        />
      ))}
    </div>
  );
};

export default InputOTPCustom;
