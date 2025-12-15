import { pool } from '../config/db.js';

export const obtInscripciones = async () => {
    const [resultado] = await pool.query(`
        SELECT i.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, p.nombre as plan_nombre, p.duracion_meses, p.precio
        FROM inscripciones i
        JOIN clientes c ON i.cliente_id = c.id
        JOIN planes p ON i.plan_id = p.id
        WHERE i.estado = "activo"
        ORDER BY i.fecha_inscripcion DESC
    `);
    return resultado;
};

export const obtInscripcion = async (id) => {
    const [resultado] = await pool.query(`
        SELECT i.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, u.email, c.telefono,
               p.nombre as plan_nombre, p.duracion_meses, p.precio, p.descripcion
        FROM inscripciones i
        JOIN clientes c ON i.cliente_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN planes p ON i.plan_id = p.id
        WHERE i.id = ? AND i.estado = "activo"
    `, [id]);
    return resultado[0];
};

export const obtInscripcionesPorCliente = async (cliente_id) => {
    const [resultado] = await pool.query(
        `SELECT i.*, p.nombre as plan_nombre, p.duracion_meses, p.precio
         FROM inscripciones i
         JOIN planes p ON i.plan_id = p.id
         WHERE i.cliente_id = ? AND i.estado = "activo"
         ORDER BY i.fecha_inscripcion DESC`,
        [cliente_id]
    );
    return resultado;
};

export const obtInscripcionesDelMes = async (año, mes) => {
    const fechaInicio = `${año}-${String(mes).padStart(2, '0')}-01`;
    
    // Calcular el último día del mes
    const proximoMes = new Date(año, mes, 1);
    const ultimoDia = new Date(proximoMes.getTime() - 86400000);
    const fechaFin = ultimoDia.toISOString().split('T')[0];

    const [resultado] = await pool.query(`
        SELECT i.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, u.email, c.telefono,
               p.nombre as plan_nombre, p.duracion_meses, p.precio
        FROM inscripciones i
        JOIN clientes c ON i.cliente_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN planes p ON i.plan_id = p.id
        WHERE i.estado = "activo" 
        AND DATE(i.fecha_inscripcion) BETWEEN ? AND ?
        ORDER BY i.fecha_inscripcion DESC
    `, [fechaInicio, fechaFin]);
    
    return resultado;
};

export const insertaInscripcion = async (inscripcion) => {
    const { cliente_id, plan_id, fecha_vencimiento, nota } = inscripcion;
    const fecha_inscripcion = new Date().toISOString().split('T')[0];
    
    const [resultado] = await pool.query(
        'INSERT INTO inscripciones (cliente_id, plan_id, fecha_inscripcion, fecha_vencimiento, nota) VALUES (?, ?, ?, ?, ?)',
        [cliente_id, plan_id, fecha_inscripcion, fecha_vencimiento, nota || null]
    );
    return { id: resultado.insertId, ...inscripcion, fecha_inscripcion };
};

export const actualizaInscripcion = async (id, inscripcion) => {
    const { plan_id, fecha_vencimiento, nota } = inscripcion;
    await pool.query(
        'UPDATE inscripciones SET plan_id = ?, fecha_vencimiento = ?, nota = ? WHERE id = ?',
        [plan_id, fecha_vencimiento, nota, id]
    );
    return { id, ...inscripcion };
};

export const renovaInscripcion = async (id, nuevaFechaVencimiento) => {
    const fecha_inscripcion = new Date().toISOString().split('T')[0];
    await pool.query(
        'UPDATE inscripciones SET fecha_inscripcion = ?, fecha_vencimiento = ? WHERE id = ?',
        [fecha_inscripcion, nuevaFechaVencimiento, id]
    );
    return { id, fecha_inscripcion, fecha_vencimiento: nuevaFechaVencimiento };
};

export const eliminaInscripcion = async (id) => {
    // Usar parámetros y comillas simples para evitar problemas con modos SQL
    const [resultado] = await pool.query('UPDATE inscripciones SET estado = ? WHERE id = ?', ['inactivo', id]);
    console.log(`inscripcionModel.eliminaInscripcion: id=${id}, affectedRows=${resultado.affectedRows}`);
    return resultado.affectedRows;
};
