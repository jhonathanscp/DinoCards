import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubjects, createFlashcard } from '../services/localDb'

export default function AddCardPage() {
    const navigate = useNavigate()
    const [decks, setDecks] = useState([])
    const [front, setFront] = useState('')
    const [back, setBack] = useState('')
    const [selectedDeck, setSelectedDeck] = useState('')
    const [tags, setTags] = useState('')
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        const fetchDecks = async () => {
            const data = await getSubjects()
            setDecks(data)
            if (data.length > 0) {
                setSelectedDeck(data[0].id)
            }
        }
        fetchDecks()
    }, [])

    const handleSave = async () => {
        if (front.trim() && back.trim() && selectedDeck) {
            try {
                await createFlashcard({
                    subject_id: selectedDeck,
                    front: front.trim(),
                    back: back.trim(),
                    tags: tags.trim()
                })
                setSaved(true)
                setTimeout(() => {
                    setSaved(false)
                    setFront('')
                    setBack('')
                    setTags('')
                }, 2000)
            } catch (error) {
                console.error("Error creating card:", error)
            }
        }
    }

    return (
        <>
            {/* Header */}
            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-slate-100/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10 transition-colors">
                <button className="flex size-12 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300 hover:text-primary transition-colors" onClick={() => window.history.back()}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12 text-slate-900 dark:text-zinc-200">
                    Add Card
                </h2>
            </header>

            <main className="flex-1 overflow-y-auto pb-6 max-w-md mx-auto w-full">
                {/* Success Toast */}
                {saved && (
                    <div className="mx-4 mt-4 px-4 py-3 bg-card-due/20 border border-card-due/30 rounded-xl text-card-due text-sm font-medium text-center animate-pulse">
                        ✓ Card saved successfully!
                    </div>
                )}

                {/* Deck Selector */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-text-muted-dark uppercase tracking-wider">
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
                                <option value="">Sem Decks (Crie 1 antes)</option>
                            ) : (
                                decks.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {/* Front */}
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-text-muted-dark uppercase tracking-wider">
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
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-text-muted-dark uppercase tracking-wider">
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
                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-text-muted-dark uppercase tracking-wider">
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

                {/* Add Button */}
                <div className="mt-8 px-4">
                    <button
                        onClick={handleSave}
                        className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-sm text-base font-semibold text-white bg-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
                    >
                        Add Card
                    </button>
                </div>
            </main>
        </>
    )
}
