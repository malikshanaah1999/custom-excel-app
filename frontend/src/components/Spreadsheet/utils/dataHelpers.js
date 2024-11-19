// src/components/Spreadsheet/utils/dataHelpers.js

export const createEmptyRow = () => {
    const row = Array(22).fill('');
    // Set default values for last 5 columns
    row[17] = 'Stockable Product';
    row[18] = 'True';
    row[19] = 'True';
    row[20] = 'Ordered quantities';
    row[21] = 'True';
    return row;
};

export const isRowEmpty = (row) => {
    if (!row) return true;
    return !row.some(cell => (cell ?? '').toString().trim() !== '');
};

export const cleanData = (data) => {
    if (!Array.isArray(data)) return [createEmptyRow()];
    /***/
    return data
        .filter(row => row && row.some(cell => (cell ?? '').toString().trim() !== ''))
        .map(row => {
            const cleanRow = row.map(cell => (cell ?? '').toString().trim());
            while (cleanRow.length < 22) cleanRow.push('');
            
            // Ensure default values for last 5 columns
            cleanRow[17] = 'Stockable Product';
            cleanRow[18] = 'True';
            cleanRow[19] = 'True';
            cleanRow[20] = 'Ordered quantities';
            cleanRow[21] = 'True';
            
            return cleanRow.slice(0, 22);
        });
};

export const ensureMinimumRows = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        return [createEmptyRow()];
    }
    return data;
};