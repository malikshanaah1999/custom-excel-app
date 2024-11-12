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

        afterChange: (changes, source) => {
            if (!changes || source !== 'edit') return;
            
            setHasChanges(true);
            
            changes.forEach(([row, prop, oldValue, newValue]) => {
                if (prop === 0 && newValue !== oldValue && newValue !== '') {
                    try {
                        const existingRow = data.find((r, index) => 
                            index !== row && 
                            Array.isArray(r) && 
                            r[0] === newValue
                        );

                        if (existingRow) {
                            const newRowData = [...existingRow];
                            const fieldsToClear = [5, 6, 7, 8];
                            fieldsToClear.forEach(index => {
                                newRowData[index] = '';
                            });

                            while (newRowData.length < 17) {
                                newRowData.push('');
                            }

                            setData(prevData => {
                                const updatedData = [...prevData];
                                updatedData[row] = newRowData.slice(0, 17);
                                return updatedData;
                            });

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

            changes.forEach(change => {
                const [, , , newValue] = change;
                if (newValue === null || newValue === undefined) {
                    change[3] = '';
                }
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
            
            if (col === 0) {
                cellProperties.allowEmpty = false;
                cellProperties.className = 'row-number-cell';
               
            }
    
            cellProperties.className = `${cellProperties.className || ''} ${row % 2 === 0 ? 'even-row' : 'odd-row'}`;
    
            return cellProperties;
        },

    }), [data, setData, setSelectedRow, setHasChanges, onDeleteRow, showNotification]);

    return getHotSettings;
};

export default useHotSettings;