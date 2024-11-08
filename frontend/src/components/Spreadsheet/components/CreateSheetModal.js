// src/components/CreateSheetModal.js

import React, { useState, useEffect } from 'react';
import { X, FileText, Edit3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../Stylings/CreateSheetModal.module.css'; // Import the CSS module

const CreateSheetModal = ({ isOpen, onClose, onCreate, isCreating }) => {
  const [sheetName, setSheetName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNameError(false);
      setSheetName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sheetName.trim() === '') {
      setNameError(true);
    } else {
      setNameError(false);
      onCreate({ name: sheetName, description });
    }
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
        {/* Modal Title */}
        <h2 id="modalTitle" className={styles.modalTitle}>
          إنشاء جدول جديد
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Sheet Name Input */}
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
              onFocus={(e) => e.target.classList.add(styles.inputFocus)}
              onBlur={(e) => e.target.classList.remove(styles.inputFocus)}
              aria-required="true"
            />
            <label htmlFor="sheetName" className={styles.inputLabel}>
              اسم الجدول<span className={styles.requiredAsterisk}>*</span>
            </label>
            <FileText size={20} className={styles.inputIcon} />
          </div>
          {nameError && (
            <div className={styles.errorMessage}>
              <span>هذا الحقل مطلوب.</span>
            </div>
          )}

          {/* Description Input */}
          <div className={styles.inputContainer}>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textareaField}
              placeholder=" "
              onFocus={(e) => e.target.classList.add(styles.inputFocus)}
              onBlur={(e) => e.target.classList.remove(styles.inputFocus)}
            />
            <label htmlFor="description" className={styles.inputLabel}>
              الوصف
            </label>
            <Edit3 size={20} className={styles.inputIcon} />
          </div>

          {/* Buttons */}
          <div className={styles.buttonContainer}>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Modal"
              className={styles.closeButton}
            >
              <X size={20} />
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreating}
              className={styles.submitButton}
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSheetModal;
