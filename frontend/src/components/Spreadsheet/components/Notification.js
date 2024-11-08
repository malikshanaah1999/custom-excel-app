// src/components/Spreadsheet/components/Notification.js

import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../Stylings/Notification.module.css'; // Import the CSS module

const Notification = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(!!notification);
  const timerId = useRef(null);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-dismiss after 5 seconds
      timerId.current = setTimeout(() => {
        handleClose();
      }, 5000);
    }
    return () => {
      clearTimeout(timerId.current);
    };
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!notification) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
          className={`${styles.notification} ${
            notification.type === 'error' ? styles.error : styles.success
          }`}
          onMouseEnter={() => clearTimeout(timerId.current)}
          onMouseLeave={() => {
            // Restart the auto-dismiss timer when mouse leaves
            timerId.current = setTimeout(() => {
              handleClose();
            }, 3000);
          }}
        >
          {/* Icon */}
          {notification.type === 'error' ? (
            <XCircle size={24} className={styles.icon} />
          ) : (
            <CheckCircle size={24} className={styles.icon} />
          )}

          {/* Message */}
          <div className={styles.message}>{notification.message}</div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close Notification"
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
