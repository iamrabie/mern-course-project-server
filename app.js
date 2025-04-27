const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PlacesRouter = require("./routes/places.routes");
const UserRouter = require("./routes/users.route");
const Error = require("./model/httpError");


// app.use((req , res , next) => {
//     console.log('basic middleware');
//     next();
// });

//extract json data (req.body)

app.use(cors());

app.use(express.json({ limit: "10mb"}));

app.use(express.urlencoded({limit: "10mb" , extended:false}));

//for cors issue on frontend
app.use((req , res , next) => {
  res.setHeader('Access-Control-Allow-Origin' , '*');
  res.setHeader('Access-Control-Allow-Headers' , 'Origin , X-Requested-With , Content-Type , Accept , Authorization');
  res.setHeader('Access-Control-Allow-Methods' , 'GET , PUT , PATCH , POST , DELETE');
  next();
});


//places routes middleware
app.use("/api/places" , PlacesRouter);


//user routes middleware
app.use("/api/users" , UserRouter);


app.use("/uploads/images" , express.static(path.join('uploads' , 'images')) );

//for totally invalid routes (Express js) , if the prev middlewae didnt gets any response then this one will handle the request.
//and here we can throw the error
app.use((req, res , next) => {
  
    return next(new Error('Could not find this route' , 404));
    
});

// ERROR HANDLING MIDDLEWARE
app.use((error , req , res , next) => {

    // console.log('file in the req body' , req.file);
    if (req.file){
      fs.unlink(req.file.path , (err) => {
        console.log('err file' , err);
      })
    }

    if (res.headerSent){
        return next(error);
    }

    res.status(error.code || 500).
    json({message:error.message || 'An unknown error occured.' , success:false , code:error.code || 500});


});




mongoose.connect('mongodb+srv://iamrabie:iamprodeveloper@cluster0.omg40.mongodb.net/MERN?retryWrites=true&w=majority&appName=Cluster0').
then(() => {
    console.log('database connected successfully');
    
    app.listen(5000 , () => {
        console.log('app running on http://localhost:5000');

    });

}).catch((err) => {
    console.log('could not connect the database to the server' , err);
});