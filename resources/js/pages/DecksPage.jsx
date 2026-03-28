import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubjects, createSubject, getFlashcards, getReviewLogs } from '../services/localDb'
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
                className={`relative w-full flex items-center py-2.5 pr-4 
          ${deck.isActive ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-zinc-800'} 
          transition-colors border-b border-slate-200 dark:border-border-dark last:border-0 group select-none`}
                style={{ paddingLeft: isChild ? '3rem' : '1rem' }}
            >
                {/* Linha vertical conectora visual para subdecks (L-shape) */}
                {isChild && (
                    <div className="absolute left-[1.125rem] top-0 w-4 h-1/2 border-l-2 border-b-2 border-slate-300 dark:border-zinc-700 rounded-bl-sm pointer-events-none" />
                )}

                {/* Expand Button */}
                <div className="w-8 flex-shrink-0 flex items-center justify-start z-10">
                    {hasChildren && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(deck.id); }}
                            className="p-0.5 rounded-md text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <span className="material-icons text-[20px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                                chevron_right
                            </span>
                        </button>
                    )}
                </div>

                {/* Study Button (Deck Name) */}
                <button
                    onClick={() => onStudy(deck)}
                    className="flex flex-1 items-center justify-start text-left focus:outline-none min-w-0 py-1"
                >
                    <span className={`font-semibold text-[15px] truncate ${isChild ? 'text-slate-600 dark:text-zinc-300' : 'text-slate-800 dark:text-zinc-100'}`}>
                        {deck.name}
                    </span>
                </button>

                {/* Settings icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onConfig(deck)
                    }}
                    className="p-1 mx-2 rounded-full text-slate-400 dark:text-text-muted-dark opacity-0 md:opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all focus:outline-none flex-shrink-0 z-10"
                    title="Deck settings"
                >
                    <span className="material-icons text-[18px]">settings</span>
                </button>

                {/* Counts */}
                <div className="flex space-x-3 text-right text-[13px] font-semibold flex-shrink-0">
                    <CountBadge value={deck.newCount} type="new" />
                    <CountBadge value={deck.lrnCount} type="learning" />
                    <CountBadge value={deck.dueCount} type="due" />
                </div>
            </div>
            
            {isExpanded && hasChildren && (
                <div className="relative">
                    {/* Linha vertical principal para conectar os filhos seguintes */}
                    <div className="absolute left-[1.125rem] top-0 bottom-0 w-[2px] bg-slate-300 dark:bg-zinc-700 pointer-events-none" />
                    
                    <div className="relative z-10">
                        {deck.children.map((child) => (
                            <DeckRow key={child.id} deck={child} isChild={true} expandedIds={expandedIds} toggleExpand={toggleExpand} onStudy={onStudy} onConfig={onConfig} />
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

/* ── Create Deck Modal ── */
function CreateDeckModal({ isOpen, onClose, onCreateDeck, availableDecks }) {
    const [deckName, setDeckName] = useState('')
    const [parentId, setParentId] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleCreate = () => {
        const trimmed = deckName.trim()
        if (!trimmed) {
            setError('Deck name is required')
            return
        }
        onCreateDeck(trimmed, parentId || null)
        setDeckName('')
        setParentId('')
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
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">
                            Pastas / Baralho Pai (Opcional)
                        </label>
                        <select
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors appearance-none"
                        >
                            <option value="">Nenhum (Nível Principal)</option>
                            {availableDecks?.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => { onClose(); setDeckName(''); setParentId(''); setError('') }}
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
    const [cardsStudiedToday, setCardsStudiedToday] = useState(0)
    const [rawSubjects, setRawSubjects] = useState([])
    const navigate = useNavigate()

    const fetchDecks = async () => {
        try {
            const data = await getSubjects()
            const allCards = await getFlashcards()
            const now = new Date()
            
            console.log('Total cards fetched:', allCards.length);
            console.log('Subjects fetched:', data.length);

            const mappedDecks = data.map(sub => {
                const deckCards = allCards.filter(c => String(c.subject_id) === String(sub.id))
                let newCount = 0
                let lrnCount = 0
                let dueCount = 0

                deckCards.forEach(card => {
                    if (!card.next_review_at) {
                        newCount++
                    } else {
                        const reviewDate = new Date(card.next_review_at)
                        if (reviewDate <= now) {
                            if (card.interval === 0 || card.repetitions === 0) {
                                lrnCount++
                            } else {
                                dueCount++
                            }
                        }
                    }
                })

                return {
                    id: sub.id,
                    name: sub.name,
                    parent_id: sub.parent_id,
                    newCount,
                    lrnCount,
                    dueCount,
                    children: [] // No nested decks logic on backend
                }
            })
            
            const deckMap = {}
            mappedDecks.forEach(d => deckMap[d.id] = d)
            const tree = []
            
            mappedDecks.forEach(d => {
                if (d.parent_id && deckMap[d.parent_id]) {
                    deckMap[d.parent_id].children.push(d)
                } else {
                    tree.push(d)
                }
            })
            
            setRawSubjects(mappedDecks)
            setDecks(tree)

            const logs = await getReviewLogs()
            const todayStr = now.toISOString().split('T')[0]
            const studiedToday = logs.filter(log => log.reviewed_at.startsWith(todayStr)).length
            setCardsStudiedToday(studiedToday)
        } catch (error) {
            console.error('Error fetching decks', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDecks()
        
        const handleDbChange = () => {
            fetchDecks()
        }
        window.addEventListener('localDbChanged', handleDbChange)
        
        return () => {
            window.removeEventListener('localDbChanged', handleDbChange)
        }
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

    const handleStudy = (deck) => {
        navigate('/study', { state: { deckId: deck.id } })
    }

    const handleConfig = (deck) => {
        navigate(`/deck/${deck.id}/config`, { state: { deck } })
    }

    const handleCreateDeck = async (name, parent_id) => {
        try {
            await createSubject({ name, parent_id })
            fetchDecks() // recarregar a arvore
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
                            <div className="text-center py-12 px-6">
                                <span className="material-icons text-5xl text-slate-300 dark:text-zinc-600 mb-4 block">style</span>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">Nenhum baralho</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium">Crie seu primeiro baralho para começar a estudar e memorizar conteúdos!</p>
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-colors inline-flex items-center"
                                >
                                    <span className="material-icons text-xl mr-2">add_circle</span>
                                    Criar Baralho
                                </button>
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
                        {cardsStudiedToday} cartões estudados hoje
                    </p>
                </div>
            </main>

            {/* Create Deck Modal */}
            <CreateDeckModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateDeck={handleCreateDeck}
                availableDecks={rawSubjects}
            />
        </>
    )
}
