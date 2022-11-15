const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user }); //加上{ user: req.user }这个就会知道目前使用者的状态 是logout还是login的
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err); //如果有error就send error
    return res.redirect("/"); //没有error的话就会被导向首页
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash(
      "error_msg",
      "Please use longer password(More than 8 character)!"
    );
    return res.redirect("/auth/signup");
  }

  // 如果注册一个新用户我们需要注意他的email是否被注册过
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "Email already been used, please use another email or use this email to log in!"
    );
    return res.redirect("/auth/signup");
  }
  //储存新用户的第一步就是要把他的密码做hash
  //用这个指令来下载npm install bcrypt
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "Congratulations, you are ready to log in now!");
  return res.redirect("/auth/login");
});

router.get(
  "/google",
  //这个function会有两个参数 第一个是我们要用google认证 所以我们写google
  //第二参数我们需要设定一个scope 然后里面填写我们需要的资料可以填写profile或者email之类的
  passport.authenticate("google", {
    scope: ["profile", "email"],
    //这个select就是会让你每次在登陆的时候都会显示选择账号来登录
    prompt: "select_account",
  })
);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login", //如果登陆失败就重新到页面
    failureFlash: "Email or password incorrect", //登陆失败显示的信息
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("进入redirect区域");
  return res.redirect("/profile");
});

module.exports = router;
