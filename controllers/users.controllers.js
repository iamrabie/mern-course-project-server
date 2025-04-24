const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const userModel = require("../model/user.model");
const Error = require("../model/httpError");



// GET all users
const getAllUsers = async (req, res, next) => {
  let allUsers;

  try {
    allUsers = await userModel.find({}, "-password -email");
    // console.log('all users ' , allUsers);
  } catch (err) {
    return next(
      new Error("could not fetch users, please try again later", 500)
    );
  }

  res.status(200).json({
    data: allUsers.map((users) => users.toObject({ getters: true })),
    message: "all users fetched",
    success: true,
    code: 200,
  });
};



//CREATE/ ADD users
const createUser = async (req, res, next) => {
  // console.log('file from the request :' , req.file.path);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new Error("please fill all the fields", 422));
  }

  const { name, email, password } = req.body;
  // console.log('REQUET BODY :' , name , email , password , image , req.file);

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
    // console.log('hashed p/w ' , hashedPassword);
  } catch (err) {
    return next(new Error("Could not creata the user, please try again.", 500));
  }

  // console.log('password' , password);
  // console.log('hashed password' , hashedPassword);

  const createdUser = new userModel({
    name,
    email,
    password: hashedPassword,
    image: `http://localhost:5000/${req.file.path.replace(/\\/g, "/")}`,
    places: [],
  });

  // console.log('user created :' , createdUser._id);
  // console.log('user created :' , createdUser.id);


  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  let doesUserExists;
  doesUserExists = await userModel.findOne({ email: email });

  // try {
  //   doesUserExists = await userModel.findOne({ email: email });
  // } catch (err) {
  //   return next(new Error("User already exists.", 500));
  // }

  if (!doesUserExists) {
    const result = await createdUser.save();
    res.status(201).json({
      message: "User created successfully",
      data: createdUser.toObject({ getters: true }),
      success: true,
      code: 201,
    });
  } else {
    return next(new Error("email already exists , please login instead", 422));
    // res.status(400).json({
    //   message: "emaail already exists, please login instead",
    //   data: createdUser.toObject({ getters: true }),
    //   success: false,
    //   code: 400,
    // });
  }


  // console.log('sign up info for user' , createdUser.id , createdUser.email);
  const token = jwt.sign({id:createdUser.id , email:createdUser.email , iat:12345} , 'supersecretkey' , {expiresIn:'1h'});
  // console.log('jwt token generated wheb the user signs up' , token);
};




//login user
const loginUser = async (req, res, next) => {
  const errors = validationResult(req);

  //expresss validator errors
  if (!errors.isEmpty()) {
    console.log("login errors :", errors);
    return next(new Error("invalid login credentails, try again", 422));
  }

  //request body
  const { email, password } = req.body;

  // const user = USERS.find((u) => u.email == email);
  let existingUser;

  //checking if the user exists in the database or not
  try {
    existingUser = await userModel.findOne({ email: email });
    // console.log('existing User :' , existingUser);
  } catch (err) {
    //this error will be thrown when there will be issue with db, in finding this user.
    return next(new Error("logging in failed, please try again later.", 500));
  }

  //if user does not exists then display this error , using return will return from here and it will not go to the next lines of code.
  if (!existingUser) {
    return next(new Error("User does not exists", 404));
  }

  //now checking if the user exists, then the p/w entered by the user should match the p/w present in the db.
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    console.log(err);
    return next(
      new Error(
        "Could not log you in, please check your credentials and try again.",
        500
      )
    );
  }

  if (!isPasswordValid) {
    return next(new Error("logging in failed, please try again later.", 500));
  }

  
  // console.log('sign up info for user' , existingUser.id , existingUser.email);

  const token = jwt.sign({id:existingUser.id , email:existingUser.email , iat:12345} , 'supersecretkey' , {expiresIn:'1h'});
  // console.log('token generated on user login' , token);

  // if the user exists and the credentials are valid then login, return success = true
  res.status(200).json({
    data: existingUser,
    message: "successfully signed in",
    success: true,
    token:token,
    code: 200,
  });
};

exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
