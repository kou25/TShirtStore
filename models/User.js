import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import crypto from "crypto";
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [40, "Name must be at under 40 characters"]
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    validate: [validator.isEmail, "Please provide a valid email"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password should be at least 6 characters"],
    select: false
  },
  role: {
    type: String,
    default: "user"
  },
  photo: {
    id: {
      type: String,
      required: true
    },
    secure_url: {
      type: String,
      required: true
    }
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//encrypt password
userSchema.pre("save", async function (next) {
  //to stop multiple encryption
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

//validate password with passed on user password
userSchema.methods.isValidatedPassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

//creta and return JWT token
userSchema.methods.getJwtToken = function () {
  return Jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
};

//generate forget password token
userSchema.methods.getForgotPasswordToken = function () {
  //generate long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  //geting a hash - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  //time of token
  this.forgotPasswordExpiry = Date.now() + 30 * 60 * 1000;

  return this.forgotPasswordToken;
};

export default mongoose.model("User", userSchema);
