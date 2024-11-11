import React from 'react';
import SheetCard from '../SheetCard';
// In GridView.js, modify the props and sheet card rendering
const GridView = ({ sheets, onDelete, onEdit }) => {  // Add onEdit to props
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        direction: 'rtl',
      }}
    >
      {sheets.map((sheet) => (
        <SheetCard 
          key={sheet.id} 
          sheet={sheet} 
          onDelete={onDelete}
          onEdit={onEdit}  // Pass onEdit to SheetCard
        />
      ))}
    </div>
  );
};

export default GridView;
