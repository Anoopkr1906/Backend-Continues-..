import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp"); // specify the directory to store uploaded files
    },

    // TODO : try console log the file object to see what it contains below
    filename: function(req, file, cb){
        cb(null , file.originalname); // use the original file name for the uploaded file
    }
})


export const upload = multer({ storage});