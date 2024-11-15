// src/components/Spreadsheet/utils/excelGenerator.js

import * as XLSX from 'xlsx';
import { spreadsheetColumns } from '../config/columns';
export const generateExcelFiles = (data) => {
    try {
        // Import and use the same column order from spreadsheetColumns
        const productsHeaders = spreadsheetColumns.map(col => col.title);

        // Group records by "الرقم" (Product ID)
        const groupedRecords = data.reduce((acc, record) => {
            const productId = record[0];
            if (!productId) return acc;
            if (!acc[productId]) acc[productId] = [];
            acc[productId].push(record);
            return acc;
        }, {});

        const productsSheetData = [];
        const packagingSheetData = [];

        // Process each group
        Object.entries(groupedRecords).forEach(([productId, group]) => {
            if (group.length === 1) {
                // Single record - keep original order as is
                productsSheetData.push(group[0]);
            } else {
                // First record goes to products sheet as is
                productsSheetData.push(group[0]);

                // Additional records go to packaging sheet
                group.slice(1).forEach(record => {
                    packagingSheetData.push([
                        record[1],  // الاسم
                        record[12], // الباركود
                        record[7],  // وحدة القياس
                        record[6],  // التعبئة
                        'True',     // مشتريات
                        'True'      // مبيعات
                    ]);
                });
            }
        });

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Add المنتجات sheet with headers
        const wsProducts = XLSX.utils.aoa_to_sheet([
            productsHeaders,
            ...productsSheetData
        ]);

        // Add التعبئة sheet with headers
        const packagingHeaders = [
            'الاسم',
            'الباركود',
            'وحدة القياس',
            'التعبئة',
            'مشتريات',
            'مبيعات'
        ];

        const wsPackaging = XLSX.utils.aoa_to_sheet([
            packagingHeaders,
            ...packagingSheetData
        ]);

        // Add sheets to workbook
        XLSX.utils.book_append_sheet(wb, wsProducts, 'المنتجات');
        XLSX.utils.book_append_sheet(wb, wsPackaging, 'التعبئة');

        // Generate Excel file
        XLSX.writeFile(wb, 'products_and_packaging.xlsx');

        return true;
    } catch (error) {
        console.error('Error in generateExcelFiles:', error);
        throw error;
    }
};