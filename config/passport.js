const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const userModel = require("../models/user-model");
const LocalStrategy = require("passport-local"); //npm install passport-local
const bcrypt = require("bcrypt"); //npm install bcrypt

passport.serializeUser((user, done) => {
  console.log("序列化Serialize使用者。。。。");
  //   console.log(user);
  done(null, user._id); //将mongoDB的id存在session内部 并且将id 签名sign之后寄给使用者
});

passport.deserializeUser(async (_id, done) => {
  console.log(
    "Deserialize使用者.。。使用serializeUser储存的id去找到资料库中的资料"
  );
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); //将req.user这个属性设定为foundUser
});

passport.use(
  //google strategy有两个parameter 第一个是一个物件包含client id，client secret以及一个callback url
  //第二个是一个function
  new GoogleStrategy(
    {
      //创建一个.env文件把google客户端ID复制粘贴进那个文件夹
      //clientID: process.env.GOOGLE_CLIENT_ID ==》google客户端id
      //clientSecret==>客户端密码
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      //这个callbackURL就是等所有的验证都完成会带着token和使用者的profile重现导向到这个url
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("进入Google Strategy的区域");
      //   console.log(profile);
      //console.log("=================================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已经注册 无需存入");
        //如果找到了这个用户 也要用done
        //第一个参数还是null 第二参数是foundUser
        done(null, foundUser);
      } else {
        console.log("侦测到新用户，需要存入资料库");
        let newUser = new userModel({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("成功创建新用户");
        //在成功创建新用户的下面我们就可以用done这个function
        //done是第四个参数
        //done本身有两个参数 第一个参数是null 规定好的 第二个参数我们可以把savedUser贴过来
        done(null, savedUser);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
