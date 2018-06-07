const router = require("express").Router();

// @route  GET api/users/test
// @desc   Tests user route
// @Access Public
router.get("/test", (req, res) => res.json({ msg: "Users work" }));

module.exports = router;
