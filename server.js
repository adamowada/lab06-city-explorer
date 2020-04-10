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

// Test Endpoint
// http://localhost:3000/test
app.get( '/test', (request, response) => {
  const name = request.query.name;
  response.send( `Hello, ${name}` );
});

app.get('/cats', (request, response) => {
  let type = request.query.type;
  let words = '';
  if ( type === 'calico' ) {
    words = 'You are a good person';
  }
  else {
    words = 'We do not have those';
  }

  response.send(words);
});

app.get('/location', handleLocation);

function handleLocation( request, response ) {
  let city = request.query.city;
  // eventually, get this from a real live API
  // But today, pull it from a file.
  let locationData = require('./data/location.json');
  let location = new Location(city, locationData[0]);
  response.json(location);
}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

/* Restaurants

  {
    "restaurant": "Serious Pie",
    "cuisines": "Pizza, Italian",
    "locality": "Belltown"
  },
*/

app.get('/restaurants', handleRestaurants);

function handleRestaurants(request, response) {
  // Eventually, will be an API call
  // Today ... get a file

  let restaurantData = require('./data/restaurants.json');
  let listOfRestaurants = [];

  restaurantData.nearby_restaurants.forEach( r => {
    let restaurant = new Restaurant(r);
    listOfRestaurants.push(restaurant);
  });

  response.json(listOfRestaurants);

}

function Restaurant(data) {
  this.name = data.restaurant.name;
  this.cuisines = data.restaurant.cuisines;
  this.locality = data.restaurant.location.locality;
}

app.listen( PORT, () => console.log('Server up on', PORT));

