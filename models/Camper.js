const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
- first_name is required, max length of 20
- last_name is required, max length of 20
- age is required, must be an integer, must be between 1 and 17 inclusive
- guardian_full_name is required, max length 50
- guardian_phone is required, CUSTOM VALIDATOR MAKES SURE ONLY NUMBERS, 
  NEED TO MAKE SURE ON CUSTOM VALIDATOR ON ALL INPUITS, must have 10 digits
- home_address is a string, required, maxLength is 200 chars
- dietary_restrctions is a string, required (could be empty), maxLength is 200 chars
- medical_conditions is a string, required (could be empty), maxLength is 200 chars
*/

const CamperSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 20 },
  last_name: { type: String, required: true, maxLength: 20 },
  age: {
    //age must be between 1 and 17 (no adults)
    type: Number,
    min: 1,
    max: 17,
    required: true,
    validate: {
      validator: Number.isInteger, //function that returns true if ok, false is not, could be an array
      message: 'VALUE IS NOT AN INTEGER VALUE',
    },
  },
  guardian_full_name: { type: String, required: true, maxLength: 50 },
  guardian_phone: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 10,
    validate: {
      validator: function isNumeric(str) {
        // Check if the string is not empty and contains only digits
        return /^\d+$/.test(str);
      },
      message: 'Guardian phone number should only have numbers in the string',
    },
  },
  home_address: { type: String, required: true, maxLength: 200 },
  dietary_restrctions: {
    type: String,
    maxLength: 200,
    required: true,
    default: '',
  },
  medical_conditions: {
    type: String,
    maxLength: 200,
    required: tru,
    default: '',
  },
});

module.exports = mongoose.model('Camper', CamperSchema);
