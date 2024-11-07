import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateSheetModal = ({ isOpen, onClose, onCreate, isCreating }) => {
    const [sheetName, setSheetName] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({ name: sheetName, description });
    };

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
                        marginBottom: '24px',
                        textAlign: 'center',
                    }}
                >
                    إنشاء جدول جديد
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label
                            style={{
                                display: 'block',
                                color: '#2d3748',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '8px',
                            }}
                        >
                            اسم الجدول<span style={{ color: '#e53e3e' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={sheetName}
                            onChange={(e) => setSheetName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #cbd5e0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                color: '#4a5568',
                                outline: 'none',
                                backgroundColor: '#fff',
                            }}
                            required
                            placeholder="أدخل اسم الجدول"
                            onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e0')}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label
                            style={{
                                display: 'block',
                                color: '#2d3748',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '8px',
                            }}
                        >
                            الوصف
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #cbd5e0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                color: '#4a5568',
                                outline: 'none',
                                resize: 'vertical',
                                minHeight: '80px',
                                backgroundColor: '#fff',
                            }}
                            placeholder="أدخل وصف الجدول (اختياري)"
                            onFocus={(e) => (e.target.style.borderColor = '#3182ce')}
                            onBlur={(e) => (e.target.style.borderColor = '#cbd5e0')}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                color: '#718096',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#4a5568')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#718096')}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                color: '#fff',
                                backgroundColor: '#4299e1',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isCreating ? 'not-allowed' : 'pointer',
                                opacity: isCreating ? '0.6' : '1',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (!isCreating) e.currentTarget.style.backgroundColor = '#3182ce';
                            }}
                            onMouseLeave={(e) => {
                                if (!isCreating) e.currentTarget.style.backgroundColor = '#4299e1';
                            }}
                        >
                            {isCreating ? 'جاري الإنشاء...' : 'إنشاء'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSheetModal;
