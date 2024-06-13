let dataMethods = ["query", "body", "params", "headers"];
import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("In-valid objectId");
};


export let validationMiddleware = (schema) => {
  return (req, res, next) => {
    const validationErr = [];
    dataMethods.forEach((key) => {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        });

        if (validationResult.error) {
          if (validationResult.error.details) {
            validationResult.error.details.map((detail) => {
              const dictionary = {};
              if (detail.context.label.includes(detail.path[0])) {
                dictionary[`${detail.path[0]}`] = `${detail.message}`;
              } else {
                dictionary[`${detail.path[0]}`] = `${detail.context.label}`;
              }
              validationErr.push(dictionary);
            });
          }
        }
      }
    });

    if (validationErr.length) {
      return res.status(400).json({ success: false, message: validationErr });
    }
    return next();
  };
};

export const generalFields = {
  id: joi.string().custom(validateObjectId).required(),
  idNotRequired: joi.string().custom(validateObjectId),
  name: joi.string().min(2).max(20).alphanum(),
  email: joi
    .string()
    .email({ tlds: { allow: ["com", "org", "yahoo"] }, minDomainSegments: 1 }),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
  phone: joi
    .string()
    .pattern(new RegExp(/^(01)(0|1|2|5)[0-9]{8}$/))
    .label("enter valid number"),
  password: joi
    .string()
    //.pattern( new RegExp( /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{8,}$/ ) ),
    .pattern(
      new RegExp(/^[a-zA-Z\u0600-\u06FF0-9\s!@#$%^&*()_+{}\[\]:;<>,.?~\\|/-]*$/)
    )
    .label(
      "password must be greater than 8 digits , contain numbers and chars"
    ),
  code: joi
    .string()
    .pattern(new RegExp(/^[0-9]{5}$/))
    .required()
    .label(`ادخل الكود كامل`),
};
