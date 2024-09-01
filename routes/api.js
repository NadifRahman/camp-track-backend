const express = require('express');
const router = express.Router();
const CamperController = require('../controller/CamperController');
const InventoryController = require('../controller/InventoryController');
const AttendanceController = require('../controller/AttendanceController');
router.get('/', function (req, res, next) {
  res.json({ msg: 'hi' });
});

router.post('/camper', CamperController.camper_post);
router.get('/camper/:postid', CamperController.camper_get);
router.get('/campers', CamperController.campers_get); //gets the whole collection of campers
router.post('/inventory', InventoryController.inventory_post);
router.get('/inventory/:postid', InventoryController.inventory_get);
router.get('/inventories', InventoryController.inventories_get);

router.post('/attendance', AttendanceController.attendance_post); //creates an attendance record
router.get('/attendances', AttendanceController.attendances_get);
router.get('/attendance/:postid', AttendanceController.attendance_get);

module.exports = router;
