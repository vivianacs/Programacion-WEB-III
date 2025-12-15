import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import planRoutes from './routes/planRoutes.js';
import inscripcionRoutes from './routes/inscripcionRoutes.js';
import captchaRoutes from './routes/captchaRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';
import { verificarToken } from './middlewares/auth.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Manejo explícito de preflight requests
app.options('*', cors());

app.use(express.json());

// Logging de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/planes', planRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de prueba
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend del gimnasio funcionando',
        timestamp: new Date().toISOString()
    });
});

// Ruta para verificar permisos según rol
app.get('/api/perfil', verificarToken, (req, res) => {
    res.json({
        usuarioId: req.usuarioId,
        rol: req.usuarioRol,
        message: 'Acceso autorizado'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});