import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { Sparkles, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthLandingPage() {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      console.log('[AUTH] Starting Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('[AUTH] Sign-in successful:', result.user.email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[AUTH] Sign-in error:', errorMessage);
      setError(errorMessage);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 text-center max-w-[900px]"
      >
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-10 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/60">Intelligence Engine v3.1</span>
        </div>

        <h1 className="text-[120px] md:text-[80px] sm:text-[60px] font-display font-bold leading-[0.82] tracking-[-0.05em] mb-10">
          Master complexity.<br />
          <span className="text-gradient">Tailor clarity.</span>
        </h1>

        <p className="text-[22px] md:text-[18px] text-white/40 max-w-[600px] mx-auto mb-14 leading-relaxed font-medium">
          The surgical precision of Gemini 3.1 Pro, distilled into a seamless interface for summarization, paraphrasing, and deep readability analysis.
        </p>

        <div className="flex flex-col items-center gap-8">
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="group relative flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-bold text-[18px] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{signingIn ? 'Signing in...' : 'Enter the Platform'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-3 rounded-lg max-w-[500px] text-center text-sm">
              <p className="font-semibold mb-1">Sign-in Error</p>
              <p className="text-xs">{error}</p>
              <p className="text-xs mt-2 text-red-300">Make sure localhost:5173 is added to Firebase's authorized redirect URIs</p>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-white/20">
            <Shield className="w-4 h-4" />
            <p className="text-[12px] font-bold uppercase tracking-widest">Secure OAuth Access</p>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="grid grid-cols-3 md:grid-cols-1 gap-16 mt-32 z-10 max-w-[1100px] w-full border-t border-white/5 pt-16"
      >
        <div className="flex flex-col gap-5 group">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-[20px] font-display font-bold">Neural Summarization</h3>
          <p className="text-white/30 text-[15px] leading-relaxed">Distill massive documents into surgical insights with zero loss in context or nuance.</p>
        </div>
        <div className="flex flex-col gap-5 group">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
            <Globe className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-[20px] font-display font-bold">Adaptive Paraphrasing</h3>
          <p className="text-white/30 text-[15px] leading-relaxed">Instantly pivot your content's tone and complexity for any audience, from beginner to expert.</p>
        </div>
        <div className="flex flex-col gap-5 group">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-[20px] font-display font-bold">Privacy First</h3>
          <p className="text-white/30 text-[15px] leading-relaxed">Your data is yours. We use enterprise-grade encryption and never train on your private content.</p>
        </div>
      </motion.div>
    </div>
  );
}
