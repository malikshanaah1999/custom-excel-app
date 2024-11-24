// src/components/Spreadsheet/pages/AdminPanel/AdminPanel.js


import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CategoryManager from './CategoryManager/CategoryManager';
import ClassificationsList from './ClassificationsList/ClassificationsList';
import TagsList from './TagsList/TagsList';
import MeasurementsList from './MeasurementsList/MeasurementsList';
import SourcesList from './SourcesList/SourcesList';
import styles from './AdminPanel.module.css';
import useNotification from '../../hooks/useNotification';
import Notification from '../../components/Notification';
import { API_BASE_URL } from '../../../../config/api';



const AdminPanel = () => {
  const navigate = useNavigate();
  const { notification, showNotification } = useNotification();

  // State for selected options
  const [selectedGlobalOption, setSelectedGlobalOption] = useState(null); // 'source' or 'measurement'
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null); // 'classification' or 'tag'

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState(null);

  // State variables for classifications and tags
  const [classifications, setClassifications] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoadingClassifications, setIsLoadingClassifications] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Fetch classifications and tags when a category is selected
  const fetchClassifications = useCallback(async (categoryId) => {
    setIsLoadingClassifications(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/classifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch classifications');
      }
      const data = await response.json();
      setClassifications(data);
    } catch (error) {
      console.error(error);
      showNotification('فشل في جلب التصنيفات', 'error');
      setClassifications([]);
    } finally {
      setIsLoadingClassifications(false);
    }
  }, [showNotification]);

  const fetchTags = useCallback(async (categoryId) => {
    setIsLoadingTags(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error(error);
      showNotification('فشل في جلب العلامات', 'error');
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, [showNotification]);

  // Effect to fetch data when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchClassifications(selectedCategory.id);
      fetchTags(selectedCategory.id);
      setSelectedCategoryOption(null); // Reset category option when a new category is selected
    }
  }, [selectedCategory, fetchClassifications, fetchTags]);

  // Handlers for category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Handlers for Global Options
  const handleGlobalOptionClick = (option) => {
    if (selectedGlobalOption === option) {
      // Toggle off if already selected
      setSelectedGlobalOption(null);
    } else {
      setSelectedGlobalOption(option);
      setSelectedCategoryOption(null); // Reset category option when a global option is selected
    }
  };

  // Handlers for Category Options
  const handleCategoryOptionClick = (option) => {
    if (selectedCategoryOption === option) {
      // Toggle off if already selected
      setSelectedCategoryOption(null);
    } else {
      setSelectedCategoryOption(option);
      setSelectedGlobalOption(null); // Reset global option when a category option is selected
    }
  };

  // Refresh handlers for CRUD operations
  const handleRefreshClassifications = () => {
    if (selectedCategory) {
      fetchClassifications(selectedCategory.id);
    }
  };

  const handleRefreshTags = () => {
    if (selectedCategory) {
      fetchTags(selectedCategory.id);
    }
  };

  const renderManagementContent = () => {
    if (selectedGlobalOption === 'source') {
      return (
        <SourcesList 
          onRefresh={() => {}} // Implement if necessary
          showNotification={showNotification}
        />
      );
    }

    if (selectedGlobalOption === 'measurement') {
      return (
        <MeasurementsList 
          onRefresh={() => {}} // Implement if necessary
          showNotification={showNotification}
        />
      );
    }

    if (selectedCategoryOption === 'classification' && selectedCategory) {
      return (
        <ClassificationsList 
          categoryId={selectedCategory.id} 
          classifications={classifications} 
          isLoading={isLoadingClassifications}
          onRefresh={handleRefreshClassifications}
          showNotification={showNotification}
        />
      );
    }

    if (selectedCategoryOption === 'tag' && selectedCategory) {
      return (
        <TagsList 
          categoryId={selectedCategory.id} 
          tags={tags} 
          isLoading={isLoadingTags}
          onRefresh={handleRefreshTags}
          showNotification={showNotification}
        />
      );
    }

    // Default content when nothing is selected
    return (
      <div className={styles.placeholder}>
        يرجى اختيار خيار من الأقسام اليمنى أو الوسطى لإدارة البيانات.
      </div>
    );
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            onClick={() => navigate('/')} 
            className={styles.backButton}
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
            <span>العودة للرئيسية</span>
          </button>
          <h1 className={styles.title}>لوحة التحكم</h1>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.mainContent}>
          {/* Left Column: Global Options */}
          <div className={styles.leftColumn}>
            <h2 className={styles.sectionTitle}>الخيارات العامة</h2>
            <button
              onClick={() => handleGlobalOptionClick('source')}
              className={`${styles.optionButton} ${selectedGlobalOption === 'source' ? styles.active : ''}`}
              aria-label="Manage Product Sources"
            >
              مصادر المنتجات
            </button>
            <button
              onClick={() => handleGlobalOptionClick('measurement')}
              className={`${styles.optionButton} ${selectedGlobalOption === 'measurement' ? styles.active : ''}`}
              aria-label="Manage Measurement Units"
            >
              وحدات القياس
            </button>
          </div>

          {/* Middle Column: Product Category Options */}
          <div className={styles.middleColumn}>
            <h2 className={styles.sectionTitle}>فئة المنتج</h2>
            <button
              onClick={() => handleCategoryOptionClick('classification')}
              className={`${styles.optionButton} ${selectedCategoryOption === 'classification' ? styles.active : ''}`}
              aria-label="Manage Classifications"
              disabled={!selectedCategory} // Disable if no category selected
            >
              التصنيفات
            </button>
            <button
              onClick={() => handleCategoryOptionClick('tag')}
              className={`${styles.optionButton} ${selectedCategoryOption === 'tag' ? styles.active : ''}`}
              aria-label="Manage Classification Tags"
              disabled={!selectedCategory} // Disable if no category selected
            >
              علامات التصنيف
            </button>
            {/* Optionally, display the selected category */}
            {selectedCategory && (
              <div className={styles.selectedCategory}>
                <span>الفئة المختارة:</span>
                <strong>{selectedCategory.name}</strong>
              </div>
            )}
            {/* Include the CategoryManager if no category is selected */}
            {!selectedCategory && (
              <CategoryManager
                onSelectCategory={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            )}
          </div>

          {/* Right Column: Management Content */}
          <div className={styles.rightColumn}>
            {renderManagementContent()}
          </div>
        </div>
      </main>

      {/* Notification component */}
      <Notification notification={notification} />
    </div>
  );
};

export default AdminPanel;
