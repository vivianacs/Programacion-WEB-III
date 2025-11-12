import express from 'express';
import { 
    createCategoryController, 
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController
} from '../controllers/categoryController.js';

const router = express.Router();

// POST /categories - Ejercicio 1
router.post('/', createCategoryController);

// GET /categories - Ejercicio 2  
router.get('/', getAllCategoriesController);

// GET /categories/:id - Ejercicio 3
router.get('/:id', getCategoryByIdController);

// PUT /categories/:id - Ejercicio 4
router.put('/:id', updateCategoryController);

// DELETE /categories/:id - Ejercicio 5
router.delete('/:id', deleteCategoryController);
export default router;