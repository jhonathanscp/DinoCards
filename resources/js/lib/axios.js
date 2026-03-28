import Axios from 'axios';

const origin = typeof window !== 'undefined' && window.location.origin.startsWith('http') 
    ? window.location.origin 
    : 'http://127.0.0.1:8000';

const axios = Axios.create({
    baseURL: import.meta.env.VITE_API_URL || origin,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true
});

console.log('--- DEBUG: AXIOS INSTANCE CREATED ---');
console.log('Target URL:', axios.defaults.baseURL);
console.log('Timestamp:', new Date().toLocaleTimeString());

export default axios;
