import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubjects, createSubject } from '../services/localDb'
import { syncAll } from '../services/syncService'

function CountBadge({ value, type }) {
    const colorMap = {
        new: 'text-card-new',
        learning: 'text-card-learning',
        due: 'text-card-due',
        muted: 'text-text-muted-dark opacity-50',
    }
    const color = value === 0 ? colorMap.muted : colorMap[type]
    return <div className={`w-8 text-center ${color}`}>{value}</div>
}

function DeckRow({ deck, isChild = false, expandedIds, toggleExpand, onStudy, onConfig }) {
    const isExpanded = expandedIds.includes(deck.id)
    const hasChildren = deck.children && deck.children.length > 0

    return (
        <>
            <div
                className={`w-full flex items-center ${isChild ? 'pl-10 pr-4 py-2' : 'px-4 py-3'} 
          ${deck.isActive ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-zinc-800'} 
          transition-colors border-b border-slate-200 dark:border-border-dark last:border-0 group`}
            >
                <button
                    onClick={() => {
                        if (hasChildren) {
                            toggleExpand(deck.id)
                        } else {
                            onStudy()
                        }
                    }}
                    className="flex items-center flex-1 text-left focus:outline-none"
                >
                    {!isChild && hasChildren && (
                        <span className={`material-icons text-sm mr-2 text-slate-400 dark:text-text-muted-dark transition-transform ${isExpanded ? 'rotate-0' : ''}`}>
                            {isExpanded ? 'remove' : 'add'}
                        </span>
                    )}
                    {!isChild && !hasChildren && (
                        <span className="material-icons text-sm mr-2 text-transparent group-hover:text-slate-400 dark:group-hover:text-text-muted-dark transition-colors">
                            circle
                        </span>
                    )}
                    <span className={`font-medium text-sm ${deck.isActive ? 'text-primary' : isChild ? 'text-slate-700 dark:text-text-main-dark' : ''}`}>
                        {deck.name}
                    </span>
                </button>

                {/* Settings icon – always visible on hover */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onConfig(deck)
                    }}
                    className="p-1 mr-2 rounded-full text-slate-400 dark:text-text-muted-dark opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all focus:outline-none"
                    title="Deck settings"
                >
                    <span className="material-icons text-sm">settings</span>
                </button>

                <div className="flex space-x-4 text-right w-32 justify-end text-sm font-medium">
                    <CountBadge value={deck.newCount} type="new" />
                    <CountBadge value={deck.lrnCount} type="learning" />
                    <CountBadge value={deck.dueCount} type="due" />
                </div>
            </div>
            {isExpanded && hasChildren && (
                <div className="bg-slate-50 dark:bg-surface-dark">
                    {deck.children.map((child) => (
                        <DeckRow key={child.id} deck={child} isChild={true} expandedIds={expandedIds} toggleExpand={toggleExpand} onStudy={onStudy} onConfig={onConfig} />
                    ))}
                </div>
            )}
        </>
    )
}

/* ── Create Deck Modal ── */
function CreateDeckModal({ isOpen, onClose, onCreateDeck }) {
    const [deckName, setDeckName] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleCreate = () => {
        const trimmed = deckName.trim()
        if (!trimmed) {
            setError('Deck name is required')
            return
        }
        onCreateDeck(trimmed)
        setDeckName('')
        setError('')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => { onClose(); setDeckName(''); setError('') }}
            />
            {/* Modal */}
            <div className="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out] transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Deck</h2>
                    <button
                        onClick={() => { onClose(); setDeckName(''); setError('') }}
                        className="p-1 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                        <span className="material-icons text-xl">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 pb-5 pt-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                            Deck Name
                        </label>
                        <input
                            value={deckName}
                            onChange={(e) => { setDeckName(e.target.value); setError('') }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="e.g. Biology, Math, History..."
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                        />
                        {error && (
                            <p className="text-card-learning text-xs mt-1.5">{error}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => { onClose(); setDeckName(''); setError('') }}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 border border-slate-300 dark:border-border-dark transition-colors active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-blue-500 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            Create Deck
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DecksPage() {
    const [decks, setDecks] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncMessage, setSyncMessage] = useState('')
    const [expandedIds, setExpandedIds] = useState([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const navigate = useNavigate()

    const fetchDecks = async () => {
        try {
            const data = await getSubjects()
            // Map the subjects to deck format, setting counts to 0 for now as flashcards counts logic is more complex
            const mappedDecks = data.map(sub => ({
                id: sub.id,
                name: sub.name,
                newCount: 0,
                lrnCount: 0,
                dueCount: 0,
                children: [] // No nested decks logic on backend
            }))
            setDecks(mappedDecks)
        } catch (error) {
            console.error('Error fetching decks', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDecks()
    }, [])

    const handleSync = async () => {
        setIsSyncing(true)
        setSyncMessage('')
        try {
            await syncAll()
            setSyncMessage('Sincronização concluída!')
            await fetchDecks() // Refresh UI after sync
        } catch (error) {
            setSyncMessage('Erro na sincronização.')
        } finally {
            setIsSyncing(false)
            setTimeout(() => setSyncMessage(''), 3000)
        }
    }

    const toggleExpand = (id) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const handleStudy = () => {
        navigate('/study')
    }

    const handleConfig = (deck) => {
        navigate(`/deck/${deck.id}/config`, { state: { deck } })
    }

    const handleCreateDeck = async (name) => {
        try {
            const newSub = await createSubject({ name })
            setDecks([...decks, {
                id: newSub.id,
                name: newSub.name,
                newCount: 0,
                lrnCount: 0,
                dueCount: 0,
                children: []
            }])
        } catch (error) {
            console.error('Failed to create deck', error)
        }
    }

    return (
        <>
            <header className="bg-slate-100 dark:bg-background-dark pt-14 pb-4 px-4 sticky top-0 z-10 transition-colors">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Decks</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`p-2 rounded-full transition-colors flex items-center justify-center 
                            ${isSyncing ? 'text-primary' : 'text-slate-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-zinc-800'}`}
                            title="Sincronizar dados"
                        >
                            <span className={`material-symbols-outlined text-2xl ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="p-2 text-primary hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            title="Create new deck"
                        >
                            <span className="material-icons text-2xl">add</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="px-4">
                {/* Sync Message Toast */}
                {syncMessage && (
                    <div className="max-w-md mx-auto mb-4 px-4 py-3 bg-card-learning/20 border border-card-learning/30 rounded-xl text-card-learning text-sm font-medium text-center animate-pulse">
                        {syncMessage}
                    </div>
                )}
                <div className="max-w-md mx-auto space-y-4">
                    {/* Column Headers */}
                    <div className="flex px-4 py-2 text-xs font-semibold text-slate-400 dark:text-text-muted-dark border-b border-slate-200 dark:border-border-dark">
                        <div className="flex-1">Deck</div>
                        <div className="flex space-x-4 text-right w-32 justify-end">
                            <div className="w-8 text-center" title="New Cards">New</div>
                            <div className="w-8 text-center" title="Learning Cards">Lrn</div>
                            <div className="w-8 text-center" title="Due Cards">Due</div>
                        </div>
                    </div>

                    {/* Deck List */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark overflow-hidden transition-colors min-h-[100px] flex flex-col justify-center">
                        {loading ? (
                            <div className="flex justify-center items-center py-6">
                                <span className="material-icons animate-spin text-primary text-2xl">sync</span>
                            </div>
                        ) : decks.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 dark:text-zinc-500 text-sm">
                                Não há decks criados.
                            </div>
                        ) : (
                            decks.map((deck) => (
                                <DeckRow
                                    key={deck.id}
                                    deck={deck}
                                    expandedIds={expandedIds}
                                    toggleExpand={toggleExpand}
                                    onStudy={handleStudy}
                                    onConfig={handleConfig}
                                />
                            ))
                        )}
                    </div>

                    <p className="text-xs text-slate-400 dark:text-text-muted-dark text-center mt-8">
                        Studied 0 cards in 0 seconds today (0s/card)
                    </p>
                </div>
            </main>

            {/* Create Deck Modal */}
            <CreateDeckModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateDeck={handleCreateDeck}
            />
        </>
    )
}
