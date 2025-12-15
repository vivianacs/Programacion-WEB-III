import * as planModel from '../models/planModel.js';

export const obtenerPlanes = async (req, res) => {
    try {
        const planes = await planModel.obtPlanes();
        res.json({ success: true, data: planes });
    } catch (error) {
        console.error('Error al obtener planes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const obtenerPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await planModel.obtPlan(id);
        
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan no encontrado' });
        }
        
        res.json({ success: true, data: plan });
    } catch (error) {
        console.error('Error al obtener plan:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const crearPlan = async (req, res) => {
    try {
        const { nombre, duracion_meses, precio, descripcion } = req.body;
        
        if (!nombre || !duracion_meses || !precio) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan campos requeridos: nombre, duracion_meses, precio' 
            });
        }
        
        const nuevoPlan = await planModel.insertaPlan({
            nombre,
            duracion_meses,
            precio,
            descripcion: descripcion || ''
        });
        
        res.status(201).json({ success: true, data: nuevoPlan });
    } catch (error) {
        console.error('Error al crear plan:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const actualizarPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, duracion_meses, precio, descripcion } = req.body;
        
        const plan = await planModel.obtPlan(id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan no encontrado' });
        }
        
        const planActualizado = await planModel.actualizaPlan(id, {
            nombre: nombre || plan.nombre,
            duracion_meses: duracion_meses || plan.duracion_meses,
            precio: precio || plan.precio,
            descripcion: descripcion || plan.descripcion
        });
        
        res.json({ success: true, data: planActualizado });
    } catch (error) {
        console.error('Error al actualizar plan:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const eliminarPlan = async (req, res) => {
    try {
        const { id } = req.params;
        
        const plan = await planModel.obtPlan(id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan no encontrado' });
        }
        
        await planModel.eliminaPlan(id);
        res.json({ success: true, message: 'Plan eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar plan:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
