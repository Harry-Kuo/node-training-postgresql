const express = require("express");
const router = express.Router();

const skillController = require("../controllers/skill");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", handleErrorAsync(skillController.getSkills));
router.post("/", handleErrorAsync(skillController.postSkill));
router.delete("/:skill", handleErrorAsync(skillController.deleteSkill));

module.exports = router;
