import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpecialDaysApp } from './components/SpecialDaysApp';
import { GirarPage } from './pages/GirarPage';
import { OtroDistribuidorPage } from './pages/OtroDistribuidorPage';
import { ScrollToTop } from './components/ScrollToTop';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SpecialDaysApp />} />
        <Route path="/girar" element={<GirarPage />} />
        <Route path="/comprar-dismac" element={<Navigate to="/girar" replace />} />
        <Route path="/registro-distribuidor" element={<OtroDistribuidorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
