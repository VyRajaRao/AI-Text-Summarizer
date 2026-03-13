import React, { useEffect, useState } from 'react';
import { summarizeText } from '../services/gemini';
import { Columns, Loader2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface ComparisonPanelProps {
  content: string;
}

export default function ComparisonPanel({ content }: ComparisonPanelProps) {
  const [summaries, setSummaries] = useState<{ short: string; medium: string; long: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const [short, medium, long] = await Promise.all([
          summarizeText(content, 'short'),
          summarizeText(content, 'medium'),
          summarizeText(content, 'long')
        ]);
        setSummaries({ short, medium, long });
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, [content]);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="glass-morphism rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
          <Columns className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-[24px] font-display font-bold text-white">Summary Comparison</h2>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-white/40">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
          <p className="text-[14px] font-medium">Generating multi-level summaries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[
            { title: 'Short', content: summaries?.short, color: 'emerald' },
            { title: 'Medium', content: summaries?.medium, color: 'blue' },
            { title: 'Long', content: summaries?.long, color: 'purple' }
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-white">{s.title}</h3>
                <div className="flex items-center gap-2 text-[11px] font-bold text-white/30 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {calculateReadingTime(s.content || '')} min read
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[15px] leading-relaxed text-white/60 whitespace-pre-wrap">
                  {s.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
