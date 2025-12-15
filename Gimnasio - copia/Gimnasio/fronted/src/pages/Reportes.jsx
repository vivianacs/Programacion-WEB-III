import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import Menu from '../components/Menu';
import '../styles/Dashboard.css';

export default function Reportes() {
  const navigate = useNavigate();
  const [año, setAño] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const rol = localStorage.getItem('rol');

  useEffect(() => {
    if (!usuario.id) {
      navigate('/login');
      return;
    }

    if (rol !== 'admin') {
      navigate('/dashboard-cliente');
      return;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  const descargarReporteInscritos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await apiClient.get(
        `/reportes/inscritos/${año}/${mes}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-inscritos-${año}-${String(mes).padStart(2, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al descargar el reporte: ' + (err.message || 'Error desconocido'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const meses = [
    { num: 1, nombre: 'Enero' },
    { num: 2, nombre: 'Febrero' },
    { num: 3, nombre: 'Marzo' },
    { num: 4, nombre: 'Abril' },
    { num: 5, nombre: 'Mayo' },
    { num: 6, nombre: 'Junio' },
    { num: 7, nombre: 'Julio' },
    { num: 8, nombre: 'Agosto' },
    { num: 9, nombre: 'Septiembre' },
    { num: 10, nombre: 'Octubre' },
    { num: 11, nombre: 'Noviembre' },
    { num: 12, nombre: 'Diciembre' }
  ];

  const años = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="dashboard-container">
      <Menu usuario={usuario} onLogout={handleLogout} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Reportes del Gimnasio</h1>
        </div>

        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Reporte de Inscritos por Mes</h2>
          <p>Descarga un reporte PDF con todos los miembros inscritos en un mes específico</p>

          {error && <p style={{ color: 'red', padding: '10px', background: '#ffe0e0', borderRadius: '4px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label htmlFor="año" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Año:</label>
              <select
                id="año"
                value={año}
                onChange={(e) => setAño(parseInt(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {años.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mes" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mes:</label>
              <select
                id="mes"
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {meses.map(m => (
                  <option key={m.num} value={m.num}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <button
              onClick={descargarReporteInscritos}
              disabled={loading}
              style={{
                padding: '8px 20px',
                background: '#8d949cff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                marginTop: '23px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? ' Generando PDF...' : ' Descargar Reporte PDF'}
            </button>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: '#dee3e6ff', borderLeft: '4px solid #8d949cff', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0 }}>Información del Reporte:</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Contiene lista de todos los miembros inscritos en el mes seleccionado</li>
              <li>Incluye información del plan contratado</li>
              <li>Muestra resumen de ingresos por plan</li>
              <li>Indica fechas de vencimiento de inscripciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
