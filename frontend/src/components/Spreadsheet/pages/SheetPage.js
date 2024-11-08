import React, { useState } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useParams, useNavigate } from 'react-router-dom';
import useSpreadsheetData from '../hooks/useSpreadsheetData';
import useNotification from '../hooks/useNotification';
import useHotSettings from '../hooks/useHotSettings';
import { Loader2, Trash2, ArrowLeft, Save, PlusCircle } from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import GenerateButton from '../components/GenerateButton';
import useExcelGeneration from '../hooks/useExcelGeneration';

const COLORS = {
  lightBlueBackground: '#e6f7ff', // Same as HomePage background
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
  successGreen: '#48bb78',
  successGreenHover: '#38a169',
};

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
    sheetInfo, // Assuming this comes from useSpreadsheetData
  } = useSpreadsheetData(showNotification, id);

  const hotSettings = useHotSettings({
    data,
    setData,
    setSelectedRow,
    setHasChanges,
    onDeleteRow: () => setShowDeleteConfirm(true),
    showNotification,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
            marginBottom: '24px',
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: COLORS.darkText,
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ArrowLeft size={20} />
            العودة للرئيسية
          </button>

          {/* Page Title */}
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: COLORS.darkText,
              textAlign: 'center',
              flexGrow: 1,
            }}
          >
            {sheetInfo?.name || 'جدول البيانات'}
          </h1>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => saveData(true)}
              disabled={isSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isSaving ? '#a0aec0' : COLORS.primaryBlue,
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.2s',
              }}
            >
              {isSaving && <Loader2 size={20} className="animate-spin" />}
              <Save size={20} />
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </button>

            <GenerateButton onClick={() => handleGenerate(data)} isGenerating={isGenerating} />
          </div>
        </div>

        {/* Spreadsheet Container */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
            border: `1px solid ${COLORS.inputBorder}`,
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            backgroundColor: COLORS.cardBackground,
          }}
        >
          <HotTable {...hotSettings()} />

          {/* Delete Row Button */}
          {selectedRow !== null && data.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                position: 'absolute',
                right: '10px',
                top: `${43 + selectedRow * 23}px`,
                backgroundColor: '#fed7d7',
                color: '#c53030',
                padding: '5px',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                width: '24px',
                height: '24px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#feb2b2';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fed7d7';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Add New Row Button */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={addNewRow}
            style={{
              backgroundColor: COLORS.successGreen,
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              border: 'none',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.successGreenHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.successGreen;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
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
