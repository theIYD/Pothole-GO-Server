const mongoose = require('mongoose');
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
        },
        height: {
            type: Number
        },
        timestamp: {
            type: Date,
            required: true
        }
    }
});

module.exports = mongoose.model("pothole", pothole);
