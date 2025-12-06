import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sakura-500 rounded-full blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">NihongoLens</h1>
                <p className="text-indigo-200">Your AI Companion for Japanese</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-indigo-200 uppercase ml-1">Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                            <input 
                                type="text" 
                                required={!isLogin}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-indigo-300/30 rounded-xl px-12 py-3 text-white placeholder-indigo-300/50 focus:outline-none focus:border-sakura-400 transition-colors"
                                placeholder="Sensei-san"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-200 uppercase ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-indigo-300/30 rounded-xl px-12 py-3 text-white placeholder-indigo-300/50 focus:outline-none focus:border-sakura-400 transition-colors"
                            placeholder="hello@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-200 uppercase ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-indigo-300/30 rounded-xl px-12 py-3 text-white placeholder-indigo-300/50 focus:outline-none focus:border-sakura-400 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-sakura-500 to-indigo-500 hover:from-sakura-400 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 mt-6 active:scale-95 transition-all"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <>
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-indigo-200 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sakura-200 font-bold hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <button 
                  onClick={onLogin}
                  className="text-sm text-indigo-300 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  Continue as Guest
                </button>
            </div>
        </div>
    </div>
  );
};

export default AuthPage;