import { useCallback, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { spreadsheetColumns } from '../config/columns';
import { createEmptyRow } from '../utils/dataHelpers';
const defaultValues = {
    'Product Type': 'Stockable Product',
    'Can be Purchased': 'True',
    'Can be Sold': 'True',
    'Invoicing Policy': 'Ordered quantities',
    'ava.pos': 'True'
};
const useHotSettings = ({
    data,
    setData,
    setSelectedRow,
    setHasChanges,
    onDeleteRow,
    showNotification
}) => {
 
    // Add this function to handle automatic values
    const ensureDefaultValues = useCallback((rowData) => {
        const newRowData = [...rowData];
        // Set default values for last 5 columns
        newRowData[17] = defaultValues['Product Type'];
        newRowData[18] = defaultValues['Can be Purchased'];
        newRowData[19] = defaultValues['Can be Sold'];
        newRowData[20] = defaultValues['Invoicing Policy'];
        newRowData[21] = defaultValues['ava.pos'];
        return newRowData;
    }, []);
    // Ensure default values are set when component mounts
    useEffect(() => {
        if (data && data.length > 0) {
            setData(prevData => 
                prevData.map(row => {
                    if (!row) return createEmptyRow();
                    return ensureDefaultValues([...row]);
                })
            );
        }
    }, [data, ensureDefaultValues]); // Add dependencies
    // Add barcode validation function
    const isBarcodeUnique = useCallback((barcode, currentRow) => {
        return !data.some((row, index) => 
            index !== currentRow && 
            row[12] === barcode && 
            barcode !== ''
        );
    }, [data]);

    // Update measurement unit validation function
    const canEditMinMax = useCallback((row) => {
        return row[7] === 'حبة' || row[8] === 'حبة';  // Updated from 11,12 to 7,8
    }, []);
    


    const getHotSettings = useCallback(() => ({
        data: data,
        columns: spreadsheetColumns,
        colHeaders: spreadsheetColumns.map(col => col.title),
        rowHeaders: true,
        height: '100%',
        width: '100%',
        licenseKey: 'non-commercial-and-evaluation',
        stretchH: 'all',
        className: 'custom-table rtl-table zebra-table',
        language: 'ar-AR',
        layoutDirection: 'rtl',
        renderAllRows: false,
        manualColumnResize: true,
        manualRowResize: false,
        outsideClickDeselects: false,
        selectionMode: 'single',
        fillHandle: false,
        dropdownMenu: true,
        filters: true,
        columnSorting: true,
        minSpareRows: 0,
        minRows: Math.max(20, data.length),
        rowHeights: 28,
        autoRowSize: false,
        autoColumnSize: false,
        viewportRowRenderingOffset: 20,
        enterMoves: { row: 1, col: 0 },
        wordWrap: false,
        autoWrapRow: true,
        autoWrapCol: true,
        
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

        // Update existing afterChange handler
        afterChange: (changes, source) => {
            if (!changes) return;

            changes.forEach(([row, prop, oldValue, newValue]) => {
                // Auto-fill logic for ID column
                if (prop === 0 && newValue !== oldValue && newValue !== '') {
                    try {
                        const existingRow = data.find((r, index) => 
                            index !== row && 
                            Array.isArray(r) && 
                            r[0] === newValue
                        );

                        if (existingRow) {
                            let newRowData = [...existingRow];
                            // Update indices for manual fields that should be cleared
                            const manualFields = [6, 7, 8, 12];  // These indices are now correct for:
                            // 6: التعبئة
                            // 7: وحدة القياس
                            // 8: قياس التعبئة
                            // 12: الباركود
                            manualFields.forEach(index => {
                                newRowData[index] = '';
                            });
                            
                            newRowData = ensureDefaultValues(newRowData);

                            setData(prevData => {
                                const updatedData = [...prevData];
                                updatedData[row] = newRowData.slice(0, 22);
                                return updatedData;
                            });

                            showNotification('تم تعبئة البيانات تلقائياً', 'success');
                        }
                    } catch (error) {
                        console.error('Error during auto-fill:', error);
                        showNotification('حدث خطأ أثناء تعبئة البيانات', 'error');
                    }
                }

                // Mutual fill for وحدة القياس and قياس التعبئة
                if ((prop === 7 || prop === 8) && newValue !== oldValue) {  // Updated from 11,12 to 7,8
                    setData(prevData => {
                        const updatedData = [...prevData];
                        if (newValue !== 'حبة' && updatedData[row][7] !== 'حبة' && updatedData[row][8] !== 'حبة') {
                            updatedData[row][13] = ''; // Clear Min (updated from 14)
                            updatedData[row][14] = ''; // Clear Max (updated from 15)
                        }
                        if (prop === 7) {
                            updatedData[row][8] = newValue;
                        } else {
                            updatedData[row][7] = newValue;
                        }
                        return updatedData;
                    });
                }

                // Mutual fill for category and POS Cat
                if ((prop === 3 || prop === 15) && newValue !== oldValue) {  // Updated from 5,6 to 3,15
                    setData(prevData => {
                        const updatedData = [...prevData];
                        if (prop === 3) {
                            updatedData[row][15] = newValue;
                        } else {
                            updatedData[row][3] = newValue;
                        }
                        return updatedData;
                    });
                }
            });
        },

        beforeChange: (changes) => {
            if (!changes) return;

            for (let i = changes.length - 1; i >= 0; i--) {
                const [row, prop, oldValue, newValue] = changes[i];

                // Barcode uniqueness validation
                if (prop === 12 && newValue !== oldValue) {  // Updated from 13 to 12
                    if (!isBarcodeUnique(newValue, row)) {
                        showNotification('لا يمكنك ادخال باركود موجود مسبقا', 'error');
                        changes.splice(i, 1);
                        continue;
                    }
                }

                // Min/Max validation based on measurement unit
                if ((prop === 13 || prop === 14) && newValue !== oldValue) {  // Updated from 14,15 to 13,14
                    if (!canEditMinMax(data[row])) {
                        showNotification('لا يمكن تعديل الحد الأدنى/الأقصى إلا عند اختيار وحدة القياس "حبة"', 'error');
                        changes.splice(i, 1);
                        continue;
                    }
                }
            }
        },

        afterRemoveRow: (index, amount) => {
            setHasChanges(true);
        },

        afterCreateRow: (index) => {
            setData(prevData => {
                const updatedData = [...prevData];
                updatedData[index] = ensureDefaultValues(createEmptyRow());
                return updatedData;
            });
        },
        beforeLoadData: (initialData) => {
            return initialData.map(row => {
                const filledRow = [...row];
                // Ensure last 5 columns have default values
                filledRow[17] = defaultValues['Product Type'];
                filledRow[18] = defaultValues['Can be Purchased'];
                filledRow[19] = defaultValues['Can be Sold'];
                filledRow[20] = defaultValues['Invoicing Policy'];
                filledRow[21] = defaultValues['ava.pos'];
                return filledRow;
            });
        },
        cells: function(row, col) {
            const cellProperties = {};
            
            if (col === 0) {
                cellProperties.allowEmpty = false;
                cellProperties.className = 'row-number-cell';
            }
            
            // Make last 5 columns read-only
            if (col >= 17 && col <= 21) {
                cellProperties.readOnly = true;  // Changed from false to true
            }
            
            cellProperties.className = `${cellProperties.className || ''} ${row % 2 === 0 ? 'even-row' : 'odd-row'}`;
            return cellProperties;
        },
        

    }),  [
        data, 
        setData, 
        setSelectedRow, 
        onDeleteRow, 
        showNotification, 
        isBarcodeUnique, 
        canEditMinMax,
        ensureDefaultValues,
        setHasChanges
    ]);

    return getHotSettings;
};

export default useHotSettings;