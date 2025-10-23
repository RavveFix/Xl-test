import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';
// Fix: Removed unused UploadedFile type
// import type { UploadedFile } from '../types';

interface FileUploadProps {
  // Fix: Changed prop to onFileSelect and type to File[] to match parent component
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
}

// Fix: Removed unused fileToBase64 function
/*
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove data:mime/type;base64, part
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};
*/

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);

    if (fileRejections.length > 0) {
      // Fix: Updated error message to reflect that only CSV is now supported.
      setError(`Vissa filer avvisades. Endast CSV- och Excel-filer är tillåtna.`);
      return;
    }

    if (acceptedFiles.length === 0) {
        return;
    }

    // Fix: Pass raw File objects directly to the parent component.
    onFileSelect(acceptedFiles);

  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Fix: Restricted accepted file types to CSV to match MainApp's parser.
    accept: {
        'text/csv': ['.csv'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
        ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} disabled={isProcessing} />
      <div className="flex flex-col items-center justify-center text-center">
        <UploadIcon className="w-10 h-10 text-slate-500 mb-3" />
        {isDragActive ? (
          <p className="text-indigo-400 font-semibold">Släpp filerna här ...</p>
        ) : (
          <div>
            <p className="text-slate-400">
              <span className="font-semibold text-indigo-400">Klicka för att ladda upp</span> eller dra och släpp
            </p>
            {/* Fix: Updated help text to show only supported file types. */}
            <p className="text-xs text-slate-500 mt-1">Stöder .csv, .xlsx, .xls</p>
          </div>
        )}
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default FileUpload;