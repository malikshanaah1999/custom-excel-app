// src/components/Spreadsheet/hooks/useNotification.js
// hooks are special functions that allow you to use React state and lifecycle features in functional components. //
import { useState, useCallback } from 'react';

const useNotification = () => { // Custom Hook.
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    return { notification, showNotification };
};

export default useNotification;