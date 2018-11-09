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
        }
    },
    images: {
        original: {
            type: Buffer,
            required: true
        },
        processed: {
            type: Buffer,
            required: true
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

module.exports = mongoose.model("pothole", pothole);
