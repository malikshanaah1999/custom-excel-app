// src/hooks/useDropdownOptions.js
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../../config/api';

// src/hooks/useDropdownOptions.js
export const useDropdownOptions = (category, parentCategory = null) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOptions = useCallback(async () => {
        if (!category) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Add logging
            console.log('Fetching options for:', category, 'parent:', parentCategory);
            
            let url = `${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(category)}`;
            if (parentCategory) {
                url += `?parent_category=${encodeURIComponent(parentCategory)}`;
            }

            console.log('Fetching from URL:', url);

            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch options');
            }
            
            const data = await response.json();
            console.log('Received data:', data);

            setOptions(data.map(option => ({
                id: option.id,
                value: option.name || option.value,
                label: option.name || option.value
            })));
        } catch (error) {
            console.error('Error fetching options:', error);
            setError(error.message);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [category, parentCategory]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    return { options, loading, error };
};