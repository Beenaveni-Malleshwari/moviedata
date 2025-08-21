const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

// Initialize Database and Server
const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Database Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

/* 
API 1: Get all movie names 
*/
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name 
    FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((movie) => ({ movieName: movie.movie_name }))
  );
});

/* 
API 2: Add a new movie 
*/
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (?, ?, ?);`;
  await db.run(addMovieQuery, [directorId, movieName, leadActor]);
  response.send("Movie Successfully Added");
});

/* 
API 3: Get movie by ID 
*/
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * 
    FROM movie
    WHERE movie_id = ?;`;
  const movie = await db.get(getMovieQuery, [movieId]);
  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

/* 
API 4: Update movie details 
*/
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
    UPDATE movie
    SET director_id = ?, movie_name = ?, lead_actor = ?
    WHERE movie_id = ?;`;

  await db.run(updateMovieQuery, [directorId, movieName, leadActor, movieId]);
  response.send("Movie Details Updated");
});

/* 
API 5: Delete a movie 
*/
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ?;`;
  await db.run(deleteMovieQuery, [movieId]);
  response.send("Movie Removed");
});

/* 
API 6: Get all directors 
*/
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * 
    FROM director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((director) => ({
      directorId: director.director_id,
      directorName: director.director_name,
    }))
  );
});

/* 
API 7: Get all movies by a director 
*/
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `
    SELECT movie_name 
    FROM movie
    WHERE director_id = ?;`;
  const moviesArray = await db.all(getMoviesByDirectorQuery, [directorId]);
  response.send(
    moviesArray.map((movie) => ({ movieName: movie.movie_name }))
  );
});

module.exports = app;
