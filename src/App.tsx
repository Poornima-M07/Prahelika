/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Copy, 
  RefreshCcw, 
  Scan, 
  Info, 
  Hash,
  ChevronDown,
  ArrowRightLeft
} from 'lucide-react';
import { CipherType, TransformMode, CryptoOptions } from './types';
import { CryptoService } from './lib/crypto';

const CIPHERS = [
  { id: CipherType.AUTO, label: 'Auto Detect', icon: Scan },
  { id: CipherType.BASE64, label: 'Base64', icon: Hash },
  { id: CipherType.ROT13, label: 'ROT13', icon: RefreshCcw },
  { id: CipherType.CAESAR, label: 'Caesar', icon: Shield },
  { id: CipherType.VIGENERE, label: 'Vigenère', icon: Lock },
  { id: CipherType.ATBASH, label: 'Atbash', icon: ArrowRightLeft },
  { id: CipherType.HEX, label: 'Hexadecimal', icon: Hash },
  { id: CipherType.BINARY, label: 'Binary', icon: Hash },
  { id: CipherType.MORSE, label: 'Morse Code', icon: Info },
];

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [cipher, setCipher] = useState<CipherType>(CipherType.AUTO);
  const [mode, setMode] = useState<TransformMode>('encode');
  const [options, setOptions] = useState<CryptoOptions>({ shift: 3, key: 'PRAHELIKA' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [detectedType, setDetectedType] = useState<CipherType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransform = useCallback(() => {
    setIsProcessing(true);
    let activeCipher = cipher;
    if (cipher === CipherType.AUTO) {
      const detected = CryptoService.detectType(input);
      setDetectedType(detected);
      activeCipher = detected;
    } else {
      setDetectedType(null);
    }
    
    // Artificial small delay for "processing" feel
    const timer = setTimeout(() => {
      const result = CryptoService.transform(input, activeCipher, mode, options);
      setOutput(result);
      setIsProcessing(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [input, cipher, mode, options]);

  useEffect(() => {
    handleTransform();
  }, [handleTransform]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const selectedCipher = CIPHERS.find(c => c.id === cipher) || CIPHERS[0];

  return (
    <div className="min-h-screen bg-onyx bg-atmosphere flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="floating-blob w-[500px] h-[500px] bg-rose-gold/20 -top-48 -left-48" />
      <div className="floating-blob w-[400px] h-[400px] bg-rose-gold/10 -bottom-48 -right-48" style={{ animationDelay: '-5s' }} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-gold/10 border border-rose-gold/20 rounded-full mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-rose-gold/5 blur-sm" />
          <Shield size={14} className="text-rose-gold shrink-0" />
          <span className="text-[10px] text-rose-gold font-mono uppercase tracking-[3px] py-1">Secure Environment Active</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-sanskrit font-bold tracking-tighter text-rose-gold mb-4 rose-gold-glow flex items-center justify-center gap-6">
          PRAHELIKA
        </h1>
        <p className="max-w-md mx-auto text-rose-gold/40 text-sm md:text-base font-light tracking-wide italic">
         Do you decode hashes like this for breakfast?
        </p>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 h-full">
        {/* Top Control Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-12 flex flex-wrap items-center justify-between gap-6 p-8 glass-panel rounded-[2.5rem]"
        >
          <div className="flex items-center gap-6">
            {/* Mode Toggle */}
            <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/5 shadow-inner">
              <button
                onClick={() => setMode('encode')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-500 font-display ${
                  mode === 'encode' 
                    ? 'bg-rose-gold text-onyx font-bold shadow-[0_0_20px_rgba(226,169,158,0.3)]' 
                    : 'text-rose-gold/40 hover:text-rose-gold'
                }`}
              >
                <Lock size={16} /> <span className="text-sm">ENCODE</span>
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-500 font-display ${
                  mode === 'decode' 
                    ? 'bg-rose-gold text-onyx font-bold shadow-[0_0_20px_rgba(226,169,158,0.3)]' 
                    : 'text-rose-gold/40 hover:text-rose-gold'
                }`}
              >
                <Unlock size={16} /> <span className="text-sm">DECODE</span>
              </button>
            </div>

            {/* Cipher Selector */}
            <div className="relative group">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-4 px-8 py-4 bg-black/60 border border-white/5 rounded-2xl text-rose-gold hover:border-rose-gold/30 transition-all min-w-[240px] shadow-sm active:scale-95"
              >
                <selectedCipher.icon size={20} className={cipher === CipherType.AUTO ? 'animate-pulse' : ''} />
                <span className="flex-1 text-left font-display font-medium tracking-wide uppercase text-sm">{selectedCipher.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-4 bg-onyx/90 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
                    >
                      <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                        {CIPHERS.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setCipher(c.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all duration-300 ${
                              cipher === c.id ? 'text-rose-gold bg-rose-gold/10' : 'text-rose-gold/40 hover:bg-white/5 hover:text-rose-gold'
                            }`}
                          >
                            <c.icon size={18} />
                            <span className="font-display text-sm tracking-wide uppercase">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Cipher Options */}
          <div className="flex items-center gap-6">
            <AnimatePresence mode="wait">
              {cipher === CipherType.CAESAR && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-4 pl-6 border-l border-white/10 h-10"
                >
                  <span className="text-[10px] text-rose-gold/40 uppercase font-mono tracking-widest">Rotation</span>
                  <input 
                    type="range"
                    min="0"
                    max="25"
                    value={options.shift}
                    onChange={(e) => setOptions({ ...options, shift: parseInt(e.target.value) || 0 })}
                    className="w-32 accent-rose-gold h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="w-8 text-xs text-rose-gold font-mono font-bold">{options.shift}</span>
                </motion.div>
              )}
              {cipher === CipherType.VIGENERE && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-4 pl-6 border-l border-white/10 h-10"
                >
                  <span className="text-[10px] text-rose-gold/40 uppercase font-mono tracking-widest">Keyphrase</span>
                  <input 
                    type="text" 
                    value={options.key}
                    onChange={(e) => setOptions({ ...options, key: e.target.value.toUpperCase() })}
                    className="bg-black/40 border border-white/5 px-4 py-2 rounded-lg text-rose-gold font-mono text-sm outline-none w-32 focus:border-rose-gold/30 uppercase tracking-widest"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Input Textarea Area */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-6 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs text-rose-gold/60 uppercase tracking-[6px] font-display font-bold">Secret Input</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-gold/30 animate-pulse" />
              <span className="text-[10px] text-rose-gold/30 uppercase font-mono tracking-widest font-bold">Awaiting Flux</span>
            </div>
          </div>
          <div className="relative group flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject sensitive data for cryptographic transformation..."
              className="w-full h-full min-h-[450px] bg-black/40 border border-white/5 rounded-[3rem] p-10 text-rose-gold placeholder:text-rose-gold/10 focus:border-rose-gold/20 focus:outline-none focus:bg-black/60 transition-all duration-700 resize-none font-mono leading-relaxed text-xl shadow-2xl custom-scrollbar"
            />
            {detectedType && (
              <div className="absolute top-10 right-10 flex items-center gap-2 bg-rose-gold/10 border border-rose-gold/30 px-3 py-1 rounded-full backdrop-blur-xl">
                 <Scan size={12} className="text-rose-gold" />
                 <span className="text-[9px] text-rose-gold uppercase font-mono tracking-widest">{detectedType}</span>
              </div>
            )}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-gold/[0.03] blur-[100px] pointer-events-none group-focus-within:bg-rose-gold/[0.06] transition-colors" />
          </div>
        </motion.div>

        {/* Output Textarea Area */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-6 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs text-rose-gold/60 uppercase tracking-[6px] font-display font-bold">Processed Stream</h3>
            <button 
              onClick={copyToClipboard}
              className="group flex items-center gap-3 text-[10px] text-rose-gold/30 hover:text-rose-gold transition-all duration-500 uppercase font-mono tracking-widest"
            >
              Copy Stream <Copy size={14} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
          <div className="relative group flex-1 h-full">
            <div className={`w-full h-full min-h-[450px] bg-black/80 border border-white/5 rounded-[3rem] p-10 text-rose-gold font-mono leading-relaxed text-xl overflow-y-auto whitespace-pre-wrap break-all shadow-2xl custom-scrollbar relative transition-opacity duration-300 ${isProcessing ? 'opacity-50' : 'opacity-100'}`}>
              <AnimatePresence mode="wait">
                {output ? (
                  <motion.div
                    key={output}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {output}
                  </motion.div>
                ) : (
                  <span className="opacity-10 italic">Encryption buffer empty...</span>
                )}
              </AnimatePresence>
            </div>
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <RefreshCcw className="text-rose-gold/20 animate-spin w-12 h-12" />
              </div>
            )}
            <div className="absolute top-0 left-0 w-64 h-64 bg-rose-gold/[0.03] blur-[100px] pointer-events-none group-focus-within:bg-rose-gold/[0.06] transition-colors" />
          </div>
        </motion.div>
      </div>

      {/* Experimental Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-[9px] text-rose-gold/30 font-mono flex items-center gap-12 uppercase tracking-[5px] relative"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-gold shadow-[0_0_8px_var(--color-rose-gold)]" />
          <span>Local Decryption Node: 0xF42</span>
        </div>
        <span>Protocol: AES-PRAHELIKA-256</span>
        <span>Runtime: 0.4ms</span>
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-rose-gold/20 to-transparent" />
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(226, 169, 158, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(226, 169, 158, 0.2);
        }
      `}</style>
    </div>
  );
}
