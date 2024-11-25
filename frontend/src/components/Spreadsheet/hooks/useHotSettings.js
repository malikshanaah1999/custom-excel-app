import { useCallback, useEffect, useState, useMemo, useRef} from 'react';
import ReactDOM from 'react-dom';
import { spreadsheetColumns } from '../config/columns';
import { createEmptyRow } from '../utils/dataHelpers';
import { useDropdownOptions } from './useDropdownOptions';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { registerAllModules } from 'handsontable/registry';
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n';
import { API_BASE_URL } from '../../../config/api';



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
    selectedRow,
    setHasChanges,
    onDeleteRow,
    showNotification,
    showDropdownEditor,
    
}) => {

    const { 
        options: categoryOptions,  // Changed from categoryOptionsHook 
        loading: categoryLoading,
        error: categoryError,
        refreshOptions: refreshCategories  // Add this to get the refresh function
    } = useDropdownOptions('فئة المنتج');
    

 
    const { 
        options: measurementUnitOptions,
        refreshOptions: refreshMeasurementUnits
    } = useDropdownOptions('وحدة القياس');
    
    const { 
        options: sourceOptions,
        refreshOptions: refreshSources
    } = useDropdownOptions('مصدر المنتج');

 // State for dependent options
 const [classificationOptions, setClassificationOptions] = useState({});
 const [tagOptions, setTagOptions] = useState({});

// Add function to refresh all dropdowns
const refreshAllDropdowns = useCallback(() => {
    refreshCategories();
    refreshMeasurementUnits();
    refreshSources();
    // This will trigger a re-fetch of classifications and tags
    // for the current category
    if (data[selectedRow]?.[3]) {
        fetchDependentOptions(data[selectedRow][3]);
    }
}, [refreshCategories, refreshMeasurementUnits, refreshSources, data, selectedRow]);

// Update fetchDependentOptions
const fetchDependentOptions = useCallback(async (categoryValue) => {
    if (!categoryValue) return;
    
    try {
        console.log('Fetching dependent options for category:', categoryValue);

        // Fetch classifications
        const classResponse = await fetch(
            `${API_BASE_URL}/api/dropdown-options/التصنيف?parent_category=${encodeURIComponent(categoryValue)}`
        );
        const classData = await classResponse.json();
        console.log('Received classifications:', classData);

        // Fetch tags
        const tagResponse = await fetch(
            `${API_BASE_URL}/api/dropdown-options/علامات تصنيف المنتج?parent_category=${encodeURIComponent(categoryValue)}`
        );
        const tagData = await tagResponse.json();
        console.log('Received tags:', tagData);

        setClassificationOptions(prev => ({
            ...prev,
            [categoryValue]: classData.map(opt => opt.value || opt.name)
        }));

        setTagOptions(prev => ({
            ...prev,
            [categoryValue]: tagData.map(opt => opt.value || opt.name)
        }));
    } catch (error) {
        console.error('Error fetching dependent options:', error);
        showNotification('خطأ في تحميل الخيارات', 'error');
    }
}, [showNotification]);

// Effect to fetch dependent options when needed
// Add to useEffect to refresh periodically
useEffect(() => {
    const interval = setInterval(refreshAllDropdowns, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
}, [refreshAllDropdowns]);
useEffect(() => {
    data?.forEach(row => {
        const categoryValue = row[3];
        if (categoryValue && (!classificationOptions[categoryValue] || !tagOptions[categoryValue])) {
            fetchDependentOptions(categoryValue);
        }
    });
}, [data, fetchDependentOptions]);
    // Add refs for rendered cell caching
    const lastRenderedValue = useRef(null);
    const lastRenderedCell = useRef(null);
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
        5: 'علامات تصنيف المنتج',  // Add this line
        7: 'وحدة القياس',        // measurement unit
        9: 'مصدر المنتج'         // product source
    };


    

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
                'info'  // Using warning instead of error
            );
        }
    });
}, [data, showNotification]);



const getColumnOptions = useCallback((columnIndex, row) => {
    console.log(`Getting options for column ${columnIndex}, row ${row}`);
    switch(columnIndex) {
        case 3:  // فئة المنتج
            console.log('Fetching options for فئة المنتج');
            return categoryOptions?.map(opt => opt.value) || [];
            
        case 4:  // التصنيف
            const categoryValue = data?.[row]?.[3];
            console.log(`Current category value: ${categoryValue}`);
            if (!categoryValue) return [];
            console.log('Fetching options for التصنيف');
            return classificationOptions[categoryValue] || [];
            
        case 5:  // علامات تصنيف المنتج
            const catValue = data?.[row]?.[3];
            console.log(`Current category value: ${catValue}`);
            if (!catValue) return [];
            console.log('Fetching options for علامات تصنيف المنتج');
            return tagOptions[catValue] || [];
            
        case 7:  // وحدة القياس
            console.log('Fetching options for وحدة القياس');
            return measurementUnitOptions?.map(opt => opt.value) || [];
            
        case 9:  // مصدر المنتج
            console.log('Fetching options for مصدر المنتج');
            return sourceOptions?.map(opt => opt.value) || [];
            
        default:
            return [];
    }
}, [data, categoryOptions, classificationOptions, tagOptions, measurementUnitOptions, sourceOptions]);



// Add effect to refresh options periodically
useEffect(() => {
    const interval = setInterval(() => {
        data?.forEach(row => {
            const categoryValue = row[3];
            if (categoryValue) {
                fetchDependentOptions(categoryValue);
            }
        });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
}, [data, fetchDependentOptions]);

// Add effect to fetch dependent options when category changes
useEffect(() => {
    data?.forEach(row => {
        const categoryValue = row[3];
        if (categoryValue && (!classificationOptions[categoryValue] || !tagOptions[categoryValue])) {
            fetchDependentOptions(categoryValue);
        }
    });
}, [data, fetchDependentOptions]);


const validateClassification = useCallback((row, value, columnIndex) => {
    const categoryValue = data[row][3];
    if (!categoryValue) return false;
    
    if (columnIndex === 4) {
        const validOptions = classificationOptions[categoryValue]?.map(opt => opt.value) || [];
        return validOptions.includes(value);
    } else if (columnIndex === 5) {
        const validOptions = tagOptions[categoryValue]?.map(opt => opt.value) || [];
        return validOptions.includes(value);
    }
    return false;
}, [data, classificationOptions, tagOptions]);


// Update getColumnSettings
const getColumnSettings = useCallback((columnIndex) => {
    if (COLUMN_CATEGORIES[columnIndex]) {
        return {
            type: 'dropdown',
            allowInvalid: false,
            source: function(query, callback) {
                const row = this.row;
                const options = getColumnOptions(columnIndex, row);
                callback(options);
            },
            editor: 'dropdown',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
                Handsontable.renderers.DropdownRenderer.apply(this, arguments);
                
                // Handle dependent dropdowns (التصنيفات and علامات التصنيف)
                if ((col === 4 || col === 5) && data[row]) {
                    const categoryValue = data[row][3]; // فئة المنتج value
                    if (!categoryValue) {
                        td.innerHTML = '';
                        return td;
                    }
                }
                
                return td;
            }
        };
    }
    return { 
        type: 'text',
        editor: 'text'
    };
}, [data, getColumnOptions]);



const getColumnType = useCallback((index) => {
    const category = COLUMN_CATEGORIES[index];
    if (category) {
        return {
            type: 'dropdown',
            source: getColumnOptions(index),
            editor: 'dropdown',  // Use built-in dropdown editor
            renderer: Handsontable.renderers.AutocompleteRenderer,  // Use built-in renderer
            allowInvalid: false
        };
    }
    return { 
        type: 'text',
        editor: 'text'
    };
}, [getColumnOptions]);



    
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
        } else {
            td.style.direction = 'rtl';
        }
    
        // Center the text within the cell
        td.style.textAlign = 'center';
        td.style.unicodeBidi = 'isolate';
    }
    
    // Update afterChange to handle category changes
    const afterChange = useCallback(function (changes, source) {
        debugger;
        if (!changes || source === 'loadData') return;
    
        // Store reference to Handsontable instance
        const instance = this;
        console.log('Changes:', changes);
        // Check for empty barcode after any change
        checkEmptyBarcode(changes);
    
        changes.forEach(([row, prop, oldValue, newValue]) => {
            console.log(`Change in row ${row}, prop ${prop}: ${oldValue} -> ${newValue}`);
            // Auto-fill logic for "الرقم" (Number) - column 0
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
                        instance.selectCell(row, 6);
                    }, 0);
                }
            } else {
                // Handle mutual updates for shared "الرقم" rows
                updateSharedNumberRows(row, prop, newValue);
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////
    
            // Mutual fill for "وحدة القياس" and "قياس التعبئة" - columns 7 and 8
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
                    instance.selectCell(row, 12);
                }, 0);
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////
            
            // Mutual fill for category and POS Cat - columns 3 and 15
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

            ////////////////////////////////////////////////////////////////////////////////////////////////////////


            if (row === undefined || !data?.[row]) return;

            // Handle changes in "التصنيف" - column 4
            if (prop === 4 && newValue !== oldValue) {
                fetchDependentOptions(newValue);
                setData(prevData => {
                    const updatedData = [...prevData];
                    if (updatedData[row]) {
                        updatedData[row][5] = ''; // Clear علامات تصنيف المنتج (Tags)
                    }
                    return updatedData;
                });
            }
    
              // When "فئة المنتج" changes
        if (prop === 3 && newValue !== oldValue) {
            console.log('فئة المنتج changed');
            setData(prevData => {
                const updatedData = [...prevData];
                if (updatedData[row]) {
                    console.log('Clearing التصنيف and علامات تصنيف المنتج values');
                    updatedData[row][4] = ''; // Clear التصنيف value
                    updatedData[row][5] = ''; // Clear علامات تصنيف المنتج value
                }
                return updatedData;
            });

            // Update the dropdown options
            console.log('Fetching new options for dependent dropdowns');
            fetchDependentOptions(newValue).then(() => {
                // Get options for the current category
                const classificationOpts = classificationOptions[newValue] || [];
                const tagOpts = tagOptions[newValue] || [];
                
                // Set the dropdown sources
                console.log('Updating dropdown options');
                instance.setCellMeta(row, 4, 'source', classificationOpts);
                instance.setCellMeta(row, 5, 'source', tagOpts);
                instance.render();

                // Update the cell values to reflect the new options
                console.log('Updating cell values');
                setData(prevData => {
                    const updatedData = [...prevData];
                    if (updatedData[row]) {
                        console.log('Updating التصنيف value to:', updatedData[row][4]);
                        console.log('Updating علامات تصنيف المنتج value to:', updatedData[row][5]);
                        updatedData[row][4] = updatedData[row][4]; // Update التصنيف value
                        updatedData[row][5] = updatedData[row][5]; // Update علامات تصنيف المنتج value
                    }
                    return updatedData;
                });
            });
        }
                 // When "التصنيف" changes
                 if (prop === 4 && newValue) {
                    const categoryValue = data[row][3];
                    if (categoryValue) {
                        const validOptions = classificationOptions[categoryValue] || [];
                        
                        // Validate selection
                        if (!validOptions.includes(newValue)) {
                            console.log('Invalid التصنيف value:', newValue);
                            console.log('Clearing التصنيف value');
                        } else {
                            console.log('Valid التصنيف value:', newValue);
                            console.log('Setting التصنيف value to:', newValue);
                            setData(prevData => {
                                const updatedData = [...prevData];
                                updatedData[row][4] = newValue;
                                return updatedData;
                            });
                        }
                    }
                }

        // Handle tags changes
        if (prop === 5 && newValue) {
            const categoryValue = data[row][3];
            if (categoryValue) {
                const validOptions = tagOptions[categoryValue] || [];
                
                // Validate selection
                if (!validOptions.includes(newValue)) {
                    console.log('Invalid علامات تصنيف المنتج value:', newValue);
                    console.log('Clearing علامات تصنيف المنتج value');
                } else {
                    console.log('Valid علامات تصنيف المنتج value:', newValue);
                    console.log('Setting علامات تصنيف المنتج value to:', newValue);
                    setData(prevData => {
                        const updatedData = [...prevData];
                        updatedData[row][5] = newValue;
                        return updatedData;
                    });
                }
            }
        }
        });
    }, [
        data, 
        setData, 
        classificationOptions,
        tagOptions,
        fetchDependentOptions, 
        checkEmptyBarcode, 
        ensureDefaultValues, 
        showNotification, 
        updateSharedNumberRows
    ]);
    
    

    const getHotSettings = useCallback(() => ({
        data: data,
        colHeaders: spreadsheetColumns.map(col => col.title),
        rowHeaders: true,
        rowHeaderWidth: 25,
        height: '100%',
        width: '99%',
        licenseKey: 'non-commercial-and-evaluation',
        stretchH: 'all',
        className: 'custom-table rtl-table zebra-table',
        language: 'ar-AR',
        layoutDirection: 'rtl',
        viewportColumnRenderingOffset: 10,
        renderAllRows: false,
        manualColumnResize: true,
        manualRowResize: true,
        outsideClickDeselects: false,
        selectionMode: 'single',
        fillHandle: true,
        columns: spreadsheetColumns.map((col, index) => ({
            ...col,
            type: [3, 4, 5, 7, 9].includes(index) ? 'dropdown' : 'text',
            editor: [3, 4, 5, 7, 9].includes(index) ? 'dropdown' : 'text',
            ...getColumnSettings(index),
            ...([3, 4, 5, 7, 9].includes(index) ? 
                { renderer: Handsontable.renderers.AutocompleteRenderer } : {}),
        })),
        
        
        
        // Hide last 5 columns
        hiddenColumns: {
            columns: [17, 18, 19, 20, 21],
            indicators: false
        },
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
        
        



        afterChange,
        
       

        beforeChange: (changes) => {
            if (!changes) return;

            for (let i = changes.length - 1; i >= 0; i--) {
                const [row, prop, oldValue, newValue] = changes[i];

                    // If it's a dropdown column and the new value isn't in the source
                // If it's a dropdown column and the new value isn't in the source
                if ([3, 7, 4, 5, 9].includes(prop)) {  // Added 5 to the list
                    const options = getColumnOptions(prop, row);
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

                if ((prop === 4 || prop === 5) && newValue) {
                    if (!validateClassification(row, newValue, prop)) {
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
            
            // Make last 6 columns read-only
            if (col >= 17 && col <= 21) {
                cellProperties.readOnly = true;
            }
            
            // Add special class for all dropdown cells including cols 4 and 5
            if ([3, 4, 5, 7, 9].includes(col)) {
                cellProperties.className = `${cellProperties.className || ''} dropdown-cell`;
                cellProperties.editor = 'dropdown';  // Use dropdown editor for all dropdown columns
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