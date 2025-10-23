
import React from 'react';
// Fix: Removed .ts extension for module resolution
import type { UploadedFile } from '../types';
import { FileIcon } from './icons/FileIcon';
import { TrashIcon } from './icons/TrashIcon';

interface FileListProps {
  files: UploadedFile[];
  onFileDelete: (fileId: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const FileItem: React.FC<{ file: UploadedFile; onDelete: (id: string) => void }> = ({ file, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
      <div className="flex items-center gap-4 overflow-hidden">
        <FileIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-slate-200 truncate" title={file.name}>
            {file.name}
          </span>
          <span className="text-xs text-slate-400">
            {formatFileSize(file.size)}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(file.id)}
        className="p-2 rounded-full text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 flex-shrink-0 ml-4"
        aria-label={`Ta bort ${file.name}`}
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};


const FileList: React.FC<FileListProps> = ({ files, onFileDelete }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-10 px-4 border-2 border-dashed border-slate-700 rounded-lg">
        <p className="text-slate-500">Inga filer uppladdade ännu.</p>
        <p className="text-slate-600 text-sm mt-1">Använd formuläret ovan för att börja.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {files.map((file) => (
        <FileItem key={file.id} file={file} onDelete={onFileDelete} />
      ))}
    </div>
  );
};

export default FileList;
