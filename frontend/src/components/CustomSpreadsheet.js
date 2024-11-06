import React, { useState, useEffect, useCallback } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { Loader2, Trash2 } from 'lucide-react';
import Handsontable from 'handsontable';

const CustomSpreadsheet = () => {
    const [data, setData] = useState([Array(17).fill('')]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [hotInstance, setHotInstance] = useState(null);
    const columns = [
        { data: 0, type: 'text', title: 'الرقم', width: 100 },
        { data: 1, type: 'text', title: 'الاسم', width: 120 },
        { data: 2, type: 'text', title: 'السعر', width: 100 },
        { data: 3, type: 'text', title: 'الشركة المنتجة', width: 120 },
        { data: 4, type: 'text', title: 'التصنيف', width: 100 },
        { data: 5, type: 'text', title: 'باركود الحبة', width: 120 },
        { data: 6, type: 'text', title: 'وحدة القياس', width: 100 },
        { data: 7, type: 'text', title: 'وحدة القياس التعبئة', width: 120 },
        { data: 8, type: 'text', title: 'التعبئة', width: 100 },
        { data: 9, type: 'text', title: 'Product Category', width: 120 },
        { data: 10, type: 'text', title: 'Product Type', width: 120 },
        { data: 11, type: 'text', title: 'Can be Purchased', width: 120 },
        { data: 12, type: 'text', title: 'Can be Sold', width: 100 },
        { data: 13, type: 'text', title: 'Invoicing Policy', width: 120 },
        { data: 14, type: 'text', title: 'pos', width: 100 },
        { data: 15, type: 'text', title: 'مشتريات', width: 100 },
        { data: 16, type: 'text', title: 'مبيعات', width: 100 }
    ];

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/data');
            const result = await response.json();
            
            if (response.ok) {
                const cleanedData = (result.data || [])
                    .filter(row => row && row.some(cell => (cell ?? '').toString().trim() !== ''))
                    .map(row => {
                        const cleanRow = row.map(cell => (cell ?? '').toString().trim());
                        while (cleanRow.length < 17) cleanRow.push('');
                        return cleanRow.slice(0, 17);
                    });
    
                setData(cleanedData.length > 0 ? cleanedData : [Array(17).fill('')]);
                
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
    };

    const deleteRow = async (rowIndex) => {
        try {
            setIsLoading(true);
    
            // Validate row index
            if (rowIndex < 0 || rowIndex >= data.length) {
                showNotification('خطأ في تحديد السجل', 'error');
                setShowDeleteConfirm(false);
                return;
            }
    
            // Check if the current row is empty
            const isCurrentRowEmpty = !data[rowIndex] || !data[rowIndex].some(cell => (cell ?? '').toString().trim() !== '');
    
            // Check if it's the last row AND it's empty
            if (data.length === 1 && isCurrentRowEmpty) {
                showNotification('يجب أن تحتوي الورقة على سجل واحد على الأقل', 'warning');
                setShowDeleteConfirm(false);
                return;
            }
    
            // If it's the last row with data, delete from backend first then clear in frontend
            if (data.length === 1 && !isCurrentRowEmpty) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/delete-row/${rowIndex}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const result = await response.json();
    
                    if (response.ok && result.status === 'success') {
                        setData([Array(17).fill('')]);
                        showNotification('تم حذف بيانات السجل');
                        setSelectedRow(null);
                        setShowDeleteConfirm(false);
                        setHasChanges(true);
    
                        // Update debug info
                        setDebugInfo(prev => ({
                            ...prev,
                            recordCount: 1,
                            lastSavedId: result.id,
                            timestamp: new Date().toLocaleString()
                        }));
                    } else {
                        throw new Error(result.message || 'Failed to delete record');
                    }
                } catch (error) {
                    console.error('Error deleting last record:', error);
                    showNotification('فشل حذف السجل', 'error');
                }
                return;
            }
    
            // Handle empty row deletion (UI only)
            if (isCurrentRowEmpty && data.length > 1) {
                setData(prev => {
                    const newData = [...prev];
                    newData.splice(rowIndex, 1);
                    return newData.length === 0 ? [Array(17).fill('')] : newData;
                });
                showNotification('تم حذف السجل بنجاح');
                setSelectedRow(null);
                setShowDeleteConfirm(false);
                setHasChanges(true);
                return;
            }
    
            // For non-empty rows, proceed with backend deletion
            const response = await fetch(`http://127.0.0.1:5000/delete-row/${rowIndex}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
    
            if (response.ok && result.status === 'success') {
                let newData = Array.isArray(result.data) ? result.data : [];
                
                // Ensure we always have at least one row
                if (newData.length === 0) {
                    newData = [Array(17).fill('')];
                }
    
                // Clean the data to ensure consistent format
                newData = newData.map(row => {
                    if (!Array.isArray(row)) return Array(17).fill('');
                    const cleanRow = row.map(cell => (cell ?? '').toString().trim());
                    while (cleanRow.length < 17) cleanRow.push('');
                    return cleanRow.slice(0, 17);
                });
    
                setData(newData);
                showNotification('تم حذف السجل بنجاح');
                setSelectedRow(null);
                setShowDeleteConfirm(false);
                setHasChanges(true);
    
                // Update debug info if available
                if (result.id) {
                    setDebugInfo(prev => ({
                        ...prev,
                        recordCount: newData.length,
                        lastSavedId: result.id,
                        timestamp: new Date().toLocaleString()
                    }));
                }
            } else {
                throw new Error(result.message || 'Failed to delete record');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            showNotification('فشل حذف السجل', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const saveData = async (forceUpdate = false) => {
        if (!hasChanges && !forceUpdate) return;
    
        setIsSaving(true);
        try {
            const cleanData = data
                .filter(row => row.some(cell => (cell ?? '').toString().trim() !== ''))
                .map(row => {
                    const cleanRow = [...row];
                    while (cleanRow.length < 17) cleanRow.push('');
                    return cleanRow.slice(0, 17);
                });
    
            const response = await fetch('http://127.0.0.1:5000/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: cleanData }),
            });
    
            if (response.ok) {
                showNotification('تم حفظ البيانات بنجاح');
                setHasChanges(false);
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            showNotification('فشل حفظ البيانات. يرجى المحاولة مرة أخرى.', 'error');
            console.error('Error saving data:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' && selectedRow !== null) {
                e.preventDefault();
                if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
                    deleteRow(selectedRow);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedRow]);

    const hotSettings = {
        data: data,
        columns: columns,
        colHeaders: columns.map(col => col.title),
        rowHeaders: true,
        height: 'auto',
        minRows: 5,
        width: '100%',
        licenseKey: 'non-commercial-and-evaluation',
        stretchH: 'all',
        className: 'custom-table rtl-table',
        language: 'ar-AR',
        layoutDirection: 'rtl',
        renderAllRows: true,
        manualColumnResize: true,
        manualRowResize: true,
        outsideClickDeselects: false,
        selectionMode: 'single',
        fillHandle: false,
        dropdownMenu: true,
        filters: true,
        columnSorting: true,
        minSpareRows: 0,
        minRows: data.length || 1,
        contextMenu: {
            items: {
                'delete_row': {
                    name: 'حذف السجل',
                    callback: function(key, selection) {
                        const row = selection[0].start.row;
                        if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
                            deleteRow(row);
                        }
                    }
                },
                'separator1': '---------',
                'row_above': {
                    name: 'إضافة سجل فوق'
                },
                'row_below': {
                    name: 'إضافة سجل تحت'
                },
                'separator2': '---------',
                'copy': {
                    name: 'نسخ'
                },
                'cut': {
                    name: 'قص'
                }
            }
        },

        afterInit: function() {
            setHotInstance(this);
        },

        afterSelection: (row, col, row2, col2) => {
            setSelectedRow(row);
        },

        afterDeselect: () => {
            setSelectedRow(null);
        },

        afterChange: (changes, source) => {
            if (!changes) return;
            
            if (source === 'edit') {
                setHasChanges(true);
            }
        },
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span style={{ marginRight: '10px' }}>جاري تحميل البيانات...</span>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#f7fafc', minHeight: '100vh' }} dir="rtl">
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c5282', textAlign: 'center', width: '100%' }}>
    Odoo Task Automation - Custom Spreadsheet
</h2>

                    <button 
                        onClick={() => saveData(true)}
                        disabled={isSaving}
                        style={{
                            backgroundColor: isSaving ? '#a0aec0' : '#3182ce',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                </div>

                {debugInfo && (
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ebf8ff', borderRadius: '8px', color: '#2b6cb0' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#2d3748', marginBottom: '10px' }}>معلومات التصحيح:</h3>
                        <p>آخر معرف تم حفظه: {debugInfo.lastSavedId}</p>
                        <p>عدد السجلات الحالية: {debugInfo.recordCount}</p>
                        <p>آخر تحديث: {debugInfo.timestamp}</p>
                    </div>
                )}

                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
                    <HotTable {...hotSettings} />
                    {selectedRow !== null && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{
                                position: 'absolute',
                                left: '10px',
                                top: `${43 + selectedRow * 23}px`,
                                backgroundColor: '#fed7d7',
                                color: '#c53030',
                                padding: '5px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button 
                        onClick={() => {
                            const newRow = Array(17).fill('');
                            setData(prev => prev.length === 0 ? [newRow] : [...prev, newRow]);
                            setHasChanges(true);
                        }}
                        style={{
                            backgroundColor: '#48bb78',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        إضافة سجل جديد
                    </button>
                </div>
            </div>

            {showDeleteConfirm && (
    <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    }}>
        <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            textAlign: 'center'
        }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>تأكيد الحذف</h3>
            <p style={{ marginBottom: '20px', color: '#4a5568' }}>
                {data.length === 1 && !data[0].some(cell => (cell ?? '').toString().trim() !== '')
                    ? 'لا يمكن حذف السجل الأخير. يجب أن تحتوي الورقة على سجل واحد على الأقل'
                    : 'هل أنت متأكد من حذف هذا السجل؟'
                }
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    إلغاء
                </button>
                {(data.length > 1 || data[0].some(cell => (cell ?? '').toString().trim() !== '')) && ( // Only show delete button if not the last empty row
                    <button
                        onClick={() => deleteRow(selectedRow)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#e53e3e',
                            color: '#fff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        حذف
                    </button>
                )}
            </div>
        </div>
    </div>
)}



            {notification && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: notification.type === 'error' ? '#fed7d7' : '#c6f6d5',
                    color: notification.type === 'error' ? '#c53030' : '#276749',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s'
                }}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default CustomSpreadsheet;
