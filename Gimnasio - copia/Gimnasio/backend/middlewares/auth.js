import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.usuarioId = decoded.id;
        req.usuarioRol = decoded.rol;
        next();
    });
};

export const esAdmin = (req, res, next) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }
    next();
};