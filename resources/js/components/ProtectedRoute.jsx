import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { user, isLoading, syncCompleted } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-background-dark text-slate-900 dark:text-white transition-colors">
                <span className="material-icons animate-spin text-primary text-4xl">sync</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se o usuário está logado mas ainda não sincronizou e não está na página de sync
    if (!syncCompleted && location.pathname !== '/sync') {
        return <Navigate to="/sync" replace />;
    }

    return <Outlet />;
}
