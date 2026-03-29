import { useState, useEffect } from 'react'
import { getFlashcards, getReviewLogs } from '../services/localDb'

export default function StatsPage() {
    const [stats, setStats] = useState({
        total: 0,
        newCards: 0,
        learning: 0,
        review: 0,
        cardsStudiedToday: 0,
        dailyStreak: 0
    })
    const [heatmapData, setHeatmapData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [cards, logs] = await Promise.all([
                    getFlashcards(),
                    getReviewLogs()
                ])

                // Collection Breakdown
                let newCards = 0
                let learning = 0
                let review = 0

                cards.forEach(card => {
                    if (card.repetitions === 0) {
                        newCards++
                    } else if (card.interval < 1) {
                        learning++
                    } else {
                        review++
                    }
                })

                // Generate Heatmap (Last 10 weeks)
                const WEEKS = 10;
                const DAYS_IN_WEEK = 7;
                const msPerDay = 24 * 60 * 60 * 1000;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Initialize empty heatmap array
                const newHeatmapData = Array(WEEKS).fill(null).map(() => Array(DAYS_IN_WEEK).fill(0));

                // Group logs by date
                const logsByDate = {};
                let cardsStudiedToday = 0;

                logs.forEach(log => {
                    const logDate = new Date(log.reviewed_at);
                    logDate.setHours(0, 0, 0, 0);
                    const dateStr = logDate.toISOString().split('T')[0];

                    if (!logsByDate[dateStr]) {
                        logsByDate[dateStr] = 0;
                    }
                    logsByDate[dateStr]++;

                    if (logDate.getTime() === today.getTime()) {
                        cardsStudiedToday++;
                    }
                });

                // Calculate Streak
                let streak = 0;
                let currentCheckDate = new Date(today);

                while (true) {
                    const dateStr = currentCheckDate.toISOString().split('T')[0];
                    if (logsByDate[dateStr] && logsByDate[dateStr] > 0) {
                        streak++;
                        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
                    } else if (streak === 0 && currentCheckDate.getTime() === today.getTime()) {
                        // It's today and we haven't studied yet, check yesterday before breaking
                        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
                    } else {
                        break;
                    }
                }

                // Fill Heatmap Data
                let maxReviewsInDay = 1;
                Object.values(logsByDate).forEach(val => {
                    if (val > maxReviewsInDay) maxReviewsInDay = val;
                });

                // Get the day of the week for today (0 = Sunday, 6 = Saturday)
                // Shift to make Monday = 0
                let currentDayOfWeek = (today.getDay() + 6) % 7;

                let dayOffset = 0;
                for (let week = WEEKS - 1; week >= 0; week--) {
                    for (let day = DAYS_IN_WEEK - 1; day >= 0; day--) {
                        // Skip future days in the current week
                        if (week === WEEKS - 1 && day > currentDayOfWeek) {
                            newHeatmapData[week][day] = { level: -1, date: '', count: 0 }; // -1 means empty space (future)
                            continue;
                        }

                        const cellDate = new Date(today.getTime() - (dayOffset * msPerDay));
                        const dateStr = cellDate.toISOString().split('T')[0];

                        const reviews = logsByDate[dateStr] || 0;

                        let level = 0;
                        if (reviews > 0) {
                            const ratio = reviews / maxReviewsInDay;
                            if (ratio <= 0.25) level = 1;
                            else if (ratio <= 0.5) level = 2;
                            else if (ratio <= 0.75) level = 3;
                            else level = 4;
                        }

                        newHeatmapData[week][day] = { level, date: dateStr, count: reviews };
                        dayOffset++;
                    }
                }

                setHeatmapData(newHeatmapData);
                setStats({
                    total: cards.length,
                    newCards,
                    learning,
                    review,
                    cardsStudiedToday,
                    dailyStreak: streak
                })
            } catch (error) {
                console.error("Failed to load stats", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [])

    const heatmapColors = {
        [-1]: 'bg-transparent', // Future days
        0: 'bg-slate-200 dark:bg-zinc-800', // No activity
        1: 'bg-primary/20', // Level 1
        2: 'bg-primary/40', // Level 2
        3: 'bg-primary/80', // Level 3
        4: 'bg-primary',    // Level 4 max
    }

    return (
        <div className="flex flex-col max-w-md mx-auto w-full pb-24">
            {/* Header */}
            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-slate-100/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10 transition-colors">
                <button className="flex size-12 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300 hover:text-primary transition-colors" onClick={() => window.history.back()}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12 text-slate-900 dark:text-zinc-200">
                    Statistics
                </h2>
            </header>

            {isLoading ? (
                <div className="flex items-center justify-center h-48 text-slate-400">
                    Calculating metrics...
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <section className="flex flex-wrap gap-3 px-4 py-4">
                        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-1 rounded-xl border border-primary/20 bg-primary/5 p-4 items-center text-center shadow-sm">
                            <p className="tracking-tight text-3xl font-bold leading-tight text-primary">{stats.dailyStreak}</p>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-orange-500">local_fire_department</span>
                                <p className="text-slate-600 dark:text-zinc-400 text-sm font-medium">Daily Streak</p>
                            </div>
                        </div>
                        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-1 rounded-xl border border-primary/20 bg-primary/5 p-4 items-center text-center shadow-sm">
                            <p className="tracking-tight text-3xl font-bold leading-tight text-primary">{stats.cardsStudiedToday}</p>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-blue-500">style</span>
                                <p className="text-slate-600 dark:text-zinc-400 text-sm font-medium">Cards Today</p>
                            </div>
                        </div>
                    </section>

                    {/* Collection Breakdown */}
                    <section className="px-4 py-2">
                        <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm transition-colors flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-slate-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">
                                    Collection Breakdown
                                </p>
                                <span className="text-slate-400 dark:text-zinc-500 text-sm">{stats.total} total</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-slate-700 dark:text-zinc-300 font-medium">New</span>
                                </div>
                                <span className="text-slate-900 dark:text-white font-bold">{stats.newCards}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span className="text-slate-700 dark:text-zinc-300 font-medium">Learning</span>
                                </div>
                                <span className="text-slate-900 dark:text-white font-bold">{stats.learning}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-slate-700 dark:text-zinc-300 font-medium">To Review</span>
                                </div>
                                <span className="text-slate-900 dark:text-white font-bold">{stats.review}</span>
                            </div>

                            {/* Progress bar visual */}
                            {stats.total > 0 && (
                                <div className="w-full h-2 rounded-full flex overflow-hidden mt-2 bg-slate-100 dark:bg-zinc-800">
                                    <div style={{ width: `${(stats.newCards / stats.total) * 100}%` }} className="bg-blue-500 h-full" />
                                    <div style={{ width: `${(stats.learning / stats.total) * 100}%` }} className="bg-orange-500 h-full" />
                                    <div style={{ width: `${(stats.review / stats.total) * 100}%` }} className="bg-emerald-500 h-full" />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Activity Heatmap */}
                    <section className="px-4 py-4">
                        <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5 shadow-sm transition-colors">
                            <p className="text-slate-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider mb-4">
                                Study Activity (Last 10 Weeks)
                            </p>

                            <div className="flex overflow-hidden">
                                <div className="flex items-start">
                                    {/* Labels for all 7 days */}
                                    <div className="flex flex-col text-[11px] font-medium text-slate-400 dark:text-zinc-500 pr-1 gap-[4px] pt-[2px]">
                                        <span className="h-[16px] leading-[16px]">Sun</span>
                                        <span className="h-[16px] leading-[16px]">Mon</span>
                                        <span className="h-[16px] leading-[16px]">Tue</span>
                                        <span className="h-[16px] leading-[16px]">Wed</span>
                                        <span className="h-[16px] leading-[16px]">Thu</span>
                                        <span className="h-[16px] leading-[16px]">Fri</span>
                                        <span className="h-[16px] leading-[16px]">Sat</span>
                                    </div>

                                    {/* The Heatmap Grid */}
                                    <div className="flex gap-[4px] overflow-x-auto pb-2 no-scrollbar flex-1 justify-end">
                                        {heatmapData.map((week, weekIdx) => (
                                            <div key={weekIdx} className="flex flex-col gap-[4px]">
                                                {week.map((dataObj, dayIdx) => (
                                                    <div
                                                        key={dayIdx}
                                                        title={dataObj.level === -1 ? undefined : `${dataObj.count} cards em ${dataObj.date}`}
                                                        className={`w-[16px] h-[16px] rounded-[4px] ${heatmapColors[dataObj.level]}`}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                                <span className="mr-1">Less</span>
                                <div className="w-[16px] h-[16px] rounded-[4px] bg-slate-200 dark:bg-zinc-800" />
                                <div className="w-[16px] h-[16px] rounded-[4px] bg-primary/40" />
                                <div className="w-[16px] h-[16px] rounded-[4px] bg-primary/80" />
                                <div className="w-[16px] h-[16px] rounded-[4px] bg-primary" />
                                <span className="ml-1">More</span>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    )
}
