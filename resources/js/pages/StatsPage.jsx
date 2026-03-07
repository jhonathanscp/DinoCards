export default function StatsPage() {
    // Heatmap data (1 = lowest, 4 = highest, 0 = none)
    const heatmapData = [
        [1, 2, 4, 4, 3, 0, 1],
        [0, 2, 1, 0, 4, 4, 2],
        [3, 4, 4, 2, 0, 1, 0],
        [0, 0, 1, 3, 4, 4, 2],
        [2, 3, 0, 0, 1, 2, 4],
        [4, 4, 3, 2, 0, 0, 1],
        [0, 1, 2, 4, 4, 3, 0],
        [1, 0, 2, 3, 4, 4, 2],
        [3, 4, 4, 0, 1, 2, 0],
        [0, 1, 2, 3, 4, 4, 2],
    ]

    const heatmapColors = {
        0: 'bg-slate-200 dark:bg-zinc-800',
        1: 'bg-primary/20',
        2: 'bg-primary/40',
        3: 'bg-primary/80',
        4: 'bg-primary',
    }

    return (
        <div className="flex flex-col max-w-md mx-auto w-full">
            {/* Header */}
            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-slate-100/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10 transition-colors">
                <button className="flex size-12 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
                    Learning Statistics
                </h2>
            </header>

            {/* Summary Stats */}
            <section className="flex flex-wrap gap-3 px-4 py-4">
                <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 items-center text-center shadow-sm">
                    <p className="tracking-tight text-3xl font-bold leading-tight text-primary">12</p>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-orange-500">local_fire_department</span>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Daily Streak</p>
                    </div>
                </div>
                <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 items-center text-center shadow-sm">
                    <p className="tracking-tight text-3xl font-bold leading-tight text-primary">45</p>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-blue-500">style</span>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Cards Studied</p>
                    </div>
                </div>
            </section>

            {/* Predicted Reviews Chart */}
            <section className="px-4 py-4">
                <div className="rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-zinc-900/50 p-5 shadow-sm transition-colors">
                    <div className="flex flex-col gap-1 mb-6">
                        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider">
                            Predicted Reviews
                        </p>
                        <div className="flex items-baseline gap-3">
                            <p className="text-[32px] font-bold leading-tight">150</p>
                            <p className="text-primary text-sm font-semibold bg-primary/10 px-2 py-1 rounded-md">
                                +10% <span className="text-slate-400 dark:text-zinc-400 font-normal">vs last week</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex min-h-[160px] flex-col gap-4 relative">
                        <svg
                            className="w-full h-[140px] drop-shadow-md"
                            fill="none"
                            preserveAspectRatio="none"
                            viewBox="0 0 400 140"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Grid Lines */}
                            <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.1" x1="0" x2="400" y1="20" y2="20" />
                            <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.1" x1="0" x2="400" y1="60" y2="60" />
                            <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.1" x1="0" x2="400" y1="100" y2="100" />
                            {/* Area Fill */}
                            <path
                                d="M0 90 C 40 90, 60 40, 100 40 C 140 40, 160 80, 200 80 C 240 80, 260 30, 300 30 C 340 30, 360 110, 400 110 L 400 140 L 0 140 Z"
                                fill="url(#chart-gradient)"
                            />
                            {/* Line */}
                            <path
                                d="M0 90 C 40 90, 60 40, 100 40 C 140 40, 160 80, 200 80 C 240 80, 260 30, 300 30 C 340 30, 360 110, 400 110"
                                stroke="#60a5fa"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                            />
                            {/* Data Points */}
                            <circle cx="100" cy="40" fill="currentColor" className="text-white dark:text-[#09090b]" r="4" stroke="#60a5fa" strokeWidth="2" />
                            <circle cx="200" cy="80" fill="currentColor" className="text-white dark:text-[#09090b]" r="4" stroke="#60a5fa" strokeWidth="2" />
                            <circle cx="300" cy="30" fill="currentColor" className="text-white dark:text-[#09090b]" r="4" stroke="#60a5fa" strokeWidth="2" />
                            <defs>
                                <linearGradient gradientUnits="userSpaceOnUse" id="chart-gradient" x1="0" x2="0" y1="0" y2="140">
                                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* X-Axis Labels */}
                        <div className="flex justify-between text-slate-400 dark:text-zinc-400 text-xs font-medium px-2 mt-2">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Activity Heatmap */}
            <section className="px-4 py-4">
                <div className="rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-zinc-900/50 p-5 shadow-sm transition-colors">
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">
                        Study Activity
                    </p>
                    <div className="flex justify-between items-end gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {heatmapData.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1.5">
                                {week.map((level, dayIdx) => (
                                    <div
                                        key={dayIdx}
                                        className={`w-3.5 h-3.5 rounded-sm ${heatmapColors[level]}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-400 dark:text-zinc-400">
                        <span>Less</span>
                        <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-zinc-800" />
                        <div className="w-3 h-3 rounded-sm bg-primary/40" />
                        <div className="w-3 h-3 rounded-sm bg-primary/80" />
                        <div className="w-3 h-3 rounded-sm bg-primary" />
                        <span>More</span>
                    </div>
                </div>
            </section>
        </div>
    )
}
