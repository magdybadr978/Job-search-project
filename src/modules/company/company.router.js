import { Router } from "express";
import isAuthenticated from "../../middlewares/authentication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import * as Schemas from './company.validationSchema.js'
import { roles } from "../../utils/enum.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as companyController from "./company.controller.js"
import { validationMiddleware } from "../../middlewares/validationMiddleware.js";
let router = Router();

router.post(
  "/createCompany",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.addCompanySchema),
  asyncHandler(companyController.addCompany)
);

router.put(
  "/updateCompany/:companyId",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.updateCopmanySchema),
  asyncHandler(companyController.updateCompany)
);
router.delete(
  "/deleteCompany/:companyId",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.getCompanySchema),
  asyncHandler(companyController.deleteCompany)
);

router.get(
  "/getCompanyData/:companyId",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.getCompanySchema),
  asyncHandler(companyController.getCompanyData)
);
router.get(
  "/searchForCompany",
  isAuthenticated,
  isAuthorized([roles.Company_Hr , roles.User]),
  validationMiddleware(Schemas.searchCompanySchema),
  asyncHandler(companyController.serachForAcompany)
);

router.get(
  "/getJobApplications/:companyId",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.getJobCompanySchema),
  asyncHandler(companyController.getJobApplications)
);

export default router;
