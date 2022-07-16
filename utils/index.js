const express = require("express");
const router = express.Router();
const path = require("path");
const buildPath = path.resolve(__dirname, "../dist/member-sessions");

router.use(express.static(buildPath));
router.get("/*", function (req, res, next) {
  if (req.url.startsWith("/api")) {
    return next();
  }
  res.sendFile(buildPath + "/index.html");
});

module.exports = router;
