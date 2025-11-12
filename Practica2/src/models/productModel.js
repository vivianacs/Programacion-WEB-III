import pool from '../config/database.js';

// Crear nuevo producto
export const createProduct = async (nombre, precio, stock, categoria_id) => {
    try {
        const [result] = await pool.execute(
            'INSERT INTO productos (nombre, precio, stock, categoria_id) VALUES (?, ?, ?, ?)',
            [nombre, precio, stock, categoria_id]
        );
        return result;
    } catch (error) {
        throw new Error(`Error al crear producto: ${error.message}`);
    }
};

export const categoryExists = async (categoria_id) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id FROM categories WHERE id = ?',
            [categoria_id]
        );
        return rows.length > 0;
    } catch (error) {
        throw new Error(`Error al verificar categoría: ${error.message}`);
    }
};
// Obtener todos los productos con nombre de categoría
export const getAllProductsWithCategory = async () => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, c.nombre as categoria_nombre 
             FROM productos p 
             INNER JOIN categories c ON p.categoria_id = c.id`
        );
        return rows;
    } catch (error) {
        throw new Error(`Error al obtener productos: ${error.message}`);
    }
};

// Obtener producto por ID con nombre de categoría
export const getProductByIdWithCategory = async (id) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, c.nombre as categoria_nombre 
             FROM productos p 
             INNER JOIN categories c ON p.categoria_id = c.id 
             WHERE p.id = ?`,
            [id]
        );
        return rows;
    } catch (error) {
        throw new Error(`Error al obtener producto: ${error.message}`);
    }
};
// Actualizar producto por ID
export const updateProduct = async (id, nombre, precio, stock, categoria_id) => {
    try {
        const [result] = await pool.execute(
            'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria_id = ?, fecha_act = CURRENT_TIMESTAMP WHERE id = ?',
            [nombre, precio, stock, categoria_id, id]
        );
        return result;
    } catch (error) {
        throw new Error(`Error al actualizar producto: ${error.message}`);
    }
};
// Actualizar stock de producto (incrementar/decrementar)
export const updateProductStock = async (id, cantidad) => {
    try {
        const [result] = await pool.execute(
            'UPDATE productos SET stock = stock + ?, fecha_act = CURRENT_TIMESTAMP WHERE id = ?',
            [cantidad, id]
        );
        return result;
    } catch (error) {
        throw new Error(`Error al actualizar stock: ${error.message}`);
    }
};

// Obtener stock actual del producto
export const getProductStock = async (id) => {
    try {
        const [rows] = await pool.execute(
            'SELECT stock FROM productos WHERE id = ?',
            [id]
        );
        return rows.length > 0 ? rows[0].stock : null;
    } catch (error) {
        throw new Error(`Error al obtener stock: ${error.message}`);
    }
};