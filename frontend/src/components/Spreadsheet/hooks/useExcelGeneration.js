// src/components/Spreadsheet/hooks/useExcelGeneration.js

import { useState, useCallback } from 'react';
import { generateExcelFiles } from '../utils/excelGenerator';

const useExcelGeneration = (showNotification) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = useCallback(async (data) => {
        setIsGenerating(true);
        try {
            console.log('Starting file generation with data:', data);
            
            if (!data || data.length === 0) {
                throw new Error('No data available to generate file');
            }

            // Filter out empty rows before processing
            const cleanData = data.filter(row => 
                row && row.some(cell => (cell ?? '').toString().trim() !== '')
            );

            console.log('Cleaned data for processing:', cleanData);

            if (cleanData.length === 0) {
                throw new Error('No valid data after cleaning');
            }

            await generateExcelFiles(cleanData);
            showNotification('تم توليد الملف بنجاح', 'success');
        } catch (error) {
            console.error('Detailed error in handleGenerate:', error);
            showNotification(`فشل في توليد الملف: ${error.message}`, 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [showNotification]);

    return {
        isGenerating,
        handleGenerate
    };
};

export default useExcelGeneration;