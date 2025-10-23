import React, { useState } from 'react';
import type { User } from '../types';
import { CubeIcon } from './icons/CubeIcon';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (!email || !password) {
      setError('E-post och lösenord krävs.');
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would validate credentials against a backend.
      // Here, we'll just create a mock user.
      const mockUser: User = {
        id: crypto.randomUUID(),
        email: email,
        plan: 'PRO', // Let's give them the PRO plan for the demo
        analysisCount: 5, // A sample starting count
      };

      onLoginSuccess(mockUser);
      // No need to set isSubmitting to false as the component will unmount
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <CubeIcon className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Välkommen till Bygg din plattform</h1>
            <p className="text-slate-400 mt-2">Logga in för att fortsätta.</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  E-postadress
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200"
                  placeholder="dittnamn@example.com"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Lösenord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Loggar in...' : 'Logga in'}
                </button>
              </div>
            </div>
          </form>
           <div className="mt-8 text-center text-xs text-slate-500">
            <p>Detta är en demo. Använd testkontot nedan eller valfri e-post/lösenord.</p>
            <div className="mt-3 inline-block bg-slate-900/50 p-3 rounded-md border border-slate-700 text-left text-sm">
                <p className="text-slate-400"><strong>E-post:</strong> <code className="text-indigo-300">test@example.com</code></p>
                <p className="text-slate-400 mt-1"><strong>Lösenord:</strong> <code className="text-indigo-300">password123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;