import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFlashcards, getSubjects, deleteFlashcard, updateFlashcard } from '../services/localDb'

const filters = ['All', 'New', 'Learning', 'Review']

export default function BrowsePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [flashcards, setFlashcards] = useState([])
    const [subjectsMap, setSubjectsMap] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedCardIds, setSelectedCardIds] = useState(new Set())
    const [showMoveModal, setShowMoveModal] = useState(false)
    const [targetSubjectId, setTargetSubjectId] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cardsData, subjectsData] = await Promise.all([
                    getFlashcards(),
                    getSubjects()
                ])
                
                const sMap = {}
                subjectsData.forEach(sub => {
                    sMap[sub.id] = sub
                })
                
                setSubjectsMap(sMap)
                setFlashcards(cardsData)
            } catch (error) {
                console.error("Failed to load cards:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const getCardStatus = (card) => {
        if (card.repetitions === 0) return 'New'
        if (card.interval < 1) return 'Learning'
        return 'Review'
    }

    const isLeech = (card) => {
        // Assume leech se possuir multiplas tentativas e Ease Factor crítico (< 1.8)
        return card.repetitions > 3 && (card.ease_factor && card.ease_factor < 1.8)
    }

    const speak = (e, text) => {
        e.stopPropagation()
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = localStorage.getItem('tts_lang') || 'en-US'
            window.speechSynthesis.speak(utterance)
        }
    }

    const filteredCards = flashcards.filter((card) => {
        const subject = subjectsMap[card.subject_id]
        const subjectName = subject ? subject.name : 'No Deck'
        
        const matchesSearch = card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (card.tags && card.tags.toLowerCase().includes(searchQuery.toLowerCase()))

        const status = getCardStatus(card)

        if (activeFilter === 'All') return matchesSearch
        if (activeFilter === 'New') return matchesSearch && status === 'New'
        if (activeFilter === 'Learning') return matchesSearch && status === 'Learning'
        if (activeFilter === 'Review') return matchesSearch && status === 'Review'
        return matchesSearch
    })

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedCardIds(new Set())
    }

    const handleSelectCard = (e, id) => {
        e.stopPropagation()
        const newSet = new Set(selectedCardIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedCardIds(newSet)
    }

    const handleBulkDelete = async () => {
        if (!window.confirm(`Deseja mesmo excluir ${selectedCardIds.size} cartões?`)) return
        setIsLoading(true)
        try {
            for (let id of selectedCardIds) {
                await deleteFlashcard(id)
            }
            setSelectedCardIds(new Set())
            setIsSelectionMode(false)
            setFlashcards(await getFlashcards())
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBulkMove = async () => {
        if (!targetSubjectId) return
        setIsLoading(true)
        try {
            for (let id of selectedCardIds) {
                await updateFlashcard(id, { subject_id: targetSubjectId })
            }
            setShowMoveModal(false)
            setSelectedCardIds(new Set())
            setIsSelectionMode(false)
            setTargetSubjectId('')
            setFlashcards(await getFlashcards())
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-full max-w-md md:max-w-6xl mx-auto w-full md:px-8">
            {/* Header */}
            <header className="flex items-center p-4 md:pt-8 pb-2 justify-between sticky top-0 bg-slate-100/80 md:bg-transparent dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10 transition-colors">
                <button className="flex size-12 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300 hover:text-primary transition-colors" onClick={() => navigate('/')}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12 text-slate-900 dark:text-zinc-200">
                    Browse Cards
                </h2>
            </header>

            {/* Search Bar */}
            <div className="px-4 py-3">
                <label className="flex flex-col w-full h-11">
                    <div className="flex w-full flex-1 items-stretch rounded-lg bg-white dark:bg-surface-dark overflow-hidden border border-slate-200 dark:border-border-dark focus-within:border-primary/50 transition-colors shadow-sm">
                        <div className="flex items-center justify-center pl-3 text-slate-400 dark:text-zinc-400">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 px-3 text-sm font-medium"
                            placeholder="Search by front, back, deck or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </label>
            </div>

            {/* Filters e Actions */}
            <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 pr-2">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors ${activeFilter === filter
                                ? 'bg-primary/20 border border-primary/30 text-primary'
                                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-border-dark flex-shrink-0">
                    <button onClick={toggleSelectionMode} className={`flex items-center justify-center rounded-lg transition-colors h-9 w-9 ${isSelectionMode ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-800'}`} title="Modo de Seleção">
                        <span className="material-symbols-outlined text-[20px]">checklist</span>
                    </button>
                    <button onClick={() => navigate('/add')} className="flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors h-9 w-9" title="Adicionar Carta">
                        <span className="material-symbols-outlined text-[22px]">add</span>
                    </button>
                </div>
            </div>

            {/* Card List */}
            <div className="flex flex-col px-4 gap-2 pb-24">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">Loading cards...</div>
                ) : (
                    <>
                        {filteredCards.map((card) => {
                            const subject = subjectsMap[card.subject_id]
                            const subjectName = subject ? subject.name : 'Unknown Deck'
                            const colorCode = subject?.color_code || '#60a5fa'
                            const status = getCardStatus(card)
                            
                            // Status colors
                            let statusColor = 'text-slate-400 dark:text-zinc-500'
                            if (status === 'New') statusColor = 'text-blue-500'
                            if (status === 'Learning') statusColor = 'text-orange-500'
                            if (status === 'Review') statusColor = 'text-emerald-500'

                            return (
                                <div
                                    key={card.id}
                                    onClick={(e) => isSelectionMode ? handleSelectCard(e, card.id) : navigate(`/card/${card.id}/edit`, { state: { card } })}
                                    className={`flex items-center justify-between bg-white dark:bg-surface-dark rounded-xl p-4 border transition-colors group cursor-pointer shadow-sm ${selectedCardIds.has(card.id) ? 'border-primary ring-1 ring-primary/50 bg-primary/5 dark:bg-primary/5' : 'border-slate-200 dark:border-border-dark/50 hover:border-slate-300 dark:hover:border-zinc-700'}`}
                                >
                                    {isSelectionMode && (
                                        <div className="mr-3 flex items-center h-full">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCardIds.has(card.id) ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-zinc-500 text-transparent'}`}>
                                                <span className="material-icons text-xs">check</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1.5 overflow-hidden pr-2 flex-1">
                                        <p className="text-slate-900 dark:text-zinc-200 text-base font-medium truncate">{card.front}</p>
                                        
                                        {card.tags && (
                                            <div className="flex flex-wrap gap-1">
                                                {card.tags.split(',').map((tag, idx) => (
                                                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 rounded border border-slate-200 dark:border-zinc-700">
                                                        #{tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorCode }} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                                                    {subjectName}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-medium ${statusColor}`}>• {status}</span>
                                            {isLeech(card) && (
                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                                                    ⚠️ Sanguessuga
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => speak(e, card.front)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-400 dark:text-zinc-500"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">volume_up</span>
                                        </button>
                                        <div className="text-slate-400 dark:text-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity ml-1">
                                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {filteredCards.length === 0 && (
                            <div className="text-center py-16 px-6">
                                <span className="material-symbols-outlined text-5xl mb-4 block text-slate-300 dark:text-zinc-600">{searchQuery ? 'search_off' : 'content_paste_off'}</span>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">
                                    {searchQuery ? 'Sem resultados' : 'Nenhuma carta'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium">
                                    {searchQuery ? 'Tente ajustar os filtros ou a busca.' : 'Você ainda não possui nenhum flashcard ou os que existiam foram removidos.'}
                                </p>
                                {!searchQuery && (
                                    <button 
                                        onClick={() => navigate('/add')}
                                        className="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-colors inline-flex items-center"
                                    >
                                        <span className="material-icons text-xl mr-2">add</span>
                                        Nova Carta
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* Bulk Action Bar */}
            {isSelectionMode && (
                <div className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-6xl mx-auto bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 flex items-center justify-between animate-[slideUp_0.2s_ease-out]">
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">{selectedCardIds.size} selecionados</span>
                    <div className="flex gap-2">
                        <button onClick={() => setShowMoveModal(true)} disabled={selectedCardIds.size === 0} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-50 transition-colors">
                            Mover
                        </button>
                        <button onClick={handleBulkDelete} disabled={selectedCardIds.size === 0} className="px-4 py-2 text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg disabled:opacity-50 transition-colors">
                            Excluir
                        </button>
                    </div>
                </div>
            )}
            
            {/* Move Modal */}
            {showMoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMoveModal(false)} />
                    <div className="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl w-full max-w-sm overflow-hidden p-5 animate-[scaleIn_0.2s_ease-out]">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Mover {selectedCardIds.size} Cartões</h2>
                        <select 
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark p-3 rounded-xl mb-6 text-slate-900 dark:text-zinc-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            value={targetSubjectId}
                            onChange={(e) => setTargetSubjectId(e.target.value)}
                        >
                            <option value="">Selecione um baralho...</option>
                            {Object.values(subjectsMap).map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-3">
                            <button onClick={() => setShowMoveModal(false)} className="flex-1 py-3 text-sm font-semibold rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors">Cancelar</button>
                            <button onClick={handleBulkMove} disabled={!targetSubjectId} className="flex-1 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">Mover</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
