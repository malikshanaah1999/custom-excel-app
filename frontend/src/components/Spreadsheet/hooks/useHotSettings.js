import { useCallback, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { spreadsheetColumns } from '../config/columns';
import { createEmptyRow } from '../utils/dataHelpers';
import { useDropdownOptions } from './useDropdownOptions';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { registerAllModules } from 'handsontable/registry';
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
    'Product Type': 'Storable Product', // Changed from 'Stockable Product'
    'Can be Purchased': 'True',
    'Can be Sold': 'True',
    'Invoicing Policy': 'Delivered quantities', // Changed from 'Ordered quantities'
    'pos': 'TRUE' // New default value
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

    // Add this function to handle mutual updates
    const updateSharedNumberRows = useCallback((row, prop, value) => {
        const currentRowNumber = data[row][0]; // Get the "الرقم" value
        if (!currentRowNumber) return;

        // Define which columns should be mutually updated
        // These are the columns that get auto-filled
        const mutualColumns = [
            1,  // الاسم
            2,  // مفرق
            3,  // فئة المنتج
            4,  // التصنيف
            5,  // علامات تصنيف المنتج
            9,  // مصدر المنتج
            10, // الشركة المصنعة
            11,  // Products / Variant Seller / Vendor
            15,
            16
        ];

        // Only proceed if the changed column is one of the mutual columns
        if (!mutualColumns.includes(Number(prop))) return;

        // Find all rows with the same "الرقم"
        const rowsToUpdate = [];
        data.forEach((row, index) => {
            if (index !== Number(row) && row[0] === currentRowNumber) {
                rowsToUpdate.push(index);
            }
        });

        // Update all related rows
        if (rowsToUpdate.length > 0) {
            setData(prevData => {
                const newData = [...prevData];
                rowsToUpdate.forEach(rowIndex => {
                    newData[rowIndex][prop] = value;
                });
                return newData;
            });
            
            //showNotification('تم تحديث جميع الصفوف المرتبطة', 'success');
        }
    }, [data, setData, showNotification]);

    // Map column indices to their categories
    const COLUMN_CATEGORIES = {
        3: 'فئة المنتج',           // category column
        4: 'التصنيف',           // classification
        7: 'وحدة القياس',        // measurement unit
        9: 'مصدر المنتج'         // product source
    };
    // Add state for dropdown options
    const categoryOptions = useDropdownOptions('فئة المنتج');
    const measurementUnitOptions = useDropdownOptions('وحدة القياس');
    const classificationOptions = useDropdownOptions('التصنيف');
    const sourceOptions = useDropdownOptions('مصدر المنتج');

    

  // Check for empty barcode in rows with data
  const checkEmptyBarcode = useCallback((changes) => {
    if (!changes) return;

    const barcodeColumnIndex = 12; // Index of "الباركود" column
    
    changes.forEach(([row, prop, oldValue, newValue]) => {
        // Skip if we're editing the barcode column itself or default value columns
        if (prop === barcodeColumnIndex || (prop >= 17 && prop <= 21)) return;

        // Check if the current row has any content (excluding default columns and barcode)
        const hasContent = data[row].some((cell, index) => 
            index < 17 && 
            index !== barcodeColumnIndex && 
            (cell ?? '').toString().trim() !== ''
        );

        // If we're adding/editing content and the barcode is empty
        if (hasContent && 
            newValue && 
            newValue.toString().trim() !== '' && 
            (!data[row][barcodeColumnIndex] || data[row][barcodeColumnIndex].trim() === '')) {
            showNotification(
                `تنبيه: الصف رقم ${row + 1} يحتوي على خانة باركود فارغة`,
                'warning'  // Using warning instead of error
            );
        }
    });
}, [data, showNotification]);

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
            allowInvalid: false,  // Prevent invalid entries
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
        newRowData[21] = defaultValues['pos'];
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
    
    function directionAwareRenderer(instance, td, row, col, prop, value, cellProperties) {
        // Use the default text renderer
        Handsontable.renderers.TextRenderer.apply(this, arguments);
    
        // Function to detect if content is LTR
        const isLTR = (value) => /^[\x00-\x7F0-9 ]*$/.test(value);
    
        if (value && isLTR(value)) {
            td.style.direction = 'ltr';
            td.style.textAlign = 'left';
            td.style.unicodeBidi = 'isolate';
        } else {
            td.style.direction = 'rtl';
            td.style.textAlign = 'right';
            td.style.unicodeBidi = 'isolate';
        }
    }
    

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
            ...getColumnSettings(index),
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
                // Columns where you want to apply the direction-aware rendering
                const columnsToApply = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        
                if (columnsToApply.includes(col)) {
                    directionAwareRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
                } else {
                    // Use the default renderer
                    Handsontable.renderers.TextRenderer.apply(this, arguments);
                }
            }
        })),
        
        beforeKeyDown: function(event) {
            const hot = this;
            const selected = hot.getSelected();
            
            if (!selected) return;
    
            const [currentRow, currentCol] = selected[0];
            const lastCol = hot.countCols() - 1; // Get last column index
    
            // For left arrow key
            if (event.keyCode === 37) { // Left arrow
                if (currentCol === lastCol) {
                    // Move to first column of the same row (not second)
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    hot.selectCell(currentRow, 0);
                } else if (currentCol === 0) {
                    // If at first column, go to last column
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    hot.selectCell(currentRow, lastCol);
                }
            }
            
            // For right arrow key
            if (event.keyCode === 39) { // Right arrow
                if (currentCol === 0) {
                    // Move to last column of the same row (not second-to-last)
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    hot.selectCell(currentRow, lastCol);
                } else if (currentCol === lastCol) {
                    // If at last column, go to first column
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    hot.selectCell(currentRow, 0);
                }
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
        autoWrapRow: false,
        editResponse: true,
        autoWrapCol: false,
        
       

        afterInit: function() {
            this.validateCells();
        },

        afterSelection: (row, col, row2, col2) => {
            setSelectedRow(row);
        },

        afterDeselect: () => {
            setSelectedRow(null);
        },
        
        



        afterChange: function(changes, source) {
            if (!changes || source === 'loadData') return;
            // Check for empty barcode after any change
            checkEmptyBarcode(changes);
            changes.forEach(([row, prop, oldValue, newValue]) => {
                // Auto-fill logic for "الرقم"
                if (prop === 0 && newValue !== oldValue && newValue !== '') {
                    const existingRow = data.find((r, index) =>
                        index !== row &&
                        Array.isArray(r) &&
                        r[0] === newValue
                    );
        
                    if (existingRow) {
                        let newRowData = [...existingRow];
                        // Update indices for manual fields that should be cleared
                        const manualFields = [6, 7, 8, 12];
                        manualFields.forEach(index => {
                            newRowData[index] = '';
                        });
        
                        newRowData = ensureDefaultValues(newRowData);
        
                        setData(prevData => {
                            const updatedData = [...prevData];
                            updatedData[row] = newRowData;
                            return updatedData;
                        });
        
                        showNotification('تم تعبئة البيانات تلقائياً', 'success');
        
                        // Move cursor to "التعبئة" column (column index 6)
                        setTimeout(() => {
                            this.selectCell(row, 6);
                        }, 0);
                    }
                } else {
                    // Handle mutual updates for shared "الرقم" rows
                    updateSharedNumberRows(row, prop, newValue);
                }
        
                // Mutual fill for "وحدة القياس" and "قياس التعبئة"
                if ((prop === 7 || prop === 8) && newValue !== oldValue) {
                    setData(prevData => {
                        const updatedData = [...prevData];
                        if (
                            newValue !== 'حبة' &&
                            updatedData[row][7] !== 'حبة' &&
                            updatedData[row][8] !== 'حبة'
                        ) {
                            updatedData[row][13] = ''; // Clear Min
                            updatedData[row][14] = ''; // Clear Max
                        }
                        if (prop === 7) {
                            updatedData[row][8] = newValue;
                        } else {
                            updatedData[row][7] = newValue;
                        }
                        return updatedData;
                    });
        
                    // Move cursor to "الباركود" column (column index 12)
                    setTimeout(() => {
                        this.selectCell(row, 12);
                    }, 0);
                }
        
                // Mutual fill for category and POS Cat
                if ((prop === 3 || prop === 15) && newValue !== oldValue) {
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
                filledRow[21] = defaultValues['pos'];
                return filledRow;
            });
        },
        cells: function(row, col) {
            const cellProperties = {};
            
            if (col === 0) {
                cellProperties.allowEmpty = false;
                cellProperties.className = 'row-number-cell';
            }
            
            // Make last 6 columns read-only (including new 'pos' column)
            if (col >= 17 && col <= 21) {
                cellProperties.readOnly = true;
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