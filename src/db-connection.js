// @flow
const mysql = require('mysql');
const config = require('../config');

const connection = mysql.createConnection({
  host: config.host,
  user: config.dbUser,
  password: config.password,
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('Connected!');
});

module.exports = connection;
