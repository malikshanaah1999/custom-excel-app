import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/Spreadsheet/pages/HomePage';
import SheetPage from './components/Spreadsheet/pages/SheetPage';
import AdminPanel from './components/Spreadsheet/pages/AdminPanel/AdminPanel';
function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sheet/:id" element={<SheetPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

export default App;
