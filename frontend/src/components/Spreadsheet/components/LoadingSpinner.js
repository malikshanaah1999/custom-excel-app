// src/components/Spreadsheet/components/LoadingSpinner.js

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'جاري تحميل البيانات...' }) => {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            fontSize: '20px' 
        }}>
            <Loader2 className="h-8 w-8 animate-spin" />
            <span style={{ marginRight: '10px' }}>{message}</span>
        </div>
    );
};

export default LoadingSpinner;