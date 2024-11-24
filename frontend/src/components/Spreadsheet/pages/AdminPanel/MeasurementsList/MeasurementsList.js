// src/components/Spreadsheet/pages/AdminPanel/MeasurementsList/MeasurementsList.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../../../../config/api';
import styles from './MeasurementsList.module.css';
import AddEditModal from '../components/AddEditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const MeasurementsList = ({ showNotification, onRefresh }) => {
  const [measurements, setMeasurements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);

  const fetchMeasurements = async () => {
    setIsLoading(true);
    try {
        // Add error logging
        console.log('Fetching measurement units...');
        const response = await fetch(`${API_BASE_URL}/admin/measurement-units`);
        console.log('Response:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data received:', data);
        setMeasurements(data);
    } catch (error) {
        console.error('Error fetching measurements:', error);
        showNotification('فشل في جلب وحدات القياس', 'error');
    } finally {
        setIsLoading(false);
    }
};

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleAdd = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/measurement-units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم إضافة وحدة القياس بنجاح', 'success');
        setShowAddModal(false);
        fetchMeasurements();
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to add measurement unit');
      }
    } catch (error) {
      showNotification('فشل في إضافة وحدة القياس', 'error');
    }
  };

  const handleEdit = async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/measurement-units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        showNotification('تم تحديث وحدة القياس بنجاح', 'success');
        setEditingMeasurement(null);
        fetchMeasurements();
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to update measurement unit');
      }
    } catch (error) {
      showNotification('فشل في تحديث وحدة القياس', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Check if measurement unit is in use
      const checkResponse = await fetch(`${API_BASE_URL}/admin/measurement-units/${id}/check-usage`);
      const checkData = await checkResponse.json();
      
      if (checkData.isInUse) {
        showNotification('لا يمكن حذف وحدة القياس لأنها مستخدمة في بعض الجداول', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/measurement-units/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showNotification('تم حذف وحدة القياس بنجاح', 'success');
        setMeasurementToDelete(null);
        fetchMeasurements();
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Failed to delete measurement unit');
      }
    } catch (error) {
      showNotification('فشل في حذف وحدة القياس', 'error');
    }
  };

  const validateMeasurementName = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/measurement-units/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          excludeId: editingMeasurement?.id
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
        <h3 className={styles.title}>وحدات القياس</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          <Plus size={18} />
          إضافة وحدة قياس جديدة
        </button>
      </div>

      <div className={styles.listContainer}>
        {isLoading ? (
          <div className={styles.emptyState}>
            جاري التحميل...
          </div>
        ) : measurements.length === 0 ? (
          <div className={styles.emptyState}>
            لا توجد وحدات قياس مضافة
          </div>
        ) : (
          <div className={styles.list}>
            {measurements.map(measurement => (
              <div key={measurement.id} className={styles.item}>
                <span className={styles.itemName}>{measurement.name}</span>
                <div className={styles.actions}>
                  <button
                    onClick={() => setEditingMeasurement(measurement)}
                    className={styles.editButton}
                    title="تعديل"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setMeasurementToDelete(measurement)}
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
        isOpen={showAddModal || !!editingMeasurement}
        onClose={() => {
          setShowAddModal(false);
          setEditingMeasurement(null);
        }}
        onSubmit={editingMeasurement ? 
          (data) => handleEdit(editingMeasurement.id, data) : 
          handleAdd}
        item={editingMeasurement}
        title={editingMeasurement ? 'تعديل وحدة قياس' : 'إضافة وحدة قياس جديدة'}
        itemType="وحدة القياس"
        validateName={validateMeasurementName}
      />

      <DeleteConfirmModal
        isOpen={!!measurementToDelete}
        onClose={() => setMeasurementToDelete(null)}
        onConfirm={() => handleDelete(measurementToDelete.id)}
        itemName={measurementToDelete?.name}
        itemType="وحدة القياس"
      />
    </div>
  );
};

export default MeasurementsList;