import User from "../models/User";
import { BigPromise } from "../middlewares/bigPromise";
import CustomError from "../utils/customError";
import { CookieToken } from "../utils/cookieToken";
import cloudinary from "cloudinary";
import { mailHelper } from "../utils/emailHelper";
import crypto from "crypto";

export const Signup = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(CustomError("Profile picture not found", 400, res));
  }
  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(
      CustomError("Name , email and password must be provided", 400, res)
    );
  }
  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "user",
    width: "150",
    crop: "scale"
  });

  const user = await User.create({
    email,
    name,
    password,
    photo: { id: result.public_id, secure_url: result.secure_url }
  });

  CookieToken(user, res);
});

export const Login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(CustomError("Please provide email and password", 400, res));
  }

  const user = await User.findOne({
    email
  }).select("+password");

  if (!user) {
    return next(
      CustomError("Email or password does not match or exists", 400, res)
    );
  }

  const isPasswordCorrect = await user.isValidatedPassword(password);

  if (!isPasswordCorrect) {
    return next(
      CustomError("Email or password does not match or exists", 400, res)
    );
  }

  CookieToken(user, res);
});

export const Logout = BigPromise(async (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logout successful"
  });
  res.end();
});

export const ForgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({
    email
  });

  if (!user) {
    return next(CustomError("Email not found as registered", 400, res));
  }
  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const newUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Copy paste this link in your URL and hit enter \n\n ${newUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Tshirtstore - password reset email",
      message
    });
    res.status(200).json({
      success: true,
      message: "Email sent successfully. Please check you inbox or spam folder"
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(CustomError(error.message, 500, res));
  }
});

export const PasswordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryptToken,
    forgotPasswordExpiry: { $gt: Date.now() }
  });
  if (!user) {
    return next(CustomError("Token is invalid or expired", 400, res));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      CustomError("Password and confirm password do not match", 400, res)
    );
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  //send a json response or token response
  CookieToken(user, res);
});

export const GetLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

export const ChangePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");
  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword) {
    return next(CustomError("Current password is incorrect", 400, res));
  }
  if (req.body.password === req.body.oldPassword) {
    return next(
      CustomError("New password cannot be same as current password", 400, res)
    );
  }
  user.password = req.body.password;
  await user.save();
  CookieToken(user, res, "Password has been updated successfully");
});

export const UpdateUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const photoId = user.photo.id;
    let file = req.files.photo;
    const resp = await cloudinary.v2.uploader.destroy(photoId);

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "user",
      width: "150",
      crop: "scale"
    });

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: user,
    Message: "User has been updated successfully"
  });
});

export const AdminAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    data: users,
    Message: ""
  });
});

export const AdminGetSingleUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(CustomError("No user found", 400, res));
  res.status(200).json({
    success: true,
    data: user,
    Message: ""
  });
});

export const AdminUpdateUser = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: user,
    Message: "User has been updated successfully"
  });
});

export const AdminDeleteUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(CustomError("No user found", 400, res));
  const photoId = user.photo.id;
  await cloudinary.v2.uploader.destroy(photoId);
  await user.remove();
  res.status(200).json({
    success: true,
    Message: "User has been removed successfully"
  });
});

export const ManagerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });
  res.status(200).json({
    success: true,
    data: users,
    Message: ""
  });
});
