import React from 'react';

const ChatCard: React.FC = () => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Chatta med din Data</h3>
            <div className="flex-grow bg-slate-900/50 rounded p-2 text-sm text-slate-400 flex items-center justify-center">
                <p>Chatt-funktionalitet kommer snart...</p>
            </div>
            <div className="mt-4 flex gap-2">
                <input 
                    type="text" 
                    placeholder="Ställ en fråga..."
                    className="flex-grow px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled
                />
                <button 
                    className="px-4 py-2 bg-indigo-600 rounded-md text-white font-medium disabled:bg-indigo-500/50 disabled:cursor-not-allowed"
                    disabled
                >
                    Skicka
                </button>
            </div>
        </div>
    );
};

export default ChatCard;
