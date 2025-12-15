import PDFDocument from 'pdfkit';
import { obtInscripcion, obtInscripcionesDelMes } from '../models/inscripcionModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generarReporteInscripcion = async (req, res) => {
    try {
        const { inscripcionId } = req.params;

        // Obtener datos de la inscripción
        const inscripcion = await obtInscripcion(inscripcionId);
        if (!inscripcion) {
            return res.status(404).json({ error: 'Inscripción no encontrada' });
        }

        // Crear documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Headers para descargar el PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-inscripcion-${inscripcionId}.pdf"`);

        // Pipe del PDF a la respuesta
        doc.pipe(res);

        // Encabezado
        doc.fontSize(20).font('Helvetica-Bold').text('GIMNASIO NITROFIT', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text('Comprobante de Inscripción', { align: 'center' });
        doc.moveDown();

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();

        // Información del Reporte
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DE LA INSCRIPCIÓN');
        doc.fontSize(10).font('Helvetica');
        doc.text(`ID Inscripción: ${inscripcion.id}`);
        doc.text(`Fecha Inscripción: ${new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-ES')}`);
        doc.text(`Fecha Vencimiento: ${new Date(inscripcion.fecha_vencimiento).toLocaleDateString('es-ES')}`);
        doc.moveDown();

        // Información del Cliente
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL MIEMBRO');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Nombre: ${inscripcion.cliente_nombre} ${inscripcion.cliente_apellido}`);
        doc.text(`Email: ${inscripcion.email || 'N/A'}`);
        doc.text(`Teléfono: ${inscripcion.telefono || 'N/A'}`);
        doc.moveDown();

        // Información del Plan
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DEL PLAN');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Plan: ${inscripcion.plan_nombre}`);
        doc.text(`Duración: ${inscripcion.duracion_meses} mes(es)`);
        doc.text(`Precio: ${parseFloat(inscripcion.precio).toFixed(2)} Bs`);
        if (inscripcion.nota) {
            doc.text(`Nota: ${inscripcion.nota}`);
        }
        doc.moveDown();

        // Pie de página
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica-Oblique').text(
            `Este documento fue generado automáticamente el ${new Date().toLocaleString('es-ES')}`,
            { align: 'center' }
        );

        // Finalizar PDF
        doc.end();
    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: 'Error al generar el reporte PDF' });
    }
};

export const generarReporteInscritos = async (req, res) => {
    try {
        const { anio, mes } = req.params;
        
        const year = parseInt(anio);
        const month = parseInt(mes);
        
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ error: 'Año y mes inválidos' });
        }

        // Obtener inscripciones del mes
        const inscripciones = await obtInscripcionesDelMes(year, month);

        // Crear documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-inscritos-${year}-${String(month).padStart(2, '0')}.pdf"`);

        doc.pipe(res);

        // Encabezado
        doc.fontSize(20).font('Helvetica-Bold').text('GIMNASIO NITROFIT', { align: 'center' });
        doc.fontSize(14).font('Helvetica-Bold').text('Reporte de Inscritos', { align: 'center' });
        doc.fontSize(11).font('Helvetica').text(`${new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`, { align: 'center' });
        doc.moveDown();

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();

        // Resumen
        doc.fontSize(11).font('Helvetica-Bold').text('RESUMEN');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Total de Inscritos: ${inscripciones.length}`);
        
        // Agrupar por plan
        const porPlan = {};
        let ingresoTotal = 0;
        
        inscripciones.forEach(insc => {
            if (!porPlan[insc.plan_nombre]) {
                porPlan[insc.plan_nombre] = 0;
            }
            porPlan[insc.plan_nombre]++;
            ingresoTotal += parseFloat(insc.precio);
        });

        doc.moveDown(0.5);
        doc.text('Distribución por Plan:', { underline: true });
        Object.entries(porPlan).forEach(([plan, cantidad]) => {
            doc.text(`  • ${plan}: ${cantidad}`);
        });
        
        doc.moveDown();
        doc.text(`Ingreso Total: ${ingresoTotal.toFixed(2)} Bs`, { underline: true });
        doc.moveDown();

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();

        // Lista de inscritos
        doc.fontSize(11).font('Helvetica-Bold').text('LISTA DE INSCRITOS');
        doc.moveDown(0.5);

        // Headers de tabla
        const startX = 50;
        const col1 = 150;
        const col2 = 250;
        const col3 = 380;
        const col4 = 480;
        
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Nombre', startX, doc.y);
        doc.text('Plan', col1, doc.y - doc.currentLineHeight());
        doc.text('Vencimiento', col2, doc.y - doc.currentLineHeight());
        doc.text('Precio', col3, doc.y - doc.currentLineHeight());
        
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.3);

        // Datos de la tabla
        doc.fontSize(8).font('Helvetica');
        inscripciones.forEach((insc) => {
            const nombre = `${insc.cliente_nombre} ${insc.cliente_apellido}`;
            const plan = insc.plan_nombre;
            const vencimiento = new Date(insc.fecha_vencimiento).toLocaleDateString('es-ES');
            const precio = `$${parseFloat(insc.precio).toFixed(2)}`;

            doc.text(nombre.substring(0, 25), startX);
            doc.text(plan.substring(0, 20), col1, doc.y - doc.currentLineHeight());
            doc.text(vencimiento, col2, doc.y - doc.currentLineHeight());
            doc.text(precio, col3, doc.y - doc.currentLineHeight());
            
            doc.moveDown(0.4);
        });

        // Pie de página
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica-Oblique').text(
            `Reporte generado el ${new Date().toLocaleString('es-ES')}`,
            { align: 'center' }
        );

        doc.end();
    } catch (error) {
        console.error('Error generando reporte de inscritos:', error);
        res.status(500).json({ error: 'Error al generar el reporte PDF' });
    }
};
