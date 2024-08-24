const express = require('express');
const router = express.Router();
const CamperController = require('../controller/CamperController');

router.get('/', function (req, res, next) {
  res.json({ msg: 'hi' });
});

router.post('/camper', CamperController.camper_post);
router.get('/camper/:postid', CamperController.camper_get);
router.get('/campers', CamperController.campers_get); //gets the whole collection of campers

module.exports = router;
