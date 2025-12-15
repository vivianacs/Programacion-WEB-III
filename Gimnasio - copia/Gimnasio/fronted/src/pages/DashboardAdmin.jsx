import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import '../styles/Dashboard.css';
import { apiClient } from '../api/apiClient';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const usuarioStored = localStorage.getItem('usuario');
    const rol = localStorage.getItem('rol');
    
    if (!usuarioStored || rol !== 'admin') {
      navigate('/login');
      return;
    }

    const usuarioParsed = JSON.parse(usuarioStored);
    setUsuario(usuarioParsed);
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar inscripciones
      const responseInscripciones = await apiClient.get('/inscripciones');
      setInscripciones(responseInscripciones.data.data || responseInscripciones.data || []);

      // Cargar clientes
      const responseClientes = await apiClient.get('/clientes');
      setClientes(responseClientes.data.data || responseClientes.data || []);

      // Cargar planes
      const responsePlanes = await apiClient.get('/planes');
      setPlanes(responsePlanes.data.data || responsePlanes.data || []);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  const renovarInscripcion = async (inscripcionId) => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.put(`/inscripciones/${inscripcionId}/renovar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Inscripción renovada correctamente');
      cargarDatos();
    } catch (err) {
      alert('Error al renovar la inscripción');
      console.error(err);
    }
  };

  const eliminarInscripcion = async (inscripcionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta inscripción?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await apiClient.delete(`/inscripciones/${inscripcionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Inscripción eliminada correctamente');
      cargarDatos();
    } catch (err) {
      alert('Error al eliminar la inscripción');
      console.error(err);
    }
  };

  if (!usuario) return <div>Cargando...</div>;

  // Calcular inscripciones próximas a vencer (en 7 días)
  const hoy = new Date();
  const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
  const proximasAVencer = inscripciones.filter(insc => {
    const fechaVencimiento = new Date(insc.fecha_vencimiento);
    return fechaVencimiento >= hoy && fechaVencimiento <= proximaSemana;
  });

  return (
    <div className="dashboard-container">
      <Menu usuario={usuario} onLogout={handleLogout} />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Administrador - Gimnasio NitroFit</h1>
          <p>Gestión de Inscripciones y Miembros</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Estadísticas */}
        <div className="estadisticas">
          <div className="estadistica-card">
            <h3>Inscripciones Totales</h3>
            <p className="numero">{inscripciones.length}</p>
          </div>
          <div className="estadistica-card">
            <h3>Miembros Activos</h3>
            <p className="numero">{clientes.length}</p>
          </div>
          <div className="estadistica-card">
            <h3>Planes Disponibles</h3>
            <p className="numero">{planes.length}</p>
          </div>
          <div className="estadistica-card">
            <h3>Por Vencer</h3>
            <p className="numero">{proximasAVencer.length}</p>
          </div>
        </div>

        {/* Alertas de Vencimiento */}
        {proximasAVencer.length > 0 && (
          <section className="alerts-section">
            <h2>Inscripciones Próximas a Vencer</h2>
            <div className="alerts-list">
              {proximasAVencer.map(insc => (
                <div key={insc.id} className="alert-item">
                  <span><strong>{insc.cliente_nombre} {insc.cliente_apellido}</strong> - {insc.plan_nombre}</span>
                  <span className="alert-date">Vence: {new Date(insc.fecha_vencimiento).toLocaleDateString('es-ES')}</span>
                  <button 
                    className="btn btn-small btn-success"
                    onClick={() => renovarInscripcion(insc.id)}
                  >
                    Renovar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Botones de Acción */}
        <section className="actions-section">
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/nueva-inscripcion')}
          >
            + Nueva Inscripción
          </button>
        </section>

        {/* Tabla de Inscripciones */}
        <section className="consultas-section">
          <h2>Inscripciones Activas</h2>
          
          {loading ? (
            <p>Cargando inscripciones...</p>
          ) : inscripciones.length === 0 ? (
            <p className="empty">No hay inscripciones registradas</p>
          ) : (
            <div className="table-responsive">
              <table className="consultas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Miembro</th>
                    <th>Plan</th>
                    <th>Duración</th>
                    <th>Precio</th>
                    <th>Fecha Inscripción</th>
                    <th>Vencimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map(insc => {
                    const esProximoAVencer = proximasAVencer.some(p => p.id === insc.id);
                    return (
                      <tr key={insc.id} style={{ background: esProximoAVencer ? '#fff3cd' : 'inherit' }}>
                        <td>#{insc.id}</td>
                        <td><strong>{insc.cliente_nombre} {insc.cliente_apellido}</strong></td>
                        <td>{insc.plan_nombre}</td>
                        <td>{insc.duracion_meses} mes(es)</td>
                        <td>{parseFloat(insc.precio).toFixed(2)} Bs</td>
                        <td>{new Date(insc.fecha_inscripcion).toLocaleDateString('es-ES')}</td>
                        <td>
                          <strong>
                            {new Date(insc.fecha_vencimiento).toLocaleDateString('es-ES')}
                          </strong>
                          {esProximoAVencer && <span style={{ color: 'red', marginLeft: '5px' }}>⚠️</span>}
                        </td>
                        <td>
                          <button 
                            className="btn btn-small btn-success"
                            onClick={() => renovarInscripcion(insc.id)}
                            title="Renovar inscripción"
                          >
                            🔄
                          </button>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => eliminarInscripcion(insc.id)}
                            title="Eliminar inscripción"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardAdmin;
