// src/hooks/useDropdownOptions.js
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../../config/api';

export const useDropdownOptions = (category, parentCategory = null) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Define fetchOptions using useCallback
    // src/hooks/useDropdownOptions.js
// Update the mapping of API response:

const fetchOptions = useCallback(async () => {
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
            throw new Error('Failed to fetch options');
        }
        
        const data = await response.json();
        
        // Update mapping based on response structure
        setOptions(data.map(option => ({
            id: option.id,
            value: option.name || option.value, // Add fallback
            label: option.name || option.value  // Add fallback
        })));
    } catch (error) {
        setError(error.message);
        setOptions([]);
    } finally {
        setLoading(false);
    }
}, [category, parentCategory]);

    const refreshOptions = useCallback(() => {
        setLastUpdate(Date.now());
    }, []);

    // Use fetchOptions in useEffect
    useEffect(() => {
        fetchOptions();
    }, [fetchOptions, lastUpdate]);

    return {
        options,
        loading,
        error,
        refreshOptions
    };
};