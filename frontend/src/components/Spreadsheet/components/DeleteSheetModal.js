// src/components/Spreadsheet/components/DeleteConfirmModal.js
//
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import styles from '../Stylings/DeleteSheetModal.module.css';
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  sheetName,
  isDeleting,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal for accessibility
      modalRef.current.focus();

      // Trap focus within the modal
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Backward tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Forward tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        } else if (e.key === 'Escape') {
          // Close modal on Escape key
          onClose();
        }
      };

      modalRef.current.addEventListener('keydown', handleTab);

      return () => {
        // Cleanup function
        if (modalRef.current) {
          modalRef.current.removeEventListener('keydown', handleTab);
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      className={styles.modalOverlay}
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        <h2 id="modal-title" className={styles.modalTitle}>
          تأكيد حذف الجدول
        </h2>

        <p className={styles.modalMessage}>
          هل أنت متأكد من حذف الجدول <span style={{ fontWeight: 'bold' }}>"{sheetName}"</span>؟
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </p>

        <div className={styles.buttonContainer}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={styles.cancelButton}
            aria-label="إلغاء الحذف"
          >
            إلغاء
          </button>
          {!isDeleting && (
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className={styles.deleteButton}
              aria-label="تأكيد الحذف"
            >
              حذف
            </button>
          )}
          {isDeleting && (
            <button
              disabled
              className={`${styles.deleteButton} ${styles.deleteButtonDisabled}`}
              aria-label="جاري الحذف..."
            >
              جارٍ الحذف...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  sheetName: PropTypes.string.isRequired,
  isDeleting: PropTypes.bool.isRequired,
};

export default DeleteConfirmModal;
