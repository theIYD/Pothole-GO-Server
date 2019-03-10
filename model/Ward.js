const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wardSchema = new Schema({
  boundaries: {
    type: Array,
    required: true
  },
  ward: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Ward", wardSchema);
