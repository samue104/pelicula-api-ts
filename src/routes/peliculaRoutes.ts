import { Router } from 'express';
import controller from '../controllers/peliculaController';

const router: Router = Router();

// ⚠️ RUTAS ESPECÍFICAS PRIMERO (favoritos)
router.get('/favoritos',            controller.listarFavoritos);
router.post('/favoritos',           controller.agregarFavorito);
router.put('/favoritos/:tmdbId',    controller.actualizarFavorito);
router.patch('/favoritos/:tmdbId',  controller.patchFavorito);
router.delete('/favoritos/:tmdbId', controller.eliminarFavorito);

// ⚠️ RUTAS DE CATEGORÍAS (usadas por el diseño / sidebar)
router.get('/categoria/populares',  controller.populares);
router.get('/categoria/top-rated',  controller.topRated);
router.get('/categoria/proximos',   controller.proximosEstrenos);
router.get('/categoria/en-cines',   controller.enCines);
router.get('/categoria/generos',    controller.generos);

// ⚠️ RUTAS GENÉRICAS AL FINAL
router.get('/',                     controller.buscarPorTitulo);
router.get('/:id',                  controller.buscarPorId);

export default router;
