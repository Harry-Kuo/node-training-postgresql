const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("AdminController");
const {
  isUndefined,
  isNotValidInteger,
  isNotValidString,
} = require("../utils/validUtils");

const adminController = {
  async postCoachCourse(req, res, next) {
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
      return next(appError(400, "欄位未填寫正確"));
    }
    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      where: {
        id: user_id,
      },
    });
    if (!findUser) {
      return next(appError(400, "使用者不存在"));
    } else if (findUser.role !== "COACH") {
      return next(appError(400, "使用者尚未成為教練"));
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
  },
  async putCoachCourse(req, res, next) {
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
      return next(appError(400, "欄位未填寫正確"));
    }
    const courseRepo = dataSource.getRepository("Course");
    const findCourse = await courseRepo.findOne({
      where: { id: courseId },
    });
    if (!findCourse) {
      return next(appError(400, "課程不存在"));
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
      return next(appError(400, "更新課程失敗"));
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
  },
  async postCoach(req, res, next) {
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
      return next(appError(400, "欄位未填寫正確"));
    }
    if (
      !isUndefined(data.profile_image_url) &&
      !isNotValidString(data.profile_image_url) &&
      !data.profile_image_url.startsWith("https")
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }

    const userRepo = dataSource.getRepository("User");
    const findUser = await userRepo.findOne({
      where: {
        id: userId,
      },
    });
    if (!findUser) {
      return next(appError(400, "使用者不存在"));
    } else if (findUser.role === "COACH") {
      return next(appError(409, "使用者已經是教練"));
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
      return next(appError(400, "更新使用者失敗"));
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
  },
  async putCoach(req, res, next) {
    const { id } = req.user;
    const {
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl = null,
      skill_ids: skillIds,
    } = req.body;
    if (
      isUndefined(experienceYears) ||
      isNotValidInteger(experienceYears) ||
      isUndefined(description) ||
      isNotValidString(description) ||
      isUndefined(profileImageUrl) ||
      isNotValidString(profileImageUrl) ||
      !profileImageUrl.startsWith("https") ||
      isUndefined(skillIds) ||
      !Array.isArray(skillIds)
    ) {
      logger.warn("欄位未填寫正確");
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }
    if (
      skillIds.length === 0 ||
      skillIds.every((skill) => isUndefined(skill) || isNotValidString(skill))
    ) {
      logger.warn("欄位未填寫正確");
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }
    const coachRepo = dataSource.getRepository("Coach");
    const coach = await coachRepo.findOne({
      select: ["id"],
      where: { user_id: id },
    });
    await coachRepo.update(
      {
        id: coach.id,
      },
      {
        experience_years: experienceYears,
        description,
        profile_image_url: profileImageUrl,
      }
    );
    const coachLinkSkillRepo = dataSource.getRepository("CoachLinkSkill");
    const newCoachLinkSkill = skillIds.map((skill) => ({
      coach_id: coach.id,
      skill_id: skill,
    }));
    await coachLinkSkillRepo.delete({ coach_id: coach.id });
    const insert = await coachLinkSkillRepo.insert(newCoachLinkSkill);
    logger.info(
      `newCoachLinkSkill: ${JSON.stringify(newCoachLinkSkill, null, 1)}`
    );
    logger.info(`insert: ${JSON.stringify(insert, null, 1)}`);
    const result = await coachRepo.find({
      select: {
        id: true,
        experience_years: true,
        description: true,
        profile_image_url: true,
        CoachLinkSkill: {
          skill_id: true,
        },
      },
      where: { id: coach.id },
      relations: {
        CoachLinkSkill: true,
      },
    });
    logger.info(`result: ${JSON.stringify(result, null, 1)}`);
    res.status(200).json({
      status: "success",
      data: {
        id: result[0].id,
        experience_years: result[0].experience_years,
        description: result[0].description,
        profile_image_url: result[0].profile_image_url,
        skill_ids: result[0].CoachLinkSkill.map((skill) => skill.skill_id),
      },
    });
  },
  async getCoach(req, res, next) {
    const { id } = req.user;
    const coachRepo = dataSource.getRepository("Coach");
    const coach = await coachRepo.findOne({
      select: ["id"],
      where: { user_id: id },
    });
    const result = await dataSource.getRepository("Coach").findOne({
      where: { id: coach.id },
      relations: {
        CoachLinkSkill: true,
      },
    });
    logger.info(`result: ${JSON.stringify(result, null, 1)}`);
    res.status(200).json({
      status: "success",
      data: {
        id: result.id,
        experience_years: result.experience_years,
        description: result.description,
        profile_image_url: result.profile_image_url,
        skill_ids:
          result.CoachLinkSkill.length > 0
            ? result.CoachLinkSkill.map((skill) => skill.skill_id)
            : result.CoachLinkSkill,
      },
    });
  },
  async getCoachCourses(req, res, next) {
    const { id } = req.user;
    if (isUndefined(id) || isNotValidString(id)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    const coachCourses = await dataSource.getRepository("Course").find({
      where: { user_id: id },
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
      name: coachCourse.name,
      start_at: coachCourse.start_at,
      end_at: coachCourse.end_at,
      max_participants: coachCourse.max_participants,
    }));
    res.status(200).json({
      status: "success",
      data: coachCourseList,
    });
  },
  async getCoachCourseDetail(req, res, next) {
    const { courseId } = req.params;
    if (isUndefined(courseId) || isNotValidString(courseId)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    const coachCourse = await dataSource.getRepository("Course").findOne({
      where: { id: courseId },
      relations: {
        User: true,
        Skill: true,
      },
    });
    if (!coachCourse) {
      return next(appError(400, "找不到該教練"));
    }
    data = {
      id: coachCourse.id,
      skill_name: coachCourse.Skill?.name,
      name: coachCourse.name,
      description: coachCourse.description,
      start_at: coachCourse.start_at,
      end_at: coachCourse.end_at,
      max_participants: coachCourse.max_participants,
    };
    res.status(200).json({
      status: "success",
      data: data,
    });
  },
};
module.exports = adminController;
