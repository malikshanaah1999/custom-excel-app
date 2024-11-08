// src/components/Spreadsheet/components/GenerateButton.js

import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import styles from '../Stylings/GenerateButton.module.css';

const GenerateButton = ({ onClick, isGenerating }) => {
  return (
    <button
      onClick={onClick}
      disabled={isGenerating}
      className={`${styles.generateButton} ${isGenerating ? styles.disabled : ''}`}
      aria-label={isGenerating ? 'جاري التوليد...' : 'توليد الملف'}
    >
      {isGenerating ? (
        <>
          <Loader2 size={20} className={styles.spinner} />
          جاري التوليد...
        </>
      ) : (
        <>
          <Download size={20} />
          توليد الملف
        </>
      )}
    </button>
  );
};

export default GenerateButton;
