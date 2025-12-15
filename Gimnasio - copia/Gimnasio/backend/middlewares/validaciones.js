import { body, validationResult } from 'express-validator';

// Validaciones de usuario
export const validarRegistro = [
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    /*body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])/)
        .withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/^(?=.*[A-Z])/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula'),*/
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
    body('apellido')
        .trim()
        .notEmpty()
        .withMessage('El apellido es requerido')
        .isLength({ min: 2 })
        .withMessage('El apellido debe tener al menos 2 caracteres'),
    body('rol')
        .optional()
        .isIn(['cliente', 'admin'])
        .withMessage('Rol inválido'),
    body('captchaId')
        .notEmpty()
        .withMessage('CAPTCHA ID es requerido'),
    body('captchaText')
        .notEmpty()
        .withMessage('Respuesta del CAPTCHA es requerida'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

export const validarLogin = [
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Contraseña requerida'),
    body('captchaId')
        .notEmpty()
        .withMessage('CAPTCHA ID es requerido'),
    body('captchaText')
        .notEmpty()
        .withMessage('Respuesta del CAPTCHA es requerida'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

// Validaciones para cliente
export const validarCliente = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
    body('apellido')
        .trim()
        .notEmpty()
        .withMessage('El apellido es requerido')
        .isLength({ min: 2 })
        .withMessage('El apellido debe tener al menos 2 caracteres'),
    body('telefono')
        .optional()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Formato de teléfono inválido'),
    body('direccion')
        .optional()
        .trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];