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

  // Fetch classifications when a category is selected
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

  // Fetch tags when a category is selected
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
          <button
            className={`${styles.tab} ${activeTab === 'measurement' ? styles.active : ''}`}
            onClick={() => setActiveTab('measurement')}
            aria-selected={activeTab === 'measurement'}
            role="tab"
          >
            وحدات القياس
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'source' ? styles.active : ''}`}
            onClick={() => setActiveTab('source')}
            aria-selected={activeTab === 'source'}
            role="tab"
          >
            مصادر المنتج
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'classification' ? (
            <ClassificationsList 
              categoryId={selectedCategory.id} 
              classifications={classifications} 
              isLoading={isLoadingClassifications}
              onRefresh={handleRefreshClassifications}
              showNotification={showNotification}
            />
          ) : activeTab === 'tag' ? (
            <TagsList 
              categoryId={selectedCategory.id} 
              tags={tags} 
              isLoading={isLoadingTags}
              onRefresh={handleRefreshTags}
              showNotification={showNotification}
            />
          ) : activeTab === 'measurement' ? (
            <MeasurementsList 
              onRefresh={() => {}} // Implement if necessary
              showNotification={showNotification}
            />
          ) : activeTab === 'source' ? (
            <SourcesList 
              onRefresh={() => {}} // Implement if necessary
              showNotification={showNotification}
            />
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
      </header>

      <main className={styles.content}>
        {renderContent()}
      </main>

      {/* Notification component */}
      <Notification notification={notification} />
    </div>
  );
};

export default AdminPanel;
