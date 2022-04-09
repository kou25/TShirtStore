import User from "../models/User";
import { BigPromise } from "../middlewares/bigPromise";
import CustomError from "../utils/customError";
import Jwt from "jsonwebtoken";

export const IsLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next(CustomError("Login first to access this page", 401, res));
  }
  const decoded = Jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

export const CustomRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        CustomError("You do not have permission to access this page", 403, res)
      );
    }
    next();
  };
};
