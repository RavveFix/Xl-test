
import React from 'react';
// Fix: Imported SavedAnalysis type
import type { SavedAnalysis } from '../types';
import SummaryCard from './SummaryCard';
import InsightCard from './InsightCard';
import DataTable from './DataTable';
import ChartDisplay from './ChartDisplay';
import { CubeIcon } from './icons/CubeIcon';

// Fix: Changed props to accept a single analysis object, simplifying the component's API.
interface DashboardProps {
    // Fix: Allow analysis to be null when none is selected.
    analysis: SavedAnalysis | null;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis }) => {
    // Fix: Removed isLoading and error logic, as it's now handled by the job queue.
    // The Dashboard now only displays a selected analysis.

    if (!analysis || !analysis.analysisResult) {
         return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-8">
                <CubeIcon className="w-12 h-12 text-slate-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-300">Ingen analys vald</h2>
                <p className="text-slate-500 mt-2 text-center">
                    Välj en analys från historiken för att se resultaten.
                </p>
            </div>
        );
    }
    
    const { analysisResult } = analysis;
    
    // Fix: Transformed table data from array of arrays to array of objects for DataTable component.
    const tableDataForComponent = (analysisResult.table.data || []).map(row => {
        const rowObject: Record<string, string | number> = {};
        (analysisResult.table.headers || []).forEach((header, i) => {
            rowObject[header] = row[i];
        });
        return rowObject;
    });


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">Analys: {analysis.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                    <SummaryCard summary={analysisResult.summary} />
                </div>
            </div>
            
            {/* Fix: Changed insights to keyInsights to match data type */}
            {analysisResult.keyInsights && analysisResult.keyInsights.length > 0 && (
                 <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-4">Nyckelinsikter</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.keyInsights.map((insight, index) => (
                            <InsightCard key={index} insight={insight} />
                    ))}
                    </div>
                </div>
            )}

            {analysisResult.table && analysisResult.table.headers && analysisResult.table.headers.length > 0 && (
                <DataTable headers={analysisResult.table.headers} data={tableDataForComponent} />
            )}

            {analysisResult.charts && analysisResult.charts.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-4">Visualiseringar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysisResult.charts.map((chart, index) => (
                            <ChartDisplay key={index} chartData={chart} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
