import { pool } from '../config/db.js';

export const obtUsuarios = async () => {
    const [resultado] = await pool.query('SELECT * FROM usuarios WHERE estado = "activo"');
    return resultado;
};

export const obtUsuario = async (id) => {
    const [resultado] = await pool.query('SELECT * FROM usuarios WHERE id = ? AND estado = "activo"', [id]);
    return resultado[0];
};

export const obtUsuarioPorEmail = async (email) => {
    const [resultado] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return resultado[0];
};

export const insertaUsuario = async (usuario) => {
    const { email, password, rol } = usuario;
    const [resultado] = await pool.query(
        'INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)',
        [email, password, rol]
    );
    return { id: resultado.insertId, ...usuario };
};

export const actualizaUsuario = async (id, usuario) => {
    const { email, password, rol } = usuario;
    await pool.query(
        'UPDATE usuarios SET email = ?, password = ?, rol = ? WHERE id = ?',
        [email, password, rol, id]
    );
    return { id, ...usuario };
};

// Eliminación lógica
export const eliminaUsuario = async (id) => {
    await pool.query('UPDATE usuarios SET estado = "inactivo" WHERE id = ?', [id]);
    return id;
};