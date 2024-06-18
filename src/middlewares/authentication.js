
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/errorHandling.js";
import { ErrorClass } from "../utils/errorClass.js";
import { verifyToken } from "../utils/Generat&VerifyToken.js";
import userModel from "../../DB/models/user.model.js";


const isAuthenticated = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  // check token existence
  if (!authorization?.startsWith(process.env.BEARER_KEY)) {
    return next(new ErrorClass('In-valid bearer key'))
  }
  // check token type
  const token = authorization.split(process.env.BEARER_KEY)[1]
  if (!token) {
    return next(new ErrorClass('In-valid token'))
  }

  // check payload 
  const decoded = verifyToken({ token });
  if (!decoded?.id) {
    return next(new ErrorClass('In-valid token payload', StatusCodes.BAD_REQUEST))
  }
  // check user existence
  const authUser = await userModel.findById(decoded.id , "-password")
  if (!authUser) {
    return next(new ErrorClass("user not found", StatusCodes.NOT_FOUND))
  }

  // pass user 
  req.authUser = authUser;
  return next();
})

export default isAuthenticated;










