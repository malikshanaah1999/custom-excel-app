// src/components/Spreadsheet/components/DeleteConfirmModal.js

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from '../Stylings/DeleteConfirmModal.module.css';

const DeleteConfirmModal = ({
  show,
  onClose,
  onConfirm,
  isLastRow,
  isEmptyRow,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (show && modalRef.current) {
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
  }, [show, onClose]);

  if (!show) return null;

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
        <h3 id="modal-title" className={styles.modalTitle}>
          تأكيد الحذف
        </h3>
        <p className={styles.modalMessage}>
          {isLastRow && isEmptyRow
            ? 'لا يمكن حذف السجل الأخير. يجب أن تحتوي الورقة على سجل واحد على الأقل.'
            : 'هل أنت متأكد من حذف هذا السجل؟'}
        </p>
        <div className={styles.buttonContainer}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            aria-label="إلغاء الحذف"
          >
            إلغاء
          </button>
          {(!isLastRow || !isEmptyRow) && (
            <button
              onClick={onConfirm}
              className={styles.deleteButton}
              aria-label="تأكيد الحذف"
            >
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isLastRow: PropTypes.bool.isRequired,
  isEmptyRow: PropTypes.bool.isRequired,
};

export default DeleteConfirmModal;
