import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import useSheets from '../hooks/useSheets';
import useNotification from '../hooks/useNotification';
import SheetCard from '../components/SheetCard';
import CreateSheetModal from '../components/CreateSheetModal';
import Notification from '../components/Notification';

const HomePage = () => {
    const { notification, showNotification } = useNotification();
    const { sheets, isLoading, isCreating, fetchSheets, createSheet } = useSheets(showNotification);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

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

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-r from-blue-50 to-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-blue-700">📊 الجداول</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105"
                >
                    <Plus size={20} />
                    جدول جديد
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="البحث عن جدول..."
                    className="block w-full pr-10 py-3 border border-gray-300 rounded-full shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    style={{ direction: 'rtl' }}
                />
            </div>

            {/* Sheets Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                </div>
            ) : sheets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sheets.map(sheet => (
                        <SheetCard key={sheet.id} sheet={sheet} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-600 py-16 bg-white rounded-lg shadow-sm">
                    {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد جداول. أنشئ جدولاً جديداً للبدء!'}
                </div>
            )}

            {/* Create Sheet Modal */}
            <CreateSheetModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateSheet}
                isCreating={isCreating}
            />

            {/* Notification */}
            <Notification notification={notification} />
        </div>
    );
};

export default HomePage;
