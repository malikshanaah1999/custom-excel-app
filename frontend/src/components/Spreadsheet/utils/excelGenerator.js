// src/components/Spreadsheet/utils/excelGenerator.js

import * as XLSX from 'xlsx';

export const generateExcelFiles = (data) => {
    try {
        // Debug log initial data
        console.log('Initial data:', data);

        // Validate input data
        if (!Array.isArray(data)) {
            throw new Error('Input data is not an array');
        }

        // Group records by "الرقم"
        const groupedRecords = data.reduce((acc, record, index) => {
            // Debug log each record being processed
            console.log('Processing record:', record);

            const productId = record[0]; // "الرقم" column
            if (!productId) {
                console.log('Skipping record with no product ID:', record);
                return acc;
            }

            if (!acc[productId]) {
                acc[productId] = [];
            }
            acc[productId].push({ ...record, originalIndex: index });
            return acc;
        }, {});

        // Debug log grouped records
        console.log('Grouped records:', groupedRecords);

        // Prepare data for both sheets
        const productsSheetData = [];
        const packagingSheetData = [];

        // Process each group
        Object.entries(groupedRecords).forEach(([productId, group]) => {
            console.log(`Processing group for product ID ${productId}:`, group);

            if (group.length === 1) {
                // If only one record, keep it in products sheet as is
                productsSheetData.push(group[0]);
            } else {
                // Keep first record in products sheet
                productsSheetData.push(group[0]);

                // Move specified columns of remaining records to packaging sheet
                // Update the packaging sheet data collection
            group.slice(1).forEach(record => {
                try {
                    packagingSheetData.push([
                        record[1],  // الاسم
                        record[13], // الباركود (updated index)
                        record[11], // وحدة القياس
                        record[10], // التعبئة (updated index)
                        'True',    // مشتريات (automatic True)
                        'True'     // مبيعات (automatic True)
                    ]);
                } catch (e) {
                    console.error('Error processing record for packaging sheet:', record, e);
                }
            });
            }
        });

        // Debug log prepared sheet data
        console.log('Products sheet data:', productsSheetData);
        console.log('Packaging sheet data:', packagingSheetData);

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Add المنتجات sheet with headers
        const productsHeaders = [
            'الرقم', 'الاسم', 'مفرق', 'التصنيف', 'علامات تصنيف المنتج',
            'category', 'POS Cat', 'الشركة المنتجة', 'اسم المورد', 'مصدر المنتج',
            'التعبئة', 'وحدة القياس', 'قياس التعبئة', 'الباركود', 'الحد الادنى',
            'الحد الاقصى', 'scales', 'Product Type', 'Can be Purchased',
            'Can be Sold', 'Invoicing Policy', 'ava.pos'
        ];

        const wsProducts = XLSX.utils.aoa_to_sheet([
            productsHeaders,
            ...productsSheetData.map(record => {
                const values = Array.isArray(record) ? record : Object.values(record);
                // Remove the last element if it's the originalIndex
                return values.filter((_, index) => index < productsHeaders.length);
            })
        ]);

        // Add التعبئة sheet with headers
        const packagingHeaders = [
            'الاسم', 'الباركود', 'وحدة القياس', 'التعبئة', 'مشتريات', 'مبيعات'
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