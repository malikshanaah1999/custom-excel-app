import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Trash2 } from 'lucide-react';

const COLORS = {
  cardBackground: '#ffffff',
  cardHoverBackground: '#f9fafb',
  rowAlternateBackground: '#a7f0f7', // Light gray background for alternate rows
  borderColor: '#e2e8f0',
  primaryText: '#2d3748',
  secondaryText: '#4a5568',
  accentBlue: '#4299e1',
  dangerRed: '#e53e3e',
  dangerRedHover: '#c53030',
};

const ListView = ({ sheets, onDelete }) => {
  const navigate = useNavigate();

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

  const navigateToSheet = (sheetId) => {
    navigate(`/sheet/${sheetId}`);
  };

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        direction: 'rtl',
        backgroundColor: COLORS.cardBackground,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <thead>
        <tr style={{ backgroundColor: COLORS.cardHoverBackground }}>
          <th style={tableHeaderStyle}>الاسم</th>
          <th style={tableHeaderStyle}>الوصف</th>
          <th style={tableHeaderStyle}>عدد السجلات</th>
          <th style={tableHeaderStyle}>آخر تحديث</th>
          <th style={tableHeaderStyle}>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {sheets.map((sheet, index) => (
          <tr
            key={sheet.id}
            style={{
              backgroundColor:
                index % 2 === 0 ? COLORS.cardBackground : COLORS.rowAlternateBackground,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onClick={() => navigateToSheet(sheet.id)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.cardHoverBackground)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                index % 2 === 0 ? COLORS.cardBackground : COLORS.rowAlternateBackground)
            }
          >
            <td style={tableCellStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} style={{ color: COLORS.accentBlue }} />
                <span style={{ color: COLORS.primaryText, fontWeight: '500' }}>
                  {sheet.name}
                </span>
              </div>
            </td>
            <td style={tableCellStyle}>
              <span style={{ color: COLORS.secondaryText }}>
                {sheet.description || '-'}
              </span>
            </td>
            <td style={tableCellStyle}>
              <span style={{ color: COLORS.secondaryText }}>
                {sheet.record_count} سجلات
              </span>
            </td>
            <td style={tableCellStyle}>
              <span style={{ color: COLORS.secondaryText }}>
                {formatDate(sheet.updated_at)}
              </span>
            </td>
            <td style={tableCellStyle}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sheet);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: COLORS.dangerRed,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.dangerRedHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.dangerRed)}
              >
                <Trash2 size={20} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const tableHeaderStyle = {
  textAlign: 'right',
  padding: '12px',
  color: COLORS.primaryText,
  fontWeight: '600',
  fontSize: '16px',
  borderBottom: `2px solid ${COLORS.borderColor}`,
};

const tableCellStyle = {
  padding: '12px',
  textAlign: 'right',
};

export default ListView;
