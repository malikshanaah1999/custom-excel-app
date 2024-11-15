// src/components/ListView.js
//
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Trash2, Calendar, Edit2 } from 'lucide-react';
import ListViewColors from '../../../../constants/ListViewColors.js';
import styles from '../../Stylings/ListView.module.css';


const ListView = ({ sheets, onDelete, onEdit }) => {
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

  const navigateToSheet = (sheetId) => {
    navigate(`/sheet/${sheetId}`);
  };

  return (
    <table className={styles.table}>
      <thead>
      <tr>
  <th>الاسم</th>
  <th>الوصف</th>
  <th>عدد السجلات</th>
  <th>آخر تحديث</th>
  <th className={styles.actionsHeader}>الإجراءات</th>
</tr>
      </thead>
      <tbody>
  {sheets.map((sheet, index) => (
    <tr key={sheet.id} onClick={() => navigateToSheet(sheet.id)}>
      <td>
        <div className={styles.sheetTitleContainer}>
          <FileSpreadsheet size={20} style={{ color: ListViewColors.accentBlue }} />
          <span className={styles.sheetTitle}>{sheet.name}</span>
        </div>
      </td>
      <td>
        <span>{sheet.description || '-'}</span>
      </td>
      <td>
        <span>{sheet.record_count} سجلات</span>
      </td>
      <td>
        <span>{formatDate(sheet.updated_at)}</span>
      </td>
      <td className={styles.actionsCell}>
  <div className={styles.actionButtons}>
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (typeof onEdit === 'function') {
          onEdit(sheet);
        }
      }}
      className={styles.editButton}
      aria-label={`تعديل ${sheet.name}`}
    >
      <Edit2 size={20} />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (typeof onDelete === 'function') {
          onDelete(sheet);
        }
      }}
      className={styles.deleteButton}
      aria-label={`حذف ${sheet.name}`}
    >
      <Trash2 size={20} />
    </button>
  </div>
</td>
    </tr>
  ))}
</tbody>
    </table>
  );
};

export default ListView;
