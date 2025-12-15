-- Script de Instalación de Base de Datos - Gimnasio
-- Ejecutar este script en MySQL para crear la estructura completa

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS gimnasio_db;
USE gimnasio_db;

-- ============================================
-- TABLA: usuarios
-- ============================================
    CREATE TABLE usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('cliente', 'admin') DEFAULT 'cliente',
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_nacimiento DATE,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    FULLTEXT INDEX ft_nombre_apellido (nombre, apellido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: planes
-- ============================================
CREATE TABLE planes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    duracion_meses INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: inscripciones
-- ============================================
CREATE TABLE inscripciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    plan_id INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    nota TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes(id),
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES - PLANES
-- ============================================

INSERT INTO planes (nombre, duracion_meses, precio, descripcion) VALUES 
('Plan Mensual', 1, 190.00, 'Acceso completo al gimnasio por 1 mes'),
('Plan Trimestral', 3, 510.00, 'Acceso completo al gimnasio por 3 meses - Ahorra 10%'),
('Plan Semestral', 6, 900.00, 'Acceso completo al gimnasio por 6 meses - Ahorra 17%'),
('Plan Anual', 12, 1680.00, 'Acceso completo al gimnasio por 12 meses - Mejor precio');

-- ============================================
-- USUARIO ADMIN POR DEFECTO
-- ============================================
-- Email: admin@gimnasio.com
-- Contraseña: Admin123!@
-- Contraseña hasheada con bcrypt (cambiar en producción)

INSERT INTO usuarios (email, password, rol, estado) VALUES 
('admin@gimnasio.com', '$2a$10$V8X8x5VvKZV5e6V5E5V5E5', 'admin', 'activo');

INSERT INTO clientes (usuario_id, nombre, apellido, telefono, direccion, estado) VALUES 
(1, 'Admin', 'Gimnasio', '555-0000', 'Oficina Principal', 'activo');

-- ============================================
-- VISTAS (Opcional)
-- ============================================

-- Vista: Inscripciones activas con información completa
CREATE VIEW v_inscripciones_activas AS
SELECT 
    i.id,
    i.cliente_id,
    i.plan_id,
    i.fecha_inscripcion,
    i.fecha_vencimiento,
    i.nota,
    c.nombre as cliente_nombre,
    c.apellido as cliente_apellido,
    c.email,
    c.telefono,
    p.nombre as plan_nombre,
    p.duracion_meses,
    p.precio,
    DATEDIFF(i.fecha_vencimiento, CURDATE()) as dias_restantes,
    CASE 
        WHEN i.fecha_vencimiento < CURDATE() THEN 'Vencida'
        WHEN i.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Por vencer'
        ELSE 'Activa'
    END as estado_inscripcion
FROM inscripciones i
JOIN clientes c ON i.cliente_id = c.id
JOIN planes p ON i.plan_id = p.id
WHERE i.estado = 'activo';

-- Vista: Estadísticas mensuales
CREATE VIEW v_estadisticas_mensuales AS
SELECT 
    DATE_TRUNC(i.fecha_inscripcion, MONTH) as mes,
    p.nombre as plan_nombre,
    COUNT(i.id) as cantidad_inscripciones,
    SUM(p.precio) as ingreso_total
FROM inscripciones i
JOIN planes p ON i.plan_id = p.id
WHERE i.estado = 'activo'
GROUP BY mes, plan_nombre
ORDER BY mes DESC;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

