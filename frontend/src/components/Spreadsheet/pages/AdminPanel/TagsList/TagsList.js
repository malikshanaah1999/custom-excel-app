// src/components/Spreadsheet/pages/AdminPanel/TagsList/TagsList.js

import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Plus, Edit2, Trash2 } from 'lucide-react';
import styles from './TagsList.module.css';
import AddEditModal from '../components/AddEditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { API_BASE_URL } from '../../../../../config/api';

const TagsList = ({ 
  categoryId, 
  tags, 
  isLoading, 
  onRefresh, 
  showNotification 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagToDelete, setTagToDelete] = useState(null);

  const handleAdd = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم إضافة العلامة بنجاح', 'success');
        setShowAddModal(false);
        onRefresh(); // Refresh tags list
      } else {
        throw new Error('Failed to add tag');
      }
    } catch (error) {
      showNotification('فشل في إضافة العلامة', 'error');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم تحديث العلامة بنجاح', 'success');
        setEditingTag(null);
        onRefresh(); // Refresh tags list
      } else {
        throw new Error('Failed to update tag');
      }
    } catch (error) {
      showNotification('فشل في تحديث العلامة', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      // First check if tag is being used
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
        setTagToDelete(null);
        onRefresh(); // Refresh tags list
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (error) {
      showNotification('فشل في حذف العلامة', 'error');
    }
  };

  const validateTagName = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tags/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          excludeId: editingTag?.id
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
        <h3 className={styles.title}>علامات التصنيف</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
          aria-label="Add New Tag"
        >
          <Plus size={18} />
          <span>إضافة علامة جديدة</span>
        </button>
      </div>

      <div className={styles.listContainer}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>جارٍ التحميل...</span>
          </div>
        ) : tags.length === 0 ? (
          <div className={styles.noData}>
            لا توجد علامات مضافة لهذه الفئة
          </div>
        ) : (
          <div className={styles.list}>
            {tags.map(tag => (
              <div key={tag.id} className={styles.item}>
                <span className={styles.itemName}>{tag.name}</span>
                <div className={styles.actions}>
                  <button
                    onClick={() => setEditingTag(tag)}
                    className={styles.editButton}
                    title="تعديل"
                    aria-label={`Edit tag ${tag.name}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setTagToDelete(tag)}
                    className={styles.deleteButton}
                    title="حذف"
                    aria-label={`Delete tag ${tag.name}`}
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
        isOpen={showAddModal || !!editingTag}
        onClose={() => {
          setShowAddModal(false);
          setEditingTag(null);
        }}
        onSubmit={editingTag ? 
          (data) => handleEdit(editingTag.id, data) : 
          handleAdd}
        item={editingTag}
        title={editingTag ? 'تعديل علامة التصنيف' : 'إضافة علامة تصنيف جديدة'}
        itemType="علامة التصنيف"
        validateName={validateTagName}
      />

      <DeleteConfirmModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => handleDelete(tagToDelete.id)}
        itemName={tagToDelete?.name}
        itemType="العلامة"
      />
    </div>
  );
};

TagsList.propTypes = {
  categoryId: PropTypes.number.isRequired,
  tags: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
};

TagsList.defaultProps = {
  tags: [],
  isLoading: false,
};

export default TagsList;
