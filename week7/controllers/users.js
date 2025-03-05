const { dataSource } = require("../db/data-source");
const { password } = require("../config/db");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("UsersController");
const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
  isValidPassword,
} = require("../utils/validUtils");
const { generateJWT, verifyJWT } = require("../utils/jwtUtils");
const bcrypt = require("bcrypt");
const CreditPackages = require("../entities/CreditPackages");
const saltRounds = 10;

const usersController = {
  async getPurchasePackage(req, res, next) {
    const { id } = req.user;
    if (isUndefined(id) || isNotValidString(id)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    const purchases = await dataSource.getRepository("CreditPurchase").find({
      where: { user_id: id },
      relations: {
        CreditPackage: true,
      },
    });
    if (purchases.length == 0) {
      return next(appError(404, "找不到購買紀錄"));
    }
    purchaseList = purchases.map((purchase) => ({
      purchased_credit: purchase.purchased_credits,
      price_paid: purchase.price_paid,
      name: purchase.CreditPackage?.name,
      purchase_at: purchase.purchaseAt,
    }));

    res.status(200).json({
      status: "success",
      data: purchaseList,
    });
  },
  async getCourseBooking(req, res, next) {
    const { id } = req.user;
    if (isUndefined(id) || isNotValidString(id)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    const courses = await dataSource.getRepository("CourseBooking").find({
      where: { user_id: id },
      relations: {
        Course: { User: true },
        User: true,
      },
    });
    if (courses.length == 0) {
      return next(appError(404, "找不到購買紀錄"));
    }
    courseList = courses.map((course) => ({
      name: course.Course?.name,
      course_id: course.course_id,
      coach_name: course.Course?.User?.name,
      start_at: course.Course?.start_at,
      end_at: course.Course?.end_at,
      meeting_url: course.Course?.meeting_url,
    }));

    res.status(200).json({
      status: "success",
      data: courseList,
    });
  },
  async postSignup(req, res, next) {
    const data = req.body;
    if (
      isUndefined(data.name) ||
      isNotValidString(data.name) ||
      isUndefined(data.email) ||
      isNotValidString(data.email) ||
      isUndefined(data.password) ||
      isNotValidString(data.password)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (!isValidPassword(data.password)) {
      return next(
        appError(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        )
      );
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      where: {
        email: data.email,
      },
    });
    if (findUser) {
      return next(appError(409, "Email已被使用"));
    }
    const hashPassword = await bcrypt.hash(data.password, saltRounds);
    const newUser = userRepo.create({
      name: data.name,
      email: data.email,
      password: hashPassword,
      role: "USER",
    });
    const result = await userRepo.save(newUser);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: result.id,
          name: result.name,
        },
      },
    });
  },
  async postLogin(req, res, next) {
    const { email, password } = req.body;
    if (
      isUndefined(email) ||
      isNotValidString(email) ||
      isUndefined(password) ||
      isNotValidString(password)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (!isValidPassword(password)) {
      return next(
        appError(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        )
      );
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      select: ["id", "name", "password"],
      where: { email },
    });
    if (!findUser) {
      return next(appError(400, "使用者不存在或密碼輸入錯誤"));
    }

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      return next(appError(400, "使用者不存在或密碼輸入錯誤"));
    }
    // JWT
    const token = generateJWT({
      id: findUser.id,
      role: findUser.role,
    });

    res.status(201).json({
      status: "success",
      data: {
        token,
        user: {
          name: findUser.name,
        },
      },
    });
  },
  async getProfile(req, res, next) {
    const { id } = req.user;
    if (isUndefined(id) || isNotValidString(id)) {
      return next(appError(400, "欄位未填寫正確"));
    }

    const findUser = await dataSource.getRepository("User").findOne({
      where: {
        id,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        email: findUser.email,
        name: findUser.name,
      },
    });
  },
  async putProfile(req, res, next) {
    const { id } = req.user;
    const { name } = req.body;
    if (isUndefined(name) || isNotValidString(name)) {
      return next(appError("400", "欄位未填寫正確"));
    }
    const userRepo = dataSource.getRepository("User");

    //檢查使用者名稱
    const findUser = await userRepo.findOne({
      where: {
        id,
      },
    });
    if (findUser.name === name) {
      return next(appError(400, "使用者名稱未變更"));
    }
    //更新使用者名稱
    const updateUser = await userRepo.update(
      {
        id,
      },
      {
        name,
      }
    );
    if (updateUser.affected === 0) {
      return next(appError(400, "更新使用者失敗"));
    }

    res.status(200).json({
      status: "success",
    });
  },
  async putPassword(req, res, next) {
    const { id } = req.user;
    const { password, new_password, confirm_new_password } = req.body;
    if (
      isUndefined(password) ||
      isNotValidString(password) ||
      isUndefined(new_password) ||
      isNotValidString(new_password) ||
      isUndefined(confirm_new_password) ||
      isNotValidString(confirm_new_password)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (
      !isValidPassword(password) ||
      !isValidPassword(new_password) ||
      !isValidPassword(confirm_new_password)
    ) {
      return next(
        appError(
          400,
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        )
      );
    }
    if (new_password === password) {
      return next(appError(400, "新密碼不能與舊密碼相同"));
    }
    if (new_password !== confirm_new_password) {
      return next(appError(400, "新密碼與驗證新密碼不一致"));
    }
    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      select: ["password"],
      where: { id },
    });

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      return next(appError(400, "密碼輸入錯誤"));
    }

    // 密碼加密並更新資料
    const hashPassword = await bcrypt.hash(new_password, saltRounds);
    const updateUser = await userRepo.update(
      { id },
      { password: hashPassword }
    );
    if (updateUser.affected === 0) {
      return next(appError(400, "更新密碼失敗"));
    }
    res.status(200).json({
      status: "success",
      data: null,
    });
  },
};

module.exports = usersController;
