const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");

exports.updateUser = async (req, res, next) => {
  try {
    var data = req.body;
    data.updatedAt = new Date();
    await User.findOne({ email: data.email }).updateMany(data);
    const user = await User.findOne({ email: data.email });
    res.status(200).json({ success: true, user: user });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  console.log("Get User->");
  try {
    const user = await User.findOne({ _id: req.params.id })
      .populate("friendList")
      .populate("profile");
    if (!user) return next(new ErrorResponse(404, "User not found"));
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Send friend request
exports.sendfriendrequest = async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);

  const recipientId = req.params.id;
  const foundFriendRequest = await FriendRequest.findOne({
    sender: tokenUser._id,
    recipient: recipientId,
  });
  if (foundFriendRequest) {
    return next(new ErrorResponse("Sent friend request already", 400));
  }
  const newFriendRequest = new FriendRequest({
    sender: tokenUser._id,
    recipient: recipientId,
    status: "pending",
  });

  newFriendRequest
    .save()
    .then((result) => {
      res.status(201).send({
        result: result,
        message: "Sent friend request! Peding...",
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

// get friend requests of current user
exports.getfriendrequests = async (req, res, next) => {
  console.log("Get Friend Requests");
  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);
  const requests = await FriendRequest.find({
    recipient: tokenUser._id,
    status: "pending",
  })
    .populate("sender", "fullname email _id")
    .populate("recipient", "fullname email _id");
  res.status(200).send({
    data: requests,
    message: "Get Friend Requests",
  });
};

// get single friend request by id, returns true or false
// determines if current user has pending or existing
// friend request with owner of profile being viewed
exports.getfriendrequest = async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);
  console.log("send Friend Request");

  const userId = tokenUser._id;
  const profileUserId = req.params.id;

  const foundFriendRequest1 = await FriendRequest.findOne({
    sender: userId,
    recipient: profileUserId,
  });
  const foundFriendRequest2 = await FriendRequest.findOne({
    sender: profileUserId,
    recipient: userId,
  });
  let friendRequestAlreadyExists = false;
  if (foundFriendRequest1 || foundFriendRequest2) {
    friendRequestAlreadyExists = true;
  }
  res.send(friendRequestAlreadyExists);
};

exports.acceptfriendrequest = async (req, res, next) => {
  console.log("Accept Friend Request->");
  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);

  const recipientId = tokenUser._id;
  const senderId = req.params.id;

  // const updatedSender = await User.findOneAndUpdate(
  //   { _id: senderId, friendList: { $nin: [recipientId] } },
  //   { $push: { friendList: recipientId } },
  //   { new: true }
  // );
  // const updatedRecipient = await User.findOneAndUpdate(
  //   { _id: recipientId, friendList: { $nin: [senderId] } },
  //   {
  //     $push: { friendList: senderId },
  //   },
  //   { new: true }
  // );
  // if (updatedRecipient) {
  //   const updatedFriendRequest = await FriendRequest.findOneAndUpdate(
  //     {
  //       sender: senderId,
  //       recipient: recipientId,
  //     },
  //     {
  //       $set: { status: "accepted" },
  //       $push: { friendshipParticipants: [senderId, recipientId] },
  //     },
  //     { new: true }
  //   );

  //   const updatedRequests = await FriendRequest.find({
  //     recipient: tokenUser._id,
  //     status: "pending",
  //   });
  //   res.sendStatus(200).json({ message: "Redirecting to the home page." });

  //   // res.status(200).send({
  //   //   message: "friend request aceepted!",
  //   // });
  // }

  const updatedSender = await User.findOneAndUpdate(
    { _id: senderId, friendList: { $nin: [recipientId] } },
    { $push: { friendList: recipientId } },
    { new: true }
  );
  const updatedRecipient = await User.findOneAndUpdate(
    { _id: recipientId, friendList: { $nin: [senderId] } },
    {
      $push: { friendList: senderId },
    },
    { new: true }
  );
  if (updatedRecipient) {
    const updatedFriendRequest = await FriendRequest.findOneAndUpdate(
      {
        sender: senderId,
        recipient: recipientId,
      },
      {
        $set: { status: "accepted" },
        $push: { friendshipParticipants: [senderId, recipientId] },
      },
      { new: true }
    );

    const updatedRequests = await FriendRequest.find({
      recipient: tokenUser._id,
      status: "pending",
    });
    res.status(200).send({
      updatedRequests: updatedRequests,
      message: "friend request aceepted!",
    });
  } else {
    const updatedRequests = await FriendRequest.find({
      recipient: tokenUser._id,
      status: "pending",
    });
    res.status(200).send({
      updatedRequests: updatedRequests,
      message: "friend request aceepted arealy!",
    });
  }
};

exports.rejectfriendrequest = async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);

  const recipientId = tokenUser._id;
  const senderId = req.params.id;
  const deletedFriendRequest = await FriendRequest.findOneAndDelete({
    sender: senderId,
    recipient: recipientId,
  });

  const updatedRequests = await FriendRequest.find({
    recipient: tokenUser._id,
    status: "pending",
  });

  res.status(200).send({
    updatedRequests: updatedRequests,
    message: "friend request rejected!",
  });
};

exports.unfriend = async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, process.env.ACCESS_SECRET);

  const userId = tokenUser._id;
  const friendId = req.params.id;

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $pullAll: { friendList: [friendId] } },
    { new: true }
  ).select("-password");
  const updatedFriend = await User.findOneAndUpdate(
    { _id: friendId },
    { $pullAll: { friendList: [userId] } },
    { new: true }
  ).select("-password");
  res
    .status(200)
    .send({ updatedUser, updatedFriend, message: "Remove friend!" });
};
