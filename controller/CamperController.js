const asyncHandler = require('express-async-handler');
const Camper = require('../models/Camper');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const passport = require('passport');

// request body should have the following, first_name, last_name, age,
// guardian_full_name, guardian_phone, home_address, dietary_restrictions (could be emptystring),
// medical_conditions (could be empty string)
exports.camper_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a first name.')
    .isLength({ max: 20 })
    .withMessage('First Name - Max character length is 20')
    .isAlpha()
    .withMessage('First Name - Enter letters only.'),

  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a last name.')
    .isLength({ max: 20 })
    .withMessage('Last Name - Max character length is 20')
    .isAlpha()
    .withMessage('Last Name - Enter letters only.'),

  body('age')
    .trim()
    .isInt({ min: 1, max: 17 })
    .withMessage('Age must be an integer between 1 and 17'),

  body('guardian_full_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a guardian full name')
    .isLength({ max: 50 })
    .withMessage('Guardian full name - Max characters is 50'),

  body('guardian_phone')
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('Guardian Phone - Must be exactly 10 digits')
    .custom((value) => {
      //custom validator, checks if only numbers exist
      if (!/^\d+$/.test(value)) {
        throw new Error(
          'Guardian Phone - Only numeric characters are allowed.'
        );
      }
      return true;
    }),

  body('home_address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a home address')
    .isLength({ max: 200 })
    .withMessage('Home Address - Max character length is 200'),

  body('dietary_restrictions')
    .trim()
    .optional({ checkFalsy: true }) //allows empty string
    .isString()
    .withMessage('Dietary Restrictions - Must be a string.')
    .isLength({ max: 200 })
    .withMessage('Dietary Restrictions - Max Character Length is 200'),

  body('medical_conditions')
    .trim()
    .optional({ checkFalsy: true }) // allows empty strings
    .isString()
    .withMessage('Medical Conditions - Must be a string.')
    .isLength({ max: 200 })
    .withMessage('Medical Conditions - Max Character Length is 200'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //if errors is not empty
      const errorMessages = errors.errors.map((error) => error.msg);
      res.status(422).json({
        statusSucc: false,
        message: 'there are errors',
        errors: errorMessages,
      });
      return;
    }

    //otherwise no errors
    const {
      first_name,
      last_name,
      age,
      guardian_full_name,
      guardian_phone,
      home_address,
      dietary_restrictions,
      medical_conditions,
    } = req.body;

    const newCamper = new Camper({
      first_name,
      last_name,
      age,
      guardian_full_name,
      guardian_phone,
      home_address,
      dietary_restrictions,
      medical_conditions,
    });

    await newCamper.save(); //save to database

    res
      .status(201)
      .json({ statusSucc: true, message: 'Camper registered successfully' });
  }),
];

//expects there to be a postid param in the url
//protected route
exports.camper_get = [
  asyncHandler(async (req, res, next) => {
    const postId = req.params['postid']; //get from url param

    if (!mongoose.isValidObjectId(postId)) {
      res
        .status(404)
        .json({ statusSucc: false, message: 'Cannot find camper' });
      return;
    }

    const foundCamper = await Camper.findOne({ _id: postId });

    if (!foundCamper) {
      //if no camper was found
      res
        .status(404)
        .json({ statusSucc: false, message: 'Cannot find camper' });
    } else {
      //camper was found
      res.status(200).json({
        statusSucc: true,
        message: 'Found camper',
        camper: foundCamper,
      });
    }
  }),
];

//gets all the campers
exports.campers_get = [
  passport.authenticate('jwt', { session: false }), //PROTECTED ROUTE

  asyncHandler(async (req, res, next) => {
    const campers = await Camper.find({}, 'first_name last_name age');

    res.status(200).json({
      statusSucc: true,
      message: 'Successfully fetched campers',
      campers,
    });
  }),
];
