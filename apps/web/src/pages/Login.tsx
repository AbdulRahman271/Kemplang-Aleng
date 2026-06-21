import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getSession } from '../utils/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const sessionData = await getSession();
        if (sessionData?.user && sessionData.user.role === 'admin') {
          navigate('/admin');
        }
      } catch (_) {
        // Not logged in, stay on login page
      } finally {
        setCheckingSession(false);
      }
    };
    checkActiveSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email dan Password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await login(email, password);
      if (response?.user && response.user.role !== 'admin') {
        setError('Akses ditolak: Anda bukan administrator.');
        return;
      }
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Kredensial salah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background dark:bg-on-background flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-tr from-surface-dim via-background to-primary-container/10 dark:from-on-background dark:via-black dark:to-primary-container/5 overflow-hidden transition-colors duration-300">
      {/* Decorative blurred backdrops */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute inset-0 batik-overlay z-0 opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/70 dark:bg-inverse-surface/40 backdrop-blur-xl border border-outline-variant/30 dark:border-outline/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10">

        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container shadow-lg mb-4">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-primary-container">
            Kemplang Aleng
          </h1>
          <p className="text-label-md text-on-surface-variant dark:text-outline-variant mt-1.5">
            Portal Administrasi Web
          </p>
        </div>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl flex items-start gap-3 text-label-md mb-6 border border-error/20 animate-fadeIn">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-label-md font-bold text-on-surface-variant dark:text-outline-variant">
              Email Administrator
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-lg select-none">
                mail
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-12 pr-5 py-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant dark:border-outline/50 focus:border-primary dark:focus:border-secondary-container rounded-2xl font-body-md text-on-surface dark:text-on-primary-container transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-secondary-container/20"
                placeholder="admin"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-label-md font-bold text-on-surface-variant dark:text-outline-variant">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-lg select-none">
                lock
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-12 pr-5 py-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant dark:border-outline/50 focus:border-primary dark:focus:border-secondary-container rounded-2xl font-body-md text-on-surface dark:text-on-primary-container transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-secondary-container/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary dark:bg-secondary-container text-on-primary dark:text-on-secondary-container hover:bg-primary-container dark:hover:bg-secondary-fixed font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none hover:shadow-md mt-8"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Masuk ke Dashboard...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                Masuk Sekarang
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-label-md text-primary dark:text-secondary-container hover:underline transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Kembali ke Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
