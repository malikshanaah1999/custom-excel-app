// src/components/Spreadsheet/pages/AdminPanel/ClassificationsList/ClassificationsList.js

import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
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
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/classifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم إضافة التصنيف بنجاح', 'success');
        setShowAddModal(false);
        onRefresh(); // Refresh the list
      } else {
        throw new Error('Failed to add classification');
      }
    } catch (error) {
      showNotification('فشل في إضافة التصنيف', 'error');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/classifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم تحديث التصنيف بنجاح', 'success');
        setEditingClassification(null);
        onRefresh(); // Refresh the list
      } else {
        throw new Error('Failed to update classification');
      }
    } catch (error) {
      showNotification('فشل في تحديث التصنيف', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      // First check if classification is being used
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
        setClassificationToDelete(null);
        onRefresh(); // Refresh the list
      } else {
        throw new Error('Failed to delete classification');
      }
    } catch (error) {
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
        <h3 className={styles.title}>التصنيفات</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
          aria-label="Add New Classification"
        >
          <Plus size={18} />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      <div className={styles.listContainer}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>جارٍ التحميل...</span>
          </div>
        ) : classifications.length === 0 ? (
          <div className={styles.noData}>
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
                    aria-label={`Edit classification ${classification.name}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setClassificationToDelete(classification)}
                    className={styles.deleteButton}
                    title="حذف"
                    aria-label={`Delete classification ${classification.name}`}
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

ClassificationsList.propTypes = {
  categoryId: PropTypes.number.isRequired,
  classifications: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
};

ClassificationsList.defaultProps = {
  classifications: [],
  isLoading: false,
};

export default ClassificationsList;
