import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { updateSubject, deleteSubject } from '../services/localDb'

export default function DeckConfigPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const deck = location.state?.deck || { id, name: 'Deck' }

    const [deckName, setDeckName] = useState(deck.name || '')
    const [newCardsPerDay, setNewCardsPerDay] = useState(20)
    const [maxReviews, setMaxReviews] = useState(200)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleSave = async () => {
        try {
            await updateSubject(deck.id, { name: deckName })
            navigate('/')
        } catch (error) {
            console.error("Failed to update deck settings", error)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteSubject(deck.id)
            navigate('/')
        } catch (error) {
            console.error("Failed to delete deck", error)
        }
    }

    return (
        <div className="bg-slate-100 dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-text-main-dark transition-colors">
            {/* Header */}
            <header className="flex items-center px-4 py-4 justify-between sticky top-0 bg-slate-100/90 dark:bg-background-dark/90 backdrop-blur-md z-10 border-b border-slate-200 dark:border-zinc-900 transition-colors">
                <div className="flex size-10 shrink-0 items-center justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-icons text-2xl">arrow_back</span>
                    </button>
                </div>
                <h2 className="text-slate-900 dark:text-zinc-200 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    Deck Settings
                </h2>
                <div className="flex size-10 shrink-0 items-center justify-center">
                    <button
                        onClick={handleSave}
                        className="text-primary font-semibold text-sm hover:text-blue-300 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-12 max-w-md mx-auto w-full">
                {/* Deck Info */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    General
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="p-4">
                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                            Deck Name
                        </label>
                        <input
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Study Settings */}
                <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Study Options
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">New cards per day</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setNewCardsPerDay(Math.max(0, newCardsPerDay - 5))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                            >
                                <span className="material-icons text-sm">remove</span>
                            </button>
                            <span className="text-base text-slate-900 dark:text-white font-medium w-8 text-center">{newCardsPerDay}</span>
                            <button
                                onClick={() => setNewCardsPerDay(newCardsPerDay + 5)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                            >
                                <span className="material-icons text-sm">add</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">Maximum reviews/day</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMaxReviews(Math.max(0, maxReviews - 10))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                            >
                                <span className="material-icons text-sm">remove</span>
                            </button>
                            <span className="text-base text-slate-900 dark:text-white font-medium w-10 text-center">{maxReviews}</span>
                            <button
                                onClick={() => setMaxReviews(maxReviews + 10)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                            >
                                <span className="material-icons text-sm">add</span>
                            </button>
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

                {/* Statistics */}
                <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Statistics
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">Total Cards</span>
                        <span className="text-base text-slate-400 dark:text-zinc-400">{(deck.newCount || 0) + (deck.lrnCount || 0) + (deck.dueCount || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">New</span>
                        <span className="text-base text-card-new">{deck.newCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">Learning</span>
                        <span className="text-base text-card-learning">{deck.lrnCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-base text-slate-900 dark:text-white">Due</span>
                        <span className="text-base text-card-due">{deck.dueCount || 0}</span>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 px-4 py-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
                    Danger Zone
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-between p-4 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-xl">delete_forever</span>
                                <span className="text-base font-medium">Delete this Deck</span>
                            </div>
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    ) : (
                        <div className="p-4 space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <span className="material-icons text-red-400 text-xl mt-0.5">warning</span>
                                <div>
                                    <p className="text-red-500 dark:text-red-300 text-sm font-semibold">Are you sure?</p>
                                    <p className="text-red-400/70 text-xs mt-1">
                                        This will permanently delete <strong>"{deckName}"</strong> and all its cards. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 border border-slate-300 dark:border-border-dark transition-colors active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                                >
                                    Delete Deck
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
