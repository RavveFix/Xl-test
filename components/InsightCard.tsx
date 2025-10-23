
import React from 'react';
// Fix: Removed .tsx extension for module resolution
import { LightbulbIcon } from './Icons';

interface InsightCardProps {
    insight: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-start gap-4 h-full">
            <div className="flex-shrink-0 mt-1">
                 <LightbulbIcon className="w-5 h-5 text-yellow-400/80" />
            </div>
            <p className="text-sm text-slate-300">{insight}</p>
        </div>
    );
};

export default InsightCard;
