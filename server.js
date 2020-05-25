'use strict';


require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT;
const app = express();

client.connect();
app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/movies', handleMovies);

function Movie(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w500/${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

function Weather(data) {
  this.time = `${new Date(data.time * 1000).getMonth()+1}-${new Date(data.time * 1000).getDate()}-${new Date(data.time * 1000).getFullYear()}`;
  this.forecast = data.summary;
}

function Trails(data) {
  this.name = data.name;
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionDetails;
  this.condition_date = data.conditionDate.match(/\d\d\d\d-\d\d-\d\d/);
  this.condition_time = data.conditionDate.match(/\d\d:\d\d:\d\d/);
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

function handleLocation( request, response ) {
  const city = request.query.city.toLowerCase();
  // check if in sql db first
  const sql = `SELECT * FROM locations WHERE search_query='${city}'`;
  client.query(sql)
    .then( results => {
      if ( results.rowCount > 0 ) {
        response.status(200).json(results.rows[0]);
      } else {
        // if not in sql db, runs api call
        const url = 'https://us1.locationiq.com/v1/search.php';
        const queryStringParams = {
          key: process.env.LOCATION_TOKEN,
          q: city,
          format: 'json',
          limit: 1,
        };
        superagent.get(url)
          .query(queryStringParams)
          .then( data => {
            const locationData = data.body[0];
            const location = new Location(city, locationData);
            const newSql = `
            INSERT INTO locations(search_query, formatted_query, latitude, longitude)
            VALUES($1, $2, $3, $4)
            `;
            const VALUES = [location.search_query, location.formatted_query, location.latitude, location.longitude];
            client.query(newSql, VALUES)
              .then( () => response.json(location));
          });
      }
    })
    .catch(error => {
      console.log(error);
      response.status(500).send('Bad Location Request');
    });
}

function handleWeather(request, response) {
  const url = 'https://api.darksky.net/forecast/';
  const key = process.env.DARKSKY_TOKEN;
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  const newUrl = `${url}${key}/${lat},${lon}`;
  superagent.get(newUrl)
    .then( data => {
      const listOfDays = data.body.daily.data.map( day => {
        return new Weather(day);
      })
      response.json(listOfDays);
    })
    .catch( error => {
      console.log(error);
      response.status(500).send('Bad Weather Request');
    });
}

app.get('/trails', handleTrails);
function handleTrails( request, response ) {
  const url = 'https://www.hikingproject.com/data/get-trails';
  const queryStringParams = {
    lat: request.query.latitude,
    lon: request.query.longitude,
    key: process.env.TRAIL_TOKEN,
  };
  superagent.get(url)
    .query(queryStringParams)
    .then( data => {
      const listOfTrails = data.body.trails.map( trail => new Trails(trail) );
      response.json(listOfTrails);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send('Bad Trails Request');
    });
}

app.listen( PORT, () => console.log('Server up on', PORT));

