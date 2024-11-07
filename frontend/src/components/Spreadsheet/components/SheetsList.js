import React from 'react';
import SheetCard from './SheetCard';
import { Loader2, FileX } from 'lucide-react';

const SheetsList = ({ sheets, isLoading, searchTerm }) => {
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '256px' }}>
                <Loader2 size={48} style={{ color: '#c05621', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!sheets.length) {
        return (
            <div style={{ textAlign: 'center', color: '#718096', padding: '48px 0' }}>
                <FileX size={48} color="#a0aec0" />
                <p style={{ marginTop: '16px', fontSize: '18px' }}>
                    {searchTerm ? 'No matching results' : 'No projects found. Create a new project to get started!'}
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {sheets.map(sheet => (
                <SheetCard key={sheet.id} sheet={sheet} />
            ))}
        </div>
    );
};

export default SheetsList;
