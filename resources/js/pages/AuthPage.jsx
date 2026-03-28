import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
    const { login, register, user } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true })
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            if (isLogin) {
                await login({ email, password })
            } else {
                await register({ name, email, password, password_confirmation: password })
            }
            navigate('/', { replace: true })
        } catch (err) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Credenciais incorretas. Tente novamente.')
                } else if (err.response.status === 422 && err.response.data.errors) {
                    const validationErrors = Object.values(err.response.data.errors).flat()
                    setError(validationErrors.join(' '))
                } else {
                    setError(err.response.data?.message || 'Falha na autenticação.')
                }
            } else if (err.request) {
                setError('Erro de conexão. Verifique se o servidor está rodando.')
            } else {
                setError(err.message || 'Um erro inesperado ocorreu.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = () => {
        navigate('/')
    }

    return (
        <div className="bg-slate-100 dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-text-main-dark relative overflow-hidden transition-colors">
            {/* Background glow effects */}
            <div className="absolute top-[-200px] left-[-100px] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-150px] right-[-100px] w-[350px] h-[350px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
                {/* Logo / Brand */}
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/10">
                        <span className="material-icons text-primary text-3xl">style</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">FlashCardApp</h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm mt-2">
                        {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
                    </p>
                </div>

                {/* Card */}
                <div className="w-full max-w-sm">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name (signup only) */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1.5">Name</label>
                                <div className="relative">
                                    <span className="material-icons text-slate-400 dark:text-zinc-500 text-lg absolute left-3.5 top-1/2 -translate-y-1/2">person</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1.5">Email</label>
                            <div className="relative">
                                <span className="material-icons text-slate-400 dark:text-zinc-500 text-lg absolute left-3.5 top-1/2 -translate-y-1/2">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1.5">Password</label>
                            <div className="relative">
                                <span className="material-icons text-slate-400 dark:text-zinc-500 text-lg absolute left-3.5 top-1/2 -translate-y-1/2">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl pl-11 pr-12 py-3 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                                >
                                    <span className="material-icons text-lg">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Forgot password (login only) */}
                        {isLogin && (
                            <div className="text-right">
                                <button type="button" className="text-primary text-xs font-medium hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-blue-500 shadow-lg shadow-primary/25 transition-all active:scale-[0.98] mt-2 disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading && <span className="material-icons animate-spin mr-2 text-[18px]">sync</span>}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Toggle login/signup */}
                    <p className="text-center text-sm text-slate-500 dark:text-zinc-400 mt-8">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError('')
                            }}
                            className="text-primary font-semibold hover:text-blue-300 transition-colors"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6 mt-6">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-border-dark" />
                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-border-dark" />
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 font-semibold text-sm shadow-lg shadow-black/10 transition-all active:scale-[0.98] mb-6 border border-slate-200 dark:border-transparent"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    )
}
