const express = require('express');
const router = express.Router();
const CamperController = require('../controller/CamperController');

router.get('/', function (req, res, next) {
  res.json({ msg: 'hi' });
});

router.post('/camper', CamperController.camper_post);
