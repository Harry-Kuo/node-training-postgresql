const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Coach");

const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
  isValidPassword,
} = require("../utils/validUtils");
const appError = require("../utils/appError");

router.get("/", async (req, res, next) => {
  try {
    const { per, page } = req.query;
    if (
      isUndefined(per) ||
      isNotValidString(per) ||
      isUndefined(page) ||
      isNotValidString(page)
    ) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
      next(appError(400, "欄位未填寫正確"));
      return;
    }
    // per & page 轉成數字
    const perNum = parseInt(req.query.per || 10); // 預設每頁 10 個
    const pageNum = parseInt(req.query.page || 1); // 預設第 1 頁
    // 取得教練列表
    const [coaches] = await dataSource.getRepository("Coach").findAndCount({
      take: perNum, // 每頁顯示的教練數量
      skip: (pageNum - 1) * perNum, // 跳過的教練數量
      relations: {
        User: true,
      },
    });

    const coachList = coaches.map((coach) => ({
      id: coach.id,
      name: coach.User?.name,
    }));

    res.status(200).json({
      status: "success",
      data: coachList,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.get("/:coachId", async (req, res, next) => {
  try {
    const { coachId } = req.params;
    if (isUndefined(coachId) || isNotValidString(coachId)) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
      next(appError(400, "欄位未填寫正確"));
      return;
    }
    const coachRepo = dataSource.getRepository("Coach");
    const findCoach = await coachRepo.findOne({
      where: {
        id: coachId,
      },
      relations: {
        User: true,
      },
    });
    if (!findCoach) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "找不到該教練",
      // });
      next(appError(400, "找不到該教練"));
      return;
    } else {
      coachDetail = {
        user: {
          name: findCoach.User?.name,
          role: findCoach.User?.role,
        },
        coach: {
          id: findCoach.id,
          user_id: findCoach.user_id,
          experience_years: findCoach.experience_years,
          description: findCoach.description,
          profile_image_url: findCoach.profile_image_url,
          created_at: findCoach.created_at,
          updated_at: findCoach.updated_at,
        },
      };
      res.status(200).json({
        status: "success",
        data: coachDetail,
      });
    }
  } catch (error) {
    logger.error(error);
    next(error);
  }
});
module.exports = router;
