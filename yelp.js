'use strict';

module.exports = handleYelp;
const superagent = require('superagent');

function Restaurant(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}

function handleYelp (request, response) {
  const url = 'https://api.yelp.com/v3/businesses/search';
  const queryStringParams = {
    location: request.query.search_query.toLowerCase(),
  }
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryStringParams)
    .then(data => {
      let yelp = data.body.businesses.map(place => new Restaurant(place));
      response.json(yelp);
    })
}
