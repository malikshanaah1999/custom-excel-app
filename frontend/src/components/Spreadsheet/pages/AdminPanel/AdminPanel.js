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
import { API_BASE_URL } from 'config/api'; // Assuming absolute imports are set up

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

  const renderContent = () => {
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
          {/* Remove the Measurement Units and Product Sources tabs from here */}
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

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backButton}
          aria-label="Back to Home"
        >
          <ArrowLeft size={18} />
          <span>العودة للرئيسية</span>
        </button>
        <h1 className={styles.title}>لوحة التحكم</h1>
        {/* Add Product Sources and Measurement Units buttons here */}
        <div className={styles.globalOptions}>
          <button
            onClick={() => setActiveTab('source')}
            className={`${styles.globalButton} ${activeTab === 'source' ? styles.active : ''}`}
            aria-label="Manage Product Sources"
          >
            مصادر المنتجات
          </button>
          <button
            onClick={() => setActiveTab('measurement')}
            className={`${styles.globalButton} ${activeTab === 'measurement' ? styles.active : ''}`}
            aria-label="Manage Measurement Units"
          >
            وحدات القياس
          </button>
        </div>
      </header>

      <main className={styles.content}>
        {renderContent()}
        {/* Render global options content when activeTab is 'source' or 'measurement' */}
        {activeTab === 'measurement' && (
          <MeasurementsList 
            onRefresh={() => {}} // Implement if necessary
            showNotification={showNotification}
          />
        )}
        {activeTab === 'source' && (
          <SourcesList 
            onRefresh={() => {}} // Implement if necessary
            showNotification={showNotification}
          />
        )}
      </main>

      {/* Notification component */}
      <Notification notification={notification} />
    </div>
  );
};

export default AdminPanel;
