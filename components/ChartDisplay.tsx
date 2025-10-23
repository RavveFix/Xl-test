
import React, { useEffect, useRef } from 'react';
// Fix: Removed .ts extension for module resolution
import type { ChartData } from '../types';

declare var Chart: any; // from CDN

interface ChartDisplayProps {
    chartData: ChartData;
}

const generateColors = (numColors: number) => {
    const colors = [
        'rgba(79, 70, 229, 0.7)',  // Indigo
        'rgba(219, 39, 119, 0.7)', // Pink
        'rgba(16, 185, 129, 0.7)', // Emerald
        'rgba(245, 158, 11, 0.7)',  // Amber
        'rgba(14, 165, 233, 0.7)', // Sky
        'rgba(139, 92, 246, 0.7)', // Violet
    ];
    const borderColors = colors.map(c => c.replace('0.7', '1'));
    return {
      backgroundColors: Array.from({ length: numColors }, (_, i) => colors[i % colors.length]),
      borderColors: Array.from({ length: numColors }, (_, i) => borderColors[i % borderColors.length]),
    }
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chartData }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                const datasetsWithColors = chartData.data.datasets.map((dataset, index) => {
                    const numDataPoints = dataset.data.length;
                    const { backgroundColors, borderColors } = generateColors(numDataPoints);
                    return {
                        ...dataset,
                        backgroundColor: chartData.type === 'pie' || chartData.type === 'doughnut' ? backgroundColors : generateColors(chartData.data.datasets.length).backgroundColors[index],
                        borderColor: chartData.type === 'pie' || chartData.type === 'doughnut' ? borderColors : generateColors(chartData.data.datasets.length).borderColors[index],
                        borderWidth: 1,
                    };
                });


                chartInstance.current = new Chart(ctx, {
                    type: chartData.type,
                    data: {
                        labels: chartData.data.labels,
                        datasets: datasetsWithColors,
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#94a3b8' // slate-400
                                }
                            },
                            tooltip: {
                                bodyColor: '#e2e8f0', // slate-200
                                titleColor: '#94a3b8' // slate-400
                            }
                        },
                        scales: chartData.type !== 'pie' && chartData.type !== 'doughnut' ? {
                            y: {
                                beginAtZero: true,
                                ticks: { color: '#94a3b8' },
                                grid: { color: 'rgba(71, 85, 105, 0.5)' }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { display: false }
                            }
                        } : {}
                    }
                });
            }
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-80">
            <h4 className="text-md font-semibold text-slate-300 mb-2 text-center">{chartData.title}</h4>
            <div className="relative h-[calc(100%-2rem)]">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default ChartDisplay;
