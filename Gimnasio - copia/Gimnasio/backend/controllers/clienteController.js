import { 
    obtClientes, 
    obtCliente, 
    obtClientePorUsuarioId,
    insertaCliente, 
    actualizaCliente, 
    eliminaCliente 
} from '../models/clienteModel.js';
import { insertaUsuario } from '../models/usuarioModel.js';
import bcryptjs from 'bcryptjs';

export const obtenerClientes = async (req, res) => {
    try {
        const clientes = await obtClientes();
        res.json({
            success: true,
            data: clientes
        });
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener clientes' 
        });
    }
};

export const obtenerCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await obtCliente(id);
        
        if (!cliente) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado' 
            });
        }
        
        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        console.error('Error obteniendo cliente:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener cliente' 
        });
    }
};

export const obtenerClientePorUsuario = async (req, res) => {
    try {
        const usuarioId = req.usuarioId; // Viene del token JWT
        const cliente = await obtClientePorUsuarioId(usuarioId);
        
        if (!cliente) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado para este usuario' 
            });
        }
        
        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        console.error('Error obteniendo cliente por usuario:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener cliente' 
        });
    }
};

export const crearCliente = async (req, res) => {
    try {
        const { usuario_id, nombre, apellido, telefono, direccion } = req.body;
        
        const cliente = await insertaCliente({
            usuario_id,
            nombre,
            apellido,
            telefono,
            direccion
        });
        
        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: cliente
        });
    } catch (error) {
        console.error('Error creando cliente:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al crear cliente' 
        });
    }
};

export const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        
        const clienteExistente = await obtCliente(id);
        if (!clienteExistente) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado' 
            });
        }
        
        const clienteActualizado = await actualizaCliente(id, datos);
        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: clienteActualizado
        });
    } catch (error) {
        console.error('Error actualizando cliente:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al actualizar cliente' 
        });
    }
};

export const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const clienteExistente = await obtCliente(id);
        
        if (!clienteExistente) {
            return res.status(404).json({ 
                success: false,
                error: 'Cliente no encontrado' 
            });
        }
        
        await eliminaCliente(id);
        
        res.json({
            success: true,
            message: 'Cliente eliminado (lógicamente) exitosamente',
            clienteId: id
        });
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al eliminar cliente' 
        });
    }
};