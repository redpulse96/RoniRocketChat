// Import libraries
const { Router } = require('express');
const router = new Router();

// Import handlers
const { fetchQuery } = require('../handlers');

// Register the routers
router.get('/fetchcedule', fetchQuery);

module.exports = router;
