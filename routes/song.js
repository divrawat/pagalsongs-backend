var express = require('express');
var saveScrapedDataOnStartup = require('../controllers/song.js').saveScrapedDataOnStartup;

var router = express.Router();

router.post('/scrape-and-save', saveScrapedDataOnStartup);

module.exports = router;
