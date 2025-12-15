import express from 'express';
import { generarCaptcha, verificarCaptcha } from '../controllers/captchaController.js';

const router = express.Router();

// Generar CAPTCHA
router.get('/generar', generarCaptcha);

// Middleware para verificar CAPTCHA (se usa en login/registro)
export const middlewareCaptcha = verificarCaptcha;

export default router;
