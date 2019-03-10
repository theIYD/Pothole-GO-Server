const express = require("express");
const methodOverride = require("method-override");
const potholeController = require("../controllers/pothole");
const multerFunctions = require("../helpers/multer");
const verifyToken = require("../helpers/verifyToken");
const api = express.Router();

// Middleware
api.use(methodOverride("_method"));

// Register a pothole
api.post(
  "/create",
  verifyToken,
  multerFunctions.upload.single("image"),
  potholeController.createAPothole
);

// Get all potholes
api.get("/potholes", verifyToken, potholeController.getAllPotholes);

// Verify a pothole
api.post(
  "/verify/:id",
  verifyToken,
  multerFunctions.upload.single("updatedimage"),
  potholeController.verifyPothole
);

// Create a ward
api.post("/createWard", multerFunctions.upload.none(), potholeController.createAWard)

// Find potholes according to the ward
api.get('/potholesByWard', potholeController.showPotholesByWards)

module.exports = api;
