import { useTheme } from '../context/ThemeContext'

export default function SettingsPage() {
    const { isDark, toggleTheme } = useTheme()

    return (
        <>
            <header className="flex items-center px-4 py-4 justify-between sticky top-0 bg-slate-100/90 dark:bg-background-dark/90 backdrop-blur-md z-10 border-b border-slate-200 dark:border-zinc-900 transition-colors">
                <div className="flex size-10 shrink-0" />
                <h2 className="text-slate-900 dark:text-zinc-200 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    Settings
                </h2>
                <div className="flex size-10 shrink-0" />
            </header>

            <main className="flex-1 overflow-y-auto pb-6 max-w-md mx-auto w-full">
                {/* Account Section */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Account
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">Email</span>
                        <span className="text-base text-slate-400 dark:text-zinc-500">user@example.com</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-base text-slate-900 dark:text-white">Sync Status</span>
                        <span className="text-base text-emerald-500 font-medium">Up to date</span>
                    </div>
                </div>

                {/* Study Section */}
                <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Study
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800 transition-colors">
                        <span className="text-base text-slate-900 dark:text-white">New cards per day</span>
                        <div className="flex items-center text-slate-400 dark:text-zinc-500">
                            <span className="text-base mr-1">20</span>
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800 transition-colors">
                        <span className="text-base text-slate-900 dark:text-white">Maximum reviews/day</span>
                        <div className="flex items-center text-slate-400 dark:text-zinc-500">
                            <span className="text-base mr-1">200</span>
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800 transition-colors">
                        <span className="text-base text-slate-900 dark:text-white">SRS Algorithm</span>
                        <div className="flex items-center text-slate-400 dark:text-zinc-500">
                            <span className="text-base mr-1">FSRS v4</span>
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Appearance
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <span className="material-icons text-xl text-slate-500 dark:text-zinc-400">
                                {isDark ? 'dark_mode' : 'light_mode'}
                            </span>
                            <span className="text-base text-slate-900 dark:text-white">Dark Mode</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`w-12 h-7 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-slate-300'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${isDark ? 'right-1' : 'left-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Sync Button */}
                <div className="mt-10 px-4 flex flex-col items-center">
                    <button
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
                        type="button"
                    >
                        Force Sync
                    </button>
                    <p className="mt-3 text-sm text-slate-400 dark:text-zinc-500">Last synced: 2 minutes ago</p>
                </div>
            </main>
        </>
    )
}
