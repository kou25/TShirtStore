import app from "./app.js";
import { connectWithDb } from "./config/db";
import cloudinary from "cloudinary";
const Port = process.env.PORT;

//Connect with Database
connectWithDb();

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.listen(Port, () => console.log(`Server is listening on port ${Port}!`));
