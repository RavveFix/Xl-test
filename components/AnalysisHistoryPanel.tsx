import React, { useState, useMemo, useEffect } from 'react';
import type { SavedAnalysis } from '../types';
import { CloseIcon, TrashIcon, PenIcon } from './Icons';

interface AnalysisHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  analyses: SavedAnalysis[];
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
  onRenameAnalysis: (id: string, newName: string) => void;
  currentAnalysisId?: string;
}

const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s sedan`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m sedan`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h sedan`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d sedan`;
};

const HistoryItem: React.FC<{
  item: SavedAnalysis;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}> = ({ item, isSelected, onSelect, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      setIsEditing(false);
    }
  };

  return (
    <li
      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-indigo-600/30' : 'hover:bg-slate-700/50'}`}
      onClick={() => !isEditing && onSelect()}
    >
      <div className="flex-grow overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleRenameSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRenameSubmit}
              autoFocus
              className="w-full bg-slate-900 text-sm font-semibold text-indigo-300 border-b border-indigo-400 focus:outline-none"
              onClick={(e) => e.stopPropagation()} // Prevent selection when clicking input
            />
          </form>
        ) : (
          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`} title={item.name}>
            {item.name}
          </p>
        )}
        <p className="text-xs text-slate-400">{formatRelativeTime(item.timestamp)}</p>
      </div>
      <div className="flex items-center flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white"
          aria-label="Byt namn"
        >
          <PenIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400"
          aria-label="Ta bort"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
};


const AnalysisHistoryPanel: React.FC<AnalysisHistoryPanelProps> = ({
  isOpen, onClose, analyses, onSelectAnalysis, onDeleteAnalysis, onRenameAnalysis, currentAnalysisId
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [analyses, searchTerm]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 bg-slate-800/90 backdrop-blur-lg border-r border-slate-700 z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-200">Historik</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="p-4 flex-shrink-0">
          <input
            type="text"
            placeholder="Sök analyser..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {filteredAnalyses.length > 0 ? (
            <ul className="space-y-2">
              {filteredAnalyses.map(item => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  isSelected={item.id === currentAnalysisId}
                  onSelect={() => onSelectAnalysis(item.id)}
                  onDelete={() => onDeleteAnalysis(item.id)}
                  onRename={(newName) => onRenameAnalysis(item.id, newName)}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <p>Inga analyser hittades.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AnalysisHistoryPanel;
