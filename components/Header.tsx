
import React from 'react';
import type { User } from '../types';
import { CubeIcon } from './icons/CubeIcon';
// Fix: Import icons for new buttons
import { ChatIcon, HistoryIcon } from './Icons';

// Fix: Added missing props to support new functionality
interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleChat: () => void;
  onToggleHistory: () => void;
  isChatEnabled: boolean;
  isHistoryEnabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleChat, onToggleHistory, isChatEnabled, isHistoryEnabled }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <CubeIcon className="w-7 h-7 text-indigo-400" />
            <span className="text-xl font-bold text-slate-200 tracking-tight">
              Bygg din plattform
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Fix: Added history and chat toggle buttons */}
            <button
              onClick={onToggleHistory}
              disabled={!isHistoryEnabled}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Visa historik"
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleChat}
              disabled={!isChatEnabled}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Öppna chatt"
            >
              <ChatIcon className="w-5 h-5" />
            </button>
             <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block"></div>
            <span className="text-sm text-slate-400 hidden sm:block">
              Inloggad som <span className="font-medium text-slate-300">{user.email}</span>
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
