// src/components/Spreadsheet/components/SpreadsheetToolbar.js

import React from 'react';
import { Loader2 } from 'lucide-react';

const SpreadsheetToolbar = ({ 
    onSave, 
    isSaving,
    onAddRow 
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
        }}>
            <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#2c5282', 
                textAlign: 'center', 
                width: '100%' 
            }}>
                Odoo Task Automation - Custom Spreadsheet
            </h2>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    style={{
                        backgroundColor: isSaving ? '#a0aec0' : '#3182ce',
                        color: '#fff',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                        transition: 'background-color 0.3s'
                    }}
                >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
            </div>
        </div>
    );
};

export default SpreadsheetToolbar;