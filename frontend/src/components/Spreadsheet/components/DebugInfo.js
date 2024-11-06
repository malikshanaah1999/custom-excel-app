// src/components/Spreadsheet/components/DebugInfo.js

import React from 'react';

const DebugInfo = ({ info }) => {
    if (!info) return null;

    return (
        <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#ebf8ff', 
            borderRadius: '8px', 
            color: '#2b6cb0' 
        }}>
            <h3 style={{ fontWeight: 'bold', color: '#2d3748', marginBottom: '10px' }}>
                معلومات التصحيح:
            </h3>
            <p>آخر معرف تم حفظه: {info.lastSavedId}</p>
            <p>عدد السجلات الحالية: {info.recordCount}</p>
            <p>آخر تحديث: {info.timestamp}</p>
        </div>
    );
};

export default DebugInfo;