import joi from "joi";
import { generalFields } from "../../middlewares/validationMiddleware.js";

export const applyToJobSchema = {
  body : joi.object().required().keys({
    TechSkills: joi.custom((value,helper)=>{
      value = JSON.parse(value);
      const valueSchema = joi.object({
        value : joi.array().items(joi.string().required()).required()
      })
      const validationResult = valueSchema.validate({value})
      if(validationResult.error){
        return helper.message("invalid value")
      }else{
        return true;
      }
    })  ,
    SoftSkills: joi.custom((value,helper)=>{
      value = JSON.parse(value)
      const valueSchema = joi.object({
        value : joi.array().items(joi.string())
      })
      const validationResult = valueSchema.validate(value)
      if(validationResult.error){
        return helper.message("invalid value")
      }else{
        return true
      }
    }),
    /*specs : joi.string().valid('Map').required()*/
    /*joi.array().items(joi.alternatives().try(joi.string(),joi.number())).required() */
  }),
  query: joi.object().required().keys({}),
  params: joi.object({
    jobId: generalFields.id
  }),
};


export const ExcelSheetSchema = {
  body : joi.object({
      companyEmail : joi.string().required().min(4) ,
      day : joi.string().required()
  })
}

