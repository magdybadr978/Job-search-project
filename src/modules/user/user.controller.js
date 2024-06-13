import userModel from "../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../../utils/errorClass.js";
import { userStatus } from "../../utils/enum.js";
import applicationModel from "../../../DB/models/application.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import moment from "moment";
import generateUniqueString from "../../utils/generateUniqueString.js";

// ============= Sign Up ================
export const signUp = async (req, res, next) => {
  // get data from request
  const {
    firstName,
    lastName,
    email,
    recoveryEmail,
    password,
    role,
    mobileNumber,
    dateOfBirth,
    hintForPassword,
  } = req.body;
  // find user by email
  const isEmailExist = await userModel.findOne({ email });
  // check if email exist
  if (isEmailExist)
    return next(new ErrorClass("Email Already Exists", StatusCodes.CONFLICT));

  // find user by mobileNumber
  const isMobileExist = await userModel.findOne({ mobileNumber });
  // check if mobile number exist
  if (isMobileExist)
    return next(new ErrorClass("mobile number exist", StatusCodes.CONFLICT));
  // find user by hint
  const isHintExist = await userModel.findOne({ hintForPassword });
  // check if hint exist
  if (isHintExist)
    return next(new ErrorClass("hint exist", StatusCodes.CONFLICT));
  // hash password
  const hashPassword = bcryptjs.hashSync(password, +process.env.SALT_ROUNDS);
  // create user
  const newUser = await userModel.create({
    firstName,
    lastName,
    // userName: firstName + " " + lastName, 
    email,
    recoveryEmail,
    password: hashPassword,
    role,
    mobileNumber,
    dateOfBirth : moment(dateOfBirth).format('YYYY-MM-DD'),
    hintForPassword
  });
  // failed to create
  if (!newUser) {
    return next(new ErrorClass("Creation Failed", StatusCodes.BAD_REQUEST));
  }
  // send response
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "done",
  });
};

// ============= Login ================
export const logIn = async (req, res, next) => {
  // get data from request
  const { email, password, mobileNumber } = req.body;
  // find with  email or mobile
  const isUserExist = await userModel.findOne({
    $or: [{ email }, { mobileNumber }],
  });
  // failed if exist before
  if (!isUserExist) {
    return next(
      new ErrorClass("invalid login credentials", StatusCodes.BAD_REQUEST)
    );
  }
  // compare passwords
  const isPasswordCorrect = bcryptjs.compareSync(
    password,
    isUserExist.password
  );
  // failed
  if (!isPasswordCorrect) {
    return next(
      new ErrorClass("invalid login credentials", StatusCodes.BAD_REQUEST)
    );
  }
  // token
  const token = jwt.sign(
    { id: isUserExist._id, userEmail: isUserExist.email },
    process.env.TOKEN_SIGNATURE
  );
  // update user status with method save
  isUserExist.status = userStatus.Online;
  isUserExist.save();
  // send response
  res.status(200).json({ success: true, message: "done", token });
};

// ============= Update Account ================
export const updateAccount = async (req, res, next) => {
  // get user data from middleware (auth)
  const { _id } = req.authUser;
  // get data from request
  const {
    email,
    mobileNumber,
    RecoveryEmail,
    firstName,
    lastName,
    userName ,
    dateOfBirth
  } = req.body;
  const userData = await userModel.findById(_id);
  // check if email or mobile exist before
    const isUserExist = await userModel.findOne({
      $or: [{ email }, { mobileNumber }],
    });
    // if exist
    if (isUserExist)
      return next(
        new ErrorClass("Email or mobile exist before", StatusCodes.CONFLICT)
      );
  
  // check if update first name
  if(firstName){
    userData.firstName = firstName || userData.firstName;
  }
  if(lastName){
    userData.lastName = lastName || userData.lastName;
  }
  userData.userName = `${userData.firstName} ${userData.lastName}`
  await userData.save();
  // update user data
  const updatedUser = await userModel.findByIdAndUpdate(
    _id,
    {
      email,
      mobileNumber,
      RecoveryEmail,
      dateOfBirth
    },
    { new: true }
  );
  // failed to update
  if (!updatedUser)
    return next(new ErrorClass("user not found", StatusCodes.BAD_REQUEST));
  // send response
  res.status(201).json({ success: true, message: "done" });
};

// ============= Delete Account ================
export const deleteAccount = async (req, res, next) => {
  // get user data from middleware (auth)
  const { _id } = req.authUser;
  // find user
  const findUser = await userModel.findByIdAndDelete(_id);
  // if failed
  if (!findUser)
    return next(new ErrorClass("user not found", StatusCodes.NOT_FOUND));
  // delete applications of this user
  
  /**@todo deleteMany */
   const findApp = await applicationModel.findOneAndDelete({applierId : _id})
  // if true
  if(findApp){
    // delete applications from cloudinary
    //const folderName = `Jobs/jobID-${findApp.jobId}/userId-${_id}`
     const name = generateUniqueString();
     const folderName = `user-${name}` 
    /**@todo use public_id for each application, don't forget to delete the file name  */
     await cloudinaryConnection().api.delete_resources_by_prefix(folderName);
     await cloudinaryConnection().api.delete_folder(folderName);
  }
  // send response
  res.status(200).json({ success: true, message: "done" });
};

// ============= Get Account info ================
export const getAccInfo = async (req, res, next) => {
  // get user data from middleware (auth)
  const { _id } = req.authUser;
  // find user
  const user = await userModel.findById(_id);
  // failed
  if (!user)
    return next(new ErrorClass("user not found", StatusCodes.NOT_FOUND));
  // send response
  res.status(200).json({ success: true, message: "done", user });
};

// ============= Get Another Account info ================
export const getAnotherAccInfo = async (req, res, next) => {
  // get user data from middleware (auth)
  const { id } = req.params;
  // find user
  const user = await userModel.findById(id);
  // failed
  if (!user)
    return next(new ErrorClass("user not found", StatusCodes.NOT_FOUND));
  // send response
  res.status(200).json({ success: true, message: "done", user });
};

//========================  Update Password =====================
export const UpdatePassword = async (req, res, next) => {
  //get user data from middleware (auth)
  const { _id } = req.authUser;
  // get data from request
  const { oldPassword, newPassword } = req.body;
  // check if user exist
  const isUserExist = await userModel.findById(_id);
  // failed
  if (!isUserExist)
    return next(new ErrorClass("user not found", StatusCodes.NOT_FOUND));
  // compare oldPassword
  const oldPasswordCheck = bcryptjs.compareSync(
    oldPassword,
    isUserExist.password 
  );
  // failed
  if (!oldPasswordCheck) {
    return next(
      new ErrorClass("Invalid current password", StatusCodes.BAD_REQUEST)
    );
  }
  // hash new password
  const passwordtest = bcryptjs.hashSync(newPassword, +process.env.SALT_ROUNDS);
  const updatedPassword = await userModel.findByIdAndUpdate(_id, {
    password: passwordtest,
  });
  // failed
  if (!updatedPassword) {
    return next(new ErrorClass("failed to update", StatusCodes.BAD_REQUEST));
  }
  // send response
  res.status(201).json({ success: true, message: "done" });
};

//========================  Forget Password =====================
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const isUserExist = await userModel.findOne({ email });
  if (!isUserExist) {
    return next(new ErrorClass("email not exist", 404));
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const encryptedOTP = CryptoJS.AES.encrypt(
    otp.toString(),
    process.env.SECRET
  ).toString();

  isUserExist.encryptedOTP = encryptedOTP;
  isUserExist.OTP = otp;
  // add data with method save
  await isUserExist.save();
  // send response
  res.status(200).json({ success: true, message: "done", encryptedOTP });
};

//=======================verify OTP=============================
export const verifyOTP = async (req, res, next) => {
  // get data from request
  const { email, encryptedOTP } = req.body;
  // decrypt otp
  const decryptOTP = CryptoJS.AES.decrypt(
    encryptedOTP,
    process.env.SECRET
  ).toString(CryptoJS.enc.Utf8);
  // find user
  const OTPVerify = await userModel.findOne({ email, OTP: decryptOTP });
  // failed
  if (!OTPVerify)
    return next(new ErrorClass("OTP not verify", StatusCodes.BAD_REQUEST));
  // send response
  return res.status(200).json({
    success: true,
    message: "done",
  });
};

//========================  Reset Password =====================
export const resetPassword = async (req, res, next) => {
  // get data from request
  const { email, hintForPassword, newPassword } = req.body;
  // hash password
  const hashPassword = bcryptjs.hashSync(newPassword, +process.env.SALT_ROUNDS);
  // check user exist and update
  const isUserExist = await userModel.findOneAndUpdate(
    { email, hintForPassword },
    { password: hashPassword, encryptedOTP: "", OTP: "" },
    { new: true }
  );
  // failed
  if(!isUserExist) return next(new ErrorClass("user not found",404))
  // send response
  return res.status(200).json({
    success : true ,
    message : "done"
  })
};

//========================  Get all with recovery Email  =====================
export const getAccountsByRecoveryAccount = async (req, res, next) => {
  // get data from request
  const { recoveryEmail } = req.body;
  // find all with recovery Email
  const findUser = await userModel.find({ recoveryEmail }).select("email");
  // failed
  if (!findUser.length)
    return next(new ErrorClass("no data", StatusCodes.BAD_REQUEST));
  // send response
  res.status(200).json({
    success: true,
    message: "done",
    findUser,
  });
};
