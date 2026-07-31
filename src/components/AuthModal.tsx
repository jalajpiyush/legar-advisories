import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { 
  auth,
  googleSignIn,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup' | 'forgot_password' | 'verification_sent'>('login');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await googleSignIn();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else if (view === 'signup') {
        if (!acceptTerms) {
          setError('You must accept the Terms & Privacy Policy to sign up.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (userCred.user) {
          if (name) {
            await updateProfile(userCred.user, { displayName: name });
          }
          await sendEmailVerification(userCred.user);
          // Let them login but show verification sent view
          setView('verification_sent');
          setTimeout(() => onClose(), 3000);
        }
      } else if (view === 'forgot_password') {
        await sendPasswordResetEmail(auth, email);
        setView('verification_sent');
      }
    } catch (err: any) {
      let msg = err?.message || 'Authentication failed';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. If you originally signed up with Google, please use the Google button below.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email is already in use. Please sign in, or use the Google button if you originally signed up with Google.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {view === 'verification_sent' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Check your email</h2>
              <p className="text-gray-600 text-[15px]">
                We've sent an email to <strong>{email}</strong> with further instructions.
              </p>
              <button
                onClick={() => setView('login')}
                className="mt-6 w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create an account' : 'Reset password'}
                </h2>
                <p className="text-gray-500 mt-2 text-[15px]">
                  {view === 'login' ? 'Enter your details to access your account' : 
                   view === 'signup' ? 'Sign up to get started with Legal Advisories' : 
                   'Enter your email to receive a reset link'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-[13px] rounded-lg border border-red-100 flex items-start gap-2">
                  <div className="mt-0.5">•</div>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {view === 'signup' && (
                  <div className="space-y-1 mb-4">
                    <label className="text-[13px] font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {view !== 'forgot_password' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-medium text-gray-700">Password</label>
                      {view === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => { setView('forgot_password'); setError(''); }}
                          className="text-[12px] font-medium text-blue-600 hover:text-blue-700"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {view === 'signup' && (
                  <div className="flex items-start gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-[12px] text-gray-600 leading-tight">
                      I accept the <a href="#" className="text-gray-900 font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-gray-900 font-medium hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? 'Please wait...' : view === 'login' ? 'Sign in' : view === 'signup' ? 'Create account' : 'Send reset link'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {view !== 'forgot_password' && (
                <>
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[13px]">
                      <span className="bg-white px-4 text-gray-500 font-medium">OR CONTINUE WITH</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                </>
              )}

              <div className="mt-8 text-center text-[13px] text-gray-500">
                {view === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button onClick={() => { setView('signup'); setError(''); }} className="text-gray-900 font-medium hover:underline">
                      Sign up
                    </button>
                  </>
                ) : view === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button onClick={() => { setView('login'); setError(''); }} className="text-gray-900 font-medium hover:underline">
                      Sign in
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setView('login'); setError(''); }} className="text-gray-900 font-medium hover:underline">
                    Back to login
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
