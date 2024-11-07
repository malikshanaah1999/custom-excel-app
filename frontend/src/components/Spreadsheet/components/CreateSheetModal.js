// src/components/Spreadsheet/components/CreateSheetModal.js

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{ direction: 'rtl' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        إنشاء جدول جديد
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            اسم الجدول*
                        </label>
                        <input
                            type="text"
                            value={sheetName}
                            onChange={(e) => setSheetName(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                            placeholder="أدخل اسم الجدول"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            الوصف
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            rows="3"
                            placeholder="أدخل وصف الجدول (اختياري)"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
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