const mongoose = require("mongoose");
const express = require("express");
const multerFunctions = require("../helpers/multer");
const methodOverride = require("method-override");
const api = express.Router();

// Middleware
api.use(methodOverride("_method"));

// import model
require("../model/Pothole");
const POTHOLE_MODEL = mongoose.model("pothole");

// Register a pothole
api.post("/create", multerFunctions.upload.array("images", 4), (req, res) => {
  //   console.log(req.files);
  let obj = {
    location: {
      lat: req.body.lat,
      lng: req.body.lng
    },
    images: {
      original: {
        image1: req.files[0].path,
        image2: req.files[1].path
      }
    },
    height: 0,
    timestamp: new Date().toISOString(),
    length: 0,
    width: 0
  };

  const newPothole = new POTHOLE_MODEL(obj);
  newPothole.save().then(success => {
    console.log("Successfully saved");
    res.json({ success: "Saved" });
  });
});

// Get all potholes
api.get("/potholes", (req, res) => {
  POTHOLE_MODEL.find({}).then(potholes => {
    if (potholes) {
      res.json(potholes);
    }
  });
});

// Upload processed images and potholes parameters
api.post("/update/:id", multerFunctions.upload.array("images", 4), (req, res) => {
  let _id = req.params.id;

  POTHOLE_MODEL.findById(_id).then(pothole => {
    if (pothole) {
      pothole
        .update({
          $set: {
            images: {
              original: {
                image1: pothole.images.original.image1,
                image2: pothole.images.original.image2
              },
              processed: {
                image1: req.files[0].path,
                image2: req.files[1].path
              }
            },
            height: req.body.height,
            length: req.body.length,
            width: req.body.width
          }
        })
        .then(updated => {
          res.json({
              success: true,
              message: "Parameters and processed images updated successfully"
          })
        });
    }
  });
});

module.exports = api;
