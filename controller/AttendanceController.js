const { body, validationResult } = require('express-validator');
const passport = require('passport');
const Attendance = require('../models/Attendance');
const Camper = require('../models/Camper');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

//creating an attendance
exports.attendance_post = [
  passport.authenticate('jwt', { session: false }), //PROTECTED ROUTE

  body('date')
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      // additional validation
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return true;
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const attendanceWithDate = await Attendance.findOne({
      date: new Date(req.body.date),
    });

    if (attendanceWithDate) {
      //if attendance record exists with this date already
      errors.errors.push({ msg: 'There is already a record with this date.' });
      const errorMessages = errors.errors.map((error) => error.msg);
      res.status(409).json({
        statusSucc: false,
        message: 'Attendance record with that date already exists',
        errors: errorMessages,
      });
      return;
    } else if (!errors.isEmpty()) {
      const errorMessages = errors.errors.map((error) => error.msg);
      res.status(422).json({
        statusSucc: false,
        message: 'There are errors in the data sent',
        errors: errorMessages,
      });
      return;
    }
    //otherwise no problems

    const allCampers = await Camper.find({}, '_id');
    const attendanceRecord = allCampers.map((camper) => {
      const newCamper = { camper_id: camper._id };

      newCamper.signin = '';
      newCamper.signout = '';
      return newCamper;
    });

    const newAttendance = new Attendance({
      date: new Date(req.body.date),
      attendance: attendanceRecord,
    });

    await newAttendance.save();

    res.status(201).json({
      statusSucc: true,
      message: 'Successfully created attendance entry',
    });
  }),
];

exports.attendances_get = [
  passport.authenticate('jwt', { session: false }), //PROTECTED ROUTE

  asyncHandler(async (req, res, next) => {
    const allAttendances = await Attendance.find({}, 'date').sort({ date: -1 });

    res.status(200).json({
      statusSucc: true,
      message: 'Succesfully fetched attendances',
      attendances: allAttendances,
    });
  }),
];

//get a specific attendance
//assumes there is a postid
exports.attendance_get = [
  passport.authenticate('jwt', { session: false }), //PROTECTED ROUTE

  asyncHandler(async (req, res, next) => {
    const postId = req.params['postid']; //get from url param

    if (!mongoose.isValidObjectId(postId)) {
      res.status(404).json({
        statusSucc: false,
        message: 'Cannot find attendance listing',
      });
      return;
    }

    const attendance = await Attendance.findOne({ _id: postId }).populate({
      path: 'attendance.camper_id', // Path to populate
      select: 'first_name last_name', // Fields to return; _id is included by default
    });

    res.status(200).json({
      statusSucc: true,
      message: 'Succesfully fetched attendance record',
      attendance,
    });
  }),
];

//update an attendance record
//takes a date (html format) and takes an attendance array (must match schema)
//needs attendance, date, and id in the request body
//attendance is

exports.attendance_update = [
  passport.authenticate('jwt', { session: false }), // PROTECTED ROUTE

  body('id').isMongoId().withMessage('Invalid attendance ID'),

  // Validate that attendance is an array
  body('attendance').isArray().withMessage('Attendance must be an array'),

  body('attendance.*.camper_id').isMongoId().withMessage('Invalid camper ID'),

  body('attendance.*.signin')
    .custom((value) => {
      return value === '' || /^[0-9]{3}$/.test(value); // Allow empty string or 3-digit string
    })
    .withMessage('Sign-in time must be a 3-digit string or empty'),

  body('attendance.*.signout')
    .custom((value) => {
      return value === '' || /^[0-9]{3}$/.test(value); // Allow empty string or 3-digit string
    })
    .withMessage('Sign-out time must be a 3-digit string or empty'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({
        statusSucc: false,
        message: 'There are errors',
        errors: errors.errors.map((error) => error.msg),
      });
      return;
    }

    //otherwise go on to update

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.body.id,
      {
        attendance: Array.isArray(req.body.attendance)
          ? req.body.attendance
          : [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedAttendance) {
      //unable to fetch attendace record
      return res.status(404).json({
        statusSucc: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      statusSucc: true,
      message: 'Attendance record updated successfully',
    });
  }),
];
