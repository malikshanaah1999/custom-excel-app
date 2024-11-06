// src/components/Spreadsheet/components/GenerateButton.js

import React from 'react';
import { Download } from 'lucide-react';

const GenerateButton = ({ onClick, isGenerating }) => {
    return (
        <button
            onClick={onClick}
            disabled={isGenerating}
            style={{
                backgroundColor: isGenerating ? '#a0aec0' : '#2563eb',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease',
                margin: '20px auto',
                fontSize: '16px',
                fontWeight: '500'
            }}
        >
            <Download size={20} />
            {isGenerating ? 'جاري التوليد...' : 'توليد الملف'}
        </button>
    );
};

export default GenerateButton;