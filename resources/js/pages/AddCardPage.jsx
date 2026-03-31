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
    const [createReverse, setCreateReverse] = useState(false)
    const [frontImage, setFrontImage] = useState(null)
    const [backImage, setBackImage] = useState(null)

    const handleImageUpload = (e, setSide) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSide(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

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
                    front_image: frontImage,
                    back: back.trim(),
                    back_image: backImage,
                    tags: tags.trim()
                })

                if (createReverse) {
                    await createFlashcard({
                        subject_id: selectedDeck,
                        front: back.trim(),
                        front_image: backImage,
                        back: front.trim(),
                        back_image: frontImage,
                        tags: tags.trim()
                    })
                }

                setSaved(true)
                setTimeout(() => {
                    setSaved(false)
                    setFront('')
                    setBack('')
                    setFrontImage(null)
                    setBackImage(null)
                    setTags('')
                }, 2000)
            } catch (error) {
                console.error("Error creating card:", error)
            }
        }
    }

    return (
        <div className="flex flex-col min-h-full max-w-md md:max-w-4xl mx-auto w-full md:px-8">
            {/* Header */}
            <header className="flex items-center p-4 md:pt-8 pb-2 justify-between sticky top-0 bg-slate-100/80 md:bg-transparent dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-primary/10 transition-colors">
                <button className="flex size-12 shrink-0 items-center justify-center text-slate-500 dark:text-zinc-300 hover:text-primary transition-colors" onClick={() => window.history.back()}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12 text-slate-900 dark:text-zinc-200">
                    Add Card
                </h2>
            </header>

            <main className="flex-1 pb-6 w-full">
                {/* Success Toast */}
                {saved && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-[scaleIn_0.2s_ease-out] mx-4 max-w-xs w-full border border-slate-100 dark:border-zinc-800">
                            <span className="material-symbols-outlined text-[64px] text-emerald-500 mb-4 animate-bounce">check_circle</span>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center">Cartão Adicionado!</h3>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-3 text-center font-medium">Continue criando para o deck...</p>
                        </div>
                    </div>
                )}

                <div className="px-4 mt-5 space-y-5">
                    {/* Deck Selector Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-200 dark:border-border-dark shadow-sm">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                            <span className="material-symbols-outlined text-sm">folder_open</span>
                            Deck de Destino
                        </label>
                        <select
                            value={selectedDeck}
                            onChange={(e) => setSelectedDeck(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
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

                    {/* Content Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden flex flex-col">
                        {/* Front */}
                        <div className="p-5 border-b border-slate-100 dark:border-border-dark/60">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                Frente (Pergunta)
                            </label>
                            <textarea
                                value={front}
                                onChange={(e) => setFront(e.target.value)}
                                placeholder="Digite o que deseja perguntar..."
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-colors"
                            />
                            <div className="mt-3 flex items-center justify-between">
                                <label className="flex items-center gap-2 text-[13px] font-bold text-primary cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                                    {frontImage ? 'Trocar Imagem' : 'Anexar Imagem'}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFrontImage)} />
                                </label>
                                {frontImage && (
                                    <div className="relative w-[50px] h-[50px] rounded-lg border-2 border-primary/20 overflow-hidden group shadow-sm">
                                        <img src={frontImage} className="w-full h-full object-cover" alt="Front Preview" />
                                        <button onClick={() => setFrontImage(null)} className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Back */}
                        <div className="p-5">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                                <span className="material-symbols-outlined text-sm">visibility_off</span>
                                Verso (Resposta)
                            </label>
                            <textarea
                                value={back}
                                onChange={(e) => setBack(e.target.value)}
                                placeholder="Digite a resposta esperada..."
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-colors"
                            />
                            <div className="mt-3 flex items-center justify-between">
                                <label className="flex items-center gap-2 text-[13px] font-bold text-primary cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                                    {backImage ? 'Trocar Imagem' : 'Anexar Imagem'}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setBackImage)} />
                                </label>
                                {backImage && (
                                    <div className="relative w-[50px] h-[50px] rounded-lg border-2 border-primary/20 overflow-hidden group shadow-sm">
                                        <img src={backImage} className="w-full h-full object-cover" alt="Back Preview" />
                                        <button onClick={() => setBackImage(null)} className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-200 dark:border-border-dark shadow-sm flex flex-col gap-5">
                        {/* Tags */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                                <span className="material-symbols-outlined text-sm">sell</span>
                                Tags (Opcional)
                            </label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Ex: biologia, capitulo-1, enem"
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3.5 text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        {/* Reverse Option */}
                        <div className="pt-5 border-t border-slate-100 dark:border-border-dark/60">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={createReverse} 
                                        onChange={(e) => setCreateReverse(e.target.checked)} 
                                        className="w-5 h-5 rounded-[6px] border-2 border-slate-300 dark:border-zinc-600 text-primary focus:ring-primary focus:ring-offset-0 transition-colors cursor-pointer" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 group-hover:text-primary transition-colors">Criar Cartão Reverso</span>
                                    <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 mt-0.5">Duplica o cartão invertendo Frente e Verso.</span>
                                </div>
                            </label>
                        </div>
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
        </div>
    )
}
