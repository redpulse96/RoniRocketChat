'use strict';

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/routes');

// Creating the express app
const app = express();

// Body parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// Testing a route
app.get('/', (req, res) => {
  res.send('Hello');
});

app.use('/api/v1', routes);

// catch 404 and forward to error handler
app.use((err, res) => {
  console.error('---Route_not_found---');
  err.status = 'Url Not found!';
  err.statusCode = 404;
  return res.status(err.statusCode).json({ ...err });
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  return res.status(err.statusCode).json({ ...err });
});

// Exporting the app
module.exports = app;
