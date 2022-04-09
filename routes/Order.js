import express from "express";
import {
  AdminGetAllOrders,
  AdminDeleteOrder,
  AdminUpdateOrder,
  CreateOrder,
  GetLoggedInOrder,
  GetSingleOrder
} from "../controllers/OrderController";

import { IsLoggedIn, CustomRole } from "../middlewares/user";
const Router = express.Router();

Router.route("/order/create").post(IsLoggedIn, CreateOrder);
Router.route("/order/:id").get(IsLoggedIn, GetSingleOrder);
Router.route("/myorders").get(IsLoggedIn, GetLoggedInOrder);

//admin
Router.route("/admin/ordes").get(
  IsLoggedIn,
  CustomRole("admin"),
  AdminGetAllOrders
);
Router.route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), AdminUpdateOrder)
  .delete(isLoggedIn, customRole("admin"), AdminDeleteOrder);
export { Router as OrderRoute };
