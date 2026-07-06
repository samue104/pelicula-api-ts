CREATE DATABASE IF NOT EXISTS peliculas_db;
USE peliculas_db;

CREATE TABLE favoritos (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  tmdbId    INT UNIQUE NOT NULL,
  titulo    VARCHAR(255),
  año       VARCHAR(20),
  poster    TEXT,
  nota      VARCHAR(500) DEFAULT '',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM favoritos;