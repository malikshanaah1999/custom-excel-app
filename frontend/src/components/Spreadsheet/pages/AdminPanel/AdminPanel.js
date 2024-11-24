// src/components/Spreadsheet/pages/AdminPanel/AdminPanel.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CategoryManager from './CategoryManager/CategoryManager';
import ClassificationsList from './ClassificationsList/ClassificationsList';
import TagsList from './TagsList/TagsList';
import styles from './AdminPanel.module.css';
import useNotification from '../../hooks/useNotification';
import Notification from '../../components/Notification';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('category');

  const renderContent = () => {
    if (!selectedCategory) {
      return <CategoryManager onSelectCategory={setSelectedCategory} />;
    }

    return (
      <>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'classification' ? styles.active : ''}`}
            onClick={() => setActiveTab('classification')}
          >
            التصنيفات
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'tag' ? styles.active : ''}`}
            onClick={() => setActiveTab('tag')}
          >
            علامات التصنيف
          </button>
        </div>

        {activeTab === 'classification' ? (
          <ClassificationsList categoryId={selectedCategory.id} />
        ) : (
          <TagsList categoryId={selectedCategory.id} />
        )}
      </>
    );
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backButton}
        >
          <ArrowLeft size={18} />
          <span>العودة للرئيسية</span>
        </button>
        <h1>لوحة التحكم</h1>
      </header>

      <main className={styles.content}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;