import express from 'express';
import cors from 'cors';

// Importar rutas
import categoriesRoutes from './routes/categoriesRoutes.js';
import productsRoutes from './routes/productsRoutes.js';

const app = express();
const PORT = 3000;

// Middlewares CORREGIDOS
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
// Rutas
app.use('/categories', categoriesRoutes);
app.use('/productos', productsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Practica Web 3 - Funcionando!',
        author: 'Tu Nombre',
        endpoints: {
            categories: '/categories',
            products: '/productos'
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});

export default app;