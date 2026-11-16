import Axios from 'axios';

const axios = Axios.create({
    // هذا الرابط يفترض أن خادم Laravel يعمل محلياً على المنفذ الافتراضي 80 عبر Sail
    baseURL: 'http://localhost/api',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
});

// اعتراض الطلبات لحقن التوكن قبل إرسالها للخادم
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axios;