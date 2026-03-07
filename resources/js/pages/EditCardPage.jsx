import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { getSubjects, updateFlashcard, deleteFlashcard } from '../services/localDb'

export default function EditCardPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const card = location.state?.card || { id, front: '', back: '', tag: '', status: '' }

    const [decks, setDecks] = useState([])
    const [front, setFront] = useState(card.front || '')
    const [back, setBack] = useState(card.back || '')
    const [selectedDeck, setSelectedDeck] = useState(card.subject_id || '')
    const [tags, setTags] = useState(card.tag || '')
    const [saved, setSaved] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        const fetchDecks = async () => {
            const data = await getSubjects()
            setDecks(data)
            if (data.length > 0 && !selectedDeck) {
                setSelectedDeck(data[0].id)
            }
        }
        fetchDecks()
    }, [])

    const handleSave = async () => {
        if (front.trim() && back.trim() && selectedDeck) {
            try {
                await updateFlashcard(card.id, {
                    subject_id: selectedDeck,
                    front: front.trim(),
                    back: back.trim()
                })
                setSaved(true)
                setTimeout(() => {
                    setSaved(false)
                    navigate('/')
                }, 1200)
            } catch (error) {
                console.error("Failed to update card", error)
            }
        }
    }

    const handleDelete = async () => {
        try {
            await deleteFlashcard(card.id)
            navigate('/')
        } catch (error) {
            console.error("Failed to delete card", error)
        }
    }

    return (
        <div className="bg-slate-100 dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-text-main-dark transition-colors">
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
                    Edit Card
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
                {/* Success Toast */}
                {saved && (
                    <div className="mx-4 mt-4 px-4 py-3 bg-card-due/20 border border-card-due/30 rounded-xl text-card-due text-sm font-medium text-center animate-pulse">
                        ✓ Card updated successfully!
                    </div>
                )}

                {/* Deck Selector */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Deck
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="p-4">
                        <select
                            value={selectedDeck}
                            onChange={(e) => setSelectedDeck(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                        >
                            {decks.length === 0 ? (
                                <option value="">Sem Decks</option>
                            ) : (
                                decks.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {/* Front */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Front
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="p-4">
                        <textarea
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            placeholder="Enter the question or prompt..."
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-colors"
                        />
                    </div>
                </div>

                {/* Back */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Back
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="p-4">
                        <textarea
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            placeholder="Enter the answer..."
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-colors"
                        />
                    </div>
                </div>

                {/* Tags */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Tags
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="p-4">
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="biology, chapter-1, exam..."
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Card Info */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    Info
                </div>
                <div className="bg-white dark:bg-surface-dark border-t border-b border-slate-200 dark:border-border-dark transition-colors">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-border-dark">
                        <span className="text-base text-slate-900 dark:text-white">Status</span>
                        <span className="text-base text-slate-400 dark:text-zinc-400">{card.status || 'New'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-base text-slate-900 dark:text-white">Card ID</span>
                        <span className="text-sm text-slate-400 dark:text-zinc-400 font-mono">#{card.id}</span>
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
                                <span className="text-base font-medium">Delete this Card</span>
                            </div>
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    ) : (
                        <div className="p-4 space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <span className="material-icons text-red-400 text-xl mt-0.5">warning</span>
                                <div>
                                    <p className="text-red-300 text-sm font-semibold">Are you sure?</p>
                                    <p className="text-red-400/70 text-xs mt-1">
                                        This will permanently delete this card. This action cannot be undone.
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
                                    Delete Card
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
