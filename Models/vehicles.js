const mongoose = require('mongoose');

console.log('here')
const CarSchema = new mongoose.Schema(
  {
    register: {type: String, required: true, unique: true},
    type: {type: String, required: true},
    seat: {type: Number, require: true},
    available: {type: String, default: 'available'},
    start_time: {type: Date},
    end_time: {type: Date},
    last_distance: {type: Number, default: 0},
  },
  {timestamps: true}
);

const vehicles = mongoose.model('vehicles', CarSchema);

module.exports = vehicles;
