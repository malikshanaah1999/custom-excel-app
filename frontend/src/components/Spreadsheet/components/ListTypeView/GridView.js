import React from 'react';
import SheetCard from '../SheetCard';

const GridView = ({ sheets, onDelete }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        direction: 'rtl', // Ensure RTL layout
      }}
    >
      {sheets.map((sheet) => (
        <SheetCard key={sheet.id} sheet={sheet} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default GridView;
