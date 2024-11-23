// src/hooks/useDropdownOptions.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

export const useDropdownOptions = (category, parentCategory = null) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            if (!category) return;
            
            setLoading(true);
            setError(null);
            
            try {
                let url = `${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(category)}`;

                if (parentCategory) {
                    url += `?parent_category=${encodeURIComponent(parentCategory)}`;
                }

                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }
                
                const data = await response.json();

                if (Array.isArray(data)) {
                    const formattedOptions = data.map(option => ({
                        id: option.id,
                        value: option.value,
                        label: option.value
                    }));
                    
                    setOptions(formattedOptions);
                } else {
                    console.warn('Received unexpected data format:', data);
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