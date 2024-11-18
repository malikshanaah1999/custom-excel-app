// src/components/Spreadsheet/utils/dataHelpers.js

export const createEmptyRow = () => {
    const row = Array(21).fill(''); // Updated to 23 columns
    // Set default values for last 6 columns (including new 'pos' column)
    row[17] = 'Storable Product';
    row[18] = 'True';
    row[19] = 'True';
    row[20] = 'Delivered quantities';
    row[21] = 'TRUE';
    return row;
};

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
            while (cleanRow.length < 23) cleanRow.push('');
            
            // Ensure default values for last 6 columns
            cleanRow[17] = 'Storable Product';
            cleanRow[18] = 'True';
            cleanRow[19] = 'True';
            cleanRow[20] = 'Delivered quantities';
            cleanRow[21] = 'TRUE';
            
            return cleanRow.slice(0, 22);
        });
};

export const ensureMinimumRows = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        return [createEmptyRow()];
    }
    return data;
};