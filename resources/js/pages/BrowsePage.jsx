import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const flashcards = [
    { id: 1, front: 'Mitochondria', tag: 'Biology', tagColor: 'green', status: 'Due tomorrow' },
    { id: 2, front: 'Capital of France', tag: 'Geography', tagColor: 'blue', status: 'Reviewing' },
    { id: 3, front: 'O(n log n)', tag: 'CS', tagColor: 'purple', status: 'New' },
    { id: 4, front: 'H₂O', tag: 'Chemistry', tagColor: 'green', status: 'Due today' },
    { id: 5, front: 'Photosynthesis', tag: 'Biology', tagColor: 'green', status: 'Learning' },
    { id: 6, front: 'Newton\'s 2nd Law', tag: 'Physics', tagColor: 'orange', status: 'Due today' },
    { id: 7, front: 'DNA Structure', tag: 'Biology', tagColor: 'green', status: 'New' },
]

const tagColors = {
    green: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20',
}

const filters = ['All', 'Due', 'Learning', 'New', 'Tags']

export default function BrowsePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const navigate = useNavigate()

    const filteredCards = flashcards.filter((card) => {
        const matchesSearch = card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.tag.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeFilter === 'All') return matchesSearch
        if (activeFilter === 'Due') return matchesSearch && card.status.includes('Due')
        if (activeFilter === 'Learning') return matchesSearch && card.status === 'Learning'
        if (activeFilter === 'New') return matchesSearch && card.status === 'New'
        return matchesSearch
    })

    return (
        <div className="flex flex-col min-h-full max-w-md mx-auto w-full">
            {/* Header */}
            <div className="flex items-center px-4 py-4 justify-between sticky top-0 bg-slate-100/90 dark:bg-background-dark/90 backdrop-blur-md z-10 border-b border-slate-200 dark:border-zinc-900 transition-colors">
                <div className="flex size-10 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-zinc-200 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    Browse Cards
                </h2>
                <div className="flex size-10 items-center justify-center">
                    <button onClick={() => navigate('/add')} className="flex items-center justify-center rounded-lg text-primary">
                        <span className="material-symbols-outlined text-2xl">add</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3">
                <label className="flex flex-col w-full h-11">
                    <div className="flex w-full flex-1 items-stretch rounded-lg bg-white dark:bg-surface-dark overflow-hidden border border-slate-200 dark:border-border-dark focus-within:border-primary/50 transition-colors">
                        <div className="flex items-center justify-center pl-3 text-slate-400 dark:text-zinc-400">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 px-3 text-sm font-medium"
                            placeholder="Search flashcards..."
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
            <div className="flex flex-col px-4 gap-2 pb-4">
                {filteredCards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => navigate(`/card/${card.id}/edit`, { state: { card } })}
                        className="flex items-center justify-between bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-border-dark/50 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors group cursor-pointer"
                    >
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-900 dark:text-zinc-200 text-base font-medium">{card.front}</p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tagColors[card.tagColor]}`}>
                                    {card.tag}
                                </span>
                                <span className="text-slate-400 dark:text-zinc-500 text-xs">{card.status}</span>
                            </div>
                        </div>
                        <div className="text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </div>
                    </div>
                ))}

                {filteredCards.length === 0 && (
                    <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
                        <span className="material-icons text-4xl mb-3 block">search_off</span>
                        <p className="text-sm">No cards found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
