import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DashboardAdmin from './pages/DashboardAdmin';
import NuevaInscripcion from './pages/NuevaInscripcion';
import Reportes from './pages/Reportes';
import Planes from './pages/Planes';
import Miembros from './pages/Miembros';
import './styles/Global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/miembros" element={<Miembros />} />
        <Route path="/nueva-inscripcion" element={<NuevaInscripcion />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
