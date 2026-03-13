import React from 'react';
import { Link } from 'react-router-dom';
import { auth, signOut, FirebaseUser } from '../lib/firebase';
import { LogOut, FileText, User } from 'lucide-react';

interface NavbarProps {
  user: FirebaseUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-16 glass-morphism rounded-full flex items-center justify-between px-8 z-50 shadow-2xl">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
          <FileText className="text-black w-5 h-5" />
        </div>
        <span className="font-display font-bold text-[20px] tracking-tight">Clarity</span>
      </Link>
      
      <div className="flex items-center gap-8">
        <Link to="/" className="text-[15px] font-medium text-white/60 hover:text-white transition-colors">Home</Link>
        {user && (
          <Link to="/dashboard" className="text-[15px] font-medium text-white/60 hover:text-white transition-colors">History</Link>
        )}
        
        {user && (
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <User className="w-4 h-4 text-white/40" />
                </div>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-white/40 group-hover:text-white" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
