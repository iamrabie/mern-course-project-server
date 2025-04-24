const express = require("express");
const router = express.Router();
// const { Router } = require("express");
const { check } = require("express-validator");

const UsersController = require("../controllers/users.controllers");
const fileUpload = require("../middlewares/upload-file");

router.get("/", UsersController.getAllUsers);

router.post(
  "/login",
  [check("email").not().isEmpty(), check("password").isLength({ min: 6 })],
  UsersController.loginUser
);

router.post(
  "/sign-up",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").not().isEmpty(),
    check("password").isLength({ min: 6 }),
  ],
  UsersController.createUser
);

module.exports = router;
