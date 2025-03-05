const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const creditPackageController = require("../controllers/creditPackage");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", handleErrorAsync(creditPackageController.getCreditPackages));
router.post("/", handleErrorAsync(creditPackageController.postCreditPackage));
router.post(
  "/:creditPackageId",
  isAuth,
  handleErrorAsync(creditPackageController.postUserPackage)
);
router.delete(
  "/:creditPackageId",
  handleErrorAsync(creditPackageController.deleteCreditPackage)
);

module.exports = router;
