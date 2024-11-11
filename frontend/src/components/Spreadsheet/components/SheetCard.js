// src/components/SheetCard.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileSpreadsheet, Trash2, Edit2 } from 'lucide-react';
import SheetCardColors from '../../../constants/SheetCardColors.js';
import styles from '../Stylings/SheetCard.module.css';

const SheetCard = ({ sheet, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG-u-nu-latn', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClick = (e) => {
    // Prevent navigation if clicking action buttons
    if (e.target.closest(`.${styles.actionButton}`)) {
      e.stopPropagation();
      return;
    }
    navigate(`/sheet/${sheet.id}`);
  };

  return (
    <div className={styles.sheetCard} onClick={handleClick}>
      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={() => onEdit(sheet)}
          className={`${styles.actionButton} ${styles.editButton}`}
          aria-label={`تعديل ${sheet.name}`}
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(sheet)}
          className={`${styles.actionButton} ${styles.deleteButton}`}
          aria-label={`حذف ${sheet.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Sheet Info */}
      <div className={styles.sheetInfo}>
        <div className={styles.sheetTitleContainer}>
          <FileSpreadsheet size={28} style={{ color: SheetCardColors.accentBlue }} />
          <h3 className={styles.sheetTitle}>{sheet.name}</h3>
        </div>
        <span className={styles.sheetRecordCount}>
          {sheet.record_count} سجلات
        </span>
      </div>

      {/* Sheet Description */}
      {sheet.description && (
        <p className={styles.sheetDescription}>{sheet.description}</p>
      )}

      {/* Last Updated */}
      <div className={styles.sheetUpdated}>
        <Calendar size={16} className={styles.sheetUpdatedIcon} />
        <span>آخر تحديث: {formatDate(sheet.updated_at)}</span>
      </div>
    </div>
  );
};

export default SheetCard;