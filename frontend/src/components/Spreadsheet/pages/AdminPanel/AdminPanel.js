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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('classification'); // Default to 'classification'
  const { notification, showNotification } = useNotification();

  // State variables for classifications and tags
  const [classifications, setClassifications] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoadingClassifications, setIsLoadingClassifications] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // State for global options
  const [activeGlobalTab, setActiveGlobalTab] = useState(null); // 'source' or 'measurement'

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
      setActiveTab('classification'); // Reset to default tab on new selection
      setActiveGlobalTab(null); // Reset global tabs when a new category is selected
    }
  }, [selectedCategory, fetchClassifications, fetchTags]);

  // Handler for category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Refresh handlers
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

  const renderCategoryContent = () => {
    if (!selectedCategory) {
      return (
        <CategoryManager
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
      );
    }

    return (
      <>
        <div className={styles.tabs} role="tablist">
          <button
            className={`${styles.tab} ${activeTab === 'classification' ? styles.active : ''}`}
            onClick={() => setActiveTab('classification')}
            aria-selected={activeTab === 'classification'}
            role="tab"
          >
            التصنيفات
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'tag' ? styles.active : ''}`}
            onClick={() => setActiveTab('tag')}
            aria-selected={activeTab === 'tag'}
            role="tab"
          >
            علامات التصنيف
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'classification' ? (
            isLoadingClassifications ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>جارٍ التحميل...</span>
              </div>
            ) : (
              <ClassificationsList 
                categoryId={selectedCategory.id} 
                classifications={classifications} 
                isLoading={isLoadingClassifications}
                onRefresh={handleRefreshClassifications}
                showNotification={showNotification}
              />
            )
          ) : activeTab === 'tag' ? (
            isLoadingTags ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>جارٍ التحميل...</span>
              </div>
            ) : (
              <TagsList 
                categoryId={selectedCategory.id} 
                tags={tags} 
                isLoading={isLoadingTags}
                onRefresh={handleRefreshTags}
                showNotification={showNotification}
              />
            )
          ) : null}
        </div>
      </>
    );
  };

  const renderGlobalContent = () => {
    if (!activeGlobalTab) {
      return null;
    }

    if (activeGlobalTab === 'measurement') {
      return (
        <MeasurementsList 
          onRefresh={() => {}} // Implement if necessary
          showNotification={showNotification}
        />
      );
    }

    if (activeGlobalTab === 'source') {
      return (
        <SourcesList 
          onRefresh={() => {}} // Implement if necessary
          showNotification={showNotification}
        />
      );
    }

    return null;
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
        {/* Add Product Sources and Measurement Units buttons here */}
        <div className={styles.globalOptions}>
          <button
            onClick={() => {
              setActiveGlobalTab(activeGlobalTab === 'source' ? null : 'source');
              setActiveTab(null); // Optional: Reset activeTab
            }}
            className={`${styles.globalButton} ${activeGlobalTab === 'source' ? styles.active : ''}`}
            aria-label="Manage Product Sources"
          >
            مصادر المنتجات
          </button>
          <button
            onClick={() => {
              setActiveGlobalTab(activeGlobalTab === 'measurement' ? null : 'measurement');
              setActiveTab(null); // Optional: Reset activeTab
            }}
            className={`${styles.globalButton} ${activeGlobalTab === 'measurement' ? styles.active : ''}`}
            aria-label="Manage Measurement Units"
          >
            وحدات القياس
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.mainContent}>
          {/* Left Column: Product Category Related Content */}
          <div className={styles.leftColumn}>
            {renderCategoryContent()}
          </div>

          {/* Right Column: Global Options */}
          <div className={styles.rightColumn}>
            {renderGlobalContent()}
          </div>
        </div>
      </main>

      {/* Notification component */}
      <Notification notification={notification} />
    </div>
  );
};

export default AdminPanel;



