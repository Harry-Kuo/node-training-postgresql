const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("CoachesController");
const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
} = require("../utils/validUtils");

const coachesController = {
  async getCoaches(req, res, next) {
    const { per, page } = req.query;
    if (
      isUndefined(per) ||
      isNotValidString(per) ||
      isUndefined(page) ||
      isNotValidString(page)
    ) {
      return next(appError(400, "欄位未填寫正確"));
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
  },
  async getCoachDetail(req, res, next) {
    const { coachId } = req.params;
    if (isUndefined(coachId) || isNotValidString(coachId)) {
      return next(appError(400, "欄位未填寫正確"));
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
      return next(appError(400, "找不到該教練"));
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
  },
  async getCoachCourses(req, res, next) {
    const { coachId } = req.params;
    if (isUndefined(coachId) || isNotValidString(coachId)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    const coachCourses = await dataSource.getRepository("Course").find({
      where: { user_id: coachId },
      relations: {
        User: true,
        Skill: true,
      },
    });
    if (coachCourses.length == 0) {
      return next(appError(400, "找不到該教練"));
    }
    coachCourseList = coachCourses.map((coachCourse) => ({
      id: coachCourse.id,
      coach_name: coachCourse.User?.name,
      skill_name: coachCourse.Skill?.name,
      name: coachCourse.name,
      description: coachCourse.description,
      start_at: coachCourse.start_at,
      end_at: coachCourse.end_at,
      max_participants: coachCourse.max_participants,
    }));
    res.status(200).json({
      status: "success",
      data: coachCourseList,
    });
  },
};
module.exports = coachesController;
