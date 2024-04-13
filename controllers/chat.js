const StatusCodes = require("http-status-codes");
const Chat = require("../models/Chat.js");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");

const ErrorResponse = require("../utils/errorResponse");

exports.getChat = async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);

  const userId = req.params.id;


  if (!userId) {
    return res.send("No User Exists!");
  }

  let chat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: tokenUser._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "email fullName _id",
  });

  if (chat.length > 0) {
    console.log('Chat',userId)
    res.send(chat[0]);
  } else {
    const createChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [tokenUser._id, userId],
    });

    const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
      "users",
      "-password"
    );

    res.status(200).json(fullChat);
  }
};

exports.getChats = async (req, res, next) => {
  const chat = await Chat.find({ users: { $elemMatch: { $eq: req.params.id } } })

  console.log('getChats',req.params.id)
  res.status(200).json({data:chat});
};

exports.createGroup = async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user.id);

  const groupChat = await Chat.create({
    chatName: req.body.name,
    users: users,
    isGroupChat: false,
    groupAdmin: req.user.id,
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullGroupChat);
};

exports.renameGroup = async (req, res, next) => {
  const { chatId, chatName } = req.body;

  const updateChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updateChat) {
    return next(new ErrorResponse("Chat Not Found", 400));
  } else {
    res.json(updateChat);
  }
};

exports.addUserToGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  const addUser = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addUser) {
    return next(new ErrorResponse("Chat Not Found", 400));
  } else {
    res.status(200).json(addUser);
  }
};

exports.removeFromGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  const removeUser = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removeUser) {
    return next(new ErrorResponse("Chat Not Found", 400));
  } else {
    res.status(200).json(removeUser);
  }
};
