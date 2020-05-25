'use strict';

module.exports = handleMovies;
const superagent = require('superagent');

function Movie(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w500/${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}

function handleMovies (request, response) {
  const url = 'https://api.themoviedb.org/3/search/movie';
  const queryStringParams = {
    api_key: process.env.MOVIE_API_KEY,
    query: request.query.search_query.toLowerCase(),
    page: 1,
  }
  superagent.get(url)
    .query(queryStringParams)
    .then(data => {
      let movies = data.body.results.map(movie => new Movie(movie));
      response.json(movies);
    })
}

