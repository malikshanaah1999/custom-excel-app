// src/pages/HomePage.js

import React, { useState, useEffect, useCallback } from 'react';  
import { Plus, Loader2, FileX, List, Grid } from 'lucide-react';
import useSheets from '../hooks/useSheets';
import useNotification from '../hooks/useNotification';
import CreateSheetModal from '../components/CreateSheetModal';
import EditSheetModal from '../components/EditSheetModal';
import Notification from '../components/Notification';
import DeleteSheetModal from '../components/DeleteSheetModal';
import GridView from '../components/ListTypeView/GridView';
import ListView from '../components/ListTypeView/ListView';
import COLORS from '../../../constants/HomePageColors';
import styles from '../Stylings/HomePage.module.css';
import SortDropdown from '../components/SortDropdown'; 
const HomePage = () => {
  const { notification, showNotification } = useNotification();
  const {
    sheets,
    isLoading,
    isCreating,
    isDeleting,
    isEditing,
    fetchSheets,
    createSheet,
    deleteSheet,
    editSheet,
  } = useSheets(showNotification);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [sheetToEdit, setSheetToEdit] = useState(null);
  const [isListView, setIsListView] = useState(false);
  const [sortBy, setSortBy] = useState('recent-activity');

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  useEffect(() => {
    if (showCreateModal || !!sheetToDelete || !!sheetToEdit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showCreateModal, sheetToDelete, sheetToEdit]);

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

  const handleEditSheet = async (sheetId, updatedData) => {
    const success = await editSheet(sheetId, updatedData);
    if (success) {
      setSheetToEdit(null);
    }
  };
  const getSortedSheets = useCallback(() => {
    if (!sheets) return [];
    
    return [...sheets].sort((a, b) => {
      if (sortBy === 'recent-activity') {
        return new Date(b.updated_at) - new Date(a.updated_at);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [sheets, sortBy]);

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
          <SortDropdown 
    currentSort={sortBy}
    onSortChange={setSortBy}
  />
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
            <ListView 
    sheets={getSortedSheets()} 
    onDelete={setSheetToDelete}
    onEdit={setSheetToEdit}
  />
          ) : (
            <GridView 
    sheets={getSortedSheets()} 
    onDelete={setSheetToDelete}
    onEdit={setSheetToEdit}
  />
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

      <EditSheetModal
        isOpen={!!sheetToEdit}
        onClose={() => setSheetToEdit(null)}
        onEdit={handleEditSheet}
        isEditing={isEditing}
        initialName={sheetToEdit?.name}
        sheetId={sheetToEdit?.id}
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