import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Zap } from 'lucide-react';
import { analyzeImage, generateSpeech } from '../services/geminiService';
import { playPCMAudio } from '../services/audioUtils';
import { TranslationResult } from '../types';

const SnapFeature: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setPermissionError(false);
    } catch (err) {
      console.error("Camera error:", err);
      setPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        processImage(dataUrl);
      }
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    try {
      const analysis = await analyzeImage(base64);
      setResult(analysis);
      // Auto-play audio on result
      const audioBase64 = await generateSpeech(analysis.kanji);
      if (audioBase64) playPCMAudio(audioBase64);
    } catch (error) {
      console.error(error);
      alert("Could not analyze image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    startCamera(); // Restart stream if it was paused/stopped (though we didn't stop it, just hid it)
  };

  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-600">
        <Camera size={48} className="mb-4 text-slate-300" />
        <p>Please allow camera access to use Snap & Learn.</p>
        <button onClick={startCamera} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black flex flex-col">
      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera View / Captured Image View */}
      <div className="flex-1 relative overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white font-medium animate-pulse">Analyzing...</p>
          </div>
        )}

        {/* Result Overlay */}
        {!loading && result && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-12 text-white">
             <div className="flex justify-between items-start mb-2">
                <span className="bg-indigo-600 text-xs px-2 py-1 rounded uppercase font-bold tracking-wider">
                  {result.type}
                </span>
                <button onClick={reset} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur">
                  <X size={20} />
                </button>
             </div>
             
             <h2 className="text-4xl font-jp font-bold mb-1">{result.kanji}</h2>
             <div className="flex items-baseline space-x-3 mb-2">
                <p className="text-xl text-sakura-200">{result.hiragana}</p>
                <p className="text-sm text-slate-400 font-mono">({result.romaji})</p>
             </div>
             <p className="text-lg font-light border-t border-white/20 pt-2 mt-2">{result.english}</p>
             
             <button 
                onClick={async () => {
                  const audio = await generateSpeech(result.kanji);
                  if (audio) playPCMAudio(audio);
                }}
                className="mt-4 w-full py-3 bg-white text-indigo-900 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
             >
               <Zap size={18} className="fill-indigo-900" />
               Listen Again
             </button>
          </div>
        )}
      </div>

      {/* Controls (Only visible when not captured) */}
      {!capturedImage && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-10 pb-20">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 active:scale-90 transition-all shadow-lg"
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-inner" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SnapFeature;
