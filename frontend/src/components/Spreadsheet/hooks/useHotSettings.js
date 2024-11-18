import { useCallback, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { spreadsheetColumns } from '../config/columns';
import { createEmptyRow } from '../utils/dataHelpers';
import { useDropdownOptions } from './useDropdownOptions';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { registerAllModules } from 'handsontable/registry';
import DropdownEditor from '../../DropdownEditor';
import styles from '../../DropdownEditor.module.css';
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n';

// Register all Handsontable modules
registerAllModules();
// Register Arabic language
registerLanguageDictionary('ar-AR', {
    languageCode: 'ar-AR',
    direction: 'rtl',
    // Add other translations as needed
});
const defaultValues = {
    'Product Type': 'Stockable Product',
    'Can be Purchased': 'True',
    'Can be Sold': 'True',
    'Invoicing Policy': 'Ordered quantities',
    'ava.pos': 'True'
};
const lastRenderedCells = new Map(); // Cache for rendered cells




const useHotSettings = ({
    data,
    setData,
    setSelectedRow,
    setHasChanges,
    onDeleteRow,
    showNotification,
    showDropdownEditor  
}) => {

    // Map column indices to their categories
    const COLUMN_CATEGORIES = {
        3: 'category',           // category column
        4: 'التصنيف',           // classification
        7: 'وحدة القياس',        // measurement unit
        9: 'مصدر المنتج'         // product source
    };
    // Add state for dropdown options
    const categoryOptions = useDropdownOptions('category');
    const measurementUnitOptions = useDropdownOptions('وحدة القياس');
    const classificationOptions = useDropdownOptions('التصنيف');
    const sourceOptions = useDropdownOptions('مصدر المنتج');

    

   

    const getColumnOptions = useCallback((columnIndex) => {
        const columnToOptions = {
            3: categoryOptions,
            7: measurementUnitOptions,
            4: classificationOptions,
            9: sourceOptions
        };
        const options = columnToOptions[columnIndex] || [];
        return options.map(opt => opt.value);
    }, [categoryOptions, measurementUnitOptions, classificationOptions, sourceOptions]);


    // Use getColumnOptions instead of dropdownOptions
const createDropdownRenderer = useCallback((columnIndex) => {
    let lastRenderedValue = null;
    let lastRenderedCell = null;

    return function customDropdownRenderer(instance, td, row, col, prop, value, cellProperties) {
        if (value === lastRenderedValue && td === lastRenderedCell) {
            return td;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'htDropdownWrapper';
        wrapper.textContent = value || '-- اختر --';
        
        wrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const options = getColumnOptions(columnIndex);
            const rect = td.getBoundingClientRect();
            
            instance.deselectCell();
            
            showDropdownEditor({
                category: COLUMN_CATEGORIES[columnIndex],
                options,
                onSelect: (newValue) => {
                    instance.setDataAtCell(row, col, newValue);
                },
                position: {
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX
                }
            });
        });

        Handsontable.dom.empty(td);
        td.appendChild(wrapper);
        
        lastRenderedValue = value;
        lastRenderedCell = td;
        
        return td;
    };
}, [getColumnOptions, showDropdownEditor]);


const getColumnSettings = useCallback((columnIndex) => {
    if (COLUMN_CATEGORIES[columnIndex]) {
        return {
            type: 'dropdown',  // Use built-in dropdown
            source: getColumnOptions(columnIndex),
            editor: 'dropdown',
            autocomplete: true,
            className: 'htDropdown custom-dropdown',
            dropdownMenu: {
                style: {
                    direction: 'rtl',
                    
                },
                highlightMatch: true,
                
            },
         
            
        };
    }
    return { 
        type: 'text',
        editor: 'text'
    };
}, [COLUMN_CATEGORIES, getColumnOptions]);

const getColumnType = useCallback((index) => {
    const category = COLUMN_CATEGORIES[index];
    if (category) {
        return {
            type: 'dropdown',
            source: getColumnOptions(index),
            editor: 'dropdown',  // Change this from false to 'dropdown'
            renderer: createDropdownRenderer(index),
            allowInvalid: false
        };
    }
    return { 
        type: 'text',
        editor: 'text'
    };
}, [getColumnOptions, createDropdownRenderer]);

    
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
    }, [data, ensureDefaultValues, setData]);
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
        manualRowResize: true,
        outsideClickDeselects: false,
        selectionMode: 'single',
        fillHandle: true,
        columns: spreadsheetColumns.map((col, index) => ({
            ...col,
            ...getColumnSettings(index)
        })),
        beforeKeyDown: function(event) {
            const selected = this.getSelected();
            if (selected && [3, 7, 4, 9].includes(selected[0][1])) {
                event.stopImmediatePropagation();
            }
        },
        minSpareRows: 0,
        minRows: Math.max(20, data.length),
        editor: true,
        rowHeights: 28,
        autoRowSize: false,
        autoColumnSize: false,
        viewportRowRenderingOffset: 20,
        enterMoves: { row: 1, col: 0 },
        wordWrap: false,
        batchRender: true,
    fragmentSelection: 'cell',
    deferredUpdates: true,
        autoWrapRow: true,
        editResponse: true,
        autoWrapCol: true,
        
       

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

                    // If it's a dropdown column and the new value isn't in the source
                if ([3, 7, 4, 9].includes(prop)) {
                    const options = getColumnOptions(prop);
                    if (newValue && !options.includes(newValue)) {
                        changes.splice(i, 1);
                        continue;
                    }
                }

                // Barcode uniqueness validation
                if (prop === 12 && newValue !== oldValue) {  // Updated from 13 to 12
                    if (!isBarcodeUnique(newValue, row)) {
                        showNotification('ل يمكنك ادخال باركود موجود مسبقا', 'error');
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
            // Add special class for dropdown cells
            if ([3, 7, 4, 9].includes(col)) {
                cellProperties.className = `${cellProperties.className || ''} dropdown-cell`;
            }
            
            cellProperties.className = `${cellProperties.className || ''} ${row % 2 === 0 ? 'even-row' : 'odd-row'}`;
            return cellProperties;
        },
        
        
        selectOptions: {
            clearable: true,
            multiple: false
        }
    }), [
        data, 
        spreadsheetColumns,
        setData, 
        setSelectedRow, 
        onDeleteRow, 
        showNotification, 
        isBarcodeUnique, 
        canEditMinMax,
        ensureDefaultValues,
        setHasChanges,
        getColumnOptions,
        getColumnType,
        showDropdownEditor
    ]);


    return getHotSettings;
};

export default useHotSettings;