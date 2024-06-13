import joi from "joi";
import { jobLocation, seniorityLevel, workingTime } from "../../utils/enum.js";
import { generalFields } from "../../middlewares/validationMiddleware.js";



export const addJobSchema = {
  body : joi.object().required().keys({
    companyEmail : generalFields.email.required(),
    jobTitle : joi.string().required().label("enter job title"),
    jobLocation : joi.string().valid(...Object.values(jobLocation)).required(),
    workingTime : joi.string().valid(...Object.values(workingTime)).required(),
    seniorityLevel : joi.string().valid(...Object.values(seniorityLevel)).required(),
    jobDescription : joi.string(),
    technicalSkills : joi.array().items(joi.string()).required(),
    softSkills  :joi.array().items(joi.string()).required(),
  }),
  params : joi.object().required().keys({}),
  query : joi.object().required().keys({}),
}



export const updateJobSchema = {
  body : joi.object().required().keys({
    jobTitle : joi.string().label("enter job title"),
    jobLocation : joi.string().valid(...Object.values(jobLocation)),
    workingTime : joi.string().valid(...Object.values(workingTime)),
    seniorityLevel : joi.string().valid(...Object.values(seniorityLevel)),
    jobDescription : joi.string(),
    technicalSkills : joi.array().items(joi.string()),
    softSkills  :joi.array().items(joi.string()),
  }),
  params : joi.object().required().keys({
    jobId : generalFields.id
  }),
  query : joi.object().required().keys({}),
}


export const deleteJobSchema = {
  body : joi.object().required().keys({}),  
  params : joi.object().required().keys({
    jobId : generalFields.id
  }),
  query : joi.object().required().keys({}),
}

export const JobByCompanyNameSchema = {
  body : joi.object().required().keys({}),  
  params : joi.object().required().keys({}),
  query : joi.object().required().keys({
    companyName : joi.string().required()
  }),
}


export const filterJobSchema = {
  body : joi.object().required().keys({
    jobTitle : joi.string().label("enter job title"),
    jobLocation : joi.string().valid(...Object.values(jobLocation)),
    workingTime : joi.string().valid(...Object.values(workingTime)),
    seniorityLevel : joi.string().valid(...Object.values(seniorityLevel)),
    jobDescription : joi.string(),
    technicalSkills : joi.array().items(joi.string()),
    softSkills  :joi.array().items(joi.string()),
  }),  
  params : joi.object().required().keys({}),
  query : joi.object().required().keys({}),
}

