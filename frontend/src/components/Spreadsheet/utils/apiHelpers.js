// src/components/Spreadsheet/utils/apiHelpers.js

import { API_BASE_URL } from '../../../config/api';

export const fetchSpreadsheetData = async () => {
    const response = await fetch(`${API_BASE_URL}/data`);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return response.json();
};
/***/
export const saveSpreadsheetData = async (data) => {
    const response = await fetch(`${API_BASE_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    });
    if (!response.ok) {
        throw new Error('Failed to save data');
    }
    return response.json();
};

export const deleteSpreadsheetRow = async (rowIndex) => {
    const response = await fetch(`${API_BASE_URL}/delete-row/${rowIndex}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        throw new Error('Failed to delete row');
    }
    return response.json();
};