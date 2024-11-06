// src/components/Spreadsheet/hooks/useNotification.js

import { useState, useCallback } from 'react';

const useNotification = () => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    return { notification, showNotification };
};

export default useNotification;