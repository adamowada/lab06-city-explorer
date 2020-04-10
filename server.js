'use strict';

/*
  The .env file has this in it:
  PORT=3000
*/
require('dotenv').config();
const cors = require('cors');
const express = require('express');

const PORT = process.env.PORT;

const app = express();
app.use(cors());


app.get('/location', handleLocation);

function handleLocation( request, response ) {
  try {
    let city = request.query.city;
    // eventually, get this from a real live API
    // But today, pull it from a file.
    let locationData = require('./data/geo.json');
    let location = new Location(city, locationData[0]);
    // throw 'john is ugly or something';
    response.json(location);
  }
  catch(error) {
    let errorObject = {
      status: 500,
      responseText: 'john is ugly or something',
    };
    response.status(500).json(errorObject);
  }
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
    let weatherData = require('./data/darksky.json');
    let listofDays = [];
    weatherData.daily.data.forEach( day => {
      let weather = new Weather(day);
      listofDays.push(weather);
    })
    response.json(listofDays);
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
  this.time = data.time;
  this.forecast = data.summary;
}



app.listen( PORT, () => console.log('Server up on', PORT));

