const router = require("express").Router();
const User = require("../../models/User");
const config = require("../../config/key");
const multer = require("multer");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

// Init multer (memory eater)
const storageImg = multer.memoryStorage();

// Init upload
const uploadImg = multer({
  storage: storageImg,
  limits: { fileSize: config.sizeLimitImg },
  fileFilter: function(req, file, cb) {
    const extname = config.fileTypesImg.test(
      path.extname(file.originalname).toLowerCase()
    );

    // Fucking mimetypes... Need using lib for magic...
    // For now, browsers associate with extension
    // Example lib: https://github.com/mscdex/mmmagic
    const mimetype = config.fileTypesImg.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb("Error: images only!");
    }
  }
}).single("myImage");

// @route  GET api/users/test
// @desc   Tests user route
// @Access Public
router.get("/test", (req, res) => res.json({ msg: "Users work" }));

// @route  POST api/users/register
// @desc   Register user
// @Access Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exist" });
    }
    // for save in MongoDB
    let fileName = "";

    if (req.body.avatar) {
      fileName = Date.now() + "-" + req.body.avatar;
    } else {
      fileName = config.defaultAvatar;
    }

    if (fileName !== config.defaultAvatar) {
      uploadImg(req, res, err => {
        if (err) {
          res.json({ msg: err });
          return;
        }

        // Resize buffer and write
        sharp(req.file.buffer)
          .resize(config.width, config.height)
          .toFile(config.filePath + fileName)
          .then(() => console.log(config.fileToDB + fileName))
          .then(() => res.json({ msg: "IMG Uploaded" }))
          .catch(err => res.json({ msg: err }));
      });
    }

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      avatar: fileName,
      password: req.body.password
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      });
    });
  });
});

// @route  POST api/users/login
// @desc   Login user
// @Access Public
router.post("/login", (req, res) => {
  console.log(req.body.password);
  const email = req.body.email ? req.body.email : "";
  const name = req.body.name ? req.body.name : "";
  console.log(email, name);

  // find user (name or email)
  User.findOne()
    .or([{ email }, { name }])
    .then(user => {
      console.log(user);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Check password
      bcrypt.compare(req.body.password, user.password).then(isMatch => {
        console.log(isMatch);
        if (isMatch) {
          res.json({ msg: "Success" });
        } else {
          return res.status(400).json({ msg: "Password incorrect" });
        }
      });
    });
});

module.exports = router;
