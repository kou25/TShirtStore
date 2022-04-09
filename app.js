import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

//for swagger
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
const swaggerDocument = YAML.load("./swagger.yaml");

dotenv.config();

const app = express();

//middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

//morgan middleware
app.use(morgan("tiny"));

//import all routes
import { HomeRoute } from "./routes/home";
import { UserRoute } from "./routes/user";
import { ProductRoute } from "./routes/Product";
import { PaymentRoute } from "./routes/Payment";
import { OrderRoute } from "./routes/Order";

//router middleware
app.use("/api/v1/", HomeRoute);
app.use("/api/v1/", UserRoute);
app.use("/api/v1/", ProductRoute);
app.use("/api/v1/", PaymentRoute);
app.use("/api/v1/", OrderRoute);
//export app js
export default app;
