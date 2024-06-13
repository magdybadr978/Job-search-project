import { StatusCodes } from "http-status-codes";
import jobModel from "../../../DB/models/Job.model.js";
import companyModel from "../../../DB/models/company.model.js";
import { ErrorClass } from "../../utils/errorClass.js";
import applicationModel from "../../../DB/models/application.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import { populate } from "dotenv";

// ================= add Job ================
export const addJob = async (req, res, next) => {
  // get data from request
  const {
    companyEmail,
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addBy,
  } = req.body;
  // get data from middleware (auth)
  const { _id } = req.authUser;
  // find company by email
  const companyExist = await companyModel.findOne({companyEmail});
  if(!companyExist) return next(new ErrorClass("company not found",StatusCodes.NOT_FOUND))
  // create job
  const newCompany = await jobModel.create({
    companyEmail,
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addBy: _id,
  });
  // failed
  if (!newCompany) {
    return next(new ErrorClass("Creation Failed", StatusCodes.BAD_REQUEST));
  }
  // send response
  return res.status(201).json({
    success: true,
    message: "done",
    newCompany
  });
};

// ================= Update Job ================
export const updateJob = async (req, res, next) => {
  // get data from middleware (auth)
  const { _id } = req.authUser;
  // get data from request
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  const { jobId } = req.params;
  // find job
  const findJob = await jobModel.findById(jobId);
  // failed
  if (!findJob) {
    return next(new ErrorClass("not found this job", StatusCodes.NOT_FOUND));
  }
  // check if this is the HR of this company
  if (_id.toString() != findJob.addBy.toString()) {
    return next(
      new ErrorClass(" not authorized to you", StatusCodes.FORBIDDEN)
    );
  }
  // update job
  const updatedJob = await jobModel.findByIdAndUpdate(
    jobId,
    {
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
    },
    { new: true }
  );
  //send response
  return res.status(201).json({ success: true, message: "done" });
};

// ================= Deconste Job ================
export const deleteJob = async (req, res, next) => {
    // get data from middleware (auth)
    const { _id } = req.authUser;
    // get data from request
    const { jobId } = req.params;
    // find job
    const job = await jobModel.findById(jobId);
    // failed
    if (!job) {
      return next(new ErrorClass("Job not found", StatusCodes.NOT_FOUND));
    }
    // check if this is the companyHR
    if (JSON.stringify(_id) != JSON.stringify(job.addBy)) {
      return next(new ErrorClass("Not authorized to delete this job", StatusCodes.FORBIDDEN));
    }
    // delete applications
    await applicationModel.deleteMany({ jobId });
    // delete applications from cloudinary
    const folderName = `Jobs/jobID-${jobId}`;
    await cloudinaryConnection().api.delete_resources_by_prefix(folderName);
    await cloudinaryConnection().api.delete_folder(folderName);
    // delete job
    await jobModel.findByIdAndDelete(jobId);
    // send response
    return res.status(201).json({ success: true, message: "Job deleted successfully" });
};

// ================ Get all Jobs with their company’s information. =====================

export const getJobWithCompanyInfo = async (req, res, next) => {
  const getAllJobs = await jobModel.find()
    .select("jobTitle -addBy")
    .populate([{ path: "addBy", select: "_id" }]);
  if (!getAllJobs.length) {
    return next(new ErrorClass("No jobs Found", StatusCodes.NOT_FOUND));
  }
  let CompanyInfoArr = [];

  for (const job of getAllJobs) {
    const companyInfo = await companyModel.find({ company_HR: job.addBy._id });
    if (!companyInfo.length) {
      return next(new ErrorClass("Company Not Found", StatusCodes.NOT_FOUND));
    }
    CompanyInfoArr = [...companyInfo];
  }

  getAllJobs.push(CompanyInfoArr);

  res.status(200).json({
    success: true,
    message: "done",
    getAllJobs,
  });
};

// ================ Get all Jobs for a specific company. =====================
export const getjobsByCompanyName = async (req, res, next) => {
  const { companyName } = req.query;

  const checkCompany = await companyModel.findOne({ companyName });

  if (!checkCompany) {
    return next(new ErrorClass("Company Not Found")), { cause: 404 };
  }

  const getJobs = await jobModel.find({ addBy: checkCompany.company_HR }).select(
    "-Applications"
  );

  if (!getJobs?.length) {
    return next(new ErrorClass("No Jobs For This Company")), { cause: 404 };
  }
  res.status(200).json({ message: "Success", getJobs });
};

// ================ Get all Jobs that match specific filters  =====================

export const filterJobs = async (req, res, next) => {
  // get data from request
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  // find jobs
  const filterJobs = await jobModel.find({
    $or: [
      { jobTitle },
      { jobLocation },
      { workingTime },
      { seniorityLevel },
      { jobDescription },
      { technicalSkills },
      { softSkills }
    ],
  })
  // failed
  if (!filterJobs.length) {
    return next(new ErrorClass("there is no jobs" , 404));
  }
  return res.status(200).json({ success : true , message : "done", filterJobs });
};
