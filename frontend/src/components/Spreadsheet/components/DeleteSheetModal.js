import React from 'react';
import { X } from 'lucide-react';

const DeleteSheetModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    sheetName,
    isDeleting 
}) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '50',
            }}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '24px',
                    width: '100%',
                    maxWidth: '500px',
                    direction: 'rtl',
                    position: 'relative',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        left: '16px',
                        top: '16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#718096',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#4a5568')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#718096')}
                >
                    <X size={20} />
                </button>

                <h2
                    style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#2d3748',
                        marginBottom: '16px',
                        textAlign: 'center',
                    }}
                >
                    تأكيد حذف الجدول
                </h2>

                <p
                    style={{
                        color: '#4a5568',
                        fontSize: '16px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        lineHeight: '1.5',
                    }}
                >
                    هل أنت متأكد من حذف الجدول "<span style={{ fontWeight: 'bold' }}>{sheetName}</span>"؟
                    <br />
                    لا يمكن التراجع عن هذا الإجراء.
                </p>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            color: '#718096',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isDeleting) e.currentTarget.style.color = '#4a5568';
                        }}
                        onMouseLeave={(e) => {
                            if (!isDeleting) e.currentTarget.style.color = '#718096';
                        }}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            color: '#fff',
                            backgroundColor: '#e53e3e',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            opacity: isDeleting ? '0.6' : '1',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isDeleting) e.currentTarget.style.backgroundColor = '#c53030';
                        }}
                        onMouseLeave={(e) => {
                            if (!isDeleting) e.currentTarget.style.backgroundColor = '#e53e3e';
                        }}
                    >
                        {isDeleting ? 'جاري الحذف...' : 'حذف'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteSheetModal;
