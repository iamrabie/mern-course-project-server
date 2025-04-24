const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
  'image/png':'png',
  'image.jpg':'jpg',
  'image/jpeg':'jpeg'
};

const storage_ = multer.diskStorage({
  destination:(req,file,cb) => {
    cb(null , 'uploads/images/');
  },
  filename:(req,file,cb) => {
    // const ext = MIME_TYPE_MAP[file.mimetype];
    // console.log('file org' , typeof file.originalname);
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`; // Ensure filename is a string
    cb(null , filename);
  }
});

const fileUpload = multer({
  limits:500000,
  storage:storage_,
  fileFilter:(req,file,cb) => {
    const isValid =  !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid MYME type');
    cb(error , isValid);
  }
});

module.exports = fileUpload;
