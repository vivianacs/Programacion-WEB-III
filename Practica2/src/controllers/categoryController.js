import { createCategory, getAllCategories,getCategoryByIdWithProducts,updateCategory,deleteCategory } from '../models/categoryModel.js';

export const createCategoryController = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) {
            return res.status(400).json({ 
                error: 'El campo nombre es obligatorio' 
            });
        }

        if (nombre.length > 100) {
            return res.status(400).json({ 
                error: 'El nombre no puede exceder 100 caracteres' 
            });
        }

        const result = await createCategory(nombre, descripcion);

        res.status(201).json({
            message: 'Categoría creada exitosamente',
            categoryId: result.insertId,
            nombre,
            descripcion
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};

// GET /categories - Obtener todas las categorías (Ejercicio 2)
export const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener categorías',
            details: error.message 
        });
    }
};
//--------------->
// GET /categories/:id - Obtener categoría por ID con sus productos
export const getCategoryByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ 
                error: 'El ID debe ser un número válido' 
            });
        }

        const categoryData = await getCategoryByIdWithProducts(id);

        if (categoryData.length === 0) {
            return res.status(404).json({ 
                error: 'Categoría no encontrada' 
            });
        }

        const response = {
            id: categoryData[0].id,
            nombre: categoryData[0].nombre,
            descripcion: categoryData[0].descripcion,
            fecha_alta: categoryData[0].fecha_alta,
            fecha_act: categoryData[0].fecha_act,
            productos: categoryData
                .filter(row => row.producto_id !== null)
                .map(product => ({
                    id: product.producto_id,
                    nombre: product.producto_nombre,
                    precio: product.precio,
                    stock: product.stock,
                    fecha_alta: product.producto_fecha_alta
                }))
        };

        res.json(response);

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener categoría',
            details: error.message 
        });
    }
};
//----------------------->
// PUT /categories/:id - Actualizar categoría por ID
export const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

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

        if (nombre.length > 100) {
            return res.status(400).json({ 
                error: 'El nombre no puede exceder 100 caracteres' 
            });
        }

        // Actualizar en la base de datos
        const result = await updateCategory(id, nombre, descripcion);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Categoría no encontrada' 
            });
        }

        res.json({
            message: 'Categoría actualizada exitosamente',
            categoryId: id,
            nombre,
            descripcion
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al actualizar categoría',
            details: error.message 
        });
    }
};
// DELETE /categories/:id - Eliminar categoría por ID
export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validaciones
        if (isNaN(id)) {
            return res.status(400).json({ 
                error: 'El ID debe ser un número válido' 
            });
        }

        // Eliminar en la base de datos
        const result = await deleteCategory(id);

        // Verificar si se eliminó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Categoría no encontrada' 
            });
        }

        res.json({
            message: 'Categoría eliminada exitosamente junto con todos sus productos',
            categoryId: id
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al eliminar categoría',
            details: error.message 
        });
    }
};