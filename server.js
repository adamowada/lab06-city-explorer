'use strict';


require('dotenv').config();
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT;
const app = express();

const handleLocation = require('./location');
const handleWeather = require('./weather');
const handleMovies = require('./movies');
const handleTrails = require('./trails');
const handleYelp = require('./yelp');

client.connect();
app.use(cors());
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/movies', handleMovies);
app.get('/trails', handleTrails);
app.get('/yelp', handleYelp);


app.listen( PORT, () => console.log('Server up on', PORT));

