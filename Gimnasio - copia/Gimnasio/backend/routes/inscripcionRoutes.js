import express from 'express';
import { 
    obtenerInscripciones, 
    obtenerInscripcion, 
    obtenerInscripcionesPorCliente,
    crearInscripcion, 
    actualizarInscripcion, 
    renovarInscripcion,
    eliminarInscripcion 
} from '../controllers/inscripcionController.js';
import { verificarToken, esAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Obtener todas las inscripciones (solo admin)
router.get('/', verificarToken, esAdmin, obtenerInscripciones);

// Obtener inscripciones de un cliente (debe ir ANTES de /:id)
router.get('/cliente/:clienteId', verificarToken, obtenerInscripcionesPorCliente);

// Renovar una inscripción (debe ir ANTES de /:id para evitar conflicto de rutas)
router.put('/:id/renovar', verificarToken, esAdmin, renovarInscripcion);

// Obtener una inscripción específica
router.get('/:id', verificarToken, obtenerInscripcion);

// Crear una nueva inscripción (solo admin)
router.post('/', verificarToken, esAdmin, crearInscripcion);

// Actualizar una inscripción (solo admin)
router.put('/:id', verificarToken, esAdmin, actualizarInscripcion);

// Eliminar una inscripción (solo admin)
router.delete('/:id', verificarToken, esAdmin, eliminarInscripcion);

export default router;
