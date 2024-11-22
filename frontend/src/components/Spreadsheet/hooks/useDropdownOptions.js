// src/hooks/useDropdownOptions.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

export const useDropdownOptions = (category) => {
    const [options, setOptions] = useState([]);
    
    useEffect(() => {
        const fetchOptions = async () => {
            if (!category) return;
            
            try {
                // Normalize the category name and encode properly
                const normalizedCategory = category.normalize('NFC');
                const encodedCategory = encodeURIComponent(normalizedCategory);
                const url = `${API_BASE_URL}/api/dropdown-options/${encodedCategory}`;
                
                console.log('Category:', {
                    original: category,
                    normalized: normalizedCategory,
                    encoded: encodedCategory,
                    url: url
                });

                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response not OK:', {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText
                    });
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Response data:', data);
                
                if (Array.isArray(data)) {
                    const formattedOptions = data
                        .filter(option => option && option.value)
                        .map(option => ({
                            id: option.id,
                            value: option.value.normalize('NFC'), // Normalize the value
                            label: option.value.normalize('NFC')  // Normalize the label
                        }));
                    
                    console.log('Formatted options:', formattedOptions);
                    setOptions(formattedOptions);
                } else {
                    console.warn('Data is not an array:', data);
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