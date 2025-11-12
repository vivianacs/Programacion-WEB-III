import { createProduct, categoryExists,getAllProductsWithCategory, getProductByIdWithCategory,updateProduct,updateProductStock,
    getProductStock } from '../models/productModel.js';

// POST /productos - Crear nuevo producto
export const createProductController = async (req, res) => {
    try {
        const { nombre, precio, stock, categoria_id } = req.body;

        if (!nombre) {
            return res.status(400).json({ 
                error: 'El campo nombre es obligatorio' 
            });
        }

        if (!precio || precio <= 0) {
            return res.status(400).json({ 
                error: 'El precio debe ser mayor a 0' 
            });
        }

        if (!stock || stock < 0) {
            return res.status(400).json({ 
                error: 'El stock no puede ser negativo' 
            });
        }

        if (!categoria_id) {
            return res.status(400).json({ 
                error: 'El campo categoria_id es obligatorio' 
            });
        }

        const categoriaExiste = await categoryExists(categoria_id);
        if (!categoriaExiste) {
            return res.status(404).json({ 
                error: 'La categoría especificada no existe' 
            });
        }

        const result = await createProduct(nombre, precio, stock, categoria_id);

        res.status(201).json({
            message: 'Producto creado exitosamente',
            productId: result.insertId,
            nombre,
            precio,
            stock,
            categoria_id
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};
// GET /productos - Obtener todos los productos con nombre de categoría
export const getAllProductsController = async (req, res) => {
    try {
        const products = await getAllProductsWithCategory();
        res.json(products);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener productos',
            details: error.message 
        });
    }
};

// GET /productos/:id - Obtener producto por ID con nombre de categoría (Ejercicio 8)
export const getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({ 
                error: 'El ID debe ser un número válido' 
            });
        }

        const products = await getProductByIdWithCategory(id);

        // Verificar si el producto existe
        if (products.length === 0) {
            return res.status(404).json({ 
                error: 'Producto no encontrado' 
            });
        }

        res.json(products[0]);

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener producto',
            details: error.message 
        });
    }
};
// PUT /productos/:id - Actualizar producto por ID
export const updateProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, stock, categoria_id } = req.body;

        // Validaciones
        if (isNaN(id)) {
            return res.status(400).json({ 
                error: 'El ID debe ser un número válido' 
            });
        }

        if (!nombre) {
            return res.status(400).json({ 
                error: 'El campo nombre es obligatorio' 
            });
        }

        if (!precio || precio <= 0) {
            return res.status(400).json({ 
                error: 'El precio debe ser mayor a 0' 
            });
        }

        if (!stock || stock < 0) {
            return res.status(400).json({ 
                error: 'El stock no puede ser negativo' 
            });
        }

        if (!categoria_id) {
            return res.status(400).json({ 
                error: 'El campo categoria_id es obligatorio' 
            });
        }

        // Verificar que la categoría exista
        const categoriaExiste = await categoryExists(categoria_id);
        if (!categoriaExiste) {
            return res.status(404).json({ 
                error: 'La categoría especificada no existe' 
            });
        }

        // Actualizar en la base de datos
        const result = await updateProduct(id, nombre, precio, stock, categoria_id);

        // Verificar si se actualizó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Producto no encontrado' 
            });
        }

        res.json({
            message: 'Producto actualizado exitosamente',
            productId: id,
            nombre,
            precio,
            stock,
            categoria_id
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al actualizar producto',
            details: error.message 
        });
    }
};
// PATCH /productos/:id/stock - Actualizar stock de producto
export const updateProductStockController = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;

        // Validaciones
        if (isNaN(id)) {
            return res.status(400).json({ 
                error: 'El ID debe ser un número válido' 
            });
        }

        if (cantidad === undefined || cantidad === null) {
            return res.status(400).json({ 
                error: 'El campo cantidad es obligatorio' 
            });
        }

        if (isNaN(cantidad)) {
            return res.status(400).json({ 
                error: 'La cantidad debe ser un número válido' 
            });
        }

        // Obtener stock actual para validación
        const stockActual = await getProductStock(id);
        
        if (stockActual === null) {
            return res.status(404).json({ 
                error: 'Producto no encontrado' 
            });
        }

        // Validar que no quede stock negativo
        if (stockActual + cantidad < 0) {
            return res.status(400).json({ 
                error: 'No se puede dejar el stock en negativo',
                stock_actual: stockActual,
                cantidad_solicitada: cantidad
            });
        }

        // Actualizar stock en la base de datos
        const result = await updateProductStock(id, cantidad);

        // Verificar si se actualizó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Producto no encontrado' 
            });
        }

        // Obtener nuevo stock
        const nuevoStock = await getProductStock(id);

        res.json({
            message: cantidad >= 0 ? 'Stock incrementado exitosamente' : 'Stock decrementado exitosamente',
            productId: id,
            cantidad_cambiada: cantidad,
            stock_anterior: stockActual,
            stock_actual: nuevoStock
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al actualizar stock',
            details: error.message 
        });
    }
};