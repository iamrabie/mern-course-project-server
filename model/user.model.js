const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unoque-validator')

const userSchema = new mongoose.Schema({

    name:{type:String , required:true},
    // lastName:{type:String , required:true},
    //uniques creates an index in the db to make it easy and faster to query the emails.
    email:{type:String , required:true , unique:true},
    password:{type:String , required:true , minlength:6},
    image:{type:String , required:true},
    places:[{type:mongoose.Types.ObjectId, required:true , ref:'Place'}],
});

// userSchema.plugin(uniqueValidator);

const userModal = mongoose.model('User' , userSchema);


// NOTE : unique is not for checking if the email address aleady exists or not. it just creates an internal index.
//using mongoose unique validator for checking if the email already exists or not.

module.exports = userModal;