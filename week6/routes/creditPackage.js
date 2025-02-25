const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");
const isAuth = require("../middlewares/isAuth");

const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
} = require("../utils/validUtils");
const appError = require("../utils/appError");

router.get("/", async (req, res, next) => {
  try {
    const package = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"],
    });
    res.status(200).json({
      status: "success",
      data: package,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    if (
      isUndefined(data.name) ||
      isNotValidString(data.name) ||
      isUndefined(data.credit_amount) ||
      isNotValidInteger(data.credit_amount) ||
      isUndefined(data.price) ||
      isNotValidInteger(data.price)
    ) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
      next(appError(400, "欄位未填寫正確"));

      return;
    }
    const creditPackageRepo = await dataSource.getRepository("CreditPackage");
    const existPackage = await creditPackageRepo.find({
      where: {
        name: data.name,
      },
    });
    if (existPackage.length > 0) {
      // res.status(409).json({
      //   status: "failed",
      //   message: "資料重複",
      // });
      next(appError(409, "資料重複"));
      return;
    }
    const newPackage = await creditPackageRepo.create({
      name: data.name,
      credit_amount: data.credit_amount,
      price: data.price,
    });
    const result = await creditPackageRepo.save(newPackage);
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:creditPackageId", isAuth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const { creditPackageId } = req.params;
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId,
      },
    });
    if (!creditPackage) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "ID錯誤",
      // });
      next(appError(400, "ID錯誤"));
      return;
    }
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
    const newPurchase = await creditPurchaseRepo.create({
      user_id: id,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString(),
    });
    await creditPurchaseRepo.save(newPurchase);
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.delete("/:creditPackageId", async (req, res, next) => {
  try {
    const packageId = req.params.creditPackageId;
    if (isUndefined(packageId) || isNotValidString(packageId)) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "ID錯誤",
      // });
      next(appError(400, "ID錯誤"));
      return;
    }
    const result = await dataSource
      .getRepository("CreditPackage")
      .delete(packageId);
    if (result.affected === 0) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "ID錯誤",
      // });
      next(appError(400, "ID錯誤"));
      return;
    }
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
