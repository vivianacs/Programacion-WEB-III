import React, { useState, useEffect } from 'react';
import Menu from '../components/Menu';
import { obtenerPlanes } from '../api/apiClient';
import '../styles/Dashboard.css';

const FALLBACK_PLANS = [
  { id: 'mensual', nombre: 'Plan Mensual', duracion_meses: 1, precio: 190 },
  { id: 'trimestral', nombre: 'Plan Trimestral', duracion_meses: 3, precio: 510 },
  { id: 'semestral', nombre: 'Plan Semestral', duracion_meses: 6, precio: 900 },
  { id: 'anual', nombre: 'Plan Anual', duracion_meses: 12, precio: 1680 }
];

export default function Planes() {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const resp = await obtenerPlanes();
      const data = Array.isArray(resp.data) ? resp.data : resp.data.data || [];
      if (data.length === 0) {
        setPlanes(FALLBACK_PLANS);
      } else {
        // Map to expected shape: ensure precio is number
        setPlanes(data.map(p => ({ id: p.id || p.nombre, nombre: p.nombre, duracion_meses: p.duracion_meses, precio: Number(p.precio) || 0 })));
      }
    } catch (err) {
      setError('No se pudieron cargar los planes, mostrando valores por defecto');
      setPlanes(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  return (
    <div className="dashboard-container">
      <Menu />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Planes - Gimnasio NitroFit</h1>
          <p>Lista de planes disponibles</p>
        </div>

        {error && <div className="error" style={{ marginBottom: 15 }}>{error}</div>}

        {loading ? (
          <p>Cargando planes...</p>
        ) : (
          <div className="estadisticas" style={{ marginTop: 10 }}>
            {planes.map(plan => (
              <div className="estadistica-card" key={plan.id}>
                <h3>{plan.nombre}</h3>
                <p style={{ fontSize: 22, marginTop: 10, marginBottom: 8 }}><strong>{plan.precio} Bs</strong></p>
                <p style={{ color: '#666' }}>{plan.duracion_meses} mes(es)</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
