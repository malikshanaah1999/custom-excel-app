// src/components/Spreadsheet/pages/AdminPanel/CategoryManager/CategoryManager.js
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../../../config/api';
import styles from './CategoryManager.module.css';
import AddEditCategoryModal from './AddEditCategoryModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import useNotification from '../../../hooks/useNotification';
import Notification from '../../../components/Notification';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/categories`);
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      } else {
        showNotification('حدث خطأ في جلب البيانات', 'error');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('حدث خطأ في جلب البيانات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      
      if (response.ok) {
        showNotification('تم إضافة الفئة بنجاح', 'success');
        setShowAddModal(false);
        fetchCategories();
      } else {
        showNotification(data.message || 'فشل في إضافة الفئة', 'error');
      }
    } catch (error) {
      showNotification('فشل في إضافة الفئة', 'error');
    }
  };

  const handleEdit = async (id, categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      
      if (response.ok) {
        showNotification('تم تحديث الفئة بنجاح', 'success');
        setEditingCategory(null);
        fetchCategories();
      } else {
        showNotification(data.message || 'فشل في تحديث الفئة', 'error');
      }
    } catch (error) {
      showNotification('فشل في تحديث الفئة', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showNotification('تم حذف الفئة بنجاح', 'success');
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        const data = await response.json();
        showNotification(data.message || 'فشل في حذف الفئة', 'error');
      }
    } catch (error) {
      showNotification('فشل في حذف الفئة', 'error');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <Plus size={20} />
          إضافة فئة جديدة
        </button>
        
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="البحث عن فئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <Loader2 size={40} className={styles.spinner} />
          <p>جاري التحميل...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className={styles.noData}>
          {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد فئات مضافة'}
        </div>
      ) : (
        <div className={styles.categoriesList}>
          {filteredCategories.map((category) => (
            <div key={category.id} className={styles.categoryItem}>
              <span className={styles.categoryName}>{category.name}</span>
              <div className={styles.actions}>
                <button
                  onClick={() => setEditingCategory(category)}
                  className={styles.editButton}
                  title="تعديل"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setCategoryToDelete(category)}
                  className={styles.deleteButton}
                  title="حذف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditCategoryModal
        isOpen={showAddModal || !!editingCategory}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? 
          (data) => handleEdit(editingCategory.id, data) : 
          handleAdd}
        category={editingCategory}
      />

      <DeleteConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => handleDelete(categoryToDelete.id)}
        itemName={categoryToDelete?.name}
        itemType="الفئة"
      />

      <Notification notification={notification} />
    </div>
  );
};

export default CategoryManager;