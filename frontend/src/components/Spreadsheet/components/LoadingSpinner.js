// src/components/Spreadsheet/components/LoadingSpinner.js

import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../Stylings/LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'جاري تحميل البيانات...' }) => {
  return (
    <div className={styles.loadingContainer} role="status" aria-live="polite">
      <Loader2 className={styles.spinner} />
      <span className={styles.loadingMessage}>{message}</span>
    </div>
  );
};

export default LoadingSpinner;
