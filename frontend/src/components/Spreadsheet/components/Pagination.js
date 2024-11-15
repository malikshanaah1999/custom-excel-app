import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../Stylings/Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className={styles.paginationContainer}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={styles.pageButton}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight size={20} />
      </button>
      
      <span className={styles.pageInfo}>
        صفحة {currentPage} من {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={styles.pageButton}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  );
};

export default Pagination;//