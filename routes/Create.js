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
  let obj;

  obj = {
    location: {
      lat: req.body.lat,
      lng: req.body.lng
    },
    images: {
      original: {
        original_images: []
      }
    },
    height: 0,
    timestamp: new Date().toISOString(),
    length: 0,
    width: 0
  };

  if (req.files.length !== 0) {
    req.files.forEach((file, index) => {
      multerFunctions
        .uploadImageToStorage(file)
        .then(url => {
          obj.images.original.original_images.push(url);
        })
        .catch(err => console.log(err));
    });

    let wait = setInterval(() => {
      if (obj.images.original.original_images.length == 2) {
        console.log(obj.images.original.original_images[0]);
        console.log(obj.images.original.original_images[1]);

        const newPothole = new POTHOLE_MODEL(obj);
        newPothole.save().then(success => {
          console.log("Successfully saved");
          res.json({ success: "Saved" });
        });
        clearInterval(wait);
      }
    }, 1000);
  }
});

// Get all potholes
api.get("/potholes", (req, res) => {
  // If the body contains lat and lng, show nearby potholes
  console.log(req.query);
  if (req.query.lat && req.query.lng) {
    console.log("inside if");
    const q = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [req.query.lat, req.query.lng].map(parseFloat)
          },
          $minDistance: 0,
          $maxDistance: 1000
        }
      }
    };

    POTHOLE_MODEL.find(q)
      .then(potholes => res.json(potholes))
      .catch(err => res.json(err));
  } else {
    console.log("inside else");
    POTHOLE_MODEL.find({}).then(potholes => {
      if (potholes) {
        res.json(potholes);
      }
    });
  }
});

// Upload processed images and potholes parameters
api.post(
  "/update/:id",
  multerFunctions.upload.array("images", 4),
  (req, res) => {
    let _id = req.params.id;
    let obj;

    POTHOLE_MODEL.findById(_id).then(pothole => {
      if (pothole) {
        console.log(pothole);
        obj = {
          images: {
            original: {
              original_images: [
                pothole.images.original.original_images[0],
                pothole.images.original.original_images[1]
              ]
            },
            processed: {
              processed_images: []
            }
          },
          height: req.body.height,
          length: req.body.length,
          width: req.body.width
        };
        console.log("before promise");
        if (req.files.length !== 0) {
          console.log("inside if before promise");
          req.files.forEach((file, index) => {
            multerFunctions
              .uploadImageToStorage(file)
              .then(url => {
                obj.images.processed.processed_images.push(url);
              })
              .catch(err => console.log(err));
          });
        }

        let wait = setInterval(() => {
          if (obj.images.processed.processed_images.length == 2) {
            pothole
              .update({
                $set: obj
              })
              .then(updated => {
                console.log(updated);
                res.json({
                  success: true,
                  message:
                    "Parameters and processed images updated successfully"
                });
              });
            clearInterval(wait);
          }
        }, 1000);
      }
    });
  }
);

module.exports = api;
