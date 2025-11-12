import pool from '../config/database.js';

export const createCategory = async (nombre, descripcion) => {
    try {
        const [result] = await pool.execute(
            'INSERT INTO categories (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion]
        );
        return result;
    } catch (error) {
        throw new Error(`Error al crear categoría: ${error.message}`);
    }
};

export const getAllCategories = async () => {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories');
        return rows;
    } catch (error) {
        throw new Error(`Error al obtener categorías: ${error.message}`);
    }
};
//------>
// Obtener categoría por ID con sus productos
export const getCategoryByIdWithProducts = async (id) => {
    try {
        const [rows] = await pool.execute(
            `SELECT c.*, p.id as producto_id, p.nombre as producto_nombre, 
                    p.precio, p.stock, p.fecha_alta as producto_fecha_alta
             FROM categories c 
             LEFT JOIN productos p ON c.id = p.categoria_id 
             WHERE c.id = ?`,
            [id]
        );
        return rows;
    } catch (error) {
        throw new Error(`Error al obtener categoría con productos: ${error.message}`);
    }
};
//-----
// Actualizar categoría por ID - EJERCICIO 4
export const updateCategory = async (id, nombre, descripcion) => {
    try {
        const [result] = await pool.execute(
            'UPDATE categories SET nombre = ?, descripcion = ?, fecha_act = CURRENT_TIMESTAMP WHERE id = ?',
            [nombre, descripcion, id]
        );
        return result;
    } catch (error) {
        throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
};
// Eliminar categoría por ID (con eliminación en cascada de productos)
export const deleteCategory = async (id) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM categories WHERE id = ?',
            [id]
        );
        return result;
    } catch (error) {
        throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
};