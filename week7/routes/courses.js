const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const handleErrorAsync = require("../utils/handleErrorAsync");
const coursesController = require("../controllers/courses");

router.get("/", handleErrorAsync(coursesController.getCourses));
router.post(
  "/:courseId",
  isAuth,
  handleErrorAsync(coursesController.postUserCourse)
);
router.delete(
  "/:courseId",
  isAuth,
  handleErrorAsync(coursesController.deleteUserCourse)
);

module.exports = router;
