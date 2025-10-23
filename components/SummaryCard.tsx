import React from 'react';

interface SummaryCardProps {
    summary: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-full">
            <h3 className="text-xl font-semibold text-slate-200 mb-3">Sammanfattning</h3>
            <p className="text-slate-400 leading-relaxed">{summary}</p>
        </div>
    );
};

export default SummaryCard;
