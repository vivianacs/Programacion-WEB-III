import React, { useState, useEffect } from 'react';
import Menu from '../components/Menu';
import { obtenerClientes, actualizarCliente } from '../api/apiClient';
import '../styles/Dashboard.css';

export default function Miembros() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ nombre: '', apellido: '', email: '', telefono: '' });

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const resp = await obtenerClientes();
      const data = Array.isArray(resp.data) ? resp.data : resp.data.data || [];
      setClientes(data);
    } catch (err) {
      setError('Error al cargar miembros: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    const id = setInterval(fetchClientes, 10000); // refrescar cada 10s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="dashboard-container">
      <Menu />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Miembros</h1>
          <p>Lista de miembros activos del gimnasio</p>
        </div>

        <div style={{ marginBottom: 15 }}>
          <button className="btn btn-primary btn-small" onClick={fetchClientes}>Refrescar</button>
        </div>

        {error && <div className="error" style={{ marginBottom: 15 }}>{error}</div>}

        {loading ? (
          <p>Cargando miembros...</p>
        ) : (
          <div className="consultas-list">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr><td colSpan="3">No hay miembros activos</td></tr>
                ) : (
                  clientes.map(c => (
                    <tr key={c.id}>
                      <td>
                        {editId === c.id ? (
                          <>
                            <input type="text" value={editData.nombre} onChange={(e) => setEditData(prev => ({...prev, nombre: e.target.value}))} />
                            <input type="text" value={editData.apellido} onChange={(e) => setEditData(prev => ({...prev, apellido: e.target.value}))} style={{marginLeft:8}} />
                          </>
                        ) : (
                          <>{c.nombre} {c.apellido}</>
                        )}
                      </td>
                      <td>
                        {editId === c.id ? (
                          <input type="email" value={editData.email} onChange={(e) => setEditData(prev => ({...prev, email: e.target.value}))} />
                        ) : (
                          (c.email || 'N/A')
                        )}
                      </td>
                      <td>
                        {editId === c.id ? (
                          <input type="text" value={editData.telefono} onChange={(e) => setEditData(prev => ({...prev, telefono: e.target.value}))} />
                        ) : (
                          (c.telefono || 'N/A')
                        )}
                      </td>
                      <td style={{width:180}}>
                        {editId === c.id ? (
                          <>
                            <button className="btn btn-primary btn-small" onClick={async () => {
                              try {
                                const payload = { nombre: editData.nombre, apellido: editData.apellido, email: editData.email, telefono: editData.telefono };
                                await actualizarCliente(c.id, payload);
                                setEditId(null);
                                fetchClientes();
                              } catch (err) {
                                setError('Error al guardar cambios: ' + (err.response?.data?.error || err.message));
                              }
                            }}>Guardar</button>
                            <button className="btn btn-secondary btn-small" style={{marginLeft:8}} onClick={() => { setEditId(null); setEditData({ nombre: '', apellido: '', email: '', telefono: '' }); }}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-info btn-small" onClick={() => { setEditId(c.id); setEditData({ nombre: c.nombre || '', apellido: c.apellido || '', email: c.email || '', telefono: c.telefono || '' }); }}>Editar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
