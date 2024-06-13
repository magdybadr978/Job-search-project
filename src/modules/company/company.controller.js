import jobModel from "../../../DB/models/Job.model.js";
import companyModel from "../../../DB/models/company.model.js";
import userModel from "../../../DB/models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../../utils/errorClass.js";
import applicationModel from "../../../DB/models/application.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";

// ================= add Company ================
export const addCompany = async (req, res, next) => {
  // get data from requset
  const {
    companyName,
    companyEmail,
    description,
    industry,
    address,
    numberOfEmployees,
  } = req.body;
  // get user data from middleware (auth)
  const { _id:company_HR} = req.authUser; // const company_HR = req.authUser._id
  // find with companyName
  const isCompanyNameExists = await companyModel.findOne({ companyName });
  // check if companyName exist
  if (isCompanyNameExists) {
    return next(new ErrorClass("companyName exist", StatusCodes.CONFLICT));
  }
  // find with companyEmail
  const isCompanyEmailExists = await companyModel.findOne({ companyEmail });
  // check if companyEmail exist
  if (isCompanyEmailExists) {
    return next(new ErrorClass("companyEmail exist ", StatusCodes.CONFLICT));
  }
  // create company
  const newCompany = await companyModel.create({
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    company_HR,
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

// ================= Deconste Company ================
export const deleteCompany = async (req, res, next) => {
  // get data from middleware (auth)
  const { _id } = req.authUser; //   const { _id : company_HR} = req.authUser;
  // get data from request
  const { companyId } = req.params;
  const { company_HR } = req.body;
  // check if this is the HR of this company
  if (_id != company_HR)
    return next(new ErrorClass("not authorized to you", StatusCodes.FORBIDDEN));
  // find company and delete
  const Company = await companyModel.findByIdAndDelete(companyId);
  // failed
  if (!Company) {
    return next(
      new ErrorClass("Failed to delete company", StatusCodes.NOT_FOUND)
    );
  }
  // delete jobs of this company
  const jobs = await jobModel.find({ addBy : _id });
  
  let jobIdsArr =[]
  for (let job of jobs) {
    // delete applications
    /**@todo you can use In operator to delete array of Ids*/ 
    // await applicationModel.deleteMany({ jobId :job._id });
    jobIdsArr.push(job._id)
    //delete applications from cloudinary
    const folderName = `Jobs/jobID-${(job._id).toString()}`;
    await cloudinaryConnection().api.delete_resources_by_prefix(folderName);
    await cloudinaryConnection().api.delete_folder(folderName);
  }
  
  
  await jobModel.deleteMany({_id :{$in:jobIdsArr}});
  await applicationModel.deleteMany({ jobId :{$in:jobIdsArr} });

  //send response
  res.status(200).json({ success: true, message: "done" });
};

// ================= Update Company ================
export const updateCompany = async (req, res, next) => {
  // get data from middleware (auth)
  const { _id } = req.authUser;
  // get data from request
  const { companyId } = req.params;
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    company_HR,
  } = req.body;
  // check if email , name exist
  if (companyEmail || companyName) {
    const doesCompanyExists = await companyModel.findOne({
      $or: [{ companyEmail }, { companyEmail }],
    });
    if (doesCompanyExists) {
      return next(new ErrorClass("Company exist before", 409));
    }
  }
  if (_id.toString() != company_HR.toString()) {
    return next(new ErrorClass("not authorized to you", 403));
  }
  const updatedCompany = await companyModel.findByIdAndUpdate(
    companyId,
    {
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      company_HR: _id,
    },
    { new: true }
  );

  if (!updatedCompany) {
    return next(new ErrorClass("Failed", StatusCodes.BAD_REQUEST));
  }
  return res
    .status(200)
    .json({ success: true, message: "done", updatedCompany });
};

// ================= Get Company Data ================
export const getCompanyData = async (req, res, next) => {
  // get data from middleware (auth)
  const { id } = req.authUser;
  // get data from request
  const { companyId } = req.params;
  const { company_HR } = req.body;
  // check if this is the companyHR
  if (id != company_HR) {
    return next(new ErrorClass("you are not the HR of this company"));
  }
  // find company
  const companyData = await companyModel.find({ _id: companyId }).lean();
  // failed
  if (!companyData.length)
    return next(new ErrorClass("not found data", StatusCodes.NOT_FOUND));
  for (const company of companyData) {
    const jobs = await jobModel.find({ addBy: company.company_HR });
    company.jobs = jobs;
  }
  // send response
  return res.status(200).json({ success: true, message: "done", companyData });
};

// =================Search For A Company ================
export const serachForAcompany = async (req, res, next) => {
  // get data from request
  const { companyName } = req.query;
  // find company with regular expression
  const findCompany = await companyModel.findOne({ companyName });
  // failed
  if (!findCompany)
    return next(new ErrorClass("Company not found", StatusCodes.NOT_FOUND));
  // send response
  res.status(200).json({ success: true, message: "done", findCompany });
};

// ================= See Job Applications ================
export const getJobApplications = async (req, res, next) => {
  // get data from middleware (auth)
  const { _id } = req.authUser;
  // get data from request
  const { companyId } = req.params;
  const { jobId } = req.body;
  // find company data
  const getCompany = await companyModel.findById(companyId);
  // failed
  if (!getCompany) {
    return next(new ErrorClass("Company Not Found", StatusCodes.NOT_FOUND));
  }

  if (getCompany.company_HR.toString() !== _id.toString()) {
    return next(new ErrorClass("Not Authorized to you", StatusCodes.FORBIDDEN));
  }

  const getApplications = await jobModel.find({
    $and: [{ addBy: getCompany.company_HR }, { _id: jobId }],
  });
  if (!getApplications.length) {
    return next(
      new ErrorClass(
        "You Don't Have Any jobs right now",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const appliers = [];
  for (const element of getApplications) {
    for (const ele of element.Applications) {
      const Applier = await userModel
        .findById(ele.applierId)
        .select("userName email mobileNumber -_id ");
      const JobSpecfication = await jobModel
        .findById(jobId)
        .select("jobTitle  -_id");
      if (Applier) {
        appliers.push(Applier, JobSpecfication);
      }
    }
  }
  if (appliers.length == 0) {
    return res.status(404).json({ message: "No Appliers For Jobs Right Now" });
  }
  return res.status(200).json({ message: "Company Data", appliers });
};
