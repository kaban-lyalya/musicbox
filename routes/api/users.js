const router = require("express").Router();
const multer = require("multer");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../../models/User");
const config = require("../../config/key");
const validateRegister = require("../../validation/register");
const validateLogin = require("../../validation/login");

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
  // Check validations
  const { errors, isValid } = validateRegister(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exist";
      return res.status(400).json(errors);
    }

    // for save in MongoDB
    let fileName;
    if (req.body.avatar) {
      fileName = Date.now() + "-" + req.body.avatar;
    } else {
      fileName = config.defaultAvatar;
    }

    if (fileName !== config.defaultAvatar) {
      uploadImg(req, res, err => {
        if (err) {
          errors.image = err;
          return res.json(errors);
        }

        // Resize buffer and write
        sharp(req.file.buffer)
          .resize(config.width, config.height)
          .toFile(config.filePath + fileName)
          .then(() => console.log(config.fileToDB + fileName))
          .then(() => res.json({ msg: "IMG Uploaded" }))
          .catch(err => {
            errors.image = err;
            res.json(errors);
          });
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
  // Check validations
  const { errors, isValid } = validateLogin(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // find user (name or email)
  User.findOne()
    .or([{ email: req.body.login }, { name: req.body.login }])
    .then(user => {
      if (!user) {
        errors.email = "User not found";
        return res.status(404).json(errors);
      }

      // Check password
      bcrypt.compare(req.body.password, user.password).then(isMatch => {
        if (isMatch) {
          // add JWT
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };
          jwt.sign(
            payload,
            config.secretKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          errors.password = "Password incorrect";
          return res.status(400).json(errors);
        }
      });
    });
});

// @route  GET api/users/current
// @desc   Return current user
// @Access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name
    });
  }
);

module.exports = router;
