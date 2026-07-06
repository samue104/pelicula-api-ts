import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL: string = 'https://api.themoviedb.org/3';
const API_KEY: string  = process.env.TMDB_API_KEY as string;

// Tipos que devuelve TMDB
export interface TmdbSearchResult {
  page: number;
  results: TmdbMovie[];
  total_results: number;
  total_pages: number;
}

export interface TmdbMovie {
  id:            number;
  title:         string;
  release_date:  string;
  poster_path:   string | null;
  overview:      string;
  vote_average:  number;
  genre_ids?:    number[];
}

const buscarPorTitulo = async (titulo: string): Promise<TmdbSearchResult> => {
  const res = await axios.get<TmdbSearchResult>(`${BASE_URL}/search/movie`, {
    params: {
      api_key: API_KEY,
      query: titulo,
      language: 'es-ES'
    }
  });
  return res.data;
};

const buscarPorId = async (id: string): Promise<TmdbMovie> => {
  const res = await axios.get<TmdbMovie>(`${BASE_URL}/movie/${id}`, {
    params: {
      api_key: API_KEY,
      language: 'es-ES'
    }
  });
  return res.data;
};

// Categorías que usa el diseño (sidebar)
const obtenerPopulares = async (): Promise<TmdbSearchResult> => {
  const res = await axios.get<TmdbSearchResult>(`${BASE_URL}/movie/popular`, {
    params: { api_key: API_KEY, language: 'es-ES', page: 1 }
  });
  return res.data;
};

const obtenerTopRated = async (): Promise<TmdbSearchResult> => {
  const res = await axios.get<TmdbSearchResult>(`${BASE_URL}/movie/top_rated`, {
    params: { api_key: API_KEY, language: 'es-ES', page: 1 }
  });
  return res.data;
};

const obtenerProximosEstrenos = async (): Promise<TmdbSearchResult> => {
  const res = await axios.get<TmdbSearchResult>(`${BASE_URL}/movie/upcoming`, {
    params: { api_key: API_KEY, language: 'es-ES', page: 1 }
  });
  return res.data;
};

const obtenerEnCines = async (): Promise<TmdbSearchResult> => {
  const res = await axios.get<TmdbSearchResult>(`${BASE_URL}/movie/now_playing`, {
    params: { api_key: API_KEY, language: 'es-ES', page: 1 }
  });
  return res.data;
};

const obtenerGeneros = async (): Promise<{ genres: { id: number; name: string }[] }> => {
  const res = await axios.get<{ genres: { id: number; name: string }[] }>(`${BASE_URL}/genre/movie/list`, {
    params: { api_key: API_KEY, language: 'es-ES' }
  });
  return res.data;
};

export default {
  buscarPorTitulo,
  buscarPorId,
  obtenerPopulares,
  obtenerTopRated,
  obtenerProximosEstrenos,
  obtenerEnCines,
  obtenerGeneros
};