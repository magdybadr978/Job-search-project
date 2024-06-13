import { Router } from "express";


import { validationMiddleware } from "../../middlewares/validationMiddleware.js";
import * as applicationValidationSchemaJs from "./application.validationSchema.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import isAuthenticated from "../../middlewares/authentication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { roles } from "../../utils/enum.js";
import * as applicationControllerJs from "./application.controller.js";
let router = Router();

router.post(
  "/applyToJob/:jobId",
  isAuthenticated,
  isAuthorized([roles.User]),
  validationMiddleware(applicationValidationSchemaJs.applyToJobSchema),
  multerMiddleHost({ extension: allowedExtensions.document }).single("Resume"),
  asyncHandler(applicationControllerJs.applyToJob)
);


router.get(
  "/ExcelSheet",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(applicationValidationSchemaJs.ExcelSheetSchema) ,
  asyncHandler(applicationControllerJs.ExcelSheet)
);

export default router;
