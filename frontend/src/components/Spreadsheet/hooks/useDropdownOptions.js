// src/hooks/useDropdownOptions.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
export const useDropdownOptions = (category) => {
    const [options, setOptions] = useState([]);
    
    useEffect(() => {
        const fetchOptions = async () => {
            if (!category) return;
            
            try {
                console.log('Fetching options for category:', category);
                const response = await fetch(`${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(category)}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Received data:', data);
                
                if (Array.isArray(data)) {
                    const formattedOptions = data
                        .filter(option => option && option.value)
                        .map(option => ({
                            id: option.id,
                            value: option.value,
                            label: option.value
                        }));
                    
                    console.log('Formatted options:', formattedOptions);
                    setOptions(formattedOptions);
                } else {
                    console.warn('Received non-array data:', data);
                    setOptions([]);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                setOptions([]);
            }
        };
        
        fetchOptions();
    }, [category]);
    
    return options;
};