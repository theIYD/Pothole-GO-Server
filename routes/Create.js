const mongoose = require("mongoose");
const express = require("express");
const multerFunctions = require("../helpers/multer");
const methodOverride = require("method-override");
const jwt = require("jsonwebtoken");
const api = express.Router();

// Verify Token Middleware
const verifyToken = require("../helpers/verifyToken");

// Middleware
api.use(methodOverride("_method"));

// import model
require("../model/Pothole");
const POTHOLE_MODEL = mongoose.model("pothole");

// Register a pothole
api.post(
  "/create",
  verifyToken,
  multerFunctions.upload.array("images", 4),
  (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) console.log(err);
      else {
        console.log(authData);
        // console.log(req);

        let obj;

        obj = {
          location: {
            lat: req.body.lat,
            lng: req.body.lng
          },
          images: {
            original: []
          },
          height: 0,
          timestamp: new Date().toISOString(),
          length: 0,
          width: 0
        };

        if (req.files.length !== 0) {
          // Iterate over each file uploaded by the body
          req.files.forEach((file, index) => {
            multerFunctions
              .uploadImageToStorage(file)
              .then(url => {
                obj.images.original.push(url);
              })
              .catch(err => console.log(err));
          });

          /* Wait for the urls to be generated by the uploadImageToStorage */
          let wait = setInterval(() => {
            if (obj.images.original.length == 2) {
              console.log(obj.images.original[0]);
              console.log(obj.images.original[1]);

              const newPothole = new POTHOLE_MODEL(obj);
              newPothole
                .save()
                .then(success => {
                  console.log("Successfully saved");
                  res.json({ success: "Saved" });
                })
                .catch(err => res.json(err));
              clearInterval(wait);
            }
          }, 1000);
        }
      }
    });
  }
);

// Get all potholes
api.get("/potholes", verifyToken, (req, res) => {
  // If the url contains lat and lng in the query object, show nearby potholes
  jwt.verify(req.token, "secretkey", (err, data) => {
    if (err) console.log(err);
    else {
      if (req.query.lat && req.query.lng) {
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
        POTHOLE_MODEL.find({})
          .then(potholes => {
            if (potholes) {
              res.json(potholes);
            }
          })
          .catch(err => res.json(err));
      }
    }
  });
});

// Upload processed images and potholes parameters
api.post(
  "/update/:id",
  verifyToken,
  multerFunctions.upload.array("images", 4),
  (req, res) => {
    jwt.verify(req.token, "secretkey", (err, data) => {
      if (err) console.log(err);
      else {
        let _id = req.params.id;
        let obj;

        POTHOLE_MODEL.findById(_id)
          .then(pothole => {
            if (pothole) {
              console.log(pothole);
              obj = {
                images: {
                  original: [
                    pothole.images.original[0],
                    pothole.images.original[1]
                  ],
                  processed: []
                },
                height: req.body.height,
                length: req.body.length,
                width: req.body.width
              };

              if (req.files.length !== 0) {
                req.files.forEach((file, index) => {
                  multerFunctions
                    .uploadImageToStorage(file)
                    .then(url => {
                      obj.images.processed.push(url);
                    })
                    .catch(err => res.json(err));
                });
              }

              let wait = setInterval(() => {
                if (obj.images.processed.length == 2) {
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
                    })
                    .catch(err => res.json(err));
                  clearInterval(wait);
                }
              }, 1000);
            }
          })
          .catch(err => res.json(err));
      }
    });
  }
);

module.exports = api;
