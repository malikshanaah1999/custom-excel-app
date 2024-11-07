import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileSpreadsheet, Trash2 } from 'lucide-react';

const SheetCard = ({ sheet, onDelete }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClick = (e) => {
        // Prevent navigation if clicking delete button
        if (e.target.closest('.delete-button')) {
            e.stopPropagation();
            return;
        }
        navigate(`/sheet/${sheet.id}`);
    };

    return (
        <div 
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                direction: 'rtl',
                borderTop: '4px solid transparent',
                overflow: 'hidden',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderTopColor = '#4299e1';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderTopColor = 'transparent';
            }}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(sheet);
                }}
                className="delete-button"
                style={{
                    position: 'absolute',
                    left: '16px',
                    top: '16px',
                    backgroundColor: '#fed7d7',
                    color: '#c53030',
                    padding: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    opacity: isHovered ? '1' : '0',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#feb2b2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fed7d7'}
            >
                <Trash2 size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileSpreadsheet size={28} style={{ color: '#4299e1' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748' }}>
                        {sheet.name}
                    </h3>
                </div>
                <span style={{ fontSize: '14px', color: '#718096' }}>
                    {sheet.record_count} سجلات
                </span>
            </div>
            
            {sheet.description && (
                <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '16px' }}>
                    {sheet.description}
                </p>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', color: '#718096', fontSize: '14px' }}>
                <Calendar size={16} style={{ marginLeft: '8px' }} />
                <span>آخر تحديث: {formatDate(sheet.updated_at)}</span>
            </div>
        </div>
    );
};

export default SheetCard;
