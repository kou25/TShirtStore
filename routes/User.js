import express from "express";
import { IsLoggedIn, CustomRole } from "../middlewares/user";
import {
  ForgotPassword,
  Login,
  Logout,
  Signup,
  PasswordReset,
  GetLoggedInUserDetails,
  ChangePassword,
  UpdateUserDetails,
  AdminAllUser,
  ManagerAllUser,
  AdminGetSingleUser,
  AdminUpdateUser,
  AdminDeleteUser
} from "../controllers/UserController";

const Router = express.Router();

Router.route("/signup").post(Signup);
Router.route("/login").post(Login);
Router.route("/logout").get(Logout);
Router.route("/forgotPassword").post(ForgotPassword);
Router.route("/password/reset/:token").post(PasswordReset);
Router.route("/profile").get(IsLoggedIn, GetLoggedInUserDetails);
Router.route("/password/update").post(IsLoggedIn, ChangePassword);
Router.route("/profile/update").post(IsLoggedIn, UpdateUserDetails);
//admin routes
Router.route("/admin/users").get(IsLoggedIn, CustomRole("admin"), AdminAllUser);
Router.route("/admin/user/:id")
  .get(IsLoggedIn, CustomRole("admin"), AdminGetSingleUser)
  .put(IsLoggedIn, CustomRole("admin"), AdminUpdateUser)
  .delete(IsLoggedIn, CustomRole("admin"), AdminDeleteUser);
//manager route
Router.route("/manager/users").get(
  IsLoggedIn,
  CustomRole("manager"),
  ManagerAllUser
);
export { Router as UserRoute };
