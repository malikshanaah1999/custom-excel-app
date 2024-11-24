// src/components/Spreadsheet/pages/AdminPanel/SourcesList/SourcesList.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../../../../config/api';
import styles from './SourcesList.module.css';
import AddEditModal from '../components/AddEditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const SourcesList = ({ showNotification, onRefresh }) => {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [sourceToDelete, setSourceToDelete] = useState(null);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/product-sources`);
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      } else {
        throw new Error('Failed to fetch sources');
      }
    } catch (error) {
      showNotification('فشل في جلب مصادر المنتجات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAdd = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/product-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم إضافة مصدر المنتج بنجاح', 'success');
        setShowAddModal(false);
        fetchSources();
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to add product source');
      }
    } catch (error) {
      showNotification('فشل في إضافة مصدر المنتج', 'error');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/product-sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم تحديث مصدر المنتج بنجاح', 'success');
        setEditingSource(null);
        fetchSources();
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to update product source');
      }
    } catch (error) {
      showNotification('فشل في تحديث مصدر المنتج', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Check if source is in use
      const checkResponse = await fetch(`${API_BASE_URL}/admin/product-sources/${id}/check-usage`);
      const checkData = await checkResponse.json();
      
      if (checkData.isInUse) {
        showNotification('لا يمكن حذف مصدر المنتج لأنه مستخدم في بعض الجداول', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/product-sources/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showNotification('تم حذف مصدر المنتج بنجاح', 'success');
        setSourceToDelete(null);
        fetchSources();
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to delete product source');
      }
    } catch (error) {
      showNotification('فشل في حذف مصدر المنتج', 'error');
    }
  };

  const validateSourceName = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/product-sources/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          excludeId: editingSource?.id
        })
      });
      
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>مصادر المنتجات</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <Plus size={18} />
          إضافة مصدر منتج جديد
        </button>
      </div>

      <div className={styles.listContainer}>
        {isLoading ? (
          <div className={styles.emptyState}>
            جاري التحميل...
          </div>
        ) : sources.length === 0 ? (
          <div className={styles.emptyState}>
            لا توجد مصادر منتجات مضافة
          </div>
        ) : (
          <div className={styles.list}>
            {sources.map(source => (
              <div key={source.id} className={styles.item}>
                <span className={styles.itemName}>{source.name}</span>
                <div className={styles.actions}>
                  <button
                    onClick={() => setEditingSource(source)}
                    className={styles.editButton}
                    title="تعديل"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setSourceToDelete(source)}
                    className={styles.deleteButton}
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditModal
        isOpen={showAddModal || !!editingSource}
        onClose={() => {
          setShowAddModal(false);
          setEditingSource(null);
        }}
        onSubmit={editingSource ? 
          (data) => handleEdit(editingSource.id, data) : 
          handleAdd}
        item={editingSource}
        title={editingSource ? 'تعديل مصدر منتج' : 'إضافة مصدر منتج جديد'}
        itemType="مصدر المنتج"
        validateName={validateSourceName}
      />

      <DeleteConfirmModal
        isOpen={!!sourceToDelete}
        onClose={() => setSourceToDelete(null)}
        onConfirm={() => handleDelete(sourceToDelete.id)}
        itemName={sourceToDelete?.name}
        itemType="مصدر المنتج"
      />
    </div>
  );
};

export default SourcesList;