import { useCallback, useEffect, useState, useMemo, useRef} from 'react';
import ReactDOM from 'react-dom';
import { spreadsheetColumns } from '../config/columns';
import { createEmptyRow } from '../utils/dataHelpers';
import { useDropdownOptions } from './useDropdownOptions';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { registerAllModules } from 'handsontable/registry';
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n';
// Add this new import for category mappings
export const CATEGORY_CLASSIFICATIONS = {
    'All / ماركت': [
        'زيوت', 'ارز', 'سكر', 'ملح', 'سمن', 'طحين', 'سردين', 'تونة',
        'حليب مجفف', 'طحينة', 'حلاوة', 'معكرونة', 'نودلز', 'عصائر',
        'مشروبات ساخنة', 'مشروبات غازية', 'مياه معدنية', 'مشروبات طاقة',
        'شاي', 'قهوة', 'اسبرسو', 'مخللات', 'كاتشاب', 'ميونيز',
        'رانش/صوص', 'شيبس', 'حبوب كورنفلكس', 'ايس كريم', 'مربى',
        'عسل', 'علكة', 'سكاكر', 'دخان', 'بقوليات مبكت', 'صلصة بندورة',
        'معلبات', 'اغئية قابلة للدهن', 'تحضير حلويات', 'فواكة معلبة',
        'خليط كيك', 'طعام اطفال', 'فواكة مجففة', 'ويفر', 'بسكوت',
        'شوكولاتة', 'كراكر', 'sugar free', 'gluten free',
        'fitness bars food', 'مكسرات', 'زيتون'
    ],
    'All / مفرزات': [
        'اسماك مفرزة', 'اغذية بحرية مفرزة', 'خضار مفرزة', 'برجر مفرز',
        'عجائن مفرزة', 'بوريكس', 'دجاج بقسماط مفرز', 'فواكة مفرزة',
        'فطائى مفرزة', 'بطاطا  مفرزة', 'كبة', 'اطعمة مفرزة'
    ],
    
    'default': ['test 1', 'test 2', 'test 3', 'test 4', 'test 5']
};
export const PRODUCT_TAG_CLASSIFICATIONS = {
    'All / ماركت': [
    'زيت ذرة', 'زيت شمس', 'جرانولا', 'زيت زيتون', 'ارز حبة طويلة',
    'ارز حبة قصيرة', 'ارز حبة مدور', 'ارز مطحون', 'سكر ابيض',
    'سكر بني', 'سكر مطحون', 'ملح ابيض', 'ملح خشن', 'ملح نكهات',
    'ملح زهري', 'سمن نباتي', 'سمن حيواني', 'سمن بلدي', 'سمن حلوب',
    'طحين ابيض', 'طحين بلدي', 'طحين فري جلوتين', 'طحين كيك', 'حلو',
    'حار', 'ذرة حلو', 'ذرة حار', 'قليل السم', 'كامل الدسم', 'سادة',
    'شوكولاتة', 'فانيلا', 'حلاوة مكسرات', 'حلاوة شعر', 'حلاوة دهن',
    'معكرونة سباجيتي', 'معكرونة كوع', 'معكرونة ماسورة', 'معكرونة اصابع',
    'معكرونة دبوكي', 'اندومي', 'ليمون', 'برتقال', 'مانجا', 'فيمتو',
    'تانك', 'الزهراء', 'نسكافية', 'مبيض', 'شوكو', 'نسكافية جولد',
    'كابتشينو', 'كوكا كولا', 'سبرايت', 'فانتا', 'بيبسي', 'ميرندا',
    'سفن اب', 'سما', 'ماتركس', 'تشات كولا', 'عبواة', 'قاروة', 'كاسات',
    'XL', 'هايبي', 'هوبي', 'بلو', 'ريد بول', 'باور هورس', 'شاي عادي',
    'نكهات', 'حلل', 'شقراء', 'نص بنص', 'محروقة', 'خليجية', 'كبسولات',
    'حبوب اسبرسو', 'خيار', 'زيتون حب', 'زيتون بدون نوى', 'باذنجان',
    'فلفل', 'كلاسيك', 'باربكيو', 'صويا صوص', 'سيزر', 'ليز', 'دوريتوز',
    'ماستر شيبس', 'بيوجليز', 'برينجلز', 'بطاطا طبيعي', 'نستلي',
    'كونفلكس الديك', 'سيريال', 'حبات', 'علب', 'تين', 'فراولة', 'مشمش',
    'صدر', 'طبيعي', 'ملكات', 'اوربت', 'سهم', 'ستيميرول', 'جوم',
    'ملبس', 'مصاص', 'نوجا', 'سجائر', 'سجائر الكترونية', 'معسل', 'تمباك',
    'ايكوس', 'عدس حب', 'بوشار', 'لوبيا', 'برغل', 'عدس مجروش',
    'صلصة بندورة', 'ذرة', 'فاصوليا بيضاء', 'فاصوليا حمراء', 'بازيلا',
    'ورق عنب', 'لحوم معلبة', 'حمص حب', 'حمص مسلوق', 'حمص مطحون',
    'فول مدمس', 'شوربة سريعة التحضير', 'زينة الحلويات', 'زبدة فول سوداني',
    'زبدة فستق حلي', 'زبدة البندق', 'قشطة حلويات', 'حليب مبخر',
    'حليب مكثف', 'باكينج باورد', 'فانيلا سائل', 'اناناس مقطع',
    'اناناس شرائح', 'سلطة فواكة', 'كرز', 'بلاك بري', 'بلو بري',
    'كيك', 'موس', 'بان كيك', 'خليط عواة', 'دونات', 'طعام اطفال',
    'حليب اطفال', 'كيوي', 'جارينا', 'علي بابا', 'ماري', 'ليدي فنجر',
    'الواح', 'بار', 'دايت', 'دارك', 'مملح', 'نكهات', 'بيجلا', 'بزر بطيخ',
    'بزر شمس', 'فسق عبيد', 'كاجو', 'فستق حلبي'
],

    'All / مفرزات': [
    'سمك بكلا', 'سمك فيله', 'سمك سلمون', 'جمبري اسود', 'جمبري احمر',
    'بازيلا مع جزر', 'بازيلا', 'خضار', 'بروكلي', 'فول صويا',
    'بيف برجر', 'تشكن برجر', 'عجينة سمبوسك', 'باف بيستري', 'عجينة بقلاوة',
    'جبنة', 'لحمة', 'بطاطا', 'سكالوب', 'كرسبي', 'اجنحة دجاج', 'نبوت',
    'ناجتس', 'مانجا', 'فراولة', 'بلاك بري', 'بلوبري', 'كيوي', 'بيتزا',
    'اقراص زعتر', 'ستيك', 'اصابع', 'ودجيز', 'كيري', 'سمايل', 'كبة لحمة',
    'كبة رز', 'كبة دجاج', 'كبة طازجة', 'كباب', 'ششبرك', 'مفتول'
],

    'default': ['test 1', 'test 2', 'test 3', 'test 4', 'test 5']
};
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
    showDropdownEditor,
    
}) => {
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
                'info'  // Using warning instead of error
            );
        }
    });
}, [data, showNotification]);

const getColumnOptions = useCallback((columnIndex, row) => {
    // Handle both التصنيف and علامات تصنيف المنتج columns
    if (columnIndex === 4 || columnIndex === 5) {
        if (row === undefined || !data?.[row]) {
            return CATEGORY_CLASSIFICATIONS['default'];
        }
        
        const categoryValue = data[row][3];
        if (!categoryValue) return CATEGORY_CLASSIFICATIONS['default'];

        if (columnIndex === 4) {
            return CATEGORY_CLASSIFICATIONS[categoryValue] || CATEGORY_CLASSIFICATIONS['default'];
        } else { // columnIndex === 5
            return PRODUCT_TAG_CLASSIFICATIONS[categoryValue] || PRODUCT_TAG_CLASSIFICATIONS['default'];
        }
    }

    const columnToOptions = {
        3: categoryOptions,  // فئة المنتج
        7: measurementUnitOptions,
        9: sourceOptions
    };

    if (columnToOptions[columnIndex]) {
        return columnToOptions[columnIndex].map(opt => opt.value);
    }

    return [];
}, [data, categoryOptions, measurementUnitOptions, sourceOptions]);


const createDropdownRenderer = useCallback((columnIndex) => {
    return function(instance, td, row, col, prop, value, cellProperties) {
        // Add safety check
        if (!td) return td;

        const wrapper = document.createElement('div');
        wrapper.className = 'htDropdownWrapper';
        wrapper.textContent = value || '-- اختر --';
        
        wrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Add safety check for row
            if (row === undefined) return;
            
            const options = getColumnOptions(columnIndex, row);
            const rect = td.getBoundingClientRect();
            
            instance.deselectCell();
            
            showDropdownEditor({
                category: COLUMN_CATEGORIES[columnIndex],
                options,
                onSelect: (newValue) => {
                    // Explicitly set the cell value and trigger a re-render
                    instance.setDataAtCell(row, col, newValue, 'edit');
                    instance.render();
                },
                position: {
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX
                }
            });
        });

        Handsontable.dom.empty(td);
        td.appendChild(wrapper);
        
        return td;
    };
}, [getColumnOptions, showDropdownEditor]);

const validateClassification = useCallback((row, value, columnIndex) => {
    const categoryValue = data[row][3];
    if (!categoryValue) return false;
    
    if (columnIndex === 4) {
        const validOptions = CATEGORY_CLASSIFICATIONS[categoryValue] || CATEGORY_CLASSIFICATIONS['default'];
        return validOptions.includes(value);
    } else if (columnIndex === 5) {
        const validOptions = PRODUCT_TAG_CLASSIFICATIONS[categoryValue] || PRODUCT_TAG_CLASSIFICATIONS['default'];
        return validOptions.includes(value);
    }
    return false;
}, [data]);

const getColumnSettings = useCallback((columnIndex) => {
    if (COLUMN_CATEGORIES[columnIndex]) {
        return {
            type: 'dropdown',
            allowInvalid: false,
            source: function(query, callback) {
                const row = this.row;
                const instance = this.instance;

                if (columnIndex === 4) {  // For "التصنيف" column
                    const categoryValue = instance.getDataAtCell(row, 3);
                    const options = categoryValue ? 
                        (CATEGORY_CLASSIFICATIONS[categoryValue] || CATEGORY_CLASSIFICATIONS['default']) : 
                        CATEGORY_CLASSIFICATIONS['default'];
                    callback(options);
                } else {
                    callback(getColumnOptions(columnIndex, row));
                }
            },
            editor: 'dropdown',
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                td.style.direction = 'rtl';
                td.style.textAlign = 'center';
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
        } else {
            td.style.direction = 'rtl';
        }
    
        // Center the text within the cell
        td.style.textAlign = 'center';
        td.style.unicodeBidi = 'isolate';
    }
    
    // Update afterChange to handle category changes
const afterChange = useCallback((changes, source) => {
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
                if (row === undefined || !data?.[row]) return;

                // When فئة المنتج changes, clear التصنيف
                // When فئة المنتج changes
                if (prop === 3) { // فئة المنتج column changes
                    const instance = this;
                    
                    setData(prevData => {
                        const updatedData = [...prevData];
                        if (updatedData[row]) {
                            updatedData[row][4] = ''; // Clear التصنيف value
                            updatedData[row][5] = ''; // Clear علامات تصنيف المنتج value
                        }
                        return updatedData;
                    });
                
                    if (instance) {
                        const validClassificationOptions = CATEGORY_CLASSIFICATIONS[newValue] || CATEGORY_CLASSIFICATIONS['default'];
                        const validTagOptions = PRODUCT_TAG_CLASSIFICATIONS[newValue] || PRODUCT_TAG_CLASSIFICATIONS['default'];
                        
                        instance.setCellMeta(row, 4, 'source', validClassificationOptions);
                        instance.setCellMeta(row, 5, 'source', validTagOptions);
                        instance.render();
                    }
                }
                // When التصنيف changes
                if (prop === 4 && newValue) {
                    const categoryValue = data[row][3];
                    const validOptions = CATEGORY_CLASSIFICATIONS[categoryValue] || 
                                    CATEGORY_CLASSIFICATIONS['default'];
                    
                    // If selected value is not valid for current category, clear it
                    if (!validOptions.includes(newValue)) {
                        setData(prevData => {
                            const updatedData = [...prevData];
                            updatedData[row][4] = '';
                            return updatedData;
                        });
                    }
                }
            });
}, [setData, getColumnOptions]);

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
            ...getColumnSettings(index),
            // Hide the last 5 columns while maintaining the direction-aware rendering
            ...(index >= 17 && index <= 21 ? { hidden: true, readOnly: true } : {}),
            renderer: function(instance, td, row, col, prop, value, cellProperties) {
                // Define visible columns that need direction-aware rendering
                const columnsToApply = Array.from({ length: 17 }, (_, i) => i); // Columns 0-16
        
                if (columnsToApply.includes(col)) {
                    directionAwareRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
                } else {
                    // Use default renderer for hidden columns
                    Handsontable.renderers.TextRenderer.apply(this, arguments);
                }
            }
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