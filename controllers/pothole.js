const jwt = require("jsonwebtoken");
// const talk = require("../helpers/interact");
const multerFunctions = require("../helpers/multer");
const mongoose = require("mongoose");
const POTHOLE_MODEL = require("../model/Pothole");

exports.createAPothole = (req, res, next) => {
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
        pitch: req.body.pitch
      };

      console.log(req.body);
      console.log(req.file);

      if (req.file) {
        const url = await multerFunctions.uploadImageToStorage(req.file);
        if (url) {
          console.log(url);
          obj.images.push(url);
        }

        /* Wait for the urls to be generated by the uploadImageToStorage */
        let wait = setInterval(async () => {
          if (obj.images.length !== 0) {
            console.log("I am here");
            console.log(obj);
            const newPothole = new POTHOLE_MODEL(obj);
            const savedPothole = await newPothole.save();
            if (savedPothole) {
              console.log("Successfully saved");
              res.status(201).json({ success: "Pothole created successfully" });
            }
            clearInterval(wait);
          }
        }, 1000);

        //Send data to python backend
        // talk()
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

exports.updatePothole = (req, res, next) => {
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
};

exports.verifyPothole = (req, res, next) => {
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(req.body);
    const imageFile = req.file;
    const id = req.params.id;
    const pitch = req.body.pitch;

    const pothole = await POTHOLE_MODEL.findById(id);
    console.log(pothole);
    if (imageFile && id && pitch) {
      const url = await multerFunctions.uploadImageToStorage(imageFile);
      if (url) {
        console.log(url);

        // let isPothole = await talk(url)
        // if(!isPothole) {

        // }
        const temp = await POTHOLE_MODEL.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(id) },
          {
            $push: { images: url },
            pitch: req.body.pitch,
            isVerified: true
          },
          { new: true }
        );
        console.log(temp);
        res.status(200).json({
          message: "URL generated. URL should go to the model",
          updated: temp
        });
      }
    }
  });
};
