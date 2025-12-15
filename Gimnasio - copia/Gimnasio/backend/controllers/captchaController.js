import svgCaptcha from 'svg-captcha';

// Almacenar captchas en memoria (en producción usar Redis)
const captchaStore = new Map();

export const generarCaptcha = (req, res) => {
    try {
        // Generar CAPTCHA
        const captcha = svgCaptcha.create({
            size: 6,
            noise: 3,
            color: true,
            background: '#f0f0f0'
        });

        // Generar ID único para la sesión CAPTCHA
        const captchaId = Date.now().toString();
        
        // Guardar el texto del captcha con expiración de 10 minutos
        captchaStore.set(captchaId, {
            text: captcha.text,
            createdAt: Date.now(),
            expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutos
        });

        // Limpiar captchas expirados
        limpiarCaptchasExpirados();

        res.json({
            success: true,
            captchaId,
            svg: captcha.data
        });
    } catch (error) {
        console.error('Error generando captcha:', error);
        res.status(500).json({ error: 'Error al generar CAPTCHA' });
    }
};

export const verificarCaptcha = (req, res, next) => {
    try {
        const { captchaId, captchaText } = req.body;

        if (!captchaId || !captchaText) {
            return res.status(400).json({ 
                error: 'CAPTCHA ID y texto son requeridos' 
            });
        }

        const captchaData = captchaStore.get(captchaId);

        if (!captchaData) {
            return res.status(400).json({ 
                error: 'CAPTCHA expirado o inválido' 
            });
        }

        // Verificar si expiró
        if (Date.now() > captchaData.expiresAt) {
            captchaStore.delete(captchaId);
            return res.status(400).json({ 
                error: 'CAPTCHA expirado' 
            });
        }

        // Comparar (sin considerar mayúsculas/minúsculas)
        if (captchaData.text.toLowerCase() !== captchaText.toLowerCase()) {
            return res.status(400).json({ 
                error: 'CAPTCHA incorrecto' 
            });
        }

        // CAPTCHA válido, eliminar para evitar reutilización
        captchaStore.delete(captchaId);
        
        // Marcar como verificado en la request
        req.captchaVerificado = true;
        next();
    } catch (error) {
        console.error('Error verificando captcha:', error);
        res.status(500).json({ error: 'Error al verificar CAPTCHA' });
    }
};

// Función auxiliar para limpiar captchas expirados
const limpiarCaptchasExpirados = () => {
    const ahora = Date.now();
    for (const [key, value] of captchaStore) {
        if (ahora > value.expiresAt) {
            captchaStore.delete(key);
        }
    }
};