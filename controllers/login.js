const jwt = require("jsonwebtoken");
const User = require("../model/User");

// Check if the user already exists in the database. If not, create a document and release a new token. Else, just release a new token
exports.loginUser = (req, res, next) => {
  let user = {
    username: req.query.username,
    email: req.query.email
  };

  User.findOne({
    username: user.username,
    email: user.email
  })
    .then(user => {
      if (user) {
        jwt.sign({ user }, "secretkey", { expiresIn: "365d" }, (err, token) => {
          console.log("Logged in to the application...")
          res.status(200).json({
            success: 2,
            token: token
          });
        });
      } else {
        const newUser = new User({
          username: req.query.username,
          email: req.query.email
        });

        newUser
          .save()
          .then(success => {
            jwt.sign(
              { user },
              "secretkey",
              { expiresIn: "365d" },
              (err, token) => {
                console.log("Logged in to the application...")
                res.status(200).json({
                  success: 1,
                  token: token
                });
              }
            );
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => {
      console.log(err);
    });
};
