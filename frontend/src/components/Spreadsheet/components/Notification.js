// src/components/Spreadsheet/components/Notification.js

import React from 'react';

const Notification = ({ notification }) => {
    if (!notification) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: notification.type === 'error' ? '#fed7d7' : '#c6f6d5',
            color: notification.type === 'error' ? '#c53030' : '#276749',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s',
            zIndex: 1000
        }}>
            {notification.message}
        </div>
    );
};

export default Notification;