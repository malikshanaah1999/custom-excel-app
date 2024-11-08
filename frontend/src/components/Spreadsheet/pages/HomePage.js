import React, { useState, useEffect } from 'react';
import { Plus, Loader2, FileX, List, Grid } from 'lucide-react'; // Import icons
import useSheets from '../hooks/useSheets';
import useNotification from '../hooks/useNotification';
import CreateSheetModal from '../components/CreateSheetModal';
import Notification from '../components/Notification';
import DeleteSheetModal from '../components/DeleteSheetModal';
import GridView from '../components/ListTypeView/GridView'; // Import GridView component
import ListView from '../components/ListTypeView/ListView'; // Import ListView component

const COLORS = {
  lightBlueBackground: '#e6f7ff', // Very light blue background color
  darkText: '#2d3748',
  primaryBlue: '#4299e1',
  primaryBlueHover: '#3182ce',
  inputBorder: '#e2e8f0',
  inputFocusBorder: '#3182ce',
  inputBackground: '#fff',
  placeholderText: '#a0aec0',
  spinnerColor: '#4299e1',
  errorText: '#718096',
  errorIcon: '#cbd5e0',
  cardBackground: '#ffffff',
  cardHoverBackground: '#f0f4f8',
  cardBorder: '#e2e8f0',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  cardHoverShadow: 'rgba(0, 0, 0, 0.15)',
  secondaryText: '#4a5568',
  accentBlue: '#4299e1',
  dangerRed: '#e53e3e',
  dangerRedHover: '#c53030',
  iconGray: '#718096',
};

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
  const [isListView, setIsListView] = useState(false); // State to track view mode

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  useEffect(() => {
    if (showCreateModal || !!sheetToDelete) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling
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
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        direction: 'rtl', // Set the direction to RTL
        backgroundColor: COLORS.lightBlueBackground, // Apply light blue background
        minHeight: '100vh', // Ensure background covers full height
      }}
    >
      {/* Main Content Container */}
      <div
        id="mainContent"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 16px',
          filter: showCreateModal || !!sheetToDelete ? 'blur(5px)' : 'none',
          transition: 'filter 0.3s ease',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.darkText }}>
            الجداول
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* View Toggle Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{isListView ? 'عرض الشبكة' : 'عرض القائمة'}</span>
              <label
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px',
                }}
              >
                <input
                  type="checkbox"
                  checked={isListView}
                  onChange={() => setIsListView(!isListView)}
                  style={{
                    opacity: 0,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    inset: 0,
                    backgroundColor: isListView ? COLORS.primaryBlue : '#ccc',
                    borderRadius: '24px',
                    transition: '0.4s',
                  }}
                ></span>
                <span
                  style={{
                    position: 'absolute',
                    height: '18px',
                    width: '18px',
                    right: isListView ? '4px' : '26px', // Adjusted for RTL
                    top: '3px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    transition: '0.4s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                ></span>
              </label>
              {isListView ? <List size={20} /> : <Grid size={20} />}
            </div>

            {/* Create New Sheet Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: COLORS.primaryBlue,
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.primaryBlueHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.primaryBlue)
              }
            >
              <Plus size={20} color="#fff" />
              جدول جديد
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '30%',
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="البحث عن جدول..."
              style={{
                width: '100%',
                padding: '12px 16px', // Adjusted padding since icon is removed
                border: `1px solid ${COLORS.inputBorder}`,
                borderRadius: '8px',
                fontSize: '16px',
                color: COLORS.darkText,
                backgroundColor: COLORS.inputBackground,
                outline: 'none',
                direction: 'rtl',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.inputFocusBorder;
                e.target.style.boxShadow =
                  '0 0 0 3px rgba(66, 153, 225, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = COLORS.inputBorder;
                e.target.style.boxShadow =
                  '0 1px 3px rgba(0, 0, 0, 0.05)';
              }}
            />
            {/* Removed Search Icon */}
          </div>
        </div>

        {/* Sheets Grid or List */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <Loader2
              size={48}
              style={{
                color: COLORS.spinnerColor,
                animation: 'spin 2s linear infinite',
              }}
            />
            {/* Spinner Animation */}
            <style>
              {`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : sheets.length > 0 ? (
          isListView ? (
            <ListView sheets={sheets} onDelete={setSheetToDelete} />
          ) : (
            <GridView sheets={sheets} onDelete={setSheetToDelete} />
          )
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: COLORS.errorText,
              padding: '48px 0',
            }}
          >
            <FileX size={48} color={COLORS.errorIcon} />
            <p style={{ marginTop: '16px', fontSize: '18px' }}>
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
