import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generarCaptcha, loginUsuario } from '../api/apiClient';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captchaId: '',
    captchaText: ''
  });
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [intentosRestantes, setIntentosRestantes] = useState(0);

  useEffect(() => {
    cargarCaptcha();
  }, []);

  const cargarCaptcha = async () => {
    try {
      const response = await generarCaptcha();
      console.log('CAPTCHA Response:', response.data);
      setCaptcha(response.data);
      setFormData(prev => ({
        ...prev,
        captchaId: response.data.captchaId,
        captchaText: ''
      }));
    } catch (err) {
      console.error('Error al cargar CAPTCHA:', err);
      setError('Error al cargar CAPTCHA: ' + (err.message || 'Intenta nuevamente'));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      if (!formData.captchaText) {
        setError('Por favor ingresa el CAPTCHA');
        setLoading(false);
        return;
      }

      const response = await loginUsuario(formData);

      if (response.data.success) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        localStorage.setItem('rol', response.data.usuario.rol);
        
        // Redirigir siempre al dashboard admin
        navigate('/dashboard-admin');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error en el login';
      
      setError(errorMsg);
      setIntentosRestantes(0); // Sin bloqueos
      
      cargarCaptcha(); // Recargar CAPTCHA en caso de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <h1>Login - Gimnasio NitroFit</h1>
        <p className="subtitulo">Accede a tu cuenta</p>

        {error && (
          <div className="error-message">
            {error}
            {intentosRestantes && <p className="info-text">Intentos bloqueados por: {intentosRestantes} minutos</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* CAPTCHA */}
          <div className="form-section">
            <h4>Verificación de CAPTCHA</h4>
            
            {captcha && (
              <div className="captcha-container">
                <div 
                  dangerouslySetInnerHTML={{ __html: captcha.svg }} 
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
                placeholder="Ingresa los caracteres"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading || intentosRestantes > 0}
          >
            {loading ? 'Iniciando sesión...' : intentosRestantes > 0 ? `Bloqueado por ${intentosRestantes} minutos` : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="link-text">
          ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
