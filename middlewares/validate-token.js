const Error = require('../model/httpError');
const jwt = require('jsonwebtoken');

const validateToken = (req,res,next) => {
  
    if (req.method == 'OPTIONS'){
       return next();
    }

    try{
        const token = req.headers.authorization.split(' ')[1];
        // console.log('token :::' , token);

        if (!token){
            console.log('authentication failed');
            return next(new Error('Authentication failed'));
        }

        const decodeToken = jwt.verify(token , 'supersecretkey');
        // console.log('decoded token' , decodeToken);
        req.userData = { userId:decodeToken.id };
        next();

    } catch(err){
        console.log('token verification failed');
        return next(new Error('Authentication failed' , 403));

    }

}


module.exports = validateToken;