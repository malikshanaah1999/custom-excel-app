// src/components/Spreadsheet/pages/AdminPanel/AdminPanel.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from '../../Stylings/AdminPanel.module.css';
import CategoryManager from './CategoryManager';
import ClassificationManager from './ClassificationManager';
import TagManager from './TagManager';
import MeasurementManager from './MeasurementManager';
import SourceManager from './SourceManager';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: 'فئات المنتجات' },
    { id: 'classifications', label: 'التصنيفات' },
    { id: 'tags', label: 'علامات التصنيف' },
    { id: 'measurements', label: 'وحدات القياس' },
    { id: 'sources', label: 'مصادر المنتجات' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoryManager />;
      case 'classifications':
        return <ClassificationManager />;
      case 'tags':
        return <TagManager />;
      case 'measurements':
        return <MeasurementManager />;
      case 'sources':
        return <SourceManager />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.adminPanel}>
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

      <nav className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;