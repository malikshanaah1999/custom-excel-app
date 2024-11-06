// src/components/Spreadsheet/hooks/useHotSettings.js

import { useCallback } from 'react';
import { spreadsheetColumns } from '../config/columns';

const useHotSettings = ({
    data,
    setData,
    setSelectedRow,
    setHasChanges,
    onDeleteRow,
    showNotification
}) => {
    const getHotSettings = useCallback(() => ({
        data: data,
        columns: spreadsheetColumns,
        colHeaders: spreadsheetColumns.map(col => col.title),
        rowHeaders: true,
        height: 'auto',
        minRows: 5,
        width: '100%',
        licenseKey: 'non-commercial-and-evaluation',
        stretchH: 'all',
        className: 'custom-table rtl-table',
        language: 'ar-AR',
        layoutDirection: 'rtl',
        renderAllRows: true,
        manualColumnResize: true,
        manualRowResize: true,
        outsideClickDeselects: false,
        selectionMode: 'single',
        fillHandle: false,
        dropdownMenu: true,
        filters: true,
        columnSorting: true,
        minSpareRows: 0,
        minRows: data.length || 1,
        
        contextMenu: {
            items: {
                'delete_row': {
                    name: 'حذف السجل',
                    callback: (key, selection) => {
                        const row = selection[0].start.row;
                        onDeleteRow(row);
                    }
                },
                'separator1': '---------',
                'row_above': {
                    name: 'إضافة سجل فوق'
                },
                'row_below': {
                    name: 'إضافة سجل تحت'
                },
                'separator2': '---------',
                'copy': {
                    name: 'نسخ'
                },
                'cut': {
                    name: 'قص'
                }
            }
        },

        afterInit: function() {
            this.validateCells();
        },

        afterSelection: (row, col, row2, col2) => {
            setSelectedRow(row);
        },

        afterDeselect: () => {
            setSelectedRow(null);
        },

        afterChange: (changes, source) => {
            if (!changes || source !== 'edit') return;
            
            setHasChanges(true);
            
            changes.forEach(([row, prop, oldValue, newValue]) => {
                // Check if change is in the "الرقم" column (index 0)
                if (prop === 0 && newValue !== oldValue && newValue !== '') {
                    try {
                        // Find existing row with the same "الرقم" value
                        const existingRow = data.find((r, index) => 
                            index !== row && 
                            Array.isArray(r) && 
                            r[0] === newValue
                        );

                        if (existingRow) {
                            // Create new row based on existing data
                            const newRowData = [...existingRow];

                            // Clear specific fields
                            // Indices for: باركود الحبة, وحدة القياس, وحدة القياس التعبئة, التعبئة
                            const fieldsToClear = [5, 6, 7, 8];
                            fieldsToClear.forEach(index => {
                                newRowData[index] = '';
                            });

                            // Ensure row has all 17 columns
                            while (newRowData.length < 17) {
                                newRowData.push('');
                            }

                            // Update the current row with the new data
                            setData(prevData => {
                                const updatedData = [...prevData];
                                updatedData[row] = newRowData.slice(0, 17); // Ensure exactly 17 columns
                                return updatedData;
                            });

                            // Show success notification
                            showNotification('تم تعبئة البيانات تلقائياً', 'success');
                        }
                    } catch (error) {
                        console.error('Error during auto-fill:', error);
                        showNotification('حدث خطأ أثناء تعبئة البيانات', 'error');
                    }
                }
            });
        },

        beforeChange: (changes, source) => {
            if (!changes || source !== 'edit') return;

            // Validate and clean data before applying changes
            changes.forEach(change => {
                const [, , , newValue] = change;
                // Convert null/undefined to empty string
                if (newValue === null || newValue === undefined) {
                    change[3] = '';
                }
                // Trim whitespace
                if (typeof newValue === 'string') {
                    change[3] = newValue.trim();
                }
            });
        },

        afterRemoveRow: (index, amount) => {
            setHasChanges(true);
        },

        afterCreateRow: (index, amount) => {
            setHasChanges(true);
        },

        cells: function(row, col) {
            const cellProperties = {};
            
            // Make the "الرقم" column (index 0) required
            if (col === 0) {
                cellProperties.allowEmpty = false;
            }

            return cellProperties;
        }
    }), [data, setData, setSelectedRow, setHasChanges, onDeleteRow, showNotification]);

    return getHotSettings;
};

export default useHotSettings;