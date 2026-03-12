import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFlashcards, getSubjects } from '../services/localDb'

const filters = ['All', 'New', 'Learning', 'Review']

export default function BrowsePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [flashcards, setFlashcards] = useState([])
    const [subjectsMap, setSubjectsMap] = useState({})
    const [isLoading, setIsLoading] = useState(true)
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

    const filteredCards = flashcards.filter((card) => {
        const subject = subjectsMap[card.subject_id]
        const subjectName = subject ? subject.name : 'No Deck'
        
        const matchesSearch = card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subjectName.toLowerCase().includes(searchQuery.toLowerCase())

        const status = getCardStatus(card)

        if (activeFilter === 'All') return matchesSearch
        if (activeFilter === 'New') return matchesSearch && status === 'New'
        if (activeFilter === 'Learning') return matchesSearch && status === 'Learning'
        if (activeFilter === 'Review') return matchesSearch && status === 'Review'
        return matchesSearch
    })

    return (
        <div className="flex flex-col min-h-full max-w-md mx-auto w-full">
            {/* Header */}
            <div className="flex items-center px-4 py-4 justify-between sticky top-0 bg-slate-100/90 dark:bg-background-dark/90 backdrop-blur-md z-10 border-b border-slate-200 dark:border-zinc-900 transition-colors">
                <div className="flex size-10 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-zinc-200 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    Browse Cards
                </h2>
                <div className="flex size-10 items-center justify-center">
                    <button onClick={() => navigate('/add')} className="flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors h-10 w-10">
                        <span className="material-symbols-outlined text-2xl">add</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3">
                <label className="flex flex-col w-full h-11">
                    <div className="flex w-full flex-1 items-stretch rounded-lg bg-white dark:bg-surface-dark overflow-hidden border border-slate-200 dark:border-border-dark focus-within:border-primary/50 transition-colors shadow-sm">
                        <div className="flex items-center justify-center pl-3 text-slate-400 dark:text-zinc-400">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 px-3 text-sm font-medium"
                            placeholder="Search by front, back or deck..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </label>
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
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
                                    onClick={() => navigate(`/card/${card.id}/edit`, { state: { card } })}
                                    className="flex items-center justify-between bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-border-dark/50 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors group cursor-pointer shadow-sm"
                                >
                                    <div className="flex flex-col gap-1.5 overflow-hidden pr-2">
                                        <p className="text-slate-900 dark:text-zinc-200 text-base font-medium truncate">{card.front}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorCode }} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                                                    {subjectName}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-medium ${statusColor}`}>• {status}</span>
                                        </div>
                                    </div>
                                    <div className="text-slate-400 dark:text-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                                    </div>
                                </div>
                            )
                        })}

                        {filteredCards.length === 0 && (
                            <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
                                <span className="material-symbols-outlined text-4xl mb-3 block opacity-50">search_off</span>
                                <p className="text-sm font-medium">No cards found</p>
                                {searchQuery && <p className="text-xs mt-1">Try adjusting your search or filters.</p>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
