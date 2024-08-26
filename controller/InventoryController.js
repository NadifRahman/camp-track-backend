const { body, validationResult } = require('express-validator');
const passport = require('passport');
const Inventory = require('../models/Inventory');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

/**
 * - request need title, category, storage_location, quantity and notes optionally (it ll be empty string)
 */
exports.inventory_post = [
  passport.authenticate('jwt', { session: false }), //PROTECTED ROUTE

  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a title')
    .isLength({ max: 50 })
    .withMessage('Title - Max character length is 50'),

  body('category')
    .trim()
    .isIn(['Apparel', 'Sport', 'Technology', 'Office', 'Consumable', 'Other'])
    .withMessage(
      'Category - must be one of Apparel, Sport, Technology, Office, Consumable, Other'
    ),

  body('storage_location')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Please enter a storage location')
    .isLength({ max: 50 })
    .withMessage('Storage Location - Max character length is 50'),

  body('quantity')
    .trim()
    .isInt({ min: 0 })
    .withMessage('Quantity - must be zero or a positive integer'),

  body('notes')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 300 })
    .withMessage('Notes - Max character length is 300'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.errors.map((error) => error.msg);
      res.status(422).json({
        statusSucc: false,
        message: 'there are errors',
        errors: errorMessages,
      });
      return;
    }
    //otherwise no errors
    const { title, category, storage_location, quantity, notes } = req.body;

    const newInventory = new Inventory({
      title,
      category,
      storage_location,
      quantity,
      notes,
    });

    await newInventory.save(); //save to database

    res
      .status(201)
      .json({ statusSucc: true, message: 'Inventory added successfully' });
  }),
];

//gets one particular item
//assumes URL has a param called postid
exports.inventory_get = [
  passport.authenticate('jwt', { session: false }),

  asyncHandler(async (req, res, next) => {
    const postId = req.params['postid']; //get from url param

    if (!mongoose.isValidObjectId(postId)) {
      res.status(404).json({
        statusSucc: false,
        message: 'Cannot find inventory listing',
      });
      return;
    }

    const foundInventory = await Inventory.findOne({ _id: postId });

    if (!foundInventory) {
      res.status(404).json({
        statusSucc: false,
        message: 'Cannot find inventory listing',
      });
    } else {
      res.status(200).json({
        statusSucc: true,
        message: 'Successfully fetched inventory listing',
        foundInventory,
      });
    }
  }),
];

//gets all the inventorys (title, category)
exports.inventories_get = [
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (req, res, next) => {
    const inventories = await Inventory.find({}, 'title category quantity');

    res.status(200).json({
      statusSucc: true,
      message: 'Successfully fetched inventory',
      inventories,
    });
  }),
];
