import React, { useEffect, useRef } from 'react';

const OptionsDialog = ({ 
    isOpen, 
    category, 
    options = [], 
    onSelect, 
    onClose, 
    position,
    className 
}) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const dialogStyle = position ? {
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'none',
        maxHeight: '300px',
        overflow: 'auto',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
        minWidth: '240px',
        maxWidth: '360px',
        border: '1px solid #e2e8f0',
        zIndex: 1001,
        direction: 'rtl',
    } : {};

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.4)',
    };

    const headerStyle = {
        padding: '14px 18px',
        background: 'linear-gradient(90deg, #2c7a7b, #285e61)',
        borderBottom: '1px solid #e2e8f0',
        borderRadius: '12px 12px 0 0',
        color: '#ffffff',
        textAlign: 'center',
    };

    const contentStyle = {
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '8px 0',
    };

    const noOptionsStyle = {
        padding: '16px',
        textAlign: 'center',
        color: '#718096',
        fontStyle: 'italic',
    };

    const optionsListStyle = {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    };

    const optionStyle = {
        padding: '12px 18px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        color: '#2d3748',
        fontSize: '16px',
        borderBottom: '1px solid #edf2f7',
    };

    const optionHoverStyle = {
        backgroundColor: '#e6fffa',
        color: '#2c7a7b',
    };

    return (
        <div 
            style={overlayStyle} 
            onClick={onClose}
            ref={dialogRef}
        >
            <div 
                className={className || ''}
                style={dialogStyle}
                onClick={e => e.stopPropagation()}
            >
                {category && (
                    <div style={headerStyle}>
                        <h3>{category}</h3>
                    </div>
                )}
                
                <div style={contentStyle}>
                    {options.length === 0 ? (
                        <div style={noOptionsStyle}>
                            لا توجد خيارات متاحة
                        </div>
                    ) : (
                        <ul style={optionsListStyle}>
                            {options.map((option, index) => (
                                <li 
                                    key={index}
                                    style={optionStyle}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = optionHoverStyle.backgroundColor}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    onClick={() => onSelect(option)}
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OptionsDialog;
