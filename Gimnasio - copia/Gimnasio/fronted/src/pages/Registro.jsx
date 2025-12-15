import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generarCaptcha, registroUsuario } from '../api/apiClient';
import '../styles/Auth.css';

const Registro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    rol: 'admin', 
    captchaId: '',
    captchaText: ''
  });
  const [captcha, setCaptcha] = useState(null);
  const [fortalezaPassword, setFortalezaPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  useEffect(() => {
    cargarCaptcha();
  }, []);

  const cargarCaptcha = async () => {
    try {
      const response = await generarCaptcha();
      setCaptcha(response.data);
      setFormData(prev => ({
        ...prev,
        captchaId: response.data.captchaId,
        captchaText: ''
      }));
    } catch (err) {
      setError('Error al cargar CAPTCHA');
    }
  };

  const evaluarFortalezaPassword = (password) => {
    const fuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const intermedio = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    
    if (fuerte.test(password)) return 'fuerte';
    if (intermedio.test(password)) return 'intermedio';
    return 'débil';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setFortalezaPassword(evaluarFortalezaPassword(value));
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password || !formData.nombre || !formData.apellido) {
        setError('Por favor completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      if (fortalezaPassword === 'débil') {
        setError('La contraseña es débil. Debe tener mayúsculas, minúsculas, números y caracteres especiales');
        setLoading(false);
        return;
      }

      const response = await registroUsuario(formData);
      
      if (response.data.success) {
        setSuccess('¡Registro exitoso! Redirigiendo a login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error en el registro');
      cargarCaptcha(); 
    } finally {
      setLoading(false);
    }
  };

  const getFortalezaColor = () => {
    if (fortalezaPassword === 'fuerte') return 'verde';
    if (fortalezaPassword === 'intermedio') return 'amarillo';
    return 'rojo';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Registro - Gimnasio NitroFit</h1>
        <p className="subtitulo">Crea tu cuenta para acceder al sistema</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Datos Personales */}
          <div className="form-section">
            <h3>Datos Personales</h3>
            
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

          {/* Contraseña */}
          <div className="form-section">
            
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
              {formData.password && (
                <div className={`fortaleza fortaleza-${getFortalezaColor()}`}>
                  Fortaleza: <strong>{fortalezaPassword}</strong>
                </div>
              )}
              <p className="help-text">
                - Caracteres especiales (@$!%*?&)
              </p>
            </div>
          </div>

          {/* CAPTCHA */}
          <div className="form-section">
            <h3>Verificación</h3>
            
            {captcha && (
              <div className="captcha-container">
                <img 
                  src={`data:image/svg+xml;base64,${btoa(captcha.svg)}`} 
                  alt="CAPTCHA"
                  className="captcha-image"
                />
                <button 
                  type="button" 
                  onClick={cargarCaptcha}
                  className="btn-recargar"
                >
                  ↻ Recargar
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="captchaText">Respuesta CAPTCHA *</label>
              <input
                type="text"
                id="captchaText"
                name="captchaText"
                value={formData.captchaText}
                onChange={handleInputChange}
                placeholder="Ingresa los caracteres de la imagen"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="link-text">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Registro;
