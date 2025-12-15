import * as inscripcionModel from '../models/inscripcionModel.js';
import * as clienteModel from '../models/clienteModel.js';
import * as planModel from '../models/planModel.js';

export const obtenerInscripciones = async (req, res) => {
    try {
        const inscripciones = await inscripcionModel.obtInscripciones();
        res.json({ 
            success: true, 
            data: Array.isArray(inscripciones) ? inscripciones : [] 
        });
    } catch (error) {
        console.error('Error al obtener inscripciones:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener inscripciones: ' + error.message 
        });
    }
};

export const obtenerInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        const inscripcion = await inscripcionModel.obtInscripcion(id);
        
        if (!inscripcion) {
            return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
        }
        
        res.json({ success: true, data: inscripcion });
    } catch (error) {
        console.error('Error al obtener inscripción:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const obtenerInscripcionesPorCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        
        const cliente = await clienteModel.obtCliente(clienteId);
        if (!cliente) {
            return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
        }
        
        const inscripciones = await inscripcionModel.obtInscripcionesPorCliente(clienteId);
        res.json({ success: true, data: inscripciones });
    } catch (error) {
        console.error('Error al obtener inscripciones del cliente:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const crearInscripcion = async (req, res) => {
    try {
        const { cliente_id, plan_id, nota } = req.body;
        
        if (!cliente_id || !plan_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan campos requeridos: cliente_id, plan_id' 
            });
        }
        
        // Verificar que el cliente existe
        const cliente = await clienteModel.obtCliente(cliente_id);
        if (!cliente) {
            return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
        }
        
        // Verificar que el plan existe
        const plan = await planModel.obtPlan(plan_id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan no encontrado' });
        }
        
        // Calcular fecha de vencimiento
        const fechaInscripcion = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + plan.duracion_meses);
        const fecha_vencimiento = fechaVencimiento.toISOString().split('T')[0];
        
        const nuevaInscripcion = await inscripcionModel.insertaInscripcion({
            cliente_id,
            plan_id,
            fecha_vencimiento,
            nota: nota || null
        });
        
        res.status(201).json({ success: true, data: nuevaInscripcion });
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const actualizarInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan_id, fecha_vencimiento, nota } = req.body;
        
        const inscripcion = await inscripcionModel.obtInscripcion(id);
        if (!inscripcion) {
            return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
        }
        
        if (plan_id) {
            const plan = await planModel.obtPlan(plan_id);
            if (!plan) {
                return res.status(404).json({ success: false, error: 'Plan no encontrado' });
            }
        }
        
        const inscripcionActualizada = await inscripcionModel.actualizaInscripcion(id, {
            plan_id: plan_id || inscripcion.plan_id,
            fecha_vencimiento: fecha_vencimiento || inscripcion.fecha_vencimiento,
            nota: nota !== undefined ? nota : inscripcion.nota
        });
        
        res.json({ success: true, data: inscripcionActualizada });
    } catch (error) {
        console.error('Error al actualizar inscripción:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const renovarInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const inscripcion = await inscripcionModel.obtInscripcion(id);
        if (!inscripcion) {
            return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
        }
        
        // Calcular nueva fecha de vencimiento basada en la duración del plan
        const plan = await planModel.obtPlan(inscripcion.plan_id);
        const fechaNueva = new Date();
        fechaNueva.setMonth(fechaNueva.getMonth() + plan.duracion_meses);
        const nuevaFechaVencimiento = fechaNueva.toISOString().split('T')[0];
        
        const inscripcionRenovada = await inscripcionModel.renovaInscripcion(id, nuevaFechaVencimiento);
        
        res.json({ success: true, data: inscripcionRenovada });
    } catch (error) {
        console.error('Error al renovar inscripción:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const eliminarInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        
        const inscripcion = await inscripcionModel.obtInscripcion(id);
        if (!inscripcion) {
            return res.status(404).json({ success: false, error: 'Inscripción no encontrada' });
        }
        
        const affected = await inscripcionModel.eliminaInscripcion(id);
        console.log(`inscripcionController.eliminarInscripcion: id=${id}, affected=${affected}`);
        if (!affected || affected === 0) {
            return res.status(500).json({ success: false, error: 'No se pudo marcar la inscripción como inactiva' });
        }

        res.json({ success: true, message: 'Inscripción eliminada correctamente', affectedRows: affected });
    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
