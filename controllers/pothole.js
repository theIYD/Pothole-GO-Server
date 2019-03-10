const jwt = require("jsonwebtoken");
const talk = require("../helpers/interact");
const multerFunctions = require("../helpers/multer");
const mongoose = require("mongoose");
const POTHOLE_MODEL = require("../model/Pothole");
const WARD_MODEL = require("../model/Ward");

exports.createAPothole = async (req, res, next) => {
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) console.log(err);
    else {
      let obj;
      obj = {
        location: {
          lat: req.body.lat,
          lng: req.body.lng
        },
        images: [],
        potholes: [],
        pitch: req.body.pitch,
        height: req.body.height
      };

      let url = "",
        t,
        newPothole;
      if (req.file) {
        url = await multerFunctions.uploadImageToStorage(req.file);
        if (url) {
          obj.images.push(url);
        }

        try {
          t = await talk({
            url: url,
            pitch: req.body.pitch
          });
          if (t.count > 0) {
            obj.count = t.count;
            for (let i = 0; i < t.width.length; i++) {
              obj.potholes[i] = {
                length: t.length[i],
                width: t.width[i]
              };
            }
          } else {
            obj.height = 0;
            obj.isVerified = true;
          }
          newPothole = new POTHOLE_MODEL(obj);
        } catch (err) {
          console.log(err);
        }

        /* Wait for the urls to be generated by the uploadImageToStorage */
        let wait = setInterval(async () => {
          if (obj.images.length !== 0) {
            if (t) {
              const savedPothole = await newPothole.save();
              if (savedPothole) {
                console.log("Successfully saved to database");
                console.log("\nCount: " + savedPothole.count);
                console.log("Potholes parameters: ");
                savedPothole.potholes.forEach(each => console.log(each));
                console.log("Pixels per cm: " + savedPothole.pitch);
                console.log("isVerified: " + savedPothole.isVerified);
                console.log("Location: " + savedPothole.location);
                console.log("Depth: " + savedPothole.height);
                console.log("Timestamp: " + savedPothole.timestamp);
                res.status(201).json({
                  newPothole: savedPothole
                });
              }
            }
            clearInterval(wait);
          }
        }, 1000);
      } else {
        res.status(400).json({
          message: "Images not provided"
        });
      }
    }
  });
};

exports.getAllPotholes = (req, res, next) => {
  // If the url contains lat and lng in the query object, show nearby potholes
  jwt.verify(req.token, "secretkey", async (err, data) => {
    let queryPothole = {};
    if (err) console.log(err);
    else {
      if (req.query.lat && req.query.lng) {
        queryPothole = {
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
      } else {
        queryPothole = {};
      }
      const potholesSearched = await POTHOLE_MODEL.find(queryPothole);
      if (potholesSearched) {
        res.status(200).json(potholesSearched);
      }
    }
  });
};

// Verify the pothole if it is fixed or not.
exports.verifyPothole = (req, res, next) => {
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      console.log(err);
      return;
    }

    const imageFile = req.file;
    const id = req.params.id;
    const pitch = req.body.pitch;

    const pothole = await POTHOLE_MODEL.findById(id);
    if (imageFile && id && pitch) {
      const url = await multerFunctions.uploadImageToStorage(imageFile);
      if (url) {
        try {
          t = await talk({
            url: url,
            pitch: req.body.pitch
          });
        } catch (err) {
          console.log(err);
        }

        const temp = await POTHOLE_MODEL.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(id)
          },
          {
            $push: {
              images: url
            },
            pitch: req.body.pitch,
            isVerified: !t.isPothole
          },
          {
            new: true
          }
        );
        console.log("\n\nPothole Updated\n\n");
        res.status(200).json({
          message: "URL generated. URL should go to the model",
          updated: temp
        });
      }
    }
  });
};

exports.createAWard = async (req, res, next) => {
  let pointsObject = req.body.points;
  let wardType = req.body.ward;

  let wardBounds = [];
  for (let point in pointsObject) {
    if (pointsObject.hasOwnProperty(point)) {
      wardBounds.push({
        lat: pointsObject[point][0],
        lng: pointsObject[point][1]
      });
    }
  }
  console.log(wardBounds);
  if (wardBounds.length > 0) {
    const ward = new WARD_MODEL({
      boundaries: wardBounds,
      ward: wardType
    });

    try {
      const savedWard = await ward.save();
      if (savedWard) {
        res.status(200).json({ message: "Ward created" });
      }
    } catch (err) {
      res.status(500).json({ data: err });
    }
  }
};

exports.showPotholesByWards = async (req, res, next) => {
  let ward = req.query.ward;
  try {
    const getWard = await WARD_MODEL.findOne({ ward: ward });
    console.log(getWard);

    let coordinates = getWard.boundaries.map(point => [point.lat, point.lng])
    coordinates.push(coordinates[0])
    const temp = await POTHOLE_MODEL.find({
      location: {
        $geoWithin: {
          $geometry: {
            type: "Polygon",
            coordinates: [coordinates]
          }
        }
      }
    });

    res.status(200).json(temp)
  } catch (err) {
    res.status(500).json({ data: err });
  }
};
