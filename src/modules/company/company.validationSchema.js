import joi from "joi";
import { generalFields } from "../../middlewares/validationMiddleware.js";

export const addCompanySchema = {
  body : joi.object().required().keys({
      companyName: joi.string().required().label("enter valid company name"),
      description: joi.string().required().label("enter description"),
      industry: joi.string().required().label("enter industry"),
      address : joi.string().required().label("enter address"),
      numberOfEmployees : joi.object({
        min : joi.number(),
        max : joi.number()
      }).required(),
      companyEmail: generalFields.email.required().label("enter valid companyEmail"),
  }),
  params : joi.object().required().keys({}),
  query : joi.object().required().keys({}),
}

export const updateCopmanySchema = {
  body : joi.object().required().keys({
    companyName: joi.string().required().label("enter valid company name"),
      description: joi.string().label("enter description"),
      industry: joi.string().label("enter industry"),
      address : joi.string().label("enter address"),
      numberOfEmployees : joi.object({
        min : joi.number(),
        max : joi.number()
      }),
      companyEmail: generalFields.email.label("enter valid companyEmail"),
      company_HR : generalFields.id
  }),
  params : joi.object().required().keys({
    companyId : generalFields.id
  }),
  query : joi.object().required().keys({}),

}

export const getCompanySchema = {
  body : joi.object().required().keys({
    company_HR : generalFields.id
  }),
  params : joi.object().required().keys({
    companyId : generalFields.id
  }),
  query : joi.object().required().keys({}),
}


export const searchCompanySchema = {
  body : joi.object().required().keys({}),
  params : joi.object().required().keys({}),
  query : joi.object().required().keys({
    companyName : joi.string().required().label("enter valid company name")
  }),
}


export const getJobCompanySchema = {
  body : joi.object().required().keys({
    jobId : generalFields.id
  }),
  params : joi.object().required().keys({
    companyId : generalFields.id
  }),
  query : joi.object().required().keys({}),
}







