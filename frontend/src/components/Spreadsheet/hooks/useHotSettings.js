// src/components/Spreadsheet/hooks/useHotSettings.js

import { useCallback } from 'react';
import { spreadsheetColumns } from '../config/columns';

const useHotSettings = ({
    data,
    setSelectedRow,
    setHasChanges,
    onDeleteRow
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
        afterSelection: (row) => setSelectedRow(row),
        afterDeselect: () => setSelectedRow(null),
        afterChange: (changes, source) => {
            if (!changes) return;
            if (source === 'edit') {
                setHasChanges(true);
            }
        },
    }), [data, setSelectedRow, setHasChanges, onDeleteRow]);

    return getHotSettings;
};

export default useHotSettings;