import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Menu.css';

const Menu = ({ usuario, onLogout }) => {
  const navigate = useNavigate();

  const handleMenuClick = (ruta) => {
    navigate(ruta);
  };

  return (
    <nav className="menu-nav">
      <div className="menu-header">
        <h2>Gimnasio NitroFit</h2>
      </div>

      <ul className="menu-list">
        <li className="menu-item">
          <button 
            onClick={() => handleMenuClick('/dashboard-admin')}
            className="menu-link"
          >
            Principal
          </button>
        </li>

        <li className="menu-item">
          <button 
            onClick={() => handleMenuClick('/miembros')}
            className="menu-link"
          >Miembros</button>
        </li>
        <li className="menu-item">
          <button className="menu-link" onClick={() => handleMenuClick('/planes')}>Planes</button>
        </li>
        <li className="menu-item">
          <button 
            onClick={() => handleMenuClick('/reportes')}
            className="menu-link"
          >
            Reportes
          </button>
        </li>

        <hr className="menu-divider" />

        <li className="menu-item">
          <button 
            onClick={onLogout}
            className="menu-link logout"
          >
            Cerrar Sesión
          </button>
        </li>
      </ul>

      <div className="menu-footer">
        <p className="user-info">{usuario?.email}</p>
        <span className="user-role">ADMINISTRADOR</span>
      </div>
    </nav>
  );
};

export default Menu;
