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
            image1: {
                type: String
            },
            image2: {
                type: String
            }
        },
        processed: {
            image1: {
                type: String
            },
            image2: {
                type: String
            }
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
