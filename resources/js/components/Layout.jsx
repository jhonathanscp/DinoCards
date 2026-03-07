import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
    return (
        <div className="bg-slate-100 dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-text-main-dark transition-colors duration-300">
            <div className="flex-1 overflow-y-auto pb-24">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    )
}
