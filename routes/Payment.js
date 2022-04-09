import express from "express";
import { IsLoggedIn } from "../middlewares/user";
import {
  CaptureStripePayment,
  SendStripeKey
} from "../controllers/PaymentController";
const Router = express.Router();

Router.route("/stripekey").get(IsLoggedIn, SendStripeKey);
Router.route("/payment").post(IsLoggedIn, CaptureStripePayment);

export { Router as PaymentRoute };
