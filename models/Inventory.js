const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * - title is a string, required, max length 50
 * - category is a string, required, and must be one of strings in the enum array
 * - storage_location is a string, required, max length 50
 * - quantity is a positive integer and is required
 * - notes, by default is an empty string and can max be 300
 *
 * quantity
 */

const InventorySchema = new Schema({
  title: { type: String, required: true, maxLength: 50 },
  category: {
    type: String,
    enum: ['Apparel', 'Sport', 'Technology', 'Office', 'Consumable', 'Other'],
    required: true,
  },
  storage_location: { type: String, required: true, maxLength: 50 },
  quantity: {
    //quantity can be at least 0
    type: Number,
    min: 0,
    required: true,
    validate: {
      validator: Number.isInteger, //function that returns true if ok, false is not, could be an array
      message: 'VALUE IS NOT AN INTEGER VALUE',
    },
  },
  notes: { type: String, default: '', maxLength: 300 },
});

module.exports = mongoose.model('Inventory', InventorySchema);
