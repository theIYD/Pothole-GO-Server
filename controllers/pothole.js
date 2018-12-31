const jwt = require("jsonwebtoken");
const talk = require("../helpers/interact");
const multerFunctions = require("../helpers/multer");
const POTHOLE_MODEL = require("../model/Pothole");

exports.createAPothole = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) console.log(err);
    else {
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
                // console.log(success);
                // talk(obj.images.original[0]);
                console.log("Successfully saved");
                res.status(201).json({ success: "Saved" });
              })
              .catch(err => res.json(err));
            clearInterval(wait);
          }
        }, 1000);
      }
    }
  });
};

exports.getAllPotholes = (req, res, next) => {
  // If the url contains lat and lng in the query object, show nearby potholes
  jwt.verify(req.token, "secretkey", (err, data) => {
    const queryPothole = {};
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
      POTHOLE_MODEL.find(queryPothole)
        .then(potholes => res.status(200).json(potholes))
        .catch(err => res.json(err));
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
