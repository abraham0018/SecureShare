import { Lock, Wifi, Trash2, Info, HelpCircle, ChevronRight, Shield, KeyRound } from 'lucide-react';
import { useVault } from '@/context/VaultContext';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { files, clearAll } = useVault();

  const handleClear = () => {
    if (files.length === 0) return toast.info('Vault is already empty');
    if (confirm('Are you sure you want to clear all data?')) {
      clearAll();
      toast.success('All data cleared');
    }
  };

  const handleChangePin = () => {
    const current = prompt('Enter current PIN:');
    const stored = localStorage.getItem('secureshare-pin');
    if (current !== stored) return toast.error('Incorrect current PIN');
    const newPin = prompt('Enter new 4-digit PIN:');
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return toast.error('PIN must be 4 digits');
    const confirm2 = prompt('Confirm new PIN:');
    if (newPin !== confirm2) return toast.error("PINs don't match");
    localStorage.setItem('secureshare-pin', newPin);
    toast.success('PIN changed successfully');
  };

  const sections = [
    {
      label: 'SECURITY',
      items: [
        {
          icon: KeyRound,
          title: 'Change PIN',
          desc: 'Update your login PIN',
          onClick: handleChangePin,
        },
        {
          icon: Lock,
          title: 'Lock App',
          desc: 'Lock the app immediately',
          onClick: () => {
            window.location.replace('/');
          },
        },
      ],
    },
    {
      label: 'SHARING',
      items: [
        {
          icon: Wifi,
          title: 'Local Network Sharing',
          desc: 'Share files over WiFi',
          onClick: () => toast.info('Files are shared over local WiFi network using share codes.'),
        },
      ],
    },
    {
      label: 'DATA',
      items: [
        {
          icon: Trash2,
          title: 'Clear All Data',
          desc: `${files.length} files in vault`,
          onClick: handleClear,
          destructive: true,
        },
      ],
    },
    {
      label: 'ABOUT',
      items: [
        {
          icon: Info,
          title: 'About SecureShare',
          desc: 'Version 1.0.0',
          onClick: () => toast.info('SecureShare v1.0.0 — Your encrypted vault'),
        },
        {
          icon: HelpCircle,
          title: 'How It Works',
          desc: 'Learn about file encryption',
          onClick: () => toast.info('Files are encrypted using XOR cipher with your password before being stored locally.'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="bg-navy px-5 py-5 flex items-center gap-3">
          <div className="icon-circle">
            <Shield size={22} className="text-teal" />
          </div>
          <h1 className="text-xl font-bold text-primary-foreground">Settings</h1>
        </div>
        <svg viewBox="0 0 1440 40" className="w-full block -mt-px" preserveAspectRatio="none">
          <path d="M0,0 L0,40 Q720,0 1440,40 L1440,0 Z" fill="hsl(200,72%,9%)" />
        </svg>
      </div>

      <div className="flex-1 px-5 space-y-5" style={{ marginTop: '110px' }}>
        {sections.map(section => (
          <div key={section.label}>
            <p className="section-label mb-2">{section.label}</p>
            <div className="space-y-2">
              {section.items.map(item => (
                <button
                  key={item.title}
                  onClick={item.onClick}
                  className="settings-item w-full text-left"
                >
                  <div className={`icon-circle shrink-0 ${item.destructive ? '!bg-destructive/10' : ''}`}>
                    <item.icon
                      size={18}
                      className={item.destructive ? 'text-destructive' : 'text-teal'}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${item.destructive ? 'text-destructive' : ''}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
