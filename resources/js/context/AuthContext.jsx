import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';
import { clearDatabase, getActiveUserId, setActiveUserId } from '../services/localDb';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncCompleted, setSyncCompleted] = useState(false);

    const checkAuthStatus = async () => {
        try {
            const { data } = await axios.get('/api/user');
            
            // Segurança Offline-first: Se mudou de utilizador sem logout limpo, precisamos esvaziar o DB pra evitar vazamento
            const storedUserId = await getActiveUserId();
            if (storedUserId && storedUserId !== data.id) {
                await clearDatabase();
            }
            await setActiveUserId(data.id);
            
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const csrf = () => axios.get('/sanctum/csrf-cookie');

    const login = async ({ email, password }) => {
        await csrf();
        await axios.post('/login', { email, password });
        setSyncCompleted(false); // Reset sync status on new login
        await checkAuthStatus();
    };

    const register = async ({ name, email, password, password_confirmation }) => {
        await csrf();
        await axios.post('/register', { name, email, password, password_confirmation });
        setSyncCompleted(false); // Reset sync status on new registration
        await checkAuthStatus();
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } catch (error) {
            console.error('Logout request failed', error);
        }
        setUser(null);
        setSyncCompleted(false);
        await clearDatabase(); // Previne que dados fiquem no IndexedDB para o próximo usuário
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading, syncCompleted, setSyncCompleted }}>
            {children}
        </AuthContext.Provider>
    );
};
