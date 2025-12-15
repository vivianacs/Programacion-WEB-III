import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import '../styles/Forms.css';
import { apiClient } from '../api/apiClient';

const NuevaInscripcion = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tipoCliente, setTipoCliente] = useState('existente'); // 'existente' o 'nuevo'
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    plan_id: '',
    nota: '',
    // Campos para cliente nuevo
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: ''
  });

  useEffect(() => {
    const usuarioStored = localStorage.getItem('usuario');
    const rol = localStorage.getItem('rol');
    
    if (!usuarioStored || rol !== 'admin') {
      navigate('/login');
      return;
    }

    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar planes
      const responsePlanes = await apiClient.get('/planes');
      const planesData = Array.isArray(responsePlanes.data) ? responsePlanes.data : responsePlanes.data.data || [];
      setPlanes(planesData);

      // Cargar clientes
      const responseClientes = await apiClient.get('/clientes');
      const clientesData = Array.isArray(responseClientes.data) ? responseClientes.data : responseClientes.data.data || [];
      setClientes(clientesData);
    } catch (err) {
      setError('Error al cargar datos: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTipoClienteChange = (tipo) => {
    setTipoCliente(tipo);
    setFormData(prev => ({
      ...prev,
      cliente_id: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: ''
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let clienteId = formData.cliente_id;

      // Si es cliente nuevo, crear primero
      if (tipoCliente === 'nuevo') {
        if (!formData.nombre || !formData.apellido || !formData.email) {
          setError('Por favor completa los datos del cliente (nombre, apellido y email)');
          return;
        }

        const datosCliente = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono || '',
          direccion: formData.direccion || '',
          fecha_nacimiento: formData.fecha_nacimiento || null,
          rol: 'cliente'
        };

        try {
          const responseCliente = await apiClient.post('/clientes', datosCliente);
          clienteId = responseCliente.data.data?.id || responseCliente.data.id;
          
          if (!clienteId) {
            setError('Error al crear el cliente');
            return;
          }
        } catch (err) {
          setError('Error al crear el cliente: ' + (err.response?.data?.error || err.message));
          console.error('Error completo:', err);
          return;
        }
      } else {
        if (!clienteId) {
          setError('Por favor selecciona un cliente');
          return;
        }
      }

      // Crear inscripción
      if (!formData.plan_id) {
        setError('Por favor selecciona un plan');
        return;
      }

      const datosInscripcion = {
        cliente_id: parseInt(clienteId),
        plan_id: parseInt(formData.plan_id),
        nota: formData.nota || ''
      };

      const responseInscripcion = await apiClient.post('/inscripciones', datosInscripcion);

      if (responseInscripcion.data.success || responseInscripcion.data.data) {
        setSuccess('¡Inscripción creada exitosamente!');
        setTimeout(() => {
          navigate('/dashboard-admin');
        }, 1500);
      } else {
        setError('Error al crear la inscripción');
      }
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  if (!localStorage.getItem('usuario')) {
    return null;
  }

  return (
    <div className="app-container">
      <Menu />
      <div className="page-container">
        <h1>Nueva Inscripción</h1>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>
          </div>
        )}

        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <form onSubmit={handleSubmit} className="form-container">
            {/* Tipo de Cliente */}
            <div className="form-section">
              <h2>Paso 1: Selecciona el Cliente</h2>
              
              <div className="tipo-cliente-options">
                <label className={`radio-option ${tipoCliente === 'existente' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    value="existente"
                    checked={tipoCliente === 'existente'}
                    onChange={(e) => handleTipoClienteChange(e.target.value)}
                  />
                  <span>Cliente Existente</span>
                </label>
                <label className={`radio-option ${tipoCliente === 'nuevo' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    value="nuevo"
                    checked={tipoCliente === 'nuevo'}
                    onChange={(e) => handleTipoClienteChange(e.target.value)}
                  />
                  <span>Cliente Nuevo</span>
                </label>
              </div>
            </div>

            {/* Cliente Existente */}
            {tipoCliente === 'existente' && (
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="cliente_id">Cliente *</label>
                  <select
                    id="cliente_id"
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} ({cliente.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Cliente Nuevo */}
            {tipoCliente === 'nuevo' && (
              <div className="form-section">
                <h3>Datos del Cliente</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido">Apellido *</label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Plan */}
            <div className="form-section">
              <h2>Paso 2: Selecciona el Plan</h2>
              
              <div className="form-group">
                <label htmlFor="plan_id">Plan de Membresía *</label>
                <select
                  id="plan_id"
                  name="plan_id"
                  value={formData.plan_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un plan</option>
                  {planes.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} - {parseFloat(plan.precio).toFixed(2)} Bs ({plan.duracion_meses} mes(es))
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nota">Observaciones (opcional)</label>
                <textarea
                  id="nota"
                  name="nota"
                  value={formData.nota}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                ✓ Crear Inscripción
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard-admin')}
              >
                ← Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .tipo-cliente-options {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          border: 2px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .radio-option:hover {
          border-color: #65696bff;
        }

        .radio-option.active {
          border-color: #a7afaaff;
          background: #f0f8f4;
        }

        .radio-option input[type="radio"] {
          margin: 0;
          cursor: pointer;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-start;
          margin-top: 30px;
        }

        .error-message {
          background: #ffe6e6;
          border: 1px solid #ff6b6b;
          color: #c92a2a;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .success-message {
          background: #d3f9d8;
          border: 1px solid #51cf66;
          color: #2f9e44;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default NuevaInscripcion;
