const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("User");

const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
  isValidPassword,
} = require("../utils/validUtils");
const { password } = require("../config/db");

const saltRounds = 10;

router.post("/signup", async (req, res, next) => {
  try {
    const data = req.body;
    if (
      isUndefined(data.name) ||
      isNotValidString(data.name) ||
      isUndefined(data.email) ||
      isNotValidString(data.email) ||
      isUndefined(data.password) ||
      isNotValidString(data.password)
    ) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }
    if (!isValidPassword(data.password)) {
      res.status(400).json({
        status: "failed",
        message:
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      });
      return;
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      where: {
        email: data.email,
      },
    });
    if (findUser) {
      res.status(409).json({
        status: "failed",
        message: "Email已被使用",
      });
      return;
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
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
