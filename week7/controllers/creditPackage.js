const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("CreditPackageController");
const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
} = require("../utils/validUtils");

const creditPackgeController = {
  async getCreditPackages(req, res, next) {
    const package = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"],
    });
    res.status(200).json({
      status: "success",
      data: package,
    });
  },
  async postCreditPackage(req, res, next) {
    const data = req.body;
    if (
      isUndefined(data.name) ||
      isNotValidString(data.name) ||
      isUndefined(data.credit_amount) ||
      isNotValidInteger(data.credit_amount) ||
      isUndefined(data.price) ||
      isNotValidInteger(data.price)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    const creditPackageRepo = await dataSource.getRepository("CreditPackage");
    const existPackage = await creditPackageRepo.find({
      where: {
        name: data.name,
      },
    });
    if (existPackage.length > 0) {
      return next(appError(409, "資料重複"));
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
  },
  async postUserPackage(req, res, next) {
    const { id } = req.user;
    const { creditPackageId } = req.params;
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId,
      },
    });
    if (!creditPackage) {
      return next(appError(400, "ID錯誤"));
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
  },
  async deleteCreditPackage(req, res, next) {
    const packageId = req.params.creditPackageId;
    if (isUndefined(packageId) || isNotValidString(packageId)) {
      return next(appError(400, "ID錯誤"));
    }
    const result = await dataSource
      .getRepository("CreditPackage")
      .delete(packageId);
    if (result.affected === 0) {
      return next(appError(400, "ID錯誤"));
    }
    res.status(200).json({
      status: "success",
    });
  },
};

module.exports = creditPackgeController;
