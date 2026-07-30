import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bolt, KeyRound, Mail, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, error, isDemoMode, enableDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Please fill in all credentials.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Incorrect credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoModeLogin = () => {
    enableDemoMode();
    setEmail('universefact67@gmail.com');
    setPassword('admin123');
    setLocalError(null);
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 py-12 relative overflow-hidden font-sans">
      {/* Abstract Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo and Brand Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 mb-4 ring-4 ring-indigo-500/10 animate-pulse">
            <Bolt className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            SparkyPro ERP
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Personal Electrician Business Management System
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">
            Authorized Owner Login
          </h2>

          {/* Combined Error States */}
          {(localError || error) && (
            <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Login Warning</p>
                <p className="opacity-95 whitespace-pre-line leading-relaxed">{localError || error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                Owner Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In as Owner'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-slate-800" />
            <span className="px-3 text-xs text-slate-500 uppercase font-mono tracking-wider bg-transparent">
              or connect with
            </span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2.5 text-slate-200 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Quick Demo Assist */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleDemoModeLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/15 border border-indigo-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
              <span>Click for Evaluation / Demo Bypass</span>
            </button>
            <p className="text-[10px] text-slate-500 mt-2">
              Bypasses iframe blocks instantly with mock electrician ledger data.
            </p>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center mt-6 text-xs text-slate-600 font-mono">
          SparkyPro Enterprise © 2026 • Secure & Private
        </div>
      </div>
    </div>
  );
};
