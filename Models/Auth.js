const moment = require('moment-timezone');
const mongoose = require('mongoose');

console.log('jer');
const AuthSchema = new mongoose.Schema(
  {
    username: {type: String, required: true, unique: true},
    password: {type: String},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    numberID: {type: String, required: true, unique: true},
    organization: {type: String, required: true},
    role: {type: String, required: true},
    mobile_number: {
      type: String,
      required: true,
    },
    birth_year: {type: Date},
  },
  {timestamps: true}
);

AuthSchema.pre('save', function (next) {
  const thaiTimeZone = 'Asia/Bangkok';
  if (this.birth_year) {
    this.birth_year = moment(this.birth_year).tz(thaiTimeZone).toDate();
  }

  next();
});
const Auth = mongoose.model('auth', AuthSchema);

module.exports = Auth;
