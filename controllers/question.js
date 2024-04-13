const Question = require("../models/Question");

exports.getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find();
    res.status(200).json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};
