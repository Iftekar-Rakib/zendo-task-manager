import React, { useState } from 'react';
import { Moon, Bell, User, Shield, Info, ChevronRight, LogOut, Smartphone, X, Sun, Monitor, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Theme = 'Light' | 'Dark' | 'System';

interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const [notifications, setNotifications] = useState(false);
  const [haptic, setHaptic] = useState(true);
  const [theme, setTheme] = useState<Theme>('Light');
  const [activeModal, setActiveModal] = useState<'theme' | 'account' | 'security' | 'about' | null>(null);

  const themeIcons = {
    'Light': Sun,
    'Dark': Moon,
    'System': Monitor
  };

  const SelectedThemeIcon = themeIcons[theme];

  return (
    <div className="p-6 pb-32">
      <header className="mb-10">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2 italic">Pulse</h1>
        <p className="text-neutral-500 text-sm">Personalize your Flow experience</p>
      </header>

      {/* Profile Section */}
      <div 
        onClick={() => setActiveModal('account')}
        className="flex items-center space-x-4 mb-10 p-4 bg-white rounded-[2rem] border border-neutral-100 card-shadow cursor-pointer hover:border-neutral-200 transition-all active:scale-[0.98]"
      >
        <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xl font-bold font-display italic">
          JD
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-neutral-900">John Doe</h3>
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest">Level 12 Architect</p>
        </div>
        <button className="p-2 text-neutral-400">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Groups */}
      <div className="space-y-8">
        <section>
          <h2 className="text-[10px] uppercase font-mono tracking-[0.2em] text-neutral-400 mb-4 ml-2">Preferences</h2>
          <div className="bg-white rounded-[2rem] border border-neutral-100 card-shadow divide-y divide-neutral-50 overflow-hidden">
            <SettingItem 
              icon={SelectedThemeIcon} 
              label="App Theme" 
              value={theme} 
              onClick={() => setActiveModal('theme')}
            />
            <SettingItem 
              icon={Bell} 
              label="Notifications" 
              toggle 
              checked={notifications} 
              onToggle={() => setNotifications(!notifications)} 
            />
            <SettingItem 
              icon={Smartphone} 
              label="Haptic Feedback" 
              toggle 
              checked={haptic} 
              onToggle={() => setHaptic(!haptic)} 
            />
          </div>
        </section>

        <section>
          <h2 className="text-[10px] uppercase font-mono tracking-[0.2em] text-neutral-400 mb-4 ml-2">Account & Safety</h2>
          <div className="bg-white rounded-[2rem] border border-neutral-100 card-shadow divide-y divide-neutral-50 overflow-hidden">
            <SettingItem 
              icon={User} 
              label="Personal Information" 
              onClick={() => setActiveModal('account')}
            />
            <SettingItem 
              icon={Shield} 
              label="Privacy & Security" 
              onClick={() => setActiveModal('security')}
            />
            <SettingItem 
              icon={Info} 
              label="About Flow" 
              onClick={() => setActiveModal('about')}
            />
          </div>
        </section>

        <button 
          id="logout-btn"
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 p-5 text-red-500 font-bold text-sm hover:bg-red-50 rounded-[2rem] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Terminate Session</span>
        </button>
      </div>

      <div className="mt-12 text-center pb-20">
        <p className="text-[10px] text-neutral-300 uppercase tracking-[0.3em] font-mono font-bold">FLOW v1.0.4 CORE</p>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[80] flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 card-shadow"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold font-display italic">
                    {activeModal === 'theme' && 'Visual Mode'}
                    {activeModal === 'account' && 'Identity'}
                    {activeModal === 'security' && 'Protocol'}
                    {activeModal === 'about' && 'Manifest'}
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Registry Update</p>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 bg-neutral-100 rounded-full text-neutral-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {activeModal === 'theme' && (
                  <div className="space-y-3">
                    {(['Light', 'Dark', 'System'] as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTheme(t); setActiveModal(null); }}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                          theme === t ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-neutral-50 border-transparent text-neutral-600 hover:border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {t === 'Light' && <Sun className="w-5 h-5" />}
                          {t === 'Dark' && <Moon className="w-5 h-5" />}
                          {t === 'System' && <Monitor className="w-5 h-5" />}
                          <span className="font-bold">{t}</span>
                        </div>
                        {theme === t && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                )}

                {activeModal === 'account' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Display Name</label>
                      <div className="p-4 bg-neutral-50 rounded-2xl font-bold text-neutral-900 border border-neutral-100">John Doe</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Secure Email</label>
                      <div className="p-4 bg-neutral-50 rounded-2xl font-bold text-neutral-900 border border-neutral-100 italic">john.doe@flow.sync</div>
                    </div>
                    <button className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-2xl text-[10px] uppercase font-mono font-bold text-neutral-400 hover:text-neutral-900 transition-colors">
                      Update Biometric Record
                    </button>
                  </div>
                )}

                {activeModal === 'security' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-neutral-900 text-white flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-neutral-400" />
                        <div>
                          <p className="text-sm font-bold">Encrypted Vault</p>
                          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.2em] mt-0.5">Active Protocol</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed italic px-2"> Your data is stored locally and synchronized across nodes using sub-atomic encryption protocols. Flow does not track external metadata.</p>
                  </div>
                )}

                {activeModal === 'about' && (
                  <div className="p-6 bg-neutral-50 rounded-3xl space-y-4 border border-neutral-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">Flow OS</h4>
                        <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">v1.0.4 Kernel</p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 leading-loose">
                      Flow is a neural productivity engine designed to eliminate the friction between thought and organized action. Built on principles of minimalism and high-speed cognitive capture.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SettingItemProps {
  icon: any;
  label: string;
  value?: string;
  toggle?: boolean;
  checked?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

function SettingItem({ icon: Icon, label, value, toggle, checked, onToggle, onClick }: SettingItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (toggle && onToggle) {
      onToggle();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center justify-between p-5 hover:bg-neutral-50/80 transition-colors cursor-pointer group"
    >
      <div className="flex items-center space-x-4">
        <div className="p-2.5 bg-neutral-50 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-neutral-800 tracking-tight">{label}</span>
      </div>
      
      <div className="flex items-center">
        {value && (
          <span className="text-[10px] font-mono font-bold text-neutral-400 mr-3 uppercase tracking-widest">
            {value}
          </span>
        )}
        {toggle ? (
          <div className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${checked ? 'bg-neutral-900' : 'bg-neutral-100 shadow-inner border border-neutral-200/50'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-[1.25rem] shadow-sm' : 'translate-x-0'}`} />
          </div>
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </div>
  );
}
