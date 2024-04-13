const Message = require("../models/Message.js");
const User = require("../models/User.js");
const Chat = require("../models/Chat.js");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const ErrorResponse = require("../utils/errorResponse");

exports.sendMessage = async (req, res, next) => {
  const { userId, message, chatId } = req.body;

  if (!message || !chatId) {
    return next(new ErrorResponse("Please Provide All Fields To send Message", 400));
  }

  let newMessage = {
    sender: userId,
    message: message,
    chat: chatId,
  };

  let m = await Message.create(newMessage);

  m = await m.populate("sender", "username avatar");
  m = await m.populate("chat");
  m = await User.populate(m, {
    path: "chat.users",
    select: "username avatar email _id",
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: m }, { new: true });

  res.status(200).json(m);
};

exports.allMessages = async (req, res) => {
  const chatId = req.params.id;

  await Message.updateMany({ chat: chatId }, { "$set": { "is_read": true } })

  const getMessage = await Message.find({ chat: chatId })
    .populate("sender", "fullname email _id")
    .populate("chat");

  res.status(200).json(getMessage);
};

exports.unreadNumMessage = async (req, res) => {

  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);

  const chats = await Chat.find({ users: { $elemMatch: { $eq: tokenUser._id } } }).populate('users')

  let results = [];
  for await (let chat of chats) {

    for (var i = 0; i < chat.users.length; i++) {
      if (chat.users[i]._id.toString() === tokenUser._id) {
        chat.users.splice(i, 1);
      }
    }
    let getNum = Message.find({ chat: chat._id, is_read: false, sender: chat.users[0]._id });
    // console.log('Get Message------------------------------------', (await getNum).length)
    results.push({ users: chat.users, num: (await getNum).length })
  }
  res.status(200).json(results);
};
