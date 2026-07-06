import { Request, Response } from 'express';
import peliculaService from '../services/peliculaService';
import pool from '../db/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Favorito extends RowDataPacket {
  id:        number;
  tmdbId:    number;
  titulo:    string;
  año:       string;
  poster:    string;
  nota:      string;
  createdAt: Date;
}

// GET /api/peliculas?titulo=Batman
const buscarPorTitulo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo } = req.query as { titulo?: string };
    if (!titulo) {
      res.status(400).json({ error: 'El parámetro titulo es requerido' });
      return;
    }
    const data = await peliculaService.buscarPorTitulo(titulo);
    res.json(data);
  } catch (error) {
    console.error('ERROR TMDB:', error);
    res.status(500).json({ error: 'Error al buscar películas' });
  }
};

// GET /api/peliculas/:id
const buscarPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    console.log('ID recibido:', id);
    const data = await peliculaService.buscarPorId(id);
    res.json(data);
  } catch (error) {
    console.error('ERROR TMDB:', error);
    res.status(500).json({ error: 'Error al buscar la película' });
  }
};

// GET /api/peliculas/categoria/populares
const populares = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await peliculaService.obtenerPopulares();
    res.json(data);
  } catch (error) {
    console.error('ERROR TMDB:', error);
    res.status(500).json({ error: 'Error al obtener populares' });
  }
};

// GET /api/peliculas/categoria/top-rated
const topRated = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await peliculaService.obtenerTopRated();
    res.json(data);
  } catch (error) {
    console.error('ERROR TMDB:', error);
    res.status(500).json({ error: 'Error al obtener top rated' });
  }
};

// GET /api/peliculas/categoria/proximos
const proximosEstrenos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await peliculaService.obtenerProximosEstrenos();
    res.json(data);
  } catch (error) {
    console.error('ERROR TMDB:', error);
    res.status(500).json({ error: 'Error al obtener próximos estrenos' });
  }
};

// GET /api/peliculas/categoria/en-cines
const enCines = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await peliculaService.obtenerEnCines();
    res.json(data);
  } catch (error) {
    console.error('ERROR TMDB:', error);
    res.status(500).json({ error: 'Error al obtener en cines' });
  }
};

// GET /api/peliculas/categoria/generos
const generos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await peliculaService.obtenerGeneros();
    res.json(data);
  } catch (error) {
    console.error('ERROR TMDB:', error);
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
};

// GET /api/peliculas/favoritos
const listarFavoritos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<Favorito[]>('SELECT * FROM favoritos');
    res.json(rows);
  } catch (error) {
    console.error('ERROR MySQL:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

// POST /api/peliculas/favoritos
const agregarFavorito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tmdbId } = req.body as { tmdbId?: number };
    if (!tmdbId) {
      res.status(400).json({ error: 'tmdbId es requerido' });
      return;
    }

    const pelicula = await peliculaService.buscarPorId(String(tmdbId));

    const posterUrl = pelicula.poster_path
      ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`
      : 'N/A';

    await pool.query<ResultSetHeader>(
      'INSERT IGNORE INTO favoritos (tmdbId, titulo, año, poster) VALUES (?, ?, ?, ?)',
      [pelicula.id, pelicula.title, pelicula.release_date, posterUrl]
    );
    res.status(201).json({ message: 'Película agregada a favoritos', pelicula });
  } catch (error) {
    console.error('ERROR al agregar favorito:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT /api/peliculas/favoritos/:tmdbId
const actualizarFavorito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tmdbId } = req.params;
    const { titulo, año, poster, nota } = req.body as {
      titulo?: string;
      año?: string;
      poster?: string;
      nota?: string;
    };

    if (!titulo || !año || !poster) {
      res.status(400).json({ error: 'titulo, año y poster son requeridos para PUT' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE favoritos SET titulo = ?, año = ?, poster = ?, nota = ? WHERE tmdbId = ?',
      [titulo, año, poster, nota ?? '', tmdbId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Favorito no encontrado' });
      return;
    }
    res.json({ message: 'Favorito actualizado completamente', tmdbId, titulo, año, poster, nota });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar favorito' });
  }
};

// PATCH /api/peliculas/favoritos/:tmdbId
const patchFavorito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tmdbId } = req.params;
    const { nota } = req.body as { nota?: string };

    if (nota === undefined) {
      res.status(400).json({ error: 'El campo nota es requerido para PATCH' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE favoritos SET nota = ? WHERE tmdbId = ?',
      [nota, tmdbId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Favorito no encontrado' });
      return;
    }
    res.json({ message: 'Nota actualizada correctamente', tmdbId, nota });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar nota' });
  }
};

// DELETE /api/peliculas/favoritos/:tmdbId
const eliminarFavorito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tmdbId } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM favoritos WHERE tmdbId = ?', [tmdbId]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Favorito no encontrado' });
      return;
    }
    res.json({ message: 'Película eliminada de favoritos' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
};

export default {
  buscarPorTitulo,
  buscarPorId,
  populares,
  topRated,
  proximosEstrenos,
  enCines,
  generos,
  listarFavoritos,
  agregarFavorito,
  actualizarFavorito,
  patchFavorito,
  eliminarFavorito
};