import React, { useEffect, useRef } from 'react';
import styles from './OptionsDialog.module.css';

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
        overflow: 'auto'
    } : {};

    return (
        <div 
            className={styles.overlay} 
            onClick={onClose}
            ref={dialogRef}
        >
            <div 
                className={`${styles.dialog} ${className || ''}`}
                style={dialogStyle}
                onClick={e => e.stopPropagation()}
            >
                {category && (
                    <div className={styles.header}>
                        <h3>{category}</h3>
                    </div>
                )}
                
                <div className={styles.content}>
                    {options.length === 0 ? (
                        <div className={styles.noOptions}>
                            لا توجد خيارات متاحة
                        </div>
                    ) : (
                        <ul className={styles.optionsList}>
                            {options.map((option, index) => (
                                <li 
                                    key={index}
                                    className={styles.option}
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