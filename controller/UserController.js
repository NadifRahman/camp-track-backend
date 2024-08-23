const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

require('dotenv').config(); //load le stuff

//req should have the following keys: password, username, first_name, last_name, role
exports.signup_post = [
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a first name.')
    .isLength({ max: 20 })
    .withMessage('First Name - Max Character Length is 20.')
    .isAlpha()
    .withMessage('First Name - Enter letters only'),

  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a last name.')
    .isLength({ max: 20 })
    .withMessage('Last Name - Max Character Length is 20.')
    .isAlpha()
    .withMessage('Last Name - Enter letters only'),

  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a username')
    .isLength({ max: 15 })
    .withMessage('Username - Maximum character length is 15')
    .isAlphanumeric()
    .withMessage('Username - Letters and numbers only'),

  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a password')
    .isLength({ max: 20 })
    .withMessage('Password - Password is too long'),

  body('role')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a role')
    .isLength({ max: 50 })
    .withMessage('Role - Maximum character length is 50')
    .isAlphanumeric()
    .withMessage('Role - Numbers and Letters only'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const userExists = await User.exists({ username: req.body.username });

    if (userExists) {
      errors.errors.push({
        msg: 'User with the given username already exists',
      });

      const errorMessages = errors.errors.map((error) => error.msg);

      res.status(409).json({
        statusSucc: true,
        message: 'username already taken',
        errors: errorMessages,
      });

      return;
    }

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

    //IF PASS BEYOND VALIDATION THEN GO TO CREATE USER DOCUMENT IN DATABASE

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      //hash the password

      if (err) return next(err);

      try {
        const newUser = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          username: req.body.username,
          hashedPassword: hashedPassword,
          role: req.body.role,
        });

        newUser.save(); //save to database

        const token = jwt.sign(
          { sub: newUser.id }, //payload of sub is the id
          process.env.JWT_SECRET, //sign with secret
          { expiresIn: '14d' }
        ); //expires in 14

        res.status(201).json({
          statusSucc: true,
          message: 'Successfully created user',
          token,
        });
      } catch (err) {
        return next(err);
      }
    });
  }),
];

//needs a username and password on the req body
exports.login_post = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a username')
    .isLength({ max: 15 })
    .withMessage('Username - Maximum character length is 15')
    .isAlphanumeric()
    .withMessage('Username - Letters and numbers only'),

  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a password')
    .isLength({ max: 20 })
    .withMessage('Password - Password is too long'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.errors.map((error) => error.msg);

      res.status(422).json({
        statusSucc: false,
        message: 'There are errors',
        errors: errorMessages,
      });

      return;
    }

    const user = await User.findOne({ username: req.body.username }); //attempt to find user with the given username

    if (!user) {
      //if user doesnt exist
      res
        .status(404)
        .json({ statusSucc: false, message: 'Username does not exist' });

      return;
    }

    //Compare if given password matches the hashed password
    const match = await bcrypt.compare(req.body.password, user.hashedPassword);

    if (!match) {
      res
        .status(401)
        .json({ statusSucc: false, message: 'Password does not match' });

      return;
    }

    //otherwise everything is fine

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: '14d',
    });

    res.status(200).json({
      statusSucc: true,
      message: 'Successfully logged in, token dispatched',
      token,
    });
  }),
];
