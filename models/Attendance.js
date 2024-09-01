const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CamperAttendanceSchema = new Schema({
  //sub-schema
  camper_id: {
    type: Schema.Types.ObjectId,
    ref: 'Camper', //references the camper model
    required: true,
  },
  signin: {
    type: String,

    validate: {
      validator: function (time) {
        return time === '' || /^[0-9]{3}$/.test(time); //empty string or 3 char string in format ___ (like 920)
      },
      message: (props) =>
        `${props.value} is not a valid signin time! It should be a 3-digit string or an empty string.`,
    },
    default: '', //default is empty string
  },
  signout: {
    type: String,

    validate: {
      validator: function (time) {
        return time === '' || /^[0-9]{3}$/.test(time); //empty string or 3 char string in format ___ (like 920)
      },
      message: (props) =>
        `${props.value} is not a valid signout time! It should be a 3-digit string or an empty string.`,
    },
    default: '', //default is empty string
  },
});

const AttendanceSchema = new Schema({
  date: {
    type: Date,
    required: true,
    unique: true, //each date can only have 1 attendance entry
  },
  attendance: {
    type: [CamperAttendanceSchema],
    required: true,
    default: [], //by default, its an empty array if its not provided
  },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
