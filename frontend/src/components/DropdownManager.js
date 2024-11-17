// src/components/DropdownManager.js
import React, { useState } from 'react';
import { useDropdownOptions } from '../hooks/useDropdownOptions';
import { API_BASE_URL } from '../config/api';
const DropdownManager = ({ category, onClose }) => {
    const { options, loading, error, addOption, updateOption, deleteOption } = useDropdownOptions(category);
    const [newValue, setNewValue] = useState('');
    const [editingOption, setEditingOption] = useState(null);

    const handleAdd = async () => {
        if (newValue.trim()) {
            await addOption(newValue.trim());
            setNewValue('');
        }
    };

    const handleUpdate = async (id, value) => {
        await updateOption(id, value);
        setEditingOption(null);
    };

    return (
        <div className="dropdown-manager">
            <h3>Manage {category} Options</h3>
            
            <div className="add-option">
                <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="New option value"
                />
                <button onClick={handleAdd}>Add</button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <ul className="options-list">
                    {options.map(option => (
                        <li key={option.id}>
                            {editingOption === option.id ? (
                                <input
                                    type="text"
                                    value={option.value}
                                    onChange={(e) => handleUpdate(option.id, e.target.value)}
                                    onBlur={() => setEditingOption(null)}
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <span>{option.value}</span>
                                    <div className="actions">
                                        <button onClick={() => setEditingOption(option.id)}>Edit</button>
                                        <button onClick={() => deleteOption(option.id)}>Delete</button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DropdownManager;
