import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Mail, Lock, User, Github } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-neutral-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-50 rounded-full blur-3xl opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2 italic">Flow</h1>
          <p className="text-neutral-400 text-xs uppercase font-mono tracking-[0.3em]">Neural Protocol v1.0.4</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-8 card-shadow shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Identity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="Display Name"
                      className="w-full bg-neutral-50 border border-transparent focus:border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 ml-1">Secure Channel</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address"
                    className="w-full bg-neutral-50 border border-transparent focus:border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Encrypted Key</label>
                  {isLogin && <button type="button" className="text-[9px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Forgot?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-neutral-50 border border-transparent focus:border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                disabled={isLoading}
                type="submit"
                className="w-full bg-neutral-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center space-x-2 hover:bg-black transition-all active:scale-[0.98] mt-4 shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Initiate Session' : 'Create Registry'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-neutral-50 space-y-4">
            <button className="w-full flex items-center justify-center space-x-2 py-3 border border-neutral-100 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
              <Github className="w-4 h-4" />
              <span>Connect with GitHub</span>
            </button>
            
            <p className="text-center text-[10px] text-neutral-400 font-medium">
              {isLogin ? "Don't have a protocol yet?" : "Already have a key?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-neutral-900 font-bold hover:underline"
              >
                {isLogin ? "Create Registry" : "Initiate Session"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 text-center opacity-30">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em]">Privacy First • Local Encryption Active</p>
      </div>
    </div>
  );
}
