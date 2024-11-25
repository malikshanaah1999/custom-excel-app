// src/components/Spreadsheet/pages/AdminPanel/ClassificationsList/ClassificationsList.js
import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import styles from './ClassificationsList.module.css';
import AddEditModal from '../components/AddEditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { API_BASE_URL } from '../../../../../config/api';

const ClassificationsList = ({ 
  categoryId, 
  classifications, 
  isLoading, 
  onRefresh, 
  showNotification 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClassification, setEditingClassification] = useState(null);
  const [classificationToDelete, setClassificationToDelete] = useState(null);

  const handleAdd = async (data) => {
    try {
        // First validate
        const isValid = await validateClassificationName(data.name);
        if (!isValid) {
            showNotification('التصنيف موجود مسبقاً', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/classifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add classification');
        }

        showNotification('تم إضافة التصنيف بنجاح', 'success');
        setShowAddModal(false);
        onRefresh();
    } catch (error) {
        console.error('Add error:', error);
        showNotification('فشل في إضافة التصنيف', 'error');
    }
};

  const handleEdit = async (id, data) => {
    try {
        // First validate
        const isValid = await validateClassificationName(data.name);
        if (!isValid) {
            showNotification('التصنيف موجود مسبقاً', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/classifications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('تم تحديث التصنيف بنجاح', 'success');
            setEditingClassification(null);
            onRefresh();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update classification');
        }
    } catch (error) {
        console.error('Edit error:', error);
        showNotification('فشل في تحديث التصنيف', 'error');
    }
};

const handleDelete = async (id) => {
  try {
      console.log('Deleting classification:', id);

      const response = await fetch(`${API_BASE_URL}/admin/classifications/${id}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete classification');
      }

      showNotification('تم حذف التصنيف بنجاح', 'success');
      setClassificationToDelete(null);
      onRefresh(); // Refresh the list
  } catch (error) {
      console.error('Delete error:', error);
      showNotification('فشل في حذف التصنيف', 'error');
  }
};
  const validateClassificationName = async (name) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/classifications/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                categoryId,
                excludeId: editingClassification?.id
            })
        });

        if (!response.ok) {
            console.error('Validation response not OK:', response.status);
            return false;
        }

        const data = await response.json();
        console.log('Validation response:', data); // Debug log
        return data.isValid;
    } catch (error) {
        console.error('Validation error:', error);
        return false;
    }
};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>التصنيفات</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <Plus size={18} />
          إضافة تصنيف جديد
        </button>
      </div>

      <div className={styles.listContainer}>
        {isLoading ? (
          <div className={styles.emptyState}>
            جاري التحميل...
          </div>
        ) : classifications.length === 0 ? (
          <div className={styles.emptyState}>
            لا توجد تصنيفات مضافة لهذه الفئة
          </div>
        ) : (
          <div className={styles.list}>
            {classifications.map(classification => (
              <div key={classification.id} className={styles.item}>
                <span className={styles.itemName}>{classification.name}</span>
                <div className={styles.actions}>
                  <button
                    onClick={() => setEditingClassification(classification)}
                    className={styles.editButton}
                    title="تعديل"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setClassificationToDelete(classification)}
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
        isOpen={showAddModal || !!editingClassification}
        onClose={() => {
          setShowAddModal(false);
          setEditingClassification(null);
        }}
        onSubmit={editingClassification ? 
          (data) => handleEdit(editingClassification.id, data) : 
          handleAdd}
        item={editingClassification}
        title={editingClassification ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}
        itemType="تصنيف"
        validateName={validateClassificationName}
      />

      <DeleteConfirmModal
        isOpen={!!classificationToDelete}
        onClose={() => setClassificationToDelete(null)}
        onConfirm={() => handleDelete(classificationToDelete.id)}
        itemName={classificationToDelete?.name}
        itemType="التصنيف"
      />
    </div>
  );
};

export default ClassificationsList;