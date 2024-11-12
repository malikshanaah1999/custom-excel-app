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
            row[13] === barcode && 
            barcode !== ''
        );
    }, [data]);

    // Add measurement unit validation function
    const canEditMinMax = useCallback((row) => {
        return row[11] === 'حبة' || row[12] === 'حبة';
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
            if (!changes || source !== 'edit') return;
            
            setHasChanges(true);
            
            changes.forEach(([row, prop, oldValue, newValue]) => {
                // Existing auto-fill logic
                if (prop === 0 && newValue !== oldValue && newValue !== '') {
                    try {
                        const existingRow = data.find((r, index) => 
                            index !== row && 
                            Array.isArray(r) && 
                            r[0] === newValue
                        );

                        if (existingRow) {
                            let newRowData = [...existingRow];
                            const manualFields = [10, 11, 12, 13, 14, 15, 16];
                            manualFields.forEach(index => {
                                newRowData[index] = '';
                            });
                            
                            // Ensure default values for last 5 columns
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
                if ((prop === 11 || prop === 12) && newValue !== oldValue) {
                    setData(prevData => {
                        const updatedData = [...prevData];
                        if (newValue !== 'حبة' && updatedData[row][11] !== 'حبة' && updatedData[row][12] !== 'حبة') {
                            updatedData[row][14] = ''; // Clear Min
                            updatedData[row][15] = ''; // Clear Max
                        }
                        if (prop === 11) {
                            updatedData[row][12] = newValue; // Fill قياس التعبئة
                        } else {
                            updatedData[row][11] = newValue; // Fill وحدة القياس
                        }
                        return updatedData;
                    });
                }
        
                // Mutual fill for category and POS Cat
                if ((prop === 5 || prop === 6) && newValue !== oldValue) {
                    setData(prevData => {
                        const updatedData = [...prevData];
                        if (prop === 5) {
                            updatedData[row][6] = newValue; // Fill POS Cat
                        } else {
                            updatedData[row][5] = newValue; // Fill category
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
                if (prop === 13 && newValue !== oldValue) {
                    if (!isBarcodeUnique(newValue, row)) {
                        showNotification('لا يمكنك ادخال باركود موجود مسبقا', 'error');
                        changes.splice(i, 1);
                        continue;
                    }
                }

                // Min/Max validation based on measurement unit
                if ((prop === 14 || prop === 15) && newValue !== oldValue) {
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