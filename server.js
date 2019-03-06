const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Mongoose middleware
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(process.env.MONGODB)
  .then(result => {
    let port = process.env.PORT || 1300;
    app.listen(port, (req, res) => {
      console.log(`Server started on port ${port} & MongoDB is connected`);
    });
  })
  .catch(err => console.log(err));

// Body Parser middleware
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// CORS
app.use(cors());

// Default route
app.get("/api/v1", (req, res) => {
  res.json("Pothole Go");
});

// Import routes
const potholeRoute = require("./routes/Potholes");
const loginRoute = require("./routes/Login");
app.use("/api/v1/", potholeRoute);
app.use("/api/v1/", loginRoute);
