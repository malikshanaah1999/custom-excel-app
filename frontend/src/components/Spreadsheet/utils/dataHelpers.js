// src/components/Spreadsheet/utils/dataHelpers.js

export const createEmptyRow = () => Array(17).fill('');

export const isRowEmpty = (row) => {
    if (!row) return true;
    return !row.some(cell => (cell ?? '').toString().trim() !== '');
};

export const cleanData = (data) => {
    if (!Array.isArray(data)) return [createEmptyRow()];
    
    return data
        .filter(row => row && row.some(cell => (cell ?? '').toString().trim() !== ''))
        .map(row => {
            const cleanRow = row.map(cell => (cell ?? '').toString().trim());
            while (cleanRow.length < 17) cleanRow.push('');
            return cleanRow.slice(0, 17);
        });
};

export const ensureMinimumRows = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        return [createEmptyRow()];
    }
    return data;
};