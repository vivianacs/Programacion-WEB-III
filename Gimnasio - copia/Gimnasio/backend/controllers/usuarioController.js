import { 
    obtUsuarios, 
    obtUsuario, 
    actualizaUsuario, 
    eliminaUsuario 
} from '../models/usuarioModel.js';
import bcrypt from 'bcryptjs';

export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await obtUsuarios();
        res.json(usuarios);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

export const obtenerUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await obtUsuario(id);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(usuario);
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        // Si se actualiza la contraseña, encriptarla
        if (datos.password) {
            const salt = await bcrypt.genSalt(10);
            datos.password = await bcrypt.hash(datos.password, salt);
        }

        const usuarioActualizado = await actualizaUsuario(id, datos);
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: usuarioActualizado
        });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        await eliminaUsuario(id);
        
        res.json({
            success: true,
            message: 'Usuario eliminado (lógicamente) exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};