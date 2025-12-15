import express from 'express';
import { generarReporteInscripcion, generarReporteInscritos } from '../controllers/reporteController.js';
import { verificarToken, esAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Rutas para generar reportes
router.get('/inscripcion/:inscripcionId', verificarToken, generarReporteInscripcion);
router.get('/inscritos/:anio/:mes', verificarToken, esAdmin, generarReporteInscritos);

export default router;
