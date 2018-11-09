const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// Mongoose middleware
mongoose.connect("mongodb://localhost/potholego");
let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("MongoDB is connected to the server....");
});

// Body Parser middleware
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

// Default route
app.get("/api/v1", (req, res) => {
    res.json("Pothole Go");
})

let port = process.env.PORT || 7000;
app.listen(port, (req, res) => {
    console.log(`Server started on port ${port}`);
});

// Import routes
const potholeRoute = require('./routes/Create');
app.use("/api/v1/", potholeRoute);