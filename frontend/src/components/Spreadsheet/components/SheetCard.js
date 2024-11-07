import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileSpreadsheet } from 'lucide-react';

const SheetCard = ({ sheet }) => {
    const navigate = useNavigate();
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div 
            onClick={() => navigate(`/sheet/${sheet.id}`)}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-transform transform hover:scale-105 cursor-pointer border border-gray-200"
            style={{ direction: 'rtl' }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-blue-600" size={30} />
                    <h3 className="text-xl font-semibold text-gray-800">
                        {sheet.name}
                    </h3>
                </div>
                <span className="text-sm text-gray-500">
                    {sheet.record_count} سجلات
                </span>
            </div>
            
            {sheet.description && (
                <p className="text-gray-600 text-sm mb-4">
                    {sheet.description}
                </p>
            )}
            
            <div className="flex items-center text-gray-500 text-sm">
                <Calendar size={16} className="ml-2" />
                <span>آخر تحديث: {formatDate(sheet.updated_at)}</span>
            </div>
        </div>
    );
};

export default SheetCard;
