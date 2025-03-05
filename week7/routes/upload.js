const express = require("express");
const uploadController = require("../controllers/upload");
const isAuth = require("../middlewares/isAuth");
const uploadImage = require("../middlewares/uploadImage");
const handleErrorAsync = require("../utils/handleErrorAsync");

const router = express.Router();

router.post(
  "/",
  isAuth,
  uploadImage,
  handleErrorAsync(uploadController.postUploadImage)
);

router.get("/", isAuth, handleErrorAsync(uploadController.getAllImages));

module.exports = router;
