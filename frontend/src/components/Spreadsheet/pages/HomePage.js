// src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, FileX, List, Grid } from 'lucide-react';
import useSheets from '../hooks/useSheets';
import useNotification from '../hooks/useNotification';
import CreateSheetModal from '../components/CreateSheetModal';
import Notification from '../components/Notification';
import DeleteSheetModal from '../components/DeleteSheetModal';
import GridView from '../components/ListTypeView/GridView';
import ListView from '../components/ListTypeView/ListView';
import COLORS from '../../../constants/HomePageColors';
import styles from '../Stylings/HomePage.module.css';

const HomePage = () => {
  const { notification, showNotification } = useNotification();
  const {
    sheets,
    isLoading,
    isCreating,
    isDeleting,
    fetchSheets,
    createSheet,
    deleteSheet,
  } = useSheets(showNotification);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [isListView, setIsListView] = useState(false);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  useEffect(() => {
    if (showCreateModal || !!sheetToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showCreateModal, sheetToDelete]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      fetchSheets(value);
    } else {
      fetchSheets();
    }
  };

  const handleCreateSheet = async (sheetData) => {
    const sheetId = await createSheet(sheetData);
    if (sheetId) {
      setShowCreateModal(false);
    }
  };

  const handleDeleteSheet = async () => {
    if (sheetToDelete) {
      const success = await deleteSheet(sheetToDelete.id);
      if (success) {
        setSheetToDelete(null);
      }
    }
  };

  return (
    <div className={styles.homePage}>
      {/* Main Content Container */}
      <div
        id="mainContent"
        className={`${styles.mainContent} ${
          showCreateModal || !!sheetToDelete ? styles.mainContentBlur : ''
        }`}
      >
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>الجداول</h1>
          <div className={styles.headerActions}>
            {/* View Toggle Switch */}
            <div className={styles.viewToggle}>
              <span>{isListView ? 'عرض الشبكة' : 'عرض القائمة'}</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={isListView}
                  onChange={() => setIsListView(!isListView)}
                  className={styles.switchInput}
                />
                <span className={styles.switchSlider}></span>
                <span className={styles.switchCircle}></span>
              </label>
              {isListView ? <List size={20} /> : <Grid size={20} />}
            </div>

            {/* Create New Sheet Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className={styles.createButton}
            >
              <Plus size={20} color="#fff" />
              جدول جديد
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="البحث عن جدول..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Sheets Grid or List */}
        {isLoading ? (
          <div className={styles.loaderContainer}>
            <Loader2 size={48} className={styles.loaderIcon} />
          </div>
        ) : sheets.length > 0 ? (
          isListView ? (
            <ListView sheets={sheets} onDelete={setSheetToDelete} />
          ) : (
            <GridView sheets={sheets} onDelete={setSheetToDelete} />
          )
        ) : (
          <div className={styles.noData}>
            <FileX size={48} color={COLORS.errorIcon} />
            <p className={styles.noDataText}>
              {searchTerm
                ? 'لا توجد نتائج للبحث'
                : 'لا توجد جداول. أنشئ جدولاً جديداً للبدء!'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSheetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSheet}
        isCreating={isCreating}
      />

      <DeleteSheetModal
        isOpen={!!sheetToDelete}
        onClose={() => setSheetToDelete(null)}
        onConfirm={handleDeleteSheet}
        sheetName={sheetToDelete?.name}
        isDeleting={isDeleting}
      />

      {/* Notifications */}
      <Notification notification={notification} />
    </div>
  );
};

export default HomePage;
