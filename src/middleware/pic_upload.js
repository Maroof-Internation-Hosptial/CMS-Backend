import * as path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    let filename =
      file.originalname.split(path.extname(file.originalname))[0] +
      "-" +
      Date.now() +
      path.extname(file.originalname);
    cb(null, filename);
  },
});

export const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "muawin_proj",
  },
});

const uploadSingle = multer({ storage: cloudinaryStorage }).single("file");
const uploadMultiple = multer({ storage: cloudinaryStorage }).array("files");

export { uploadSingle, uploadMultiple };
