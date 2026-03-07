import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFlashcards } from '../services/localDb'

export default function StudyPage() {
    const navigate = useNavigate()
    const [studyCards, setStudyCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [completed, setCompleted] = useState(false)

    useEffect(() => {
        const fetchCards = async () => {
            try {
                // Future Implementation: pass subject_id and filter by due date. 
                // For now, grabbing all non-deleted flashcards.
                const cards = await getFlashcards()
                if (cards.length === 0) setCompleted(true)
                setStudyCards(cards)
            } catch (error) {
                console.error("Error fetching study session", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCards()
    }, [])

    const totalCards = studyCards.length
    const card = studyCards[currentIndex]
    const progress = ((currentIndex + 1) / totalCards) * 100

    const handleAnswer = () => {
        // Implement logic to invoke POST to Review API (or store locally)
        // For step 9 validation we'll just progress the local state.
        if (currentIndex < totalCards - 1) {
            setCurrentIndex(currentIndex + 1)
            setShowAnswer(false)
        } else {
            setCompleted(true)
        }
    }

    if (loading) {
        return (
            <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen flex items-center justify-center p-6 transition-colors">
                <span className="material-icons animate-spin text-primary text-4xl">sync</span>
            </div>
        )
    }

    if (completed) {
        return (
            <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col items-center justify-center p-6 font-display text-slate-900 dark:text-zinc-100 transition-colors">
                <div className="text-center space-y-6">
                    <span className="material-icons text-6xl text-card-due">check_circle</span>
                    <h2 className="text-2xl font-bold">Session Complete!</h2>
                    <p className="text-slate-500 dark:text-zinc-400">
                        You studied {totalCards} cards
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-primary hover:bg-blue-500 rounded-xl font-semibold text-white transition-colors"
                    >
                        Back to Decks
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-display min-h-screen flex flex-col antialiased transition-colors">
            {/* Header */}
            <header className="pt-12 pb-4 px-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-col gap-4 transition-colors">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <span className="material-icons text-xl">close</span>
                    </button>
                    <div className="text-center">
                        <h1 className="font-semibold text-base">Basic Review</h1>
                        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-0.5">
                            {currentIndex + 1} / {totalCards} Cards
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -mr-2 text-primary font-medium text-sm rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                        END
                    </button>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Card Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                <div
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="w-full max-w-sm aspect-[4/3] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 flex flex-col p-6 relative cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-colors active:scale-[0.98]"
                >
                    <div className="flex justify-between items-start text-xs text-slate-400 dark:text-zinc-400 mb-4">
                        <span>Ease: {card?.ease_factor || 2.5}</span>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/card/${card?.id}/edit`, { state: { card } })
                            }}
                        >
                            <span className="material-icons text-sm">edit</span>
                        </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-center">
                        <p className={`font-semibold ${showAnswer ? 'text-2xl text-card-due' : 'text-3xl'}`}>
                            {showAnswer ? card?.back : card?.front}
                        </p>
                    </div>
                    <div className="text-right text-xs text-slate-400 dark:text-zinc-400 mt-4">
                        <span>{showAnswer ? 'Back' : 'Front'}</span>
                    </div>
                </div>

                {/* Tap to reveal hint OR answer buttons */}
                {!showAnswer ? (
                    <p className="text-slate-400 dark:text-zinc-500 text-sm animate-pulse">
                        Tap card to reveal answer
                    </p>
                ) : (
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <button
                            onClick={handleAnswer}
                            className="flex-1 px-2 py-4 rounded-lg bg-red-100 dark:bg-red-900/80 border border-red-200 dark:border-red-800/50 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-zinc-100 flex items-center justify-center shadow-lg transform active:scale-95 transition-all"
                        >
                            <span className="font-medium text-sm">Errei</span>
                        </button>
                        <button
                            onClick={handleAnswer}
                            className="flex-1 px-2 py-4 rounded-lg bg-amber-100 dark:bg-yellow-700/80 border border-amber-200 dark:border-yellow-600/50 hover:bg-amber-200 dark:hover:bg-yellow-600 text-amber-700 dark:text-zinc-100 flex items-center justify-center shadow-lg transform active:scale-95 transition-all"
                        >
                            <span className="font-medium text-sm">Repetir</span>
                        </button>
                        <button
                            onClick={handleAnswer}
                            className="flex-1 px-2 py-4 rounded-lg bg-green-100 dark:bg-green-800/80 border border-green-200 dark:border-green-700/50 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-zinc-100 flex items-center justify-center shadow-lg transform active:scale-95 transition-all"
                        >
                            <span className="font-medium text-sm">Acertei</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
