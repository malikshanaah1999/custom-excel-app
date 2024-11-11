import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '../Stylings/SortDropdown.module.css';

const SortDropdown = ({ currentSort, onSortChange }) => {
  return (
    <div className={styles.dropdownContainer}>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className={styles.select}
      >
        <option value="recent-activity">آخر تحديث</option>
        <option value="recently-created">أحدث إنشاء</option>
      </select>
      <ChevronDown className={styles.icon} size={20} />
    </div>
  );
};

export default SortDropdown;