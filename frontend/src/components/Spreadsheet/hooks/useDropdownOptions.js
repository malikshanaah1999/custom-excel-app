// src/hooks/useDropdownOptions.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

export const useDropdownOptions = (category) => {
    const [options, setOptions] = useState([]);
    
    useEffect(() => {
        const fetchOptions = async () => {
            if (!category) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(category)}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Fetched options:', data); // <-- Add this line
                
                if (Array.isArray(data)) {
                    const formattedOptions = data.map(option => {
                        // Ensure we're accessing the correct properties
                        if (!option || !option.value) {
                            console.warn('Invalid option:', option);
                            return null;
                        }
                        return {
                            id: option.id,
                            value: option.value,
                            label: option.value
                        };
                    }).filter(Boolean); // Remove any null values
                    
                    setOptions(formattedOptions);
                } else {
                    console.error('Received non-array data:', data);
                    setOptions([]);
                }
            } catch (error) {
                console.error('Failed to fetch options:', error);
                setOptions([]);
            }
        };
        
        fetchOptions();
    }, [category]);
    
    return options;
};
