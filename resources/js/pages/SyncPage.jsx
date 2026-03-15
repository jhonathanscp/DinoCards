import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { syncAll } from '../services/syncService';

export default function SyncPage() {
    const { user, setSyncCompleted } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const performSync = async () => {
        setStatus('loading');
        try {
            if (navigator.onLine) {
                await syncAll();
            }
            setSyncCompleted(true);
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Initial sync failed:", err);
            setStatus('error');
            setErrorMsg(err.response?.data?.message || err.message || 'Erro de conexão ao sincronizar.');
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        performSync();
    }, [user]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background-dark p-6 transition-colors">
            <div className="w-full max-w-sm text-center">
                <div className="mb-8">
                    <span className="material-icons text-primary text-6xl animate-pulse">sync</span>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Sincronizando Dados
                </h1>
                
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    {status === 'loading' 
                        ? 'Estamos baixando seus flashcards e progresso da nuvem. Isso levará apenas um momento...'
                        : 'Ocorreu um erro ao tentar sincronizar seus dados.'}
                </p>

                {status === 'loading' && (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                        <div className="bg-primary h-full animate-progress-indeterminate"></div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {errorMsg}
                        </div>
                        <button
                            onClick={performSync}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-icons text-sm">refresh</span>
                            Tentar Novamente
                        </button>
                        <button
                            onClick={() => {
                                setSyncCompleted(true); // Permitir entrar mesmo com erro (offline-first fallback)
                                navigate('/', { replace: true });
                            }}
                            className="w-full py-3 px-4 bg-transparent text-slate-500 dark:text-slate-400 rounded-xl text-sm hover:underline"
                        >
                            Continuar Offline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
