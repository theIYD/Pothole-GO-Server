const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pothole = new Schema({
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  count: {
    type: Number,
    default: 0
  },
  images: {
    type: String,
    required: true
  },
  potholes: {
    type: Array,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  pitch: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

pothole.index({
  location: "2dsphere"
});

module.exports = mongoose.model("Pothole", pothole);
