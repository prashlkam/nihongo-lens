import React, { useState } from 'react';
import { Volume2, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { translateText, generateSpeech } from '../services/geminiService';
import { playPCMAudio } from '../services/audioUtils';
import { TranslationResult } from '../types';

const TranslatorFeature: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await translateText(inputText);
      setResult(data);
      // Auto play
      playAudio(data.kanji);
    } catch (e) {
      console.error(e);
      alert("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (text: string) => {
    setIsPlaying(true);
    try {
      const audioBase64 = await generateSpeech(text);
      if (audioBase64) {
        await playPCMAudio(audioBase64);
      }
    } catch (e) {
      console.error("Audio failed", e);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50 overflow-y-auto pb-32">
      <h1 className="text-2xl font-bold text-indigo-950 mb-6 flex items-center gap-2">
        <BookOpen className="text-indigo-600" />
        Type & Speak
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">English</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Where is the train station?"
          className="w-full text-lg text-slate-800 placeholder-slate-300 outline-none resize-none bg-transparent h-24"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-white transition-all
              ${loading || !inputText ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}
            `}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Translate'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                 <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Japanese</span>
                 <button 
                  onClick={() => playAudio(result.kanji)}
                  disabled={isPlaying}
                  className="p-2 bg-white rounded-full text-indigo-600 shadow-sm hover:scale-110 active:scale-95 transition-all"
                 >
                   {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                 </button>
              </div>
              <div className="p-6 text-center">
                <h2 className="text-3xl font-jp font-bold text-slate-800 mb-2 leading-relaxed">
                  {result.kanji}
                </h2>
                <p className="text-xl text-indigo-500 mb-1 font-jp font-medium">{result.hiragana}</p>
                <p className="text-slate-400 font-mono text-sm">{result.romaji}</p>
              </div>
           </div>
        </div>
      )}

      {/* Quick Tips */}
      {!result && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Try asking:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Hello",
              "Thank you",
              "Delicious!",
              "Excuse me",
              "I don't understand"
            ].map(phrase => (
              <button 
                key={phrase}
                onClick={() => setInputText(phrase)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslatorFeature;
