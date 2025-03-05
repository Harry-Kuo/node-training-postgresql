const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");

const adminController = require("../controllers/admin");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.post(
  "/coaches/courses",
  isAuth,
  isCoach,
  handleErrorAsync(adminController.postCoachCourse)
);
router.put(
  "/coaches/courses/:courseId",
  isAuth,
  isCoach,
  handleErrorAsync(adminController.putCoachCourse)
);

router.post(
  "/coaches/:userId",
  isAuth,
  handleErrorAsync(adminController.postCoach)
);
router.put(
  "/coaches/",
  isAuth,
  isCoach,
  handleErrorAsync(adminController.putCoach)
);
router.get(
  "/coaches",
  isAuth,
  isCoach,
  handleErrorAsync(adminController.getCoach)
);
router.get(
  "/coaches/courses",
  isAuth,
  isCoach,
  handleErrorAsync(adminController.getCoachCourses)
);
router.get(
  "/coaches/courses/:courseId",
  isAuth,
  isCoach,
  handleErrorAsync(adminController.getCoachCourseDetail)
);

module.exports = router;
