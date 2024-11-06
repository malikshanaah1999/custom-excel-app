// src/components/Spreadsheet/hooks/useSpreadsheetData.js

import { useState, useCallback, useEffect } from 'react';
import { 
    fetchSpreadsheetData, 
    saveSpreadsheetData, 
    deleteSpreadsheetRow 
} from '../utils/apiHelpers';
import { cleanData, createEmptyRow, isRowEmpty } from '../utils/dataHelpers';

const useSpreadsheetData = (showNotification) => {
    const [data, setData] = useState([createEmptyRow()]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const result = await fetchSpreadsheetData();
            
            if (result.status === 'success') {
                const cleanedData = cleanData(result.data);
                setData(cleanedData.length > 0 ? cleanedData : [createEmptyRow()]);
                
                if (result.id) {
                    setDebugInfo({
                        lastSavedId: result.id,
                        recordCount: cleanedData.length,
                        timestamp: new Date().toLocaleString()
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('فشل تحميل البيانات', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    const saveData = useCallback(async (forceUpdate = false) => {
        if (!hasChanges && !forceUpdate) return;

        setIsSaving(true);
        try {
            const cleanedData = cleanData(data);
            const result = await saveSpreadsheetData(cleanedData);

            if (result.status === 'success') {
                showNotification('تم حفظ البيانات بنجاح');
                setHasChanges(false);
                
                // Update debug info
                if (result.id) {
                    setDebugInfo(prev => ({
                        ...prev,
                        lastSavedId: result.id,
                        timestamp: new Date().toLocaleString()
                    }));
                }
            }
        } catch (error) {
            console.error('Error saving data:', error);
            showNotification('فشل حفظ البيانات. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [data, hasChanges, showNotification]);

    const deleteRow = useCallback(async (rowIndex) => {
        try {
            setIsLoading(true);

            if (rowIndex < 0 || rowIndex >= data.length) {
                showNotification('خطأ في تحديد السجل', 'error');
                return;
            }

            const isCurrentRowEmpty = isRowEmpty(data[rowIndex]);

            // Handle last row case
            if (data.length === 1 && isCurrentRowEmpty) {
                showNotification('يجب أن تحتوي الورقة على سجل واحد على الأقل', 'warning');
                return;
            }

            // If it's the last row with data, delete from backend first
            if (data.length === 1 && !isCurrentRowEmpty) {
                const result = await deleteSpreadsheetRow(rowIndex);
                if (result.status === 'success') {
                    setData([createEmptyRow()]);
                    showNotification('تم حذف بيانات السجل');
                    setHasChanges(true);
                }
                return;
            }

            // Handle empty row deletion (UI only)
            if (isCurrentRowEmpty && data.length > 1) {
                setData(prev => {
                    const newData = [...prev];
                    newData.splice(rowIndex, 1);
                    return newData;
                });
                showNotification('تم حذف السجل بنجاح');
                setHasChanges(true);
                return;
            }

            // Handle regular row deletion
            const result = await deleteSpreadsheetRow(rowIndex);
            if (result.status === 'success') {
                const newData = cleanData(result.data);
                setData(newData.length > 0 ? newData : [createEmptyRow()]);
                showNotification('تم حذف السجل بنجاح');
                setHasChanges(true);
            }
        } catch (error) {
            console.error('Error deleting row:', error);
            showNotification('فشل حذف السجل', 'error');
        } finally {
            setIsLoading(false);
            setSelectedRow(null);
        }
    }, [data, showNotification]);

    const addNewRow = useCallback(() => {
        setData(prev => [...prev, createEmptyRow()]);
        setHasChanges(true);
    }, []);

    // Initial data load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        isLoading,
        isSaving,
        hasChanges,
        debugInfo,
        selectedRow,
        setSelectedRow,
        setHasChanges,
        saveData,
        deleteRow,
        addNewRow
    };
};

export default useSpreadsheetData;