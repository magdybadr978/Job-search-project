
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










// import jwt from 'jsonwebtoken'
// import User from '../../DB/models/user.model.js'

// export let auth = (accessRoles)=>{
//     return async (req,res,next) => {
//         try {
                
//             let {accesstoken} = req.headers
//             if(!accesstoken){
//                 return next(new Error("Please Log in First"), {cause:400})
//             }
//             if(!accesstoken.startsWith(process.env.TOKEN_PREFIX)){
//                 return next(new Error('invalid token prefix', { cause: 400 }))
//             }
//             let token = accesstoken.split(process.env.TOKEN_PREFIX)[1]
//             let decodedData = jwt.verify(token,process.env.LOGIN_SIGNATURE)
//             if(!decodedData){
//                 return next(new Error('invalid token payload', { cause: 400 }))
//             }
            
//             let findUser = await User.findById(decodedData.id, "-password")
//             if(!findUser){
//                 return next(new Error('User Not Found', { cause: 404 }))
//             }
            
//             if (accessRoles && !accessRoles.includes(findUser.role)) {
//                 return next(new Error('you are not authorized' , {cause:401}))
//             }
//             req.authUser = findUser 
//             next()
//         } catch (error) {
//             next(new Error('please LogIN Again', { cause: 500 }))
//         }
//     }
// }