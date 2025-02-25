const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Admin");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");
const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
  isValidPassword,
} = require("../utils/validUtils");
const appError = require("../utils/appError");

router.post("/coaches/courses", isAuth, isCoach, async (req, res, next) => {
  try {
    const {
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;

    if (
      isUndefined(user_id) ||
      isNotValidString(user_id) ||
      isUndefined(skill_id) ||
      isNotValidString(skill_id) ||
      isUndefined(name) ||
      isNotValidString(name) ||
      isUndefined(description) ||
      isNotValidString(description) ||
      isUndefined(start_at) ||
      isNotValidString(start_at) ||
      isUndefined(end_at) ||
      isNotValidString(end_at) ||
      isUndefined(max_participants) ||
      isNotValidInteger(max_participants) ||
      isUndefined(meeting_url) ||
      isNotValidString(meeting_url) ||
      !meeting_url.startsWith("https")
    ) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
      next(appError(400, "欄位未填寫正確"));
      return;
    }
    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      where: {
        id: user_id,
      },
    });
    if (!findUser) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "使用者不存在",
      // });
      next(appError(400, "使用者不存在"));
      return;
    } else if (findUser.role !== "COACH") {
      // res.status(400).json({
      //   status: "failed",
      //   message: "使用者尚未成為教練",
      // });
      next(appError(400, "使用者尚未成為教練"));
      return;
    }
    const courseRepo = dataSource.getRepository("Course");
    const newCourse = courseRepo.create({
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    });
    const result = await courseRepo.save(newCourse);

    res.status(201).json({
      status: "success",
      data: {
        course: result,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});
router.put(
  "/coaches/courses/:courseId",
  isAuth,
  isCoach,
  async (req, res, next) => {
    try {
      const courseId = req.params.courseId;

      const {
        skill_id,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
      } = req.body;
      if (
        isUndefined(courseId) ||
        isNotValidString(courseId) ||
        isUndefined(skill_id) ||
        isNotValidString(skill_id) ||
        isUndefined(name) ||
        isNotValidString(name) ||
        isUndefined(description) ||
        isNotValidString(description) ||
        isUndefined(start_at) ||
        isNotValidString(start_at) ||
        isUndefined(end_at) ||
        isNotValidString(end_at) ||
        isUndefined(max_participants) ||
        isNotValidInteger(max_participants) ||
        isUndefined(meeting_url) ||
        isNotValidString(meeting_url) ||
        !meeting_url.startsWith("https")
      ) {
        // res.status(400).json({
        //   status: "failed",
        //   message: "欄位未填寫正確",
        // });
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      const courseRepo = dataSource.getRepository("Course");
      const findCourse = await courseRepo.findOne({
        where: { id: courseId },
      });
      if (!findCourse) {
        // res.status(400).json({
        //   status: "failed",
        //   message: "課程不存在",
        // });
        next(appError(400, "課程不存在"));
        return;
      }

      const updateCourse = await courseRepo.update(
        {
          id: courseId,
        },
        {
          skill_id,
          name,
          description,
          start_at,
          end_at,
          max_participants,
          meeting_url,
        }
      );
      if (updateCourse.affected === 0) {
        // res.status(400).json({
        //   status: "failed",
        //   message: "更新課程失敗",
        // });
        next(appError(400, "更新課程失敗"));
        return;
      }
      const courseResult = await courseRepo.findOne({
        where: {
          id: courseId,
        },
      });
      res.status(201).json({
        status: "success",
        data: {
          course: courseResult,
        },
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
);

router.post("/coaches/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const data = req.body;

    if (
      isUndefined(userId) ||
      isNotValidString(userId) ||
      isUndefined(data.experience_years) ||
      isNotValidInteger(data.experience_years) ||
      isUndefined(data.description) ||
      isNotValidString(data.description)
    ) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
      next(appError(400, "欄位未填寫正確"));
      return;
    }
    if (
      !isUndefined(data.profile_image_url) &&
      !isNotValidString(data.profile_image_url) &&
      !data.profile_image_url.startsWith("https")
    ) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "欄位未填寫正確",
      // });
      next(appError(400, "欄位未填寫正確"));
      return;
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      where: {
        id: userId,
      },
    });
    if (!findUser) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "使用者不存在",
      // });
      next(appError(400, "使用者不存在"));
      return;
    } else if (findUser.role === "COACH") {
      // res.status(409).json({
      //   status: "failed",
      //   message: "使用者已經是教練",
      // });
      next(appError(409, "使用者已經是教練"));
      return;
    }
    const updateUser = await userRepo.update(
      {
        id: userId,
      },
      {
        role: "COACH",
      }
    );
    if (updateUser.affected === 0) {
      // res.status(400).json({
      //   status: "failed",
      //   message: "更新使用者失敗",
      // });
      next(appError(400, "更新使用者失敗"));
      return;
    }

    const coachRepo = dataSource.getRepository("Coach");
    const newCoach = coachRepo.create({
      user_id: userId,
      description: data.description,
      profile_image_url: data.profile_image_url,
      experience_years: data.experience_years,
    });

    const coachResult = await coachRepo.save(newCoach);
    const userResult = await userRepo.findOne({
      where: {
        id: userId,
      },
    });
    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: userResult.name,
          role: userResult.role,
        },
        coach: coachResult,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
