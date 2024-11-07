import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, FileX } from 'lucide-react';
import useSheets from '../hooks/useSheets';
import useNotification from '../hooks/useNotification';
import SheetCard from '../components/SheetCard';
import CreateSheetModal from '../components/CreateSheetModal';
import Notification from '../components/Notification';
import DeleteSheetModal from '../components/DeleteSheetModal';

const HomePage = () => {
    const { notification, showNotification } = useNotification();
    const { 
        sheets, 
        isLoading, 
        isCreating, 
        isDeleting,
        fetchSheets, 
        createSheet,
        deleteSheet
    } = useSheets(showNotification);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sheetToDelete, setSheetToDelete] = useState(null);

    useEffect(() => {
        fetchSheets();
    }, [fetchSheets]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            fetchSheets(value);
        } else {
            fetchSheets();
        }
    };

    const handleCreateSheet = async (sheetData) => {
        const sheetId = await createSheet(sheetData);
        if (sheetId) {
            setShowCreateModal(false);
        }
    };

    const handleDeleteSheet = async () => {
        if (sheetToDelete) {
            const success = await deleteSheet(sheetToDelete.id);
            if (success) {
                setSheetToDelete(null);
            }
        }
    };

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', backgroundColor: '#f7fafc' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748' }}>الجداول</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#4299e1',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4299e1'}
                >
                    <Plus size={20} color="#fff" />
                    جدول جديد
                </button>
            </div>

            {/* Search Bar */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    marginBottom: '24px',
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        width: '30%',
                    }}
                >
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="البحث عن جدول..."
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 40px', // Adjusted padding to prevent overlap
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: '#4a5568',
                            backgroundColor: '#fff',
                            outline: 'none',
                            direction: 'rtl',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3182ce';
                            e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.3)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '12px',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: '#a0aec0',
                        }}
                    >
                        <Search size={20} />
                    </div>
                </div>
            </div>

            {/* Sheets Grid with Loading State */}
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Loader2 size={48} style={{ color: '#4299e1', animation: 'spin 2s linear infinite' }} />
                </div>
            ) : sheets.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {sheets.map(sheet => (
                        <SheetCard 
                            key={sheet.id} 
                            sheet={sheet} 
                            onDelete={setSheetToDelete}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#718096', padding: '48px 0' }}>
                    <FileX size={48} color="#cbd5e0" />
                    <p style={{ marginTop: '16px', fontSize: '18px' }}>
                        {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد جداول. أنشئ جدولاً جديداً للبدء!'}
                    </p>
                </div>
            )}

            {/* Modals */}
            <CreateSheetModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateSheet}
                isCreating={isCreating}
            />

            <DeleteSheetModal
                isOpen={!!sheetToDelete}
                onClose={() => setSheetToDelete(null)}
                onConfirm={handleDeleteSheet}
                sheetName={sheetToDelete?.name}
                isDeleting={isDeleting}
            />

            {/* Notifications */}
            <Notification notification={notification} />
        </div>
    );
};

export default HomePage;
