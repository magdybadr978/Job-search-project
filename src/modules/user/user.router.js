import { Router } from "express";
import { validationMiddleware } from "../../middlewares/validationMiddleware.js";
import * as Schemas from "./user.validationSchema.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as userControllerJs from "./user.controller.js";
import isAuthenticated from "../../middlewares/authentication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { roles } from "../../utils/enum.js";
let router = Router();

router.post(
  "/signUp",
  validationMiddleware(Schemas.signUpSchema),
  asyncHandler(userControllerJs.signUp)
);
router.post(
  "/logIn",
  validationMiddleware(Schemas.logInSchema),
  asyncHandler(userControllerJs.logIn)
);

router.put(
  "/updateUser",
  isAuthenticated,
  validationMiddleware(Schemas.updateUserSchema),
  asyncHandler(userControllerJs.updateAccount)
);

router.delete(
  "/deleteUser",
  isAuthenticated,
  asyncHandler(userControllerJs.deleteAccount)
);

router.get(
  "/getUserInfo",
  isAuthenticated,
  asyncHandler(userControllerJs.getAccInfo)
);

router.get(
  "/getAnotherUserInfo/:id",
  validationMiddleware(Schemas.getUserSchema),
  asyncHandler(userControllerJs.getAnotherAccInfo)
);

router.post(
  "/updatePassword",
  isAuthenticated,
  validationMiddleware(Schemas.updatePassSchema),
  asyncHandler(userControllerJs.UpdatePassword)
);

router.post(
  "/forgotPassword",
  validationMiddleware(Schemas.forgetPassSchema),
  asyncHandler(userControllerJs.forgetPassword)
);

router.post(
  "/verifyOTP",
  validationMiddleware(Schemas.verifyOTPSchema),
  asyncHandler(userControllerJs.verifyOTP)
);

router.post(
  "/resetPassword",
  validationMiddleware(Schemas.resetPassSchema),
  asyncHandler(userControllerJs.resetPassword)
);

router.get(
  "/getAssociatedAccounts",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.getByRecoverySchema),
  asyncHandler(userControllerJs.getAccountsByRecoveryAccount)
);

export default router;
