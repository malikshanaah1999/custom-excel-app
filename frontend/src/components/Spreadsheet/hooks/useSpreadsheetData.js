// src/components/Spreadsheet/hooks/useSpreadsheetData.js

import { useState, useCallback, useEffect } from 'react';
import { 
    fetchSpreadsheetData, 
    saveSpreadsheetData, 
    deleteSpreadsheetRow 
} from '../utils/apiHelpers';
import { cleanData, createEmptyRow, isRowEmpty } from '../utils/dataHelpers';
import { useParams } from 'react-router-dom';
const useSpreadsheetData = (showNotification) => {
    const [data, setData] = useState([createEmptyRow()]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [lastAutoSave, setLastAutoSave] = useState(null);
    const { id } = useParams(); // Get sheet ID from URL
    const [sheetInfo, setSheetInfo] = useState(null);
 
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://127.0.0.1:5000/data/${id}`);
            const result = await response.json();
            
            if (response.ok && result.status === 'success') {
                const cleanedData = cleanData(result.data || []);
                setData(cleanedData.length > 0 ? cleanedData : [createEmptyRow()]);
                
                setSheetInfo({
                    name: result.name,
                    description: result.description,
                    recordCount: cleanedData.length
                });

                if (result.id) {
                    setDebugInfo({
                        lastSavedId: result.id,
                        recordCount: cleanedData.length,
                        timestamp: new Date().toLocaleString()
                    });
                }
            } else {
                throw new Error(result.message || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('فشل تحميل البيانات', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [id, showNotification]); // Add dependencies

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Now fetchData is properly memoized

    const saveData = useCallback(async (forceUpdate = false) => {
        if (!hasChanges && !forceUpdate) return;

        setIsSaving(true);
        try {
            const cleanedData = cleanData(data);
            const response = await fetch(`http://127.0.0.1:5000/save/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: cleanedData }),
            });

            const result = await response.json();
            
            if (response.ok && result.status === 'success') {
                showNotification('تم حفظ البيانات بنجاح');
                setHasChanges(false);
                
                const now = new Date();
                setDebugInfo(prev => ({
                    ...prev,
                    lastSavedId: result.id,
                    timestamp: now.toLocaleString(),
                    lastAutoSave: now
                }));
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            showNotification('فشل حفظ البيانات. يرجى المحاولة مرة أخرى.', 'error');
            console.error('Error saving data:', error);
        } finally {
            setIsSaving(false);
        }
    }, [data, hasChanges, id, showNotification]); // Add all dependencies


    // src/components/Spreadsheet/hooks/useSpreadsheetData.js

const deleteRow = useCallback(async (rowIndex) => {
    try {
        setIsLoading(true);

        // Validate row index
        if (rowIndex < 0 || rowIndex >= data.length) {
            showNotification('خطأ في تحديد السجل', 'error');
            return;
        }

        const isCurrentRowEmpty = !data[rowIndex] || !data[rowIndex].some(cell => (cell ?? '').toString().trim() !== '');

        // Check if it's the last row AND it's empty
        if (data.length === 1 && isCurrentRowEmpty) {
            showNotification('يجب أن تحتوي الورقة على سجل واحد على الأقل', 'warning');
            return;
        }

        // Handle UI-only deletion for auto-filled or empty rows
        if ((isCurrentRowEmpty && data.length > 1) || !data[rowIndex][0]) {
            setData(prev => {
                const newData = [...prev];
                newData.splice(rowIndex, 1);
                return newData.length === 0 ? [Array(17).fill('')] : newData;
            });
            showNotification('تم حذف السجل بنجاح');
            setSelectedRow(null);
            setHasChanges(true);
            return;
        }

        // If it's the last row with data, handle both UI and backend
        if (data.length === 1 && !isCurrentRowEmpty) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/delete-row/${rowIndex}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    setData([Array(17).fill('')]);
                    showNotification('تم حذف بيانات السجل');
                    setSelectedRow(null);
                    setHasChanges(true);
                } else {
                    throw new Error('Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting last record:', error);
                // Even if backend fails, still clear the UI for better UX
                setData([Array(17).fill('')]);
                showNotification('تم حذف السجل محلياً', 'warning');
            }
            return;
        }

        // Handle regular deletion with backend sync
        try {
            const response = await fetch(`http://127.0.0.1:5000/delete-row/${rowIndex}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                let newData = Array.isArray(result.data) ? result.data : [];
                
                if (newData.length === 0) {
                    newData = [Array(17).fill('')];
                }

                // Clean the data
                newData = newData.map(row => {
                    if (!Array.isArray(row)) return Array(17).fill('');
                    const cleanRow = row.map(cell => (cell ?? '').toString().trim());
                    while (cleanRow.length < 17) cleanRow.push('');
                    return cleanRow.slice(0, 17);
                });

                setData(newData);
                showNotification('تم حذف السجل بنجاح');
                setHasChanges(true);
            } else {
                // If backend delete fails, still remove from UI
                setData(prev => {
                    const newData = [...prev];
                    newData.splice(rowIndex, 1);
                    return newData.length === 0 ? [Array(17).fill('')] : newData;
                });
                showNotification('تم حذف السجل محلياً', 'warning');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            // Still remove from UI even if backend fails
            setData(prev => {
                const newData = [...prev];
                newData.splice(rowIndex, 1);
                return newData.length === 0 ? [Array(17).fill('')] : newData;
            });
            showNotification('تم حذف السجل محلياً', 'warning');
        }
    } finally {
        setIsLoading(false);
        setSelectedRow(null);
    }
}, [data, setData, setSelectedRow, setHasChanges, showNotification]);

const addNewRow = useCallback(() => {
    setData(prev => [...prev, createEmptyRow()]);
    setHasChanges(true);
}, []);

// Auto-save effect
useEffect(() => {
    const interval = setInterval(() => {
        if (hasChanges) {
            saveData();
        }
    }, 60000); // Auto-save every minute

    return () => clearInterval(interval);
}, [hasChanges, saveData]);

return {
    data,
    setData,
    isLoading,
    isSaving,
    debugInfo,
    selectedRow,
    setSelectedRow,
    setHasChanges,
    saveData,
    deleteRow,
    addNewRow,
    sheetInfo
};
};

export default useSpreadsheetData;