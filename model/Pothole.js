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
  images: {
    original: {
      original_images: Array
    },
    processed: {
      processed_images: Array
    }
  },
  height: {
    type: Number
  },
  timestamp: {
    type: Date,
    required: true
  },
  length: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  }
});

pothole.index({
  location: '2dsphere'
})

module.exports = mongoose.model("pothole", pothole);
