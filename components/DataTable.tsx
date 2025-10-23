
import React from 'react';

interface DataTableProps {
    headers: string[];
    data: Record<string, string | number>[];
}

const DataTable: React.FC<DataTableProps> = ({ headers, data }) => {
    // Show only the first 10 rows to avoid overwhelming the UI
    const dataSample = data.slice(0, 10);

    if (!headers || headers.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-slate-200 mb-4">Dataöversikt</h3>
            <p className="text-sm text-slate-500 mb-4">Visar de första {dataSample.length} raderna av {data.length} totalt.</p>
            <div className="overflow-x-auto max-h-96 rounded-lg">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-300 uppercase bg-slate-700/50 sticky top-0 backdrop-blur-sm">
                        <tr>
                            {headers.map((header) => (
                                <th key={header} scope="col" className="px-6 py-3">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {dataSample.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-700/30">
                                {headers.map((header) => (
                                    <td key={`${rowIndex}-${header}`} className="px-6 py-4 text-slate-200 whitespace-nowrap" title={String(row[header] ?? '')}>
                                       <div className="max-w-xs truncate">
                                         {/* Fix: Handle potentially undefined row[header] */}
                                         {String(row[header] ?? '')}
                                       </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
