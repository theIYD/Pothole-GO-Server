const format = require('util').format;
const multer = require("multer");
const path = require('path')
const { Storage } = require("@google-cloud/storage");

// Multer Functions
const storage = new Storage({
  projectId: "potholego",
  keyFilename: './potholego.json'
});

const bucket = storage.bucket("potholego.appspot.com");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

const uploadImageToStorage = (file) => {
    let prom = new Promise((resolve, reject) => {
      if (!file) {
        reject('No image file');
      }
      let newFileName = `${file.originalname}_${Date.now()}`;
  
      let fileUpload = bucket.file(newFileName);
  
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
  
      blobStream.on('error', (error) => {
        reject(error);
      });
  
      blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
        resolve(url);
      });
  
      blobStream.end(file.buffer);
    });
    return prom;
  }

module.exports = {
  storage: storage,
//   fileFilter: fileFilter,
  upload: upload,
  uploadImageToStorage: uploadImageToStorage
};
