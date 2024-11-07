// src/components/Spreadsheet/components/ErrorBoundary.js

import React from 'react';

class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Sheet Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="text-center p-8">
                    <h2 className="text-xl text-red-600 mb-4">عذراً، حدث خطأ ما</h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        إعادة تحميل الصفحة
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}