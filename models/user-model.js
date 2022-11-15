const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  googleID: {
    type: String,
  },
  date: {
    //这个就是日期 当前日期
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    //图片
    type: String,
  },
  //local Login
  email: {
    type: String,
  },
  password: {
    type: String,
    minLength: 8,
    maxLength: 1024,
  },
});

module.exports = mongoose.model("User", userSchema);
