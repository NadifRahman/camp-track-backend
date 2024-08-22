const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
- First name and last name are required and max length of 20
- Username has lax length of 15
- Hashed password has no limit but password to enter will be max 20 (will use other validation)
- Role has 50 characters maximum and is required
*/

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 20 },
  last_name: { type: String, required: true, maxLength: 20 },
  username: { type: String, required: true, maxLength: 15 },
  hashedPassword: {
    //max input before hashing is 20
    type: String,
    required: true,
  },
  role: { type: String, required: true, maxLength: 50 },
});

module.exports = mongoose.model('User', UserSchema);
