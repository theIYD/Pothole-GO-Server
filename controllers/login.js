const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const Admin = require("../model/Admin");

// Check if the user already exists in the database. If not, create a document and release a new token. Else, just release a new token
exports.loginUser = async (req, res, next) => {
  let user = {
    username: req.query.username,
    email: req.query.email
  };
  try {
    const userFound = await User.findOne({
      username: user.username,
      email: user.email
    });
    if (userFound) {
      jwt.sign({ user }, "secretkey", { expiresIn: "365d" }, (err, token) => {
        console.log("Logged in to the application...");
        res.status(200).json({
          success: 2,
          token: token
        });
      });
    } else {
      const newUser = new User({ username: user.username, email: user.email });
      const savedUser = newUser.save();

      if (savedUser) {
        jwt.sign({ user }, "secretkey", { expiresIn: "365d" }, (err, token) => {
          console.log("Logged in to the application...");
          res.status(200).json({
            success: 1,
            token: token
          });
        });
      }
    }
  } catch (err) {
    res.status(500).json({ data: err });
  }
};

exports.adminLogin = async (req, res, next) => {
  const admin = {
    username: req.query.username,
    password: req.query.password
  };

  try {
    const hashedPassword = await bcrypt.hash(admin.password, 12);
    if (hashedPassword) {
      const admin = await Admin.findOne({
        username: admin.username,
        password: hashedPassword
      });

      if (admin) {
        jwt.sign({ admin }, "secretkey", { expiresIn: "7d" }, (err, token) => {
          console.log("Admin Logged in");
          res.status(200).json({
            token: token
          });
        });
      }
    }
  } catch (err) {
    res.status(500).json({ data: err });
  }
};

exports.registerAdmin = async (req, res, next) => {
  const admin = {
    username: req.query.username,
    password: req.query.password
  };

  try {
    if (admin) {
      const hashedPassword = await bcrypt.hash(admin.password, 12);
      const createAdmin = new Admin({
        username: admin.username,
        password: hashedPassword
      });
      const isAdminRegistered = await Admin.find(createAdmin);
      if (!isAdminRegistered) {
        const savedAdmin = await createAdmin.save();

        if (savedAdmin) {
          res.status(201).json({ message: "Admin registered" });
        }
      } else {
        res.status(200).json({ message: "Admin already registered" });
      }
    }
  } catch (err) {
    res.status(500).json({ data: err });
  }
};
