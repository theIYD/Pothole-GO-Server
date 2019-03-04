const router = require("express").Router();
const loginController = require("../controllers/login");

// User login
router.post("/login", loginController.loginUser);

// Admin login
router.post("/admin/register", loginController.registerAdmin);
router.post("/admin", loginController.adminLogin);

module.exports = router;
