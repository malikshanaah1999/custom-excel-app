// src/components/Spreadsheet/components/DeleteConfirmModal.js

import React from 'react';

const DeleteConfirmModal = ({ 
    show, 
    onClose, 
    onConfirm, 
    isLastRow, 
    isEmptyRow 
}) => {
    if (!show) return null;

    return (
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
                    {isLastRow && isEmptyRow
                        ? 'لا يمكن حذف السجل الأخير. يجب أن تحتوي الورقة على سجل واحد على الأقل'
                        : 'هل أنت متأكد من حذف هذا السجل؟'
                    }
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button
                        onClick={onClose}
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
                    {(!isLastRow || !isEmptyRow) && (
                        <button
                            onClick={onConfirm}
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
    );
};

export default DeleteConfirmModal;