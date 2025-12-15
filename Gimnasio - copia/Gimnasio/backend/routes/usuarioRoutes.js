import express from 'express';
import { 
    obtenerUsuarios, 
    obtenerUsuario, 
    actualizarUsuario, 
    eliminarUsuario 
} from '../controllers/usuarioController.js';
import { verificarToken, esAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verificarToken, esAdmin, obtenerUsuarios);
router.get('/:id', verificarToken, esAdmin, obtenerUsuario);
router.put('/:id', verificarToken, esAdmin, actualizarUsuario);
router.delete('/:id', verificarToken, esAdmin, eliminarUsuario);

export default router;