'use strict';

module.exports = handleLocation;
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
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