// src/components/Spreadsheet/pages/AdminPanel/CategoryManager/AddEditCategoryModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './AddEditCategoryModal.module.css';

const AddEditCategoryModal = ({ isOpen, onClose, onSubmit, category }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
    setError('');
  }, [category, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('اسم الفئة مطلوب');
      return;
    }

    onSubmit({ name: name.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className={styles.modalTitle}>
          {category ? 'تعديل فئة' : 'إضافة فئة جديدة'}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              اسم الفئة <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className={`${styles.input} ${error ? styles.error : ''}`}
              placeholder="أدخل اسم الفئة"
              autoFocus
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              إلغاء
            </button>
            <button type="submit" className={styles.submitButton}>
              {category ? 'حفظ التغييرات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCategoryModal;