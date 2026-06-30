/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, KeyRound, Mail, AlertCircle, Sparkles, Compass } from 'lucide-react';
import { DbService } from '../../services/db';

interface LoginScreenProps {
  onSuccess: (user: any) => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleDemoMode = () => {
    setError(null);
    setIsLoading(true);
    try {
      const demoUser = DbService.createDemoUser();
      onSuccess(demoUser);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred entering Demo Mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Registration validations
        if (!username.trim() || !email.trim() || !password) {
          throw new Error('All fields are required.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        
        const newUser = await DbService.registerUser(username, email, password);
        onSuccess(newUser);
      } else {
        // Login validations
        if (!email.trim() || !password) {
          throw new Error('Please enter both email/username and password.');
        }
        const user = await DbService.authenticateUser(email, password);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full flex items-center justify-center bg-gradient-to-tr from-slate-950 via-indigo-950 to-neutral-950 overflow-hidden font-sans select-none">
      {/* Decorative blurred background shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md px-6 py-8"
        id="login-container"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md mb-4 text-violet-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">
            LifeDesk<span className="text-violet-400">OS</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            Your premium, isolated personal workspace
          </p>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-white/5 shadow-2xl backdrop-blur-2xl px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegistering ? 'register' : 'login'}
              initial={{ opacity: 0, x: isRegistering ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRegistering ? -50 : 50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                {isRegistering ? 'Create workspace' : 'Welcome back'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="reg-username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="john_doe"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">
                    {isRegistering ? 'Email Address' : 'Email or Username'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="login-identity"
                      type={isRegistering ? 'email' : 'text'}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isRegistering ? 'john@example.com' : 'username or email'}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                {isRegistering && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        id="reg-confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300"
                    id="form-error-banner"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  id="submit-auth-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-xl py-2.5 text-sm font-medium transition-all shadow-lg shadow-violet-600/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isRegistering ? (
                    'Initialize Workspace'
                  ) : (
                    'Unlock Desktop'
                  )}
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <span className="relative px-3 bg-neutral-950/20 text-[10px] text-neutral-400 uppercase tracking-wider backdrop-blur-sm rounded-full">
                    or
                  </span>
                </div>

                <button
                  id="demo-auth-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={handleDemoMode}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/[0.01] text-neutral-200 border border-white/5 rounded-xl py-2.5 text-sm font-medium transition-all focus:outline-none flex items-center justify-center gap-2"
                >
                  <Compass className="w-4.5 h-4.5 text-violet-400" />
                  Try Demo Mode
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <button
              id="toggle-auth-mode"
              onClick={() => {
                setIsRegistering(!isRegistering);
                clearForm();
              }}
              className="text-xs text-neutral-400 hover:text-white transition-colors focus:outline-none"
            >
              {isRegistering ? (
                <>Already have an account? <span className="text-violet-400 font-medium">Sign in</span></>
              ) : (
                <>New to LifeDeskOS? <span className="text-violet-400 font-medium">Create an account</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
