import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Flame, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('demo');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Please enter both username/email and password', 'error');
      return;
    }

    try {
      await login({ username: identifier.trim(), password });
      showToast('Welcome back! Let’s crush today’s goals 🔥', 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error');
    }
  };

  const handleQuickDemo = async () => {
    setIdentifier('demo');
    setPassword('password123');
    try {
      await login({ username: 'demo', password: 'password123' });
      showToast('Signed in as demo user Alex Morgan', 'success');
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md font-bold text-lg mb-2">
            AT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Activity Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to track activities, build daily streaks, and view productivity metrics.
          </p>
        </div>

        {/* Demo Quick Button */}
        <button
          onClick={handleQuickDemo}
          type="button"
          className="w-full p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-between hover:border-amber-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Instant Demo: Log in as Alex Morgan</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Username or email"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-slate-900 dark:text-white font-semibold underline underline-offset-2"
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
