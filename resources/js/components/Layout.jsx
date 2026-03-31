import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'

export default function Layout() {
    return (
        <div className="bg-slate-50 dark:bg-background-dark min-h-screen flex flex-col md:flex-row font-display text-slate-900 dark:text-text-main-dark transition-colors duration-300">
            <SideNav />
            <div className="flex-1 overflow-y-auto pb-24 md:pb-0 h-screen w-full relative">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    )
}
