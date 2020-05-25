'use strict';

module.exports = handleTrails;
const superagent = require('superagent');

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