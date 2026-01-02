import React, { useMemo } from 'react';
import workoutsData from './workouts.json';
import { Dumbbell, Check, Calendar } from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';

function App() {
    // Process Data
    const { dates, programs, grid, months } = useMemo(() => {
        const uniqueDates = [...new Set(workoutsData.map(w => w.date))].sort();
        const uniquePrograms = [...new Set(workoutsData.map(w => w.program))].sort();

        const gridMap = {};
        workoutsData.forEach(workout => {
            if (!gridMap[workout.program]) {
                gridMap[workout.program] = {};
            }
            gridMap[workout.program][workout.date] = workout;
        });

        // Extract unique months for navigation
        const uniqueMonths = [...new Set(uniqueDates.map(date => {
            return format(parseISO(date), 'yyyy-MM');
        }))].sort();

        return { dates: uniqueDates, programs: uniquePrograms, grid: gridMap, months: uniqueMonths };
    }, []);

    const scrollToMonth = (monthStr) => {
        // Find the first date of this month in our dates array
        const targetDate = dates.find(d => d.startsWith(monthStr));
        if (targetDate) {
            const element = document.getElementById(`date-${targetDate}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-white p-8 font-sans flex flex-col h-screen">
            <header className="mb-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-xl text-primary">
                        <Dumbbell size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">WodUp History</h1>
                        <p className="text-secondary">Workouts from July 1st</p>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex gap-2 overflow-x-auto max-w-2xl pb-2 custom-scrollbar">
                    {months.map(month => (
                        <button
                            key={month}
                            onClick={() => scrollToMonth(month)}
                            className="px-4 py-2 rounded-lg bg-surface hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all text-sm font-medium whitespace-nowrap flex items-center gap-2"
                        >
                            <Calendar size={14} className="text-secondary" />
                            {format(parseISO(`${month}-01`), 'MMMM yyyy')}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative border border-white/10 rounded-xl bg-surface/10">
                <div className="absolute inset-0 overflow-auto custom-scrollbar">
                    <div className="min-w-max">
                        {/* Grid Header (Dates) */}
                        <div className="flex sticky top-0 z-30">
                            <div className="w-48 flex-shrink-0 p-4 font-bold text-secondary sticky left-0 bg-background z-40 border-b border-r border-white/10 shadow-[4px_4px_24px_rgba(0,0,0,0.5)]">
                                Program
                            </div>
                            {dates.map(date => (
                                <div
                                    key={date}
                                    id={`date-${date}`}
                                    className="w-80 flex-shrink-0 p-4 font-medium text-center border-b border-white/10 text-gray-400 bg-background/95 backdrop-blur"
                                >
                                    {format(parseISO(date), 'EEE, MMM d')}
                                </div>
                            ))}
                        </div>

                        {/* Grid Rows */}
                        {programs.map(program => (
                            <div key={program} className="flex hover:bg-white/5 transition-colors group">
                                {/* Row Header (Program Name) */}
                                <div className="w-48 flex-shrink-0 p-4 font-bold text-white sticky left-0 bg-background group-hover:bg-surface transition-colors z-20 border-r border-white/5 flex items-center shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
                                    {program}
                                </div>

                                {/* Cells */}
                                {dates.map(date => {
                                    const workout = grid[program]?.[date];
                                    const isValid = workout?.details.includes('Show less');

                                    return (
                                        <div key={`${program}-${date}`} className="w-80 flex-shrink-0 p-2 border-r border-b border-white/5 flex flex-col">
                                            {workout ? (
                                                <div className="w-full h-96 bg-surface/30 rounded-lg p-4 text-left overflow-y-auto border border-white/5 hover:border-primary/30 transition-colors custom-scrollbar relative">
                                                    <div className="flex justify-between items-start sticky top-0 bg-surface/95 backdrop-blur py-1 z-10 mb-2">
                                                        <div className="text-xs font-bold text-primary">
                                                            {workout.program}
                                                        </div>
                                                        {isValid && (
                                                            <div className="bg-green-500/20 p-1 rounded-full text-green-400" title="Expanded">
                                                                <Check size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
                                                        {workout.details}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-96 flex items-center justify-center text-white/5">
                                                    -
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
