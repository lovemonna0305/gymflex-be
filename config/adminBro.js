const AdminBro = require("admin-bro");
const mongooseAdminBro = require("@admin-bro/mongoose");
const expressAdminBro = require("@admin-bro/express");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Question = require("../models/Question");

AdminBro.registerAdapter(mongooseAdminBro);
const AdminBroOptions = {
  resources: [User, Profile, Question],
};

const adminBro = new AdminBro(AdminBroOptions);
const adminRoute = expressAdminBro.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const user = await User.findOne({ email }).select("+password");
    if (user) {
      const matched = await user.matchPassword(password);
      if (matched && user.role === "admin") {
        return user;
      }
    }
    return false;
  },
  cookiePassword: "some-secret-password-used-to-secure-cookie",
});

module.exports = {adminBro, adminRoute}
