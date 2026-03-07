import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import DecksPage from './pages/DecksPage'
import AddCardPage from './pages/AddCardPage'
import BrowsePage from './pages/BrowsePage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import StudyPage from './pages/StudyPage'
import DeckConfigPage from './pages/DeckConfigPage'
import AuthPage from './pages/AuthPage'
import EditCardPage from './pages/EditCardPage'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/" element={<DecksPage />} />
                                <Route path="/add" element={<AddCardPage />} />
                                <Route path="/browse" element={<BrowsePage />} />
                                <Route path="/stats" element={<StatsPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                            </Route>
                            <Route path="/study" element={<StudyPage />} />
                            <Route path="/deck/:id/config" element={<DeckConfigPage />} />
                            <Route path="/card/:id/edit" element={<EditCardPage />} />
                        </Route>
                        <Route path="/login" element={<AuthPage />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
