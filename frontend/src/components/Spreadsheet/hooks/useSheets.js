// src/components/Spreadsheet/hooks/useSheets.js

import { useState, useEffect, useCallback } from 'react';

const useSheets = (showNotification) => {
    const [sheets, setSheets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fetchSheets = useCallback(async (searchTerm = '') => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://127.0.0.1:5000/sheets?search=${encodeURIComponent(searchTerm)}`);
            const result = await response.json();
            
            if (result.status === 'success') {
                setSheets(result.sheets);
                // Only show empty message for search
                if (searchTerm && result.sheets.length === 0) {
                    showNotification('لا توجد نتائج للبحث', 'info');
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error fetching sheets:', error);
            // Only show error for non-search operations
            if (!searchTerm) {
                showNotification('حدث خطأ في جلب البيانات', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);
    const deleteSheet = useCallback(async (sheetId) => {
        try {
            setIsDeleting(true);
            const response = await fetch(`http://127.0.0.1:5000/sheets/${sheetId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok && result.status === 'success') {
                showNotification('تم حذف الجدول بنجاح', 'success');
                await fetchSheets();
                return true;
            } else {
                throw new Error(result.message || 'Failed to delete sheet');
            }
        } catch (error) {
            console.error('Error deleting sheet:', error);
            showNotification('فشل في حذف الجدول', 'error');
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [fetchSheets, showNotification]);
    const createSheet = useCallback(async (sheetData) => {
        try {
            setIsCreating(true);
            console.log('Creating sheet with data:', sheetData); // Debug log

            const response = await fetch('http://127.0.0.1:5000/sheets', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sheetData)
            });
            
            const result = await response.json();
            console.log('Server response:', result); // Debug log
            
            if (response.ok && result.status === 'success') {
                showNotification('تم إنشاء الجدول بنجاح', 'success');
                await fetchSheets();
                return result.id;
            } else {
                throw new Error(result.message || 'Failed to create sheet');
            }
        } catch (error) {
            console.error('Error creating sheet:', error);
            showNotification(error.message || 'فشل في إنشاء الجدول', 'error');
            return null;
        } finally {
            setIsCreating(false);
        }
    }, [fetchSheets, showNotification]);

    // Initial fetch
    useEffect(() => {
        fetchSheets();
    }, [fetchSheets]);

    return {
        sheets,
        isLoading,
        isCreating,
        isDeleting,
        fetchSheets,
        createSheet,
        deleteSheet
    };
};

export default useSheets;