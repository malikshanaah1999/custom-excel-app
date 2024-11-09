// src/pages/SheetPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import useSpreadsheetData from '../hooks/useSpreadsheetData';
import useNotification from '../hooks/useNotification';
import useHotSettings from '../hooks/useHotSettings';
import {
  Loader2,
  Trash2,
  ArrowLeft,
  Save,
  PlusCircle,
} from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import GenerateButton from '../components/GenerateButton';
import useExcelGeneration from '../hooks/useExcelGeneration';
import styles from '../Stylings/SheetPage.module.css';

const SheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification } = useNotification();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isGenerating, handleGenerate } = useExcelGeneration(showNotification);
  const {
    data,
    setData,
    isLoading,
    isSaving,
    selectedRow,
    setSelectedRow,
    setHasChanges,
    saveData,
    deleteRow,
    addNewRow,
    sheetInfo,
  } = useSpreadsheetData(showNotification, id);

  const hotSettings = useHotSettings({
    data,
    setData,
    setSelectedRow,
    setHasChanges,
    onDeleteRow: () => setShowDeleteConfirm(true),
    showNotification,
  });

  // Handle Ctrl+S shortcut for saving
  const handleKeyDown = useCallback(
    (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveData(true);
      }
    },
    [saveData]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.sheetPage}>
      {/* Main Content Container */}
      <div id="mainContent" className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          {/* Back Button */}
          <button onClick={() => navigate('/')} className={styles.backButton}>
            <ArrowLeft size={20} />
            العودة للرئيسية
          </button>

          {/* Page Title */}
          <h1 className={styles.pageTitle}>
            {sheetInfo?.name || 'جدول البيانات'}
          </h1>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              onClick={() => saveData(true)}
              disabled={isSaving}
              className={`${styles.saveButton} ${
                isSaving ? 'disabled' : ''
              }`}
            >
              {isSaving && <Loader2 size={20} className={styles.spinner} />}
              <Save size={20} />
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </button>

            <GenerateButton
              onClick={() => handleGenerate(data)}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Spreadsheet Container */}
        <div className={styles.spreadsheetContainer}>
          <HotTable {...hotSettings()} />

          {/* Delete Row Button */}
          {selectedRow !== null && data.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={styles.deleteRowButton}
              style={{ top: `${43 + selectedRow * 23}px` }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Add New Row Button */}
        <div className={styles.addRowContainer}>
          <button onClick={addNewRow} className={styles.addRowButton}>
            <PlusCircle size={20} color="#fff" />
            إضافة سجل جديد
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteRow(selectedRow);
          setShowDeleteConfirm(false);
        }}
        isLastRow={data.length === 1}
        isEmptyRow={!data[0]?.some((cell) => (cell ?? '').toString().trim() !== '')}
      />

      {/* Notifications */}
      <Notification notification={notification} />
    </div>
  );
};

export default SheetPage;
