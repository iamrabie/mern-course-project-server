const mongoose = require("mongoose");


const placeSchema = new mongoose.Schema({

    title:{type:String , required:true},
    description:{type:String , required:true},
    address:{type:String , required:true},
    //not a file because it will make the db slower, so instead we will use URL which is also a string
    image:{type:String , required:true},
    location:{
        lat:{type:Number , required:true},
        lng:{type:Number , required:true}
    },
    creator:{type:mongoose.Types.ObjectId, required:true , ref:'User'},
    
});

//stored in db as places rather tha Place, it becomes plural and gets created with small letter
const placeModel =  mongoose.model('Place' , placeSchema);


module.exports = placeModel;