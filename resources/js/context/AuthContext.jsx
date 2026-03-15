import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncCompleted, setSyncCompleted] = useState(false);

    const checkAuthStatus = async () => {
        try {
            const { data } = await axios.get('/api/user');
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
        await axios.post('/logout');
        setUser(null);
        setSyncCompleted(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading, syncCompleted, setSyncCompleted }}>
            {children}
        </AuthContext.Provider>
    );
};
