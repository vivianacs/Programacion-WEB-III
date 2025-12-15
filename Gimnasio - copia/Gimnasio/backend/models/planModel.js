import { pool } from '../config/db.js';

export const obtPlanes = async () => {
    const [resultado] = await pool.query(`
        SELECT * FROM planes WHERE estado = "activo"
    `);
    return resultado;
};

export const obtPlan = async (id) => {
    const [resultado] = await pool.query(`
        SELECT * FROM planes WHERE id = ? AND estado = "activo"
    `, [id]);
    return resultado[0];
};

export const insertaPlan = async (plan) => {
    const { nombre, duracion_meses, precio, descripcion } = plan;
    const [resultado] = await pool.query(
        'INSERT INTO planes (nombre, duracion_meses, precio, descripcion) VALUES (?, ?, ?, ?)',
        [nombre, duracion_meses, precio, descripcion]
    );
    return { id: resultado.insertId, ...plan };
};

export const actualizaPlan = async (id, plan) => {
    const { nombre, duracion_meses, precio, descripcion } = plan;
    await pool.query(
        'UPDATE planes SET nombre = ?, duracion_meses = ?, precio = ?, descripcion = ? WHERE id = ?',
        [nombre, duracion_meses, precio, descripcion, id]
    );
    return { id, ...plan };
};

export const eliminaPlan = async (id) => {
    await pool.query('UPDATE planes SET estado = "inactivo" WHERE id = ?', [id]);
    return id;
};
