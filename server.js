'use strict';

/*
  The .env file has this in it:
  PORT=3000
*/
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');

// pg
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();


const PORT = process.env.PORT;

const app = express();
app.use(cors());


app.get('/location', handleLocation);

function handleLocation( request, response ) {
  let city = request.query.city.toLowerCase();
  console.log('the city variable is', city);
  // check if in sql db first
  const SQL = `SELECT * FROM locations WHERE search_query='${city}'`;


  // if( locationCache[city] ) {
  //   console.log(city, 'Came from Memory');
  //   response.json( locationCache[city] );
  //   return;
  // }

  client.query(SQL)
    .then( results => {
      if ( results.rowCount > 0 ) {
        response.status(200).json(results.rows);
        console.log('we have it in sql db');
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
            let locationData = data.body[0];
            console.log('this is the locationdata:', locationData);
            let location = new Location(city, locationData);
            response.json(location);
          });
        // response.status(400).send('No Results Found man');
        console.log('sup its not in the db man');
      }
    })
    .catch(error => response.status(500).send(error));
}


function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}


app.get('/weather', handleWeather);

function handleWeather(request, response) {
  try {

    // use darksky fake data
    // eventually will be an api call
    // let weatherData = require('./data/darksky.json');

    let url = 'https://api.darksky.net/forecast/';
    let key = process.env.DARKSKY_TOKEN;
    let lat = request.query.latitude;
    let lon = request.query.longitude;

    // user-key
    let newUrl = `${url}${key}/${lat},${lon}`;

    superagent.get(newUrl)
      .then( data => {
        let listOfDays = data.body.daily.data.map( day => {
          return new Weather(day);
        })
        response.json(listOfDays);
      }).catch( error => {
        console.log(error);
      });
  }
  catch(error) {
    let errorObject = {
      status: 500,
      responseText: 'john is ugly or something',
    };
    response.status(500).json(errorObject);
  }
}

function Weather(data) {
  this.time = data.time; // format to date (not epoch)
  this.forecast = data.summary;
}



app.listen( PORT, () => console.log('Server up on', PORT));

