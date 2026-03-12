import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';
import { syncAll } from '../services/syncService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const { data } = await axios.get('/api/user');
            setUser(data);
            
            // Wait for initial sync to finish before showing the app to the user
            if (navigator.onLine) {
                try {
                    await syncAll();
                } catch (syncError) {
                    console.error("Initial sync failed but auth succeeded:", syncError);
                }
            }
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
        await checkAuthStatus();
    };

    const register = async ({ name, email, password, password_confirmation }) => {
        await csrf();
        await axios.post('/register', { name, email, password, password_confirmation });
        await checkAuthStatus();
    };

    const logout = async () => {
        await axios.post('/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
