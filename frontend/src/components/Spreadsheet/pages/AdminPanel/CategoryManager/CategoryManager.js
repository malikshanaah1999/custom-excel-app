// src/components/Spreadsheet/pages/AdminPanel/CategoryManager/CategoryManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../../../../config/api';
import useNotification from '../../../hooks/useNotification';
import AddEditCategoryModal from '../components/AddEditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Notification from '../../../components/Notification';
import ClassificationsList from '../ClassificationsList/ClassificationsList';
import TagsList from '../TagsList/TagsList';
import styles from './CategoryManager.module.css';
import MeasurementsList from '../MeasurementsList/MeasurementsList';
import SourcesList from '../SourcesList/SourcesList';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const { notification, showNotification } = useNotification();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('category');
    const [classifications, setClassifications] = useState([]);
    const [tags, setTags] = useState([]);
    const [isLoadingClassifications, setIsLoadingClassifications] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);
  // Fetch classifications for selected category
  const fetchClassifications = async () => {
    if (!selectedCategory) return;

    setIsLoadingClassifications(true);
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/categories/${selectedCategory.id}/classifications`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch classifications');
        }

        const data = await response.json();
        setClassifications(data);
    } catch (error) {
        console.error('Error fetching classifications:', error);
        showNotification('فشل في جلب التصنيفات', 'error');
        setClassifications([]);
    } finally {
        setIsLoadingClassifications(false);
    }
};
const refreshAllDropdowns = useCallback(() => {
  fetchCategories();
  if (selectedCategory) {
    fetchClassifications();
    fetchTags();
  }
}, [selectedCategory]);
// Fetch tags for selected category
const fetchTags = async () => {
    if (!selectedCategory) return;

    setIsLoadingTags(true);
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/categories/${selectedCategory.id}/tags`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch tags');
        }

        const data = await response.json();
        setTags(data);
    } catch (error) {
        console.error('Error fetching tags:', error);
        showNotification('فشل في جلب العلامات', 'error');
        setTags([]);
    } finally {
        setIsLoadingTags(false);
    }
};
// Fetch both classifications and tags when category changes
useEffect(() => {
    if (selectedCategory) {
        fetchClassifications();
        fetchTags();
    }
}, [selectedCategory]);
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
  const handleDeleteClassification = async (id) => {
    try {
      // First check if classification is in use
      const checkResponse = await fetch(`${API_BASE_URL}/admin/classifications/${id}/check-usage`);
      const checkData = await checkResponse.json();
      
      if (checkData.isInUse) {
        showNotification('لا يمكن حذف التصنيف لأنه مستخدم في بعض الجداول', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/classifications/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('تم حذف التصنيف بنجاح', 'success');
        fetchClassifications();
      } else {
        throw new Error('Failed to delete classification');
      }
    } catch (error) {
      showNotification('فشل في حذف التصنيف', 'error');
    }
  };
  const handleAddTag = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${selectedCategory.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showNotification('تم إضافة العلامة بنجاح', 'success');
        fetchTags();
      } else {
        throw new Error('Failed to add tag');
      }
    } catch (error) {
      showNotification('فشل في إضافة العلامة', 'error');
    }
  };

  const handleEditTag = async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showNotification('تم تحديث العلامة بنجاح', 'success');
        fetchTags();
      } else {
        throw new Error('Failed to update tag');
      }
    } catch (error) {
      showNotification('فشل في تحديث العلامة', 'error');
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      // First check if tag is in use
      const checkResponse = await fetch(`${API_BASE_URL}/admin/tags/${id}/check-usage`);
      const checkData = await checkResponse.json();
      
      if (checkData.isInUse) {
        showNotification('لا يمكن حذف العلامة لأنها مستخدمة في بعض الجداول', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/tags/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('تم حذف العلامة بنجاح', 'success');
        fetchTags();
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (error) {
      showNotification('فشل في حذف العلامة', 'error');
    }
  };
   // Add fetch for related data
   const fetchRelatedData = async (categoryId) => {
    try {
      const [classificationsRes, tagsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/categories/${categoryId}/classifications`),
        fetch(`${API_BASE_URL}/admin/categories/${categoryId}/tags`)
      ]);
      
      if (classificationsRes.ok && tagsRes.ok) {
        const classData = await classificationsRes.json();
        const tagData = await tagsRes.json();
        setClassifications(classData);
        setTags(tagData);
      }
    } catch (error) {
      showNotification('فشل في جلب البيانات المرتبطة', 'error');
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
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchRelatedData(category.id);
  };
  const handleAddClassification = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${selectedCategory.id}/classifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم إضافة التصنيف بنجاح', 'success');
        fetchRelatedData(selectedCategory.id);
      } else {
        throw new Error('Failed to add classification');
      }
    } catch (error) {
      showNotification('فشل في إضافة التصنيف', 'error');
    }
  };
  
  const handleEditClassification = async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم تحديث التصنيف بنجاح', 'success');
        fetchRelatedData(selectedCategory.id);
      } else {
        throw new Error('Failed to update classification');
      }
    } catch (error) {
      showNotification('فشل في تحديث التصنيف', 'error');
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar for categories */}
      <div className={styles.sidebar}>
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
  
        <div className={styles.categoriesList}>
        {filteredCategories.map((category) => (
            <div key={category.id} className={styles.categoryItem}>
              <span>{category.name}</span>
              <div className={styles.actions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(category);
                  }}
                  className={styles.editButton}
                  title="تعديل"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategoryToDelete(category);
                  }}
                  className={styles.deleteButton}
                  title="حذف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
  
      {/* Content area for details */}
      <div className={styles.content}>
        {selectedCategory ? (
          <>
            {/* Tabs for classifications and tags */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "classification" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("classification")}
              >
                التصنيفات
              </button>

              <button
                className={`${styles.tab} ${
                  activeTab === "tag" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("tag")}
              >
                علامات التصنيف
              </button>
              <button
                className={`${styles.tab} ${activeTab === "measurement" ? styles.active : ""}`}
                onClick={() => setActiveTab("measurement")}
              >
                وحدات القياس
              </button>
              <button
                className={`${styles.tab} ${activeTab === "source" ? styles.active : ""}`}
                onClick={() => setActiveTab("source")}
              >
                مصادر المنتج
              </button>

            </div>
  
            {/* Render classifications or tags based on activeTab */}

            {activeTab === "classification" && (
              <ClassificationsList
              categoryId={selectedCategory.id}
              classifications={classifications}
              isLoading={isLoadingClassifications}
              onRefresh={fetchClassifications}
              showNotification={showNotification}
              />
            )}
  
            {activeTab === "tag" && (
              <TagsList
              categoryId={selectedCategory.id}
              tags={tags}
              isLoading={isLoadingTags}
              onRefresh={fetchTags}
              showNotification={showNotification}
              />
            )}
            {activeTab === "measurement" && (
            <MeasurementsList
              onRefresh={refreshAllDropdowns}
              showNotification={showNotification}
            />
          )}

          {activeTab === "source" && (
            <SourcesList
              onRefresh={refreshAllDropdowns}
              showNotification={showNotification}
            />
          )}

          </>
        ) : (
          <div className={styles.noSelection}>
            الرجاء اختيار فئة من القائمة
          </div>
        )}
      </div>
  
      {/* Modals for add/edit and delete confirmation */}
      <AddEditCategoryModal
        isOpen={showAddModal || !!editingCategory}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
        onSubmit={
          editingCategory
            ? (data) => handleEdit(editingCategory.id, data)
            : handleAdd
        }
        category={editingCategory}
      />
  
      <DeleteConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => handleDelete(categoryToDelete.id)}
        itemName={categoryToDelete?.name}
        itemType="الفئة"
      />
  
      {/* Notification component */}
      <Notification notification={notification} />
    </div>
  );
  
};

export default CategoryManager;