import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileSpreadsheet, Trash2 } from 'lucide-react';

const COLORS = {
  cardBackground: '#ffffff',
  cardHoverBackground: '#f0f4f8',
  cardBorder: '#e2e8f0',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  cardHoverShadow: 'rgba(0, 0, 0, 0.15)',
  primaryText: '#2d3748',
  secondaryText: '#4a5568',
  accentBlue: '#4299e1',
  accentBlueHover: '#3182ce',
  dangerRed: '#e53e3e',
  dangerRedHover: '#c53030',
  iconGray: '#718096',
};

const SheetCard = ({ sheet, onDelete }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG-u-nu-latn', {
      calendar: 'gregory',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        backgroundColor: COLORS.cardBackground,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: `0 4px 6px ${COLORS.cardShadow}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
        direction: 'rtl',
        border: `1px solid ${COLORS.cardBorder}`,
        overflow: 'hidden',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = `0 12px 20px ${COLORS.cardHoverShadow}`;
        e.currentTarget.style.backgroundColor = COLORS.cardHoverBackground;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 6px ${COLORS.cardShadow}`;
        e.currentTarget.style.backgroundColor = COLORS.cardBackground;
      }}
    >
      {/* Delete Button */}
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
          backgroundColor: 'transparent',
          color: COLORS.dangerRed,
          padding: '8px',
          borderRadius: '50%',
          border: `1px solid ${COLORS.dangerRed}`,
          cursor: 'pointer',
          transition: 'background-color 0.2s, color 0.2s, transform 0.2s',
          opacity: isHovered ? '1' : '0',
          transform: isHovered ? 'scale(1)' : 'scale(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.dangerRed;
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = COLORS.dangerRed;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Trash2 size={16} />
      </button>

      {/* Sheet Info */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <FileSpreadsheet size={28} style={{ color: COLORS.accentBlue }} />
          <h3
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: COLORS.primaryText,
              margin: '0',
            }}
          >
            {sheet.name}
          </h3>
        </div>
        <span
          style={{
            fontSize: '14px',
            color: COLORS.secondaryText,
            marginRight: '40px',
          }}
        >
          {sheet.record_count} سجلات
        </span>
      </div>

      {/* Sheet Description */}
      {sheet.description && (
        <p
          style={{
            color: COLORS.secondaryText,
            fontSize: '14px',
            marginBottom: '16px',
            lineHeight: '1.6',
          }}
        >
          {sheet.description}
        </p>
      )}

      {/* Last Updated */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          color: COLORS.iconGray,
          fontSize: '14px',
        }}
      >
        <Calendar size={16} style={{ marginLeft: '8px' }} />
        <span>آخر تحديث: {formatDate(sheet.updated_at)}</span>
      </div>
    </div>
  );
};

export default SheetCard;
