const moment = require('moment-timezone');
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    bookingID: {
      type: String,
      required: true,
      unique: true,
    },
    is_locked: {type: Boolean},
    status: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
      default: 1,
    },
    vehicle: {type: String},
    vehicle_id: {type: String},
    userinfo: {type: String, required: true},
    user_id: {type: String, required: true},
    organization: {type: String, required: true},
    mobile_number: {type: String, required: true},
    title: {type: String, required: true},
    start: {type: Date, required: true},
    end: {type: Date, required: true},
    placestart: {type: String, required: true},
    placeend: {type: String, required: true},
    compensation_payment: {type: String, required: true},
    passengerCount: {type: Number, required: true},
    passengers: [{}],
    booking_Time: {type: Date},
    approverName: {type: String},
    cancelerName: {type: String},
    note: {type: String},
    approve_Time: {type: Date, require: true},
    adminApprove: {type: Boolean, default: null},
    adminApproveName: {type: String},
    adminApprove_Time: {type: Date},
    UnApprove_Time: {type: Date},
    adminName: {type: String},
    driver: {type: String},
    driver_id: {type: String},
    carArrange_Time: {type: Date},
    kilometer_start: {type: Number},
    kilometer_end: {type: Number},
    total_kilometer: {type: Number},
    completion_Time: {type: Date},
    allDay: {type: Boolean, default: false},
  },
  {
    timestamps: true,
  }
);

// Define a pre-save hook to convert start and end timestamps to Thai time zone
eventSchema.pre('save', function (next) {
  const thaiTimeZone = 'Asia/Bangkok';
  if (this.start) {
    this.start = moment(this.start).tz(thaiTimeZone).toDate();
  }
  if (this.end) {
    this.end = moment(this.end).tz(thaiTimeZone).toDate();
  }
  next();
});

const Booking = mongoose.model('book', eventSchema);

module.exports = Booking;
