import React from 'react';
import type { Job } from '../types';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, CloseIcon } from './Icons';

interface AnalysisQueueProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  onSelectAnalysis: (analysisId: string) => void;
}

const JobStatusIcon: React.FC<{ status: Job['status'] }> = ({ status }) => {
  switch (status) {
    case 'parsing':
    case 'analyzing':
      return <SpinnerIcon className="w-5 h-5 text-indigo-400" />;
    case 'success':
      return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    case 'error':
      return <XCircleIcon className="w-5 h-5 text-red-400" />;
    default:
      return null;
  }
};

const statusText: Record<Job['status'], string> = {
    parsing: 'Tolkar fil...',
    analyzing: 'Analyserar...',
    success: 'Klar! Klicka för att öppna.',
    error: 'Fel uppstod'
};

const JobItem: React.FC<{ job: Job; onSelectAnalysis: (analysisId: string) => void; }> = ({ job, onSelectAnalysis }) => {
    const isClickable = job.status === 'success' && job.analysisId;
    const itemProps = {
        ...(isClickable && { onClick: () => onSelectAnalysis(job.analysisId!), role: 'button' }),
        className: `flex items-center gap-3 p-3 ${isClickable ? 'cursor-pointer hover:bg-slate-600/50' : ''}`
    };

    return (
        <div {...itemProps} title={job.error}>
            <div className="flex-shrink-0">
                <JobStatusIcon status={job.status} />
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-medium text-slate-200 truncate">{job.fileName}</p>
                <p className="text-xs text-slate-400 truncate" title={job.error ? job.error : statusText[job.status]}>{job.error ? job.error : statusText[job.status]}</p>
            </div>
        </div>
    );
};

const AnalysisQueue: React.FC<AnalysisQueueProps> = ({ jobs, setJobs, onSelectAnalysis }) => {
    if (jobs.length === 0) {
        return null;
    }

    const handleClearCompleted = () => {
        setJobs(prevJobs => prevJobs.filter(job => job.status === 'parsing' || job.status === 'analyzing'));
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            <header className="flex items-center justify-between p-3 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-200">Analyseringskö</h3>
                <button onClick={handleClearCompleted} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white" title="Rensa slutförda">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </header>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-700">
                {jobs.map(job => (
                    <JobItem key={job.id} job={job} onSelectAnalysis={onSelectAnalysis} />
                ))}
            </div>
        </div>
    );
};

export default AnalysisQueue;