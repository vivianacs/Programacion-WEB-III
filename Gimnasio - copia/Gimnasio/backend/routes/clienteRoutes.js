import express from 'express';
import { 
    obtenerClientes, 
    obtenerCliente, 
    obtenerClientePorUsuario,
    crearCliente, 
    actualizarCliente, 
    eliminarCliente 
} from '../controllers/clienteController.js';
import { verificarToken, esAdmin } from '../middlewares/auth.js';
import { validarCliente } from '../middlewares/validaciones.js';

const router = express.Router();

// Ruta para obtener datos del cliente autenticado
router.get('/mi-perfil', verificarToken, obtenerClientePorUsuario);

// Rutas protegidas (admin)
router.get('/', verificarToken, esAdmin, obtenerClientes);
router.get('/:id', verificarToken, esAdmin, obtenerCliente);
router.post('/', verificarToken, esAdmin, validarCliente, crearCliente);
router.put('/:id', verificarToken, esAdmin, validarCliente, actualizarCliente);
router.delete('/:id', verificarToken, esAdmin, eliminarCliente);

export default router;