import { NavLink } from 'react-router-dom'

const navItems = [
    { to: '/', icon: 'view_agenda', label: 'Decks' },
    { to: '/add', icon: 'add_circle', label: 'Add' },
    { to: '/browse', icon: 'search', label: 'Browse' },
    { to: '/stats', icon: 'bar_chart', label: 'Stats' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
]

export default function SideNav() {
    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark flex-shrink-0 transition-colors z-20 sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8 text-primary">
                    <span className="material-icons text-3xl">style</span>
                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">DinoCards</span>
                </div>
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-slate-500 dark:text-text-muted-dark hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 font-medium'
                                }`
                            }
                        >
                            <span className="material-icons text-2xl">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
            
            <div className="mt-auto p-4 text-xs text-slate-400 dark:text-zinc-500 text-center border-t border-slate-200 dark:border-border-dark">
                DinoCards v1.0
            </div>
        </aside>
    )
}
