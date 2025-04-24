const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const fs = require('fs');

const Error = require("../model/httpError");
const PlaceModel = require("../model/place.model");
const placeModel = require("../model/place.model");
const userModel = require("../model/user.model");



//DELETE place
const deletePlace = async(req, res, next) => {
  const { pid } = req.params;
  // const identifiedPlace = DUMMY_PLACES.find(p => p.id == pid);
  let place;
  
  try{
    place = await placeModel.findById(pid).populate('creator');
  } catch(err){
      const error = new Error('Something went wrong, could not delete the place.' , 500);
      return next(error);
  }

  if (!place){
    const error = new Error('Could not find the place.' , 404);
    return next(error);
  }

  const imagePath = place.image;

  // console.log('image Path' , imagePath);

  try{
    // const deletePlace = await placeModel.deleteOne({_id:pid});
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.deleteOne({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  }
  

  catch(err){
    const error = new Error('could not delete the place' , 500);
    return next(error);
  }


  fs.unlink(imagePath , err => console.log('error deleting image' , err));
  // DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== pid);
  res.json({
    // data: DUMMY_PLACES,
    message: "place deleted successfully",
    success: true,
    code: 200,
  });

};




//UPDATE PLACE
const updatePlace = async(req, res, next) => {
  const { title, description } = req.body;
  const { pid } = req.params;

  let place;
  try{
    place = await placeModel.updateOne({ _id:pid }, { $set:{ title:title , description:description }});
    console.log('updated place :' , place);
  }
  catch(err) {
    const error = new Error('Something went wrong, Could not find a place.' , 500);
    return next(error);
  }

  // const identifiedPlace = { ...DUMMY_PLACES.find((p) => p.id == pid) };
  // const index = DUMMY_PLACES.findIndex((p) => p.id == pid);
  // console.log('index :' , index );

  // identifiedPlace.title = title;
  // identifiedPlace.description = description;

  // DUMMY_PLACES[index] = identifiedPlace;

  place.title = title;
  place.description = description;
    
  res.status(200).json({
      data: place,
      message: "place update successfully",
      sucess: true,
      code: 200,
    });

};





//CREATE/ADD PLACE
const createPlace = async(req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()){
    //error details
     console.log('express validator error ::::::::::' , errors);
     return next(new Error('Please fill all the fields' , 422));
  }


  const { title, description , address, creator} = req.body;


  // const newPlace = {
  //   id: uuidv4(),
  //   title,
  //   description,
  //   location: coordinates,
  //   address,
  //   creator,
  // };

  // DUMMY_PLACES.push(newPlace);
  const placeCreated = new PlaceModel({
    // id: uuidv4(),
    title,
    description,
    image:`http://localhost:5000/${req.file.path.replace(/\\/g , '/')}`,
    location: {
      "lat":89.0988,
      "lng":67.0000,
    },
    address,
    creator,
  });


  let user;

  try{
    user = await userModel.findById(creator);
  } catch(err){
    return next(new Error('Creating place failed, user does not exists.' , 500));
  }


  // console.log('user , ' , user);

  if (!user){
    return next(new Error('Could not find the provided user id.' , 404));
  }


  try{
    // const result = await placeCreated.save();

    const session = await mongoose.startSession();
    // console.log("Session :" , session);
    session.startTransaction();
    const place = await placeCreated.save({session:session});
    // console.log('place , ' , place);
    user.places.push(place);
    await user.save({session:session});
    await session.commitTransaction();

  } catch(err){
    // console.error("💥 TRANSACTION ERROR:", err);
    return next(new Error('creating place failed, please try again later.' , 500));
  }



  res.status(201).json({
    data: placeCreated.toObject({getters:true}),
    message: "place created successfully",
    success: true,
    code: 201,
  });

};




//GET PLACE BY ID
const getPlaceById = async(req, res, next) => {
  const placeId = req.params.pid;

  console.log('by id:' , placeId);
  
  let place;
  
  try{
    place = await placeModel.findById(placeId);
    console.log('places :' , place);
  }

  catch(err){
    const error = new Error('Something went wrong, could not find a place.' , 500);
    //usong next() as it is an asynchronus call
    return next(error);
  }


  // const place = DUMMY_PLACES.find((p) => p.id == placeId);

  if (!place) {
    //METHOD 3:
    throw new Error("Could not find the place for the provided id.", 404);

    //METHOD 2:
    // const error = new Error("COuld not find the place for the provided id.");
    // error.code = 404;
    // throw(error);

    // METH0D 1
    // res
    //   .status(404)
    //   .json({
    //     message: "ERROR: Could not find the place",
    //     error: true
    //   });
  }

  res.json({
    data: place.toObject({ getters:true }),
    message: "place fetched successfully",
    success: true,
    code: 200,
  });
};





//GET PLACES BY  USER ID
const getPlacesByUserId = async(req, res, next) => {
  const userId = req.params.uid;

  // const places = await placeModel.find();
  // console.log('places :' , places);

  //find gives only the first obj where id matches but in case of get places by user id, there cam be multiple places for a user so we will use filter() here
  // const identifiedPlace = DUMMY_PLACES.filter((u) => u.creator == userId);

  let place;

  try{

    place = await placeModel.find({creator:userId});
    // console.log("place , " , place);

  } catch(err){
    const error = new Error("Something went wrong, could not find a place" , 500);
    return next(error);
  }


  if (!place || place.length == 0) {
    return next(
      new Error("Could not find the place for the provided user id.", 404)
    );

    // METHOD 2
    // const error = new Error("Could not find the place for the provided  user id.");
    // error.code = 404;
    // return next(error);

    //METHOD 1
    // res
    //   .status(404)
    //   .json({
    //     message: "ERROR: Could not find the place with user id",
    //     error: true,
    //   });
  }

  res.json({
    data: place.map((p) => p.toObject({getters:true})),
    message: "place fetched by user id",
    success: true,
    code: 200,
  });
};




const getAllPlaces = async(req , res , next) => {

  const getPlaces =  await PlaceModel.find();
  res.status(200).json({message:"places fetched successfully" , data:getPlaces , success:true , code:200});

}


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.getAllPlaces = getAllPlaces;
