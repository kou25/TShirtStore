import express from "express";
import {
  AddProduct,
  AddReview,
  AdminDeleteSingleProduct,
  AdminGetAllProduct,
  AdminUpdateSingleProduct,
  DeleteReview,
  GetOnlyReviewOfSingleProduct,
  GetProduct,
  GetSingleProduct
} from "../controllers/ProductController";
import { IsLoggedIn, CustomRole } from "../middlewares/user";
const Router = express.Router();

Router.route("/products").get(GetProduct);
Router.route("/product/:id").get(GetSingleProduct);
Router.route("/review").put(IsLoggedIn, AddReview);
Router.route("/review").delete(IsLoggedIn, DeleteReview);
Router.route("/reviews").get(GetOnlyReviewOfSingleProduct);

Router.route("/admin/product/add").post(
  IsLoggedIn,
  CustomRole("admin"),
  AddProduct
);

Router.route("/admin/products").get(
  IsLoggedIn,
  CustomRole("admin"),
  AdminGetAllProduct
);

Router.route("/admin/product/:id")
  .put(IsLoggedIn, CustomRole("admin"), AdminUpdateSingleProduct)
  .delete(IsLoggedIn, CustomRole("admin"), AdminDeleteSingleProduct);

export { Router as ProductRoute };
