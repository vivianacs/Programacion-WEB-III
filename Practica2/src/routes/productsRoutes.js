import express from 'express';
import { 
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    updateProductStockController
} from '../controllers/productController.js';

const router = express.Router();

// POST /productos - Ejercicio 6
router.post('/', createProductController);

// GET /productos - Ejercicio 7
router.get('/', getAllProductsController);

// GET /productos/:id - Ejercicio 8
router.get('/:id', getProductByIdController);

// PUT /productos/:id - Ejercicio 9
router.put('/:id', updateProductController);

// PATCH /productos/:id/stock - Ejercicio 10
router.patch('/:id/stock', updateProductStockController);

export default router;