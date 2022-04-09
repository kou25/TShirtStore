import Mongoose from "mongoose";

export const connectWithDb = () => {
  Mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(console.log(`DB is connected`))
    .catch((error) => {
      console.log(`DB connectin issues`);
      console.log(error);
      process.exit(1);
    });
};
