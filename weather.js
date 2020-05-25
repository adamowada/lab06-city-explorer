'use strict';

module.exports = handleWeather;
const superagent = require('superagent');

function Weather(data) {
  this.time = `${new Date(data.time * 1000).getMonth()+1}-${new Date(data.time * 1000).getDate()}-${new Date(data.time * 1000).getFullYear()}`;
  this.forecast = data.summary;
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