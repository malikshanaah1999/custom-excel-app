// src/components/Spreadsheet/CustomSpreadsheet.js

import React, { useState } from 'react';
import { HotTable } from '@handsontable/react';
import { Loader2, Trash2 } from 'lucide-react';
import 'handsontable/dist/handsontable.full.min.css';

import useSpreadsheetData from '../Spreadsheet/hooks/useSpreadsheetData';
import useNotification from '../Spreadsheet/hooks/useNotification';
import useHotSettings from '../Spreadsheet/hooks/useHotSettings';

import DeleteConfirmModal from '../Spreadsheet/components/DeleteConfirmModal';
import DebugInfo from '../Spreadsheet/components/DebugInfo';
import LoadingSpinner from '../Spreadsheet/components/LoadingSpinner';
import Notification from '../Spreadsheet/components/Notification';
import SpreadsheetToolbar from '../Spreadsheet/components/SpreadsheetToolbar';

const CustomSpreadsheet = () => {
    const { notification, showNotification } = useNotification();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const {
        data,
        isLoading,
        isSaving,
        debugInfo,
        selectedRow,
        setSelectedRow,
        setHasChanges,
        saveData,
        deleteRow,
        addNewRow
    } = useSpreadsheetData(showNotification);

    const hotSettings = useHotSettings({
        data,
        setSelectedRow,
        setHasChanges,
        onDeleteRow: () => setShowDeleteConfirm(true)
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '20px', 
            backgroundColor: '#f7fafc', 
            minHeight: '100vh' 
        }} dir="rtl">
            <div style={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)', 
                padding: '20px', 
                border: '1px solid #e2e8f0' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px' 
                }}>
                    <h2 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#2c5282', 
                        textAlign: 'center', 
                        width: '100%' 
                    }}>
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

                <DebugInfo info={debugInfo} />

                <div style={{ 
                    position: 'relative', 
                    overflow: 'hidden', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' 
                }}>
                    <HotTable {...hotSettings()} />
                 

{selectedRow !== null && data.length > 0 && (
    <button
        onClick={() => setShowDeleteConfirm(true)}
        style={{
            position: 'absolute',
            right: '10px', // Changed from 'left' to 'right'
            top: `${43 + selectedRow * 23}px`,
            backgroundColor: '#fed7d7',
            color: '#c53030',
            padding: '5px',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            zIndex: 1000,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            width: '24px',
            height: '24px'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fecaca';
            e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fed7d7';
            e.currentTarget.style.transform = 'scale(1)';
        }}
    >
        <Trash2 size={16} />
    </button>
)}
                </div>

                <div style={{ 
                    marginTop: '20px', 
                    display: 'flex', 
                    justifyContent: 'center' 
                }}>
                    <button 
                        onClick={addNewRow}
                        style={{
                            backgroundColor: '#48bb78',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease',
                            border: 'none',
                            fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#38a169';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#48bb78';
                            e.currentTarget.style.transform = 'translateY(0)';
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
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                            تأكيد الحذف
                        </h3>
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
                            {(data.length > 1 || (data[0] && data[0].some(cell => (cell ?? '').toString().trim() !== ''))) && (
                                <button
                                    onClick={() => {
                                        deleteRow(selectedRow);
                                        setShowDeleteConfirm(false);
                                    }}
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

            <Notification notification={notification} />
        </div>
    );
};

export default CustomSpreadsheet;