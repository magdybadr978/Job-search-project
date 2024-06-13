import { StatusCodes } from "http-status-codes";
import jobModel from "../../../DB/models/Job.model.js"
import applicationModel from "../../../DB/models/application.model.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import companyModel from "../../../DB/models/company.model.js";
import moment from "moment";
import { ErrorClass } from "../../utils/errorClass.js";
import excel from 'exceljs'
import generateUniqueString from "../../utils/generateUniqueString.js";

export const applyToJob = async (req, res, next) => {
  const {TechSkills , SoftSkills ,/*specs*/} = req.body;
  const { _id } = req.authUser;
  const { jobId } = req.params;

  // jobId Check
  const isJobExist = await jobModel.findById(jobId);
  if (!isJobExist) return next(new Error("NO Job Found",StatusCodes.NOT_FOUND));

  // if User Alredy apply
  const isUserAlreadyApply = await applicationModel.findOne({ jobId, applierId: _id });
  if (isUserAlreadyApply)
    return next(
      new Error("You Are Already Applied To This Job",StatusCodes.CONFLICT)
    );
  // upload to cloudinary
  const userResume = {};
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `Jobs/jobID-${jobId}/userId-${_id}`,
      unique_filename: true,
      use_filename: true,
    });
  userResume.secure_url = secure_url;
  userResume.public_id = public_id;

  // create application
  const application = await applicationModel.create({
    userResume,
    SoftSkills : JSON.parse(SoftSkills),
    TechSkills : JSON.parse(TechSkills),
    applierId: _id,
    jobId,
    /*specs : JSON.parse(specs)*/
  });

  if (!application) {
    // delete from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(
      `Jobs/jobID-${jobId}/userId-${_id}`
    );
    await cloudinaryConnection().api.delete_folder(
      `Jobs/jobID-${jobId}/userId-${_id}`
    );
    return next(new ErrorClass("Create Fail", StatusCodes.BAD_REQUEST));
  }
  return res.status(201).json({ success : true , message : "done", application });
};



// ======================= Excel =======================//
export const ExcelSheet = async(req,res,next)=>{
  // get data from request
  const {companyEmail, day} = req.body;
    // get all jobs for specific company
    const allJobsForCompany = await jobModel.find({companyEmail})
    //console.log(allJobsForCompany);
    if(!allJobsForCompany.length){return next(new Error('No jobs Found'))}
    // get all applications to company
    let applications = []
    for (const job of allJobsForCompany) {
        const jobId = job._id
        const allApplications = await applicationModel.find({jobId})
        .populate([
            {path:'jobId',select:'_id jobTitle jobLocation workingTime seniorityLevel'},
            {path:'applierId',select:'_id userName email dateOfBirth mobileNumber'}
        ])
        applications.push(...allApplications)
    }
    //console.log(applications);
    // filter application based on day
    const applicationInSpecificDay = applications.filter(app =>{
        const createdAtMoment = moment(app.createdAt)
        return createdAtMoment.isSame(day,'day')
    })
    //console.log(applicationInSpecificDay);
    if(!applicationInSpecificDay.length){
        return next(new ErrorClass(`No applications applied in this day: ${day}`,StatusCodes.NOT_FOUND))
    }
    // create excel sheet
    const workBook = new excel.Workbook()
    const workSheet = workBook.addWorksheet('Applications')
    workSheet.columns = [
        {header:'jobLocation' , key:'jobLocation', width:30},
        {header:'jobTitle' , key:'jobTitle', width:30},
        {header:'workingTime' , key:'workingTime', width:30},
        {header:'seniorityLevel' , key:'seniorityLevel', width:30},
        {header:'technicalSkills' , key:'technicalSkills', width:30},
        {header:'softSkills' , key:'softSkills', width:30},
        {header:'userName' , key:'userName', width:20},
        {header:'email' , key:'email', width:20},
        {header:'dateOfBirth' , key:'dateOfBirth', width:20},
        {header:'mobileNumber' , key:'mobileNumber', width:20},
        {header:'userTechSkills' , key:'userTechSkills', width:60},
        {header:'userSoftSkills' , key:'userSoftSkills', width:60},
        {header:'UserResume' , key:'userResume', width:50},
        {header:'CreatedAt' , key:'createdAt', width:30},
    ]
    applicationInSpecificDay.forEach(app=>{
        workSheet.addRow({
            jobLocation:app.jobId.jobLocation,
            jobTitle:app.jobId.jobTitle,
            workingTime:app.jobId.workingTime,
            seniorityLevel:app.jobId.seniorityLevel,
            technicalSkills:app.jobId.technicalSkills,
            softSkills:app.jobId.softSkills,
            userName:app.applierId.userName,
            email:app.applierId.email,
            dateOfBirth:app.applierId.dateOfBirth,
            mobileNumber:app.applierId.mobileNumber,
            userTechSkills:app.userTechSkills,
            userSoftSkills:app.userSoftSkills,
            userResume:app.userResume,
            createdAt:app.createdAt
        })
    })
    // save excel file
    const name = generateUniqueString()
    const fileName = `applications-for-specific-company-in-specific-day-${name}.xlsx`
    workBook.xlsx.writeFile(fileName)
    .then(console.log('Done'))
    .catch(err =>console.log(err.message))
    res.status(200).json({success : true ,message:`Excel file '${fileName}' created successfully.`})
}
