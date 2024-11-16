// src/pages/SheetPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import useSpreadsheetData from '../hooks/useSpreadsheetData';
import useNotification from '../hooks/useNotification';
import DropdownEditor from '../../DropdownEditor';
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
import OptionsModal from '../../OptionsDialog';

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
    showDropdownEditor: showOptionsModal
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
//

const handleClickOutside = useCallback((event) => {
  if (!event.target.closest(`.${styles.dropdownContainer}`) && 
      !event.target.closest('.dropdown-cell') &&
      !event.target.closest('.htDropdownWrapper')) {
      setModalState(prev => ({ ...prev, isOpen: false }));
      setDropdownEditorState(prev => ({ ...prev, isOpen: false }));
  }
}, []);

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
      {/* Main Content Container */}
      <div id="mainContent" className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
    <button onClick={() => navigate('/')} className={styles.backButton}>
        <ArrowLeft size={18} />
        العودة للرئيسية
    </button>

    <h1 className={styles.pageTitle}>
        {sheetInfo?.name || 'جدول البيانات'}
    </h1>

    <div className={styles.actionButtons}>
        <button onClick={addNewRow} className={styles.addRowButton}>
            <PlusCircle size={18} />
            إضافة سجل
        </button>

        <button
            onClick={() => saveData(true)}
            disabled={isSaving}
            className={`${styles.saveButton} ${isSaving ? 'disabled' : ''}`}
        >
            {isSaving ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
            {isSaving ? 'جاري الحفظ' : 'حفظ'}
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
              style={{ top: `${43 + selectedRow * 23}px` }}
            >
              <Trash2 size={16} />
            </button>
          )}
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
