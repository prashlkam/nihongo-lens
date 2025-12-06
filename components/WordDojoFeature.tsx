import React, { useState } from 'react';
import { Volume2, ChevronRight, ChevronLeft, RotateCcw, Plus, Loader2 } from 'lucide-react';
import { VocabularyItem } from '../types';
import { generateSpeech, translateText } from '../services/geminiService';
import { playPCMAudio } from '../services/audioUtils';

// Mock Data - In a real app, fetch from Firebase
const MOCK_WORDS: VocabularyItem[] = [
  { id: '1', english: 'Cat', japanese_kanji: '猫', japanese_kana: 'ねこ', romaji: 'Neko', category: 'Animals', difficulty: 'N5', imageUrl: 'https://picsum.photos/400/300?random=1' },
  { id: '2', english: 'Delicious', japanese_kanji: '美味しい', japanese_kana: 'おいしい', romaji: 'Oishii', category: 'Food', difficulty: 'N5', imageUrl: 'https://picsum.photos/400/300?random=2' },
  { id: '3', english: 'Subway / Train', japanese_kanji: '電車', japanese_kana: 'でんしゃ', romaji: 'Densha', category: 'Travel', difficulty: 'N5', imageUrl: 'https://picsum.photos/400/300?random=3' },
  { id: '4', english: 'Mountain', japanese_kanji: '山', japanese_kana: 'やま', romaji: 'Yama', category: 'Nature', difficulty: 'N5', imageUrl: 'https://picsum.photos/400/300?random=4' },
  { id: '5', english: 'Thank you', japanese_kanji: 'ありがとう', japanese_kana: 'ありがとう', romaji: 'Arigatou', category: 'Greetings', difficulty: 'N5', imageUrl: 'https://picsum.photos/400/300?random=5' },
];

const WordDojoFeature: React.FC = () => {
  const [words, setWords] = useState<VocabularyItem[]>(MOCK_WORDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const [newWordInput, setNewWordInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const currentWord = words[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const playWordAudio = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (isLoadingAudio) return;
    
    setIsLoadingAudio(true);
    const audio = await generateSpeech(currentWord.japanese_kanji);
    if (audio) await playPCMAudio(audio);
    setIsLoadingAudio(false);
  };

  const handleAddWord = async () => {
    if (!newWordInput.trim()) return;
    setIsAdding(true);
    try {
      const translation = await translateText(newWordInput);
      const newCard: VocabularyItem = {
        id: Date.now().toString(),
        english: translation.english || newWordInput,
        japanese_kanji: translation.kanji,
        japanese_kana: translation.hiragana,
        romaji: translation.romaji,
        category: 'Custom',
        difficulty: 'Custom',
        imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`
      };
      
      const updatedWords = [...words, newCard];
      setWords(updatedWords);
      setCurrentIndex(updatedWords.length - 1);
      setNewWordInput('');
      setIsFlipped(false);
    } catch (e) {
      console.error(e);
      alert("Failed to translate word.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center bg-slate-50 p-6 pb-32 overflow-y-auto">
       <div className="w-full max-w-md flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-indigo-950">Word Dojo</h1>
            <p className="text-slate-500 text-sm">Master your vocabulary</p>
          </div>
          <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
            {currentIndex + 1} / {words.length}
          </div>
       </div>

       {/* Add Word Input */}
       <div className="w-full max-w-md mb-6 relative z-10">
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <input 
            type="text" 
            value={newWordInput}
            onChange={(e) => setNewWordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            placeholder="Add a word (e.g. 'Coffee')"
            className="flex-1 px-4 py-2 outline-none text-slate-700 placeholder-slate-400 bg-transparent min-w-0"
          />
          <button 
            onClick={handleAddWord}
            disabled={isAdding || !newWordInput.trim()}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-colors flex items-center justify-center min-w-[48px]"
          >
            {isAdding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

       {/* Flashcard Container */}
       <div className="perspective-1000 w-full max-w-sm aspect-[3/4] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
             
             {/* Front Side */}
             <div className="absolute inset-0 bg-white rounded-3xl backface-hidden flex flex-col overflow-hidden border border-slate-200">
                <div className="h-3/5 bg-slate-200 relative">
                  <img src={currentWord.imageUrl} alt={currentWord.english} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-xs">
                    {currentWord.category}
                  </div>
                </div>
                <div className="h-2/5 flex flex-col items-center justify-center p-6 bg-white">
                   <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center leading-tight">{currentWord.english}</h2>
                   <p className="text-slate-400 text-sm">Tap to reveal Japanese</p>
                </div>
             </div>

             {/* Back Side */}
             <div className="absolute inset-0 bg-indigo-900 rounded-3xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sakura-400 to-indigo-500"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
                
                <h2 className="text-5xl font-jp font-bold mb-4 text-center leading-tight">{currentWord.japanese_kanji}</h2>
                <p className="text-2xl text-sakura-200 mb-2 text-center">{currentWord.japanese_kana}</p>
                <p className="text-indigo-300 font-mono tracking-widest uppercase mb-12 text-sm text-center">{currentWord.romaji}</p>

                <button 
                  onClick={playWordAudio}
                  className="bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all active:scale-95"
                >
                  <Volume2 className={isLoadingAudio ? "animate-pulse text-sakura-400" : "text-white"} size={32} />
                </button>
             </div>
          </div>
       </div>

       {/* Controls */}
       <div className="flex items-center gap-6 mt-8">
          <button onClick={prevCard} className="p-4 bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hover:text-indigo-600 active:bg-slate-50 transition-colors">
             <ChevronLeft size={24} />
          </button>
          
          <button onClick={() => setIsFlipped(!isFlipped)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 font-semibold active:scale-95 transition-transform">
             <RotateCcw size={18} />
             Flip Card
          </button>

          <button onClick={nextCard} className="p-4 bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hover:text-indigo-600 active:bg-slate-50 transition-colors">
             <ChevronRight size={24} />
          </button>
       </div>
    </div>
  );
};

export default WordDojoFeature;