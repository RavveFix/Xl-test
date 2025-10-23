import React, { useState, useEffect, useCallback } from 'react';
import type { User, UploadedFile, SavedAnalysis, Job } from '../types';
import * as geminiService from '../services/geminiService';
import Header from './Header';
import FileUpload from './FileUpload';
import FileList from './FileList';
import Dashboard from './Dashboard';
import AnalysisQueue from './AnalysisQueue';
import AnalysisHistoryPanel from './AnalysisHistoryPanel';
import ChatPanel from './ChatPanel';

// Declare XLSX from SheetJS library loaded via CDN
declare var XLSX: any;

/**
 * Efficiently reads a sample from the beginning of a large file without loading the whole file into memory.
 * @param file The file object to read from.
 * @param lineCount The number of lines to sample from the file.
 * @returns A promise that resolves with the sampled CSV data as a string.
 */
const readFileSample = (file: File, lineCount: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        // We read a slice of the file (e.g., the first 2MB). This is much more memory-efficient
        // than reading the entire file, especially for large datasets. 2MB is ample for
        // capturing a significant sample of several hundred lines for most CSVs.
        const slice = file.slice(0, 2 * 1024 * 1024);
        const reader = new FileReader();

        reader.onload = (event) => {
            if (event.target?.result) {
                const text = event.target.result as string;
                // Take the specified number of lines from the slice.
                const lines = text.split('\n');
                const sampledLines = lines.slice(0, lineCount);
                resolve(sampledLines.join('\n'));
            } else {
                reject(new Error("Could not read file sample."));
            }
        };

        reader.onerror = (event) => {
            reject(new Error(`File could not be read! Error: ${event.target?.error?.message}`));
        };

        reader.readAsText(slice);
    });
};

/**
 * Efficiently reads a sample from the beginning of an Excel file.
 * @param file The Excel file object to read from.
 * @param lineCount The number of lines to sample.
 * @returns A promise that resolves with the sampled data as a CSV string.
 */
const readExcelSample = (file: File, lineCount: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = (event) => {
            if (event.target?.result) {
                try {
                    const data = new Uint8Array(event.target.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // To get a sample, convert a limited range of the sheet to an array of arrays.
                    const range = XLSX.utils.decode_range(worksheet['!ref']);
                    range.e.r = Math.min(range.e.r, lineCount - 1); // Limit rows
                    const newRange = XLSX.utils.encode_range(range);
                    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: newRange });
                    
                    // Convert the array of arrays to a CSV string.
                    const csvSample = rows.map(row => 
                        (row as any[]).map(cell => {
                            const cellStr = String(cell ?? '');
                            // Handle commas inside cells by wrapping in quotes
                            return cellStr.includes(',') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
                        }).join(',')
                    ).join('\n');
                    
                    resolve(csvSample);
                } catch (e) {
                    console.error("Error parsing Excel file:", e);
                    reject(new Error("Kunde inte tolka Excel-filen."));
                }
            } else {
                 reject(new Error("Kunde inte läsa Excel-filens innehåll."));
            }
        };

        reader.onerror = (event) => {
            reject(new Error(`Filen kunde inte läsas! Fel: ${event.target?.error?.message}`));
        };
    });
};


const DATA_SAMPLE_LINE_COUNT = 500;


interface MainAppProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updateFn: (currentUser: User) => User) => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, onUpdateUser }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>(() => {
    try {
      const stored = localStorage.getItem(`analyses_${user.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<SavedAnalysis | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(`analyses_${user.id}`, JSON.stringify(savedAnalyses));
  }, [savedAnalyses, user.id]);
  
  const processFile = useCallback(async (file: File) => {
    const jobId = crypto.randomUUID();
    const newJob: Job = { id: jobId, fileName: file.name, status: 'parsing' };
    setJobs(prev => [...prev, newJob]);

    try {
      let dataSample = '';
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith('.csv')) {
        dataSample = await readFileSample(file, DATA_SAMPLE_LINE_COUNT);
      } else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
        dataSample = await readExcelSample(file, DATA_SAMPLE_LINE_COUNT);
      } else {
        // This case should ideally not be hit due to the FileUpload component's `accept` prop
        throw new Error(`Filtypen stöds inte: ${file.name}. Ladda upp en CSV- eller Excel-fil.`);
      }
      
      // Validate that the sample has content (e.g., header + at least one row)
      if (!dataSample.trim() || dataSample.split('\n').length < 2) {
        throw new Error("Filen verkar vara tom eller har ett ogiltigt format.");
      }

      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'analyzing' } : j));
      const result = await geminiService.analyzeData(dataSample);
      
      const analysisId = crypto.randomUUID();
      const newAnalysis: SavedAnalysis = {
        id: analysisId,
        name: `Analys av ${file.name}`,
        fileName: file.name,
        timestamp: new Date().toISOString(),
        analysisResult: result
      };

      setSavedAnalyses(prev => [newAnalysis, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'success', analysisId: analysisId } : j));
      
      // Update user's analysis count
      onUpdateUser(currentUser => ({...currentUser, analysisCount: currentUser.analysisCount + 1}));

    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Ett okänt fel inträffade.";
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'error', error: errorMessage } : j));
    }
  }, [onUpdateUser]);

  const handleFileSelect = (files: File[]) => {
    const newUploadedFiles: UploadedFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
    }));
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    
    files.forEach(file => processFile(file));
  };

  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    // Note: This does not cancel an in-progress analysis, it only removes from the list.
  };
  
  const handleSelectAnalysis = (id: string) => {
    const analysis = savedAnalyses.find(a => a.id === id);
    if (analysis) {
        setCurrentAnalysis(analysis);
        setIsHistoryOpen(false); // Close panel on selection
    }
  };

  const handleDeleteAnalysis = (id: string) => {
    setSavedAnalyses(prev => prev.filter(a => a.id !== id));
    if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null);
    }
  };

  const handleRenameAnalysis = (id: string, newName: string) => {
    setSavedAnalyses(prev => prev.map(a => a.id === id ? {...a, name: newName} : a));
    if (currentAnalysis?.id === id) {
        setCurrentAnalysis(prev => prev ? {...prev, name: newName} : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <Header 
        user={user} 
        onLogout={onLogout}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isHistoryEnabled={savedAnalyses.length > 0}
        isChatEnabled={!!currentAnalysis}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-slate-100 mb-4">Ladda upp data</h2>
              <FileUpload onFileSelect={handleFileSelect} isProcessing={jobs.some(j => j.status === 'parsing' || j.status === 'analyzing')} />
              <div className="mt-6">
                <FileList files={uploadedFiles} onFileDelete={handleFileDelete} />
              </div>
            </section>
            
            <section>
                <Dashboard analysis={currentAnalysis} />
            </section>
          </div>
        </div>
      </main>

      <AnalysisQueue jobs={jobs} setJobs={setJobs} onSelectAnalysis={handleSelectAnalysis} />
      
      <AnalysisHistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        analyses={savedAnalyses}
        onSelectAnalysis={handleSelectAnalysis}
        onDeleteAnalysis={handleDeleteAnalysis}
        onRenameAnalysis={handleRenameAnalysis}
        currentAnalysisId={currentAnalysis?.id}
      />
      
      <ChatPanel 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        analysis={currentAnalysis}
      />

    </div>
  );
};

export default MainApp;