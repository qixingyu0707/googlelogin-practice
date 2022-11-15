const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
require("./config/passport"); //这样就会自动执行config里面的那个passport.js的程式码
const session = require("express-session"); //要记得npm install express-session来下载这个
const passport = require("passport");
const flash = require("connect-flash");

//connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/GoogleDB")
  .then(() => {
    console.log("Connnecting to mongoDB");
  })
  .catch((e) => {
    console.log(e);
  });

//设定middlewares以及排版引擎
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session()); //在上面设定好了session之后 passport就能用这个session了
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//设定routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  return res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
