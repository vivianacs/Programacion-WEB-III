import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { obtUsuarioPorEmail, insertaUsuario } from '../models/usuarioModel.js';
import { insertaCliente } from '../models/clienteModel.js';

// Almacenar intentos fallidos de login (en producción usar Redis)
const intentosFallidos = new Map();
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO = 15 * 60 * 1000; // 15 minutos

// Validación de fortaleza de contraseña
export const validarFortalezaPassword = (password) => {
    const fortaleza = {
        debil: /^[a-zA-Z]{6,}$/,
        intermedio: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
        fuerte: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
    };

    if (fortaleza.fuerte.test(password)) return 'fuerte';
    if (fortaleza.intermedio.test(password)) return 'intermedio';
    return 'débil';
};
export const registrar = async (req, res) => {
    try {
        const { email, password, nombre, apellido, telefono, direccion, rol, captchaId, captchaText } = req.body;

        // Validar fortaleza de contraseña
        const fortaleza = validarFortalezaPassword(password);
        if (fortaleza === 'débil') {
            return res.status(400).json({ 
                success: false,
                error: 'La contraseña es débil. Debe tener mayúsculas, minúsculas, números y caracteres especiales',
                fortaleza: 'débil'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await obtUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ 
                success: false,
                error: 'El email ya está registrado' 
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Validar rol (solo 'cliente' o 'admin')
        const rolValido = ['cliente', 'admin'].includes(rol) ? rol : 'cliente';

        // Crear usuario
        const usuario = await insertaUsuario({
            email,
            password: hashedPassword,
            rol: rolValido
        });

        // Crear registro en tabla clientes
        await insertaCliente({
            usuario_id: usuario.id,
            nombre,
            apellido,
            telefono,
            direccion
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            fortaleza_password: fortaleza,
            usuarioId: usuario.id
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al registrar usuario' 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const usuario = await obtUsuarioPorEmail(email);
        if (!usuario) {
            return res.status(401).json({ 
                success: false,
                error: 'Credenciales incorrectas' 
            });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ 
                success: false,
                error: 'Credenciales incorrectas' 
            });
        }

        // Verificar estado
        if (usuario.estado !== 'activo') {
            return res.status(403).json({ 
                success: false,
                error: 'Usuario inactivo' 
            });
        }

        // Validar JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está configurada');
            return res.status(500).json({ 
                success: false,
                error: 'Error en la configuración del servidor' 
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                rol: usuario.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                estado: usuario.estado
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al iniciar sesión' 
        });
    }
};