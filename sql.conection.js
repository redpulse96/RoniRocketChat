const sql = require('mssql');

// DB configs
const config = {
  user: process.env.DB_USER, //  '...',
  password: process.env.DB_PASS, //  '...',
  server: process.env.DB_HOST, //  'localhost', // You can use 'localhost\\instance' to connect to named instance
  port: parseInt(process.env.DB_PORT), //  'localhost', // You can use 'localhost\\instance' to connect to named instance
  database: process.env.DB_NAME,
};

module.exports = function connectToSql() {
  return new Promise((res, rej) => {
    sql
      .connect(config)
      .then((pool) => {
        res(pool);
      })
      .catch((err) => {
        rej(err);
      });
  });
};
