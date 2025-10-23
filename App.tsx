
import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
// Fix: Removed .tsx extension for module resolution
import MainApp from './components/MainApp';
// Fix: Removed .ts extension for module resolution
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (loggedInUser: User) => {
    // Exclude password from being stored in state/session storage
    const { password, ...userToStore } = loggedInUser;
    setUser(userToStore);
    sessionStorage.setItem('user', JSON.stringify(userToStore));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  // Fix: Added handler to update user state, passed to MainApp
  const handleUpdateUser = (updateFn: (currentUser: User) => User) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const updatedUser = updateFn(currentUser);
        // Persist updated user to session storage
        const { password, ...userToStore } = updatedUser;
        sessionStorage.setItem('user', JSON.stringify(userToStore));
        return userToStore;
    });
  };

  return (
    <div className="bg-slate-900">
      {user ? (
        <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      ) : (
        <AuthPage onLoginSuccess={handleLogin} />
      )}
    </div>
  );
}

export default App;
