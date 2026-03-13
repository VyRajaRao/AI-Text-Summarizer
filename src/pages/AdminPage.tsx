import React, { useEffect, useState } from 'react';
import { auth, db, collection, query, onSnapshot, getDoc, doc } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Shield, MessageSquare, ThumbsUp, ThumbsDown, Loader2, Users } from 'lucide-react';

export default function AdminPage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const checkAdmin = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
      } else if (user.email === 'vyraja777@gmail.com') {
        setIsAdmin(true);
      } else {
        navigate('/');
      }
    };

    checkAdmin();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'feedback'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
      setFeedback(items);
      setIsFetching(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  if (loading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-bg-dark pt-40 pb-20">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-lg shadow-white/5">
            <Shield className="text-black w-8 h-8" />
          </div>
          <div>
            <h1 className="text-[40px] font-display font-bold text-white tracking-tight">Admin Console</h1>
            <p className="text-[18px] text-white/40">System insights and user feedback</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-morphism rounded-[32px] p-8">
              <div className="flex items-center gap-3 text-white/30 mb-8">
                <Users className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">System Overview</span>
              </div>
              <div className="space-y-8">
                <div>
                  <p className="text-[14px] font-medium text-white/40 mb-2">Total Feedback</p>
                  <p className="text-[48px] font-display font-bold text-white leading-none">{feedback.length}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-2">Positive</p>
                    <p className="text-[24px] font-bold text-emerald-400">{feedback.filter(f => f.rating === 'up').length}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-2">Negative</p>
                    <p className="text-[24px] font-bold text-red-400">{feedback.filter(f => f.rating === 'down').length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-display font-bold text-white flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Recent Feedback
              </h3>
              <span className="text-[12px] font-bold text-white/20 uppercase tracking-widest">Live Feed</span>
            </div>
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="glass-morphism rounded-[24px] p-6 flex items-start justify-between group hover:bg-white/[0.07] transition-all">
                  <div className="flex gap-6">
                    <div className={`p-4 rounded-2xl border transition-all ${
                      item.rating === 'up' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {item.rating === 'up' ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 px-2 py-0.5 bg-white/5 rounded border border-white/10">{item.targetType}</span>
                        <span className="text-[12px] text-white/20 font-medium">{item.createdAt?.toDate().toLocaleString()}</span>
                      </div>
                      <p className="text-[17px] leading-relaxed text-white/80 group-hover:text-white transition-colors">{item.comment || 'No comment provided'}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10" />
                        <p className="text-[11px] font-mono text-white/20">UID: {item.userId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
