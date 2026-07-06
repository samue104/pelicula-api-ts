import express, { Application } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import peliculaRoutes from './routes/peliculaRoutes';

dotenv.config();

const app: Application = express();

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use('/api/peliculas', peliculaRoutes);

const PORT: number = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
