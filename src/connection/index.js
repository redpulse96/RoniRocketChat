// get the client
const mysql = require('mysql2/promise');

// DB configs
const config = {
  user: process.env.DB_USER, //  '...',
  password: process.env.DB_PASS, //  '...',
  host: process.env.DB_HOST, //  'localhost', // You can use 'localhost\\instance' to connect to named instance
  port: parseInt(process.env.DB_PORT), //  'localhost', // You can use 'localhost\\instance' to connect to named instance
  database: process.env.DB_NAME,
};

// create the connection
module.exports = function () {
  try {
    mysql.createConnection(config).then((res) => {
      return res;
    });
  } catch (error) {
    console.log('catch.error');
    console.error(error);
    throw error;
  }
};
