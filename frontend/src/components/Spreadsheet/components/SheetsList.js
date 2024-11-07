import React from 'react';
import SheetCard from './SheetCard';
import { Loader2 } from 'lucide-react';

const SheetsList = ({ sheets, isLoading, searchTerm }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!sheets.length) {
        return (
            <div className="text-center text-gray-600 py-16 bg-white rounded-lg shadow-sm">
                {searchTerm 
                    ? 'لا توجد نتائج للبحث'
                    : 'لا توجد جداول. أنشئ جدولاً جديداً للبدء!'
                }
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sheets.map(sheet => (
                <SheetCard key={sheet.id} sheet={sheet} />
            ))}
        </div>
    );
};

export default SheetsList;
