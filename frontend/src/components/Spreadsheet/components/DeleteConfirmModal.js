// src/components/Spreadsheet/components/DeleteConfirmModal.js

import React, { useEffect, useRef } from 'react';

const COLORS = {
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: '#fff',
  modalText: '#2d3748',
  modalSecondaryText: '#4a5568',
  modalBorder: '#e2e8f0',
  cancelButtonBackground: '#e2e8f0',
  cancelButtonHover: '#cbd5e0',
  cancelButtonText: '#1a202c',
  deleteButtonBackground: '#e53e3e',
  deleteButtonHover: '#c53030',
  deleteButtonText: '#fff',
};

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.modalOverlay,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s',
      }}
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        style={{
          backgroundColor: COLORS.modalBackground,
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          position: 'relative',
          direction: 'rtl',
          animation: 'scaleIn 0.3s',
          outline: 'none',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h3
          id="modal-title"
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: COLORS.modalText,
          }}
        >
          تأكيد الحذف
        </h3>
        <p
          style={{
            marginBottom: '24px',
            color: COLORS.modalSecondaryText,
            lineHeight: '1.6',
          }}
        >
          {isLastRow && isEmptyRow
            ? 'لا يمكن حذف السجل الأخير. يجب أن تحتوي الورقة على سجل واحد على الأقل.'
            : 'هل أنت متأكد من حذف هذا السجل؟'}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: COLORS.cancelButtonBackground,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              border: 'none',
              color: COLORS.cancelButtonText,
              fontSize: '16px',
              fontWeight: '500',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.cancelButtonHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.cancelButtonBackground)
            }
          >
            إلغاء
          </button>
          {(!isLastRow || !isEmptyRow) && (
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 24px',
                backgroundColor: COLORS.deleteButtonBackground,
                color: COLORS.deleteButtonText,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.deleteButtonHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.deleteButtonBackground)
              }
            >
              حذف
            </button>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default DeleteConfirmModal;
