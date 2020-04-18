'use strict';

/*
  The .env file has this in it:
  PORT=3000
*/
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');

const PORT = process.env.PORT;

const app = express();
app.use(cors());


app.get('/location', handleLocation);

function handleLocation( request, response ) {
  const city = request.query.city;
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
      let locationData = data.body[0];
      let location = new Location(city, locationData);
      response.json(location);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send('Bad Location Request');
    });
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}


app.get('/weather', handleWeather);

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


function Weather(data) {
  this.time = `${new Date(data.time * 1000).getMonth()+1}-${new Date(data.time * 1000).getDate()}-${new Date(data.time * 1000).getFullYear()}` ; // format to date (not epoch)
  this.forecast = data.summary;
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
      console.log(data.body.trails);
      const listOfTrails = data.body.trails.map( trail => new Trails(trail) );
      response.json(listOfTrails);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send('Bad Trails Request');
    });
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



app.listen( PORT, () => console.log('Server up on', PORT));

