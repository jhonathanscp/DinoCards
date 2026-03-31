import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { syncAll } from '../services/syncService'
import { getSyncMetadata, getSubjects, getFlashcards, createSubject, createFlashcard } from '../services/localDb'

export default function SettingsPage() {
    const { isDark, toggleTheme } = useTheme()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncMessage, setSyncMessage] = useState('')
    const [lastSyncStr, setLastSyncStr] = useState('Never synced')
    const [isImporting, setIsImporting] = useState(false)
    const [ttsLang, setTtsLang] = useState(localStorage.getItem('tts_lang') || 'en-US')

    useEffect(() => {
        const fetchMeta = async () => {
            const time = await getSyncMetadata('last_pulled_at')
            if (time) {
                setLastSyncStr(new Date(time).toLocaleString())
            }
        }
        fetchMeta()
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login', { replace: true })
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleForceSync = async () => {
        setIsSyncing(true)
        setSyncMessage('')
        try {
            await syncAll()
            setSyncMessage('Sincronização concluída com sucesso!')
            const time = await getSyncMetadata('last_pulled_at')
            if (time) {
                setLastSyncStr(new Date(time).toLocaleString())
            }
        } catch (error) {
            setSyncMessage('Falha ao sincronizar. Verifique sua conexão.')
        } finally {
            setIsSyncing(false)
            setTimeout(() => setSyncMessage(''), 4000)
        }
    }

    const handleExportCsv = async () => {
        try {
            const cards = await getFlashcards()
            const decks = await getSubjects()
            const deckMap = {}
            decks.forEach(d => deckMap[d.id] = d.name)
            
            let csv = "Deck,Front,Back,Tags\n"
            cards.forEach(c => {
                const clean = str => (str || '').toString().replace(/"/g, '""');
                csv += `"${clean(deckMap[c.subject_id] || 'Default')}","${clean(c.front)}","${clean(c.back)}","${clean(c.tags)}"\n`
            })
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `flashcards_export_${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            URL.revokeObjectURL(url)
            setSyncMessage('Exportado com sucesso!')
        } catch (error) {
            setSyncMessage('Erro ao exportar.')
        } finally {
            setTimeout(() => setSyncMessage(''), 3000)
        }
    }

    const handleImportCsv = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setIsImporting(true)
        setSyncMessage('Importando...')
        try {
            const text = await file.text()
            const lines = text.split('\n')
            const decks = await getSubjects()
            const deckNameMap = {}
            decks.forEach(d => deckNameMap[d.name] = d.id)

            // Skip header
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue
                
                // Matches values inside quotes or without quotes respecting commas
                const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                if (!matches || matches.length < 3) continue
                
                const clean = str => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"') : ''
                const deckName = clean(matches[0])
                const front = clean(matches[1])
                const back = clean(matches[2])
                const tags = matches[3] ? clean(matches[3]) : ''
                
                let deckId = deckNameMap[deckName]
                if (!deckId) {
                    const newDeck = await createSubject({ name: deckName, parent_id: null })
                    deckId = newDeck.id
                    deckNameMap[deckName] = deckId
                }
                
                await createFlashcard({ subject_id: deckId, front, back, tags })
            }
            setSyncMessage('Cartões importados com sucesso!')
        } catch (error) {
            setSyncMessage('Erro ao importar.')
            console.error(error)
        } finally {
            setIsImporting(false)
            e.target.value = null // reset input
            setTimeout(() => setSyncMessage(''), 3000)
        }
    }

    return (
        <div className="flex flex-col min-h-full max-w-md md:max-w-4xl mx-auto w-full md:px-8">
            {/* Header */}
            <header className="flex items-center p-4 md:pt-8 pb-2 justify-between sticky top-0 bg-slate-100/80 md:bg-transparent dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10 transition-colors">
                <button className="flex size-12 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300 hover:text-primary transition-colors" onClick={() => navigate('/')}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12 text-slate-900 dark:text-zinc-200">
                    Settings
                </h2>
            </header>

            <main className="flex-1 pb-6 w-full">
                {/* Account Section */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Account
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">Email</span>
                        <span className="text-base text-slate-400 dark:text-zinc-500">{user?.email || 'Not logged in'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-base text-slate-900 dark:text-white">Sync Status</span>
                        {syncMessage ? (
                            <span className="text-sm text-card-learning font-medium animate-pulse">{syncMessage}</span>
                        ) : (
                            <span className="text-base text-emerald-500 font-medium">{isSyncing ? 'Sincronizando...' : 'Online'}</span>
                        )}
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
                    <div className="flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800 transition-colors">
                        <span className="text-base text-slate-900 dark:text-white">Idioma do Áudio (TTS)</span>
                        <div className="flex items-center text-slate-400 dark:text-zinc-500">
                            <select 
                                value={ttsLang} 
                                onChange={(e) => {
                                    setTtsLang(e.target.value)
                                    localStorage.setItem('tts_lang', e.target.value)
                                }} 
                                className="bg-transparent text-base focus:outline-none appearance-none text-right pr-2 font-medium"
                            >
                                <option value="en-US">Inglês (US)</option>
                                <option value="pt-BR">Português (BR)</option>
                                <option value="es-ES">Espanhol (ES)</option>
                                <option value="fr-FR">Francês (FR)</option>
                                <option value="de-DE">Alemão (DE)</option>
                                <option value="ja-JP">Japonês (JP)</option>
                            </select>
                            <span className="material-symbols-outlined text-xl">edit</span>
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

                {/* Data Section */}
                <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Data Management
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800 transition-colors" onClick={handleExportCsv}>
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-xl text-slate-500 dark:text-zinc-400">download</span>
                            <span className="text-base">Exportar CSV</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 cursor-pointer active:bg-slate-50 dark:active:bg-zinc-800 transition-colors relative">
                        <input type="file" accept=".csv" onChange={handleImportCsv} disabled={isImporting} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" title="Importar CSV" />
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined text-xl text-slate-500 dark:text-zinc-400">upload</span>
                            <span className="text-base">{isImporting ? 'Importando...' : 'Importar CSV'}</span>
                        </div>
                    </div>
                </div>

                {/* Sync & Logout Buttons */}
                <div className="mt-10 px-4 flex flex-col items-center gap-4">
                    <div className="w-full text-center">
                        <button
                            onClick={handleForceSync}
                            disabled={isSyncing}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-75"
                            type="button"
                        >
                            {isSyncing ? (
                                <><span className="material-icons animate-spin mr-2">sync</span> Sincronizando...</>
                            ) : (
                                'Force Sync'
                            )}
                        </button>
                        <p className="mt-3 text-sm text-slate-400 dark:text-zinc-500">Última sincronização: {lastSyncStr}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-red-200 dark:border-red-900/50 rounded-xl shadow-sm text-base font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all active:scale-[0.98] mt-4"
                        type="button"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Log Out
                    </button>
                </div>
            </main>
        </div>
    )
}
