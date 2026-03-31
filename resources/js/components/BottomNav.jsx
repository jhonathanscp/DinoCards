import { NavLink } from 'react-router-dom'

const navItems = [
    { to: '/', icon: 'view_agenda', label: 'Decks' },
    { to: '/add', icon: 'add_circle', label: 'Add' },
    { to: '/browse', icon: 'search', label: 'Browse' },
    { to: '/stats', icon: 'bar_chart', label: 'Stats' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
]

export default function BottomNav() {
    return (
        <nav className="md:hidden bg-white dark:bg-background-dark border-t border-slate-200 dark:border-border-dark fixed bottom-0 w-full z-20 pb-6 pt-3 px-2 transition-colors">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center w-14 transition-colors ${isActive
                                ? 'text-primary'
                                : 'text-slate-400 dark:text-text-muted-dark hover:text-primary'
                            }`
                        }
                    >
                        <span className="material-icons text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-medium mt-1">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
