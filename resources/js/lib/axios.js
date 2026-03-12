import Axios from 'axios';

const axios = Axios.create({
    baseURL: 'http://127.0.0.1:8000', // Forçado para resolver conflito de localhost no Electron
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
