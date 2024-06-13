import { Router } from "express";

import * as jobController from "./job.controller.js";
import { validationMiddleware } from "../../middlewares/validationMiddleware.js";
import isAuthenticated from "../../middlewares/authentication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { roles } from "../../utils/enum.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as Schemas from "./job.validationSchema.js"
let router = Router();

router.post(
  "/addJob",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.addJobSchema),
  asyncHandler(jobController.addJob)
);

router.put(
  "/updateJob/:jobId",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.updateJobSchema),
  asyncHandler(jobController.updateJob)
);
router.delete(
  "/deleteJob/:jobId",
  isAuthenticated,
  isAuthorized([roles.Company_Hr]),
  validationMiddleware(Schemas.deleteJobSchema),
  asyncHandler(jobController.deleteJob)
);

router.get(
  "/getAllJobs",
  isAuthenticated,
  isAuthorized([roles.Company_Hr ,roles.User]),
  asyncHandler(jobController.getJobWithCompanyInfo)
);

router.get(
  "/getJobsByCompanyName",
  isAuthenticated,
  isAuthorized([roles.Company_Hr ,roles.User]),
  validationMiddleware(Schemas.JobByCompanyNameSchema),
  asyncHandler(jobController.getjobsByCompanyName)
);

router.get(
  "/fillterJobs",
  isAuthenticated,
  isAuthorized([roles.Company_Hr ,roles.User]),
  validationMiddleware(Schemas.filterJobSchema),
  asyncHandler(jobController.filterJobs)
);

export default router;
