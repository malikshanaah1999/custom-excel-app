// src/hooks/useDropdownOptions.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

export const useDropdownOptions = (category, parentCategory = null) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // useDropdownOptions.js
const fetchOptions = async () => {
    if (!category) return;
    
    setLoading(true);
    setError(null);
    
    try {
        let url = `${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(category)}`;

        if (parentCategory) {
            url += `?parent_category=${encodeURIComponent(parentCategory)}`;
        }

        console.log('Fetching from URL:', url); // Debug log

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data); // Debug log

        if (Array.isArray(data)) {
            const formattedOptions = data.map(option => ({
                id: option.id,
                value: option.value,
                label: option.value
            }));
            
            setOptions(formattedOptions);
        } else if (data.status === 'error') {
            throw new Error(data.message || 'Unknown error');
        } else {
            console.warn('Unexpected data format:', data);
            setOptions([]);
        }
    } catch (error) {
        console.error('Error fetching dropdown options:', error);
        setError(error.message);
        setOptions([]);
    } finally {
        setLoading(false);
    }
};
        
        fetchOptions();
    }, [category, parentCategory]);

    return {
        options,
        loading,
        error
    };
};
