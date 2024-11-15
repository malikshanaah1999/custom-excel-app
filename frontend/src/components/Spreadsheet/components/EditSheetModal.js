// src/components/EditSheetModal.js//
import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../Stylings/EditSheetModal.module.css';

const EditSheetModal = ({ isOpen, onClose, onEdit, isEditing, initialName, sheetId }) => {
  const [sheetName, setSheetName] = useState('');
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSheetName(initialName);
      setNameError(false);
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sheetName.trim() === '') {
      setNameError(true);
      return;
    }
    onEdit(sheetId, { name: sheetName.trim() });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={onClose}
      className={styles.modalOverlay}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={styles.modalContent}
      >
        <h2 id="modalTitle" className={styles.modalTitle}>
          تعديل اسم الجدول
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              id="sheetName"
              value={sheetName}
              onChange={(e) => {
                setSheetName(e.target.value);
                if (e.target.value.trim() !== '') {
                  setNameError(false);
                }
              }}
              className={`${styles.inputField} ${nameError ? styles.errorInput : ''}`}
              placeholder=" "
              autoFocus
            />
            <label htmlFor="sheetName" className={styles.inputLabel}>
              اسم الجدول<span className={styles.requiredAsterisk}>*</span>
            </label>
            <Edit3 size={20} className={styles.inputIcon} />
          </div>
          {nameError && (
            <div className={styles.errorMessage}>
              <span>هذا الحقل مطلوب.</span>
            </div>
          )}

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
            >
              <X size={20} />
            </button>

            <button
              type="submit"
              disabled={isEditing}
              className={styles.submitButton}
            >
              {isEditing ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditSheetModal;