const router = require("express").Router();
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, async (req, res) => {
  //如果有人要进来就要做这个authCheck 这样就可以保证如果没登陆的话不会错误的跳转到profile页面
  //由于authcheck里面写的 所以会被重现导向到login那里
  //console.log("进入profile区域");
  let postFound = await Post.find({ author: req.user._id });
  return res.render("profile", { user: req.user, posts: postFound }); //deserializeUser() 在profile.ejs里面所以的user都会指向这个user所指代的那个人
});

router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "Please fill up both tile and content");
    return res.redirect("/profile/post");
  }
});

module.exports = router;
