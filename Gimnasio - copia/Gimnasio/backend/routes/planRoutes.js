import express from 'express';
import { 
    obtenerPlanes, 
    obtenerPlan, 
    crearPlan, 
    actualizarPlan, 
    eliminarPlan 
} from '../controllers/planController.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

// Obtener todos los planes (público)
router.get('/', obtenerPlanes);

// Obtener un plan específico (público)
router.get('/:id', obtenerPlan);

// Crear un nuevo plan (solo admin)
router.post('/', verificarToken, (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }
    next();
}, crearPlan);

// Actualizar un plan (solo admin)
router.put('/:id', verificarToken, (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }
    next();
}, actualizarPlan);

// Eliminar un plan (solo admin)
router.delete('/:id', verificarToken, (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }
    next();
}, eliminarPlan);

export default router;
