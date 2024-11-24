// src/components/Spreadsheet/pages/AdminPanel/CategoryManager/AddEditModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './AddEditModal.module.css';

const AddEditModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  item, 
  title,
  itemType,
  validateName = async () => true, 
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
    } else {
      setName('');
    }
    setError('');
  }, [item, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(`اسم ${itemType} مطلوب`);
      return;
    }

    // Add validation before submit
    const isValid = await validateName(name.trim());
    if (!isValid) {
      setError(`${itemType} موجود مسبقاً`);
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

        <h2 className={styles.modalTitle}>{title}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              الاسم <span className={styles.required}>*</span>
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
              placeholder={`أدخل اسم ${itemType}`}
              autoFocus
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              إلغاء
            </button>
            <button type="submit" className={styles.submitButton}>
              {item ? 'حفظ التغييرات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditModal;