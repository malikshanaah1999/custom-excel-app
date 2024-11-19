// src/components/DropdownEditor.js
import React, { useState } from 'react';
import { Edit3, Plus, Trash2, Search } from 'lucide-react';
import styles from '../Stylings/DropdownEditor.module.css';

const DropdownEditor = ({ isOpen, onClose, options = [], onSelect, position }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={styles.dropdownContainer} 
      style={{ 
        top: position?.top || 0, 
        left: position?.left || 0 
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className={styles.optionsList}>
        {options.map((option, index) => (
          <div 
            key={index} 
            className={styles.optionItem}
            onClick={() => {
              onSelect(option);
              onClose();
            }}
          >
            <span>{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownEditor;