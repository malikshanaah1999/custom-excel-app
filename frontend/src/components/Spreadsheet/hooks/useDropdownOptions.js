// src/hooks/useDropdownOptions.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

export const useDropdownOptions = (category) => {
    const [options, setOptions] = useState([]);
    
    useEffect(() => {
        const fetchOptions = async () => {
            if (!category) {
                console.log('No category provided');
                return;
            }
            
            try {
                const url = `${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(category)}`;
                console.log('Fetching options from:', url);
                
                const response = await fetch(url);
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Raw data received:', data);
                
                if (Array.isArray(data)) {
                    const formattedOptions = data.map(option => {
                        if (!option || !option.value) {
                            console.warn('Invalid option:', option);
                            return null;
                        }
                        const formatted = {
                            id: option.id,
                            value: option.value,
                            label: option.value
                        };
                        console.log('Formatted option:', formatted);
                        return formatted;
                    }).filter(Boolean);
                    
                    console.log('Setting options:', formattedOptions);
                    setOptions(formattedOptions);
                } else {
                    console.error('Received non-array data:', data);
                    setOptions([]);
                }
            } catch (error) {
                console.error('Failed to fetch options:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                setOptions([]);
            }
        };
        
        fetchOptions();
    }, [category]);
    
    console.log('Current options for category:', category, options);
    return options;
};