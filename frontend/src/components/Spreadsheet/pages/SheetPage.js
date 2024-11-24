// src/pages/SheetPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import useSpreadsheetData from '../hooks/useSpreadsheetData';
import useNotification from '../hooks/useNotification';
import DropdownEditor from '../components/DropdownEditor';
import useHotSettings from '../hooks/useHotSettings';
import { useDropdownOptions } from '../hooks/useDropdownOptions';
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
import OptionsModal from '../components/OptionsDialog';
import { RefreshCw } from 'lucide-react';

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
  const { 
    refreshOptions: refreshCategories,
    options: categoryOptions 
  } = useDropdownOptions('فئة المنتج');

  const { 
    refreshOptions: refreshMeasurements,
    options: measurementOptions 
  } = useDropdownOptions('وحدة القياس');

  const { 
    refreshOptions: refreshSources,
    options: sourceOptions 
  } = useDropdownOptions('مصدر المنتج');

  const refreshAllDropdowns = useCallback(() => {
    refreshCategories();
    refreshMeasurements();
    refreshSources();
  }, [refreshCategories, refreshMeasurements, refreshSources]);

  useEffect(() => {
    // Auto refresh every 30 seconds
    const interval = setInterval(refreshAllDropdowns, 30000);
    return () => clearInterval(interval);
  }, [refreshAllDropdowns]);

  // Prevent memory leaks
  useEffect(() => {
    return () => {
      setModalState({
        isOpen: false,
        category: '',
        options: [],
        onSelect: null
      });
      setDropdownEditorState({
        isOpen: false,
        position: null
      });
    };
  }, []);

  const [dropdownEditorState, setDropdownEditorState] = useState({
    isOpen: false,
    options: [],
    onSelect: null,
    position: null
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    category: '',
    options: [],
    onSelect: null,
    position: null
  });

  const showOptionsModal = useCallback(({ category, options, onSelect, position }) => {
    const adjustedPosition = {
      top: position.top,
      left: position.left,
    };

    // Adjust position if it would go off screen
    if (position.top + 300 > window.innerHeight) {
      adjustedPosition.top = position.top - 300;
    }

    setModalState({
      isOpen: true,
      category,
      options: Array.isArray(options) ? options : [],
      onSelect,
      position: adjustedPosition
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleOptionSelect = useCallback((value) => {
    if (modalState.onSelect) {
      modalState.onSelect(value);
    }
    handleModalClose();
    setDropdownEditorState(prev => ({ ...prev, isOpen: false }));
  }, [modalState.onSelect, handleModalClose]);

  const hotSettings = useHotSettings({
    data,
    setData,
    setSelectedRow,
    setHasChanges,
    onDeleteRow: () => setShowDeleteConfirm(true),
    showNotification,
    showDropdownEditor: showOptionsModal,
  });

  const memoizedHotSettings = useMemo(() => hotSettings(), [
    data,
    setData,
    setSelectedRow,
    setHasChanges,
    showNotification,
    showOptionsModal,
    hotSettings
  ]);

  // Handle keydown events for shortcuts
  const handleKeyDown = useCallback(
    (event) => {
      // Handle Ctrl+S shortcut for saving
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveData(true);
      }

      // Handle "+" key press to add a new row
      // Check if no modifier keys are pressed (Ctrl, Alt, Meta)
      if (!event.ctrlKey && !event.altKey && !event.metaKey) {
        // Detect "+" key press
        if (
          event.key === '+' ||                // Standard "+" key
          (event.shiftKey && event.key === '=') || // Shift + "=" produces "+" on some keyboards
          event.keyCode === 107               // Numpad "+" key
        ) {
          event.preventDefault();
          addNewRow();
        }
      }
    },
    [saveData, addNewRow]
  );

  const handleClickOutside = useCallback((event) => {
    if (!event.target.closest(`.${styles.dropdownContainer}`) &&
        !event.target.closest('.dropdown-cell') &&
        !event.target.closest('.htDropdownWrapper')) {
      setModalState(prev => ({ ...prev, isOpen: false }));
      setDropdownEditorState(prev => ({ ...prev, isOpen: false }));
    }
  }, []);
  useEffect(() => {
    // Refresh dropdowns every 30 seconds
    const interval = setInterval(refreshAllDropdowns, 30000);
    return () => clearInterval(interval);
  }, [refreshAllDropdowns]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!modalState.isOpen) return;

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalState.isOpen, handleClickOutside]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.sheetPage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          <ArrowLeft size={18} />
          <span className={styles.backButtonText}>العودة للرئيسية</span>
        </button>

        <h1 className={styles.pageTitle}>
          {sheetInfo?.name || 'جدول البيانات'}
        </h1>

        <div className={styles.actionButtons}>
            <button
              onClick={refreshAllDropdowns}
              className={styles.refreshButton}
              title="تحديث القوائم المنسدلة"
          >
              <RefreshCw size={18} />
              <span className={styles.buttonText}>تحديث القوائم</span>
          </button>
          <button onClick={addNewRow} className={styles.addRowButton} title="إضافة حقل جديد">
            <PlusCircle size={18} />
            <span className={styles.buttonText}>إضافة حقل جديد</span>
          </button>

          <button
            onClick={() => saveData(true)}
            disabled={isSaving}
            className={`${styles.saveButton} ${isSaving ? styles.disabled : ''}`}
            title="حفظ البيانات (Ctrl+S)"
          >
            {isSaving ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
            <span className={styles.buttonText}>{isSaving ? 'جاري الحفظ' : 'حفظ'}</span>
          </button>

          <GenerateButton
            onClick={() => handleGenerate(data)}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className={styles.spreadsheetContainer}>
        <HotTable {...memoizedHotSettings} />

        {/* Delete Row Button */}
        {selectedRow !== null && data.length > 0 && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={styles.deleteRowButton}
            style={{ top: `${43 + selectedRow * 24}px` }}
            title="حذف الصف المحدد"
          >
            <Trash2 size={16} />
          </button>
        )}
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

      <OptionsModal
        isOpen={modalState.isOpen}
        category={modalState.category}
        options={modalState.options}
        onSelect={handleOptionSelect}
        onClose={handleModalClose}
        position={modalState.position}
        className={styles.optionsModal}
      />
    </div>
  );
};

export default SheetPage;
