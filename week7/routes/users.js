const express = require("express");
const router = express.Router();

const logger = require("../utils/logger")("Users");
const handleErrorAsync = require("../utils/handleErrorAsync");
const isAuth = require("../middlewares/isAuth");

const usersController = require("../controllers/users");

router.get(
  "/credit-package",
  isAuth,
  handleErrorAsync(usersController.getPurchasePackage)
);
router.get(
  "/courses",
  isAuth,
  handleErrorAsync(usersController.getCourseBooking)
);
router.post("/signup", handleErrorAsync(usersController.postSignup));
router.post("/login", handleErrorAsync(usersController.postLogin));
router.get("/profile", isAuth, handleErrorAsync(usersController.getProfile));
router.put("/profile", isAuth, handleErrorAsync(usersController.putProfile));
router.put("/password", isAuth, handleErrorAsync(usersController.putPassword));

module.exports = router;
