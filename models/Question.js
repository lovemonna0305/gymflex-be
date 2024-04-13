const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  content: String,
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
