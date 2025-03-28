const express = require("express");
const router = express.Router();

const coachesController = require("../controllers/coaches");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", handleErrorAsync(coachesController.getCoaches));
router.get("/:coachId", handleErrorAsync(coachesController.getCoachDetail));
router.get(
  "/:coachId/courses",
  handleErrorAsync(coachesController.getCoachCourses)
);

module.exports = router;
