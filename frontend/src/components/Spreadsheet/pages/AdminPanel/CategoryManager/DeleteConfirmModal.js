// src/components/Spreadsheet/pages/AdminPanel/CategoryManager/DeleteConfirmModal.js
import React from 'react';
import { X } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, itemType }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className={styles.modalTitle}>تأكيد الحذف</h2>

        <p className={styles.message}>
          هل أنت متأكد من حذف {itemType} "{itemName}"؟
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </p>

        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelButton}>
            إلغاء
          </button>
          <button onClick={onConfirm} className={styles.deleteButton}>
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;