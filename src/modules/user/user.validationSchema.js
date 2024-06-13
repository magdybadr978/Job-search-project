import joi from "joi";
import { Types } from "mongoose";
import { generalFields } from "../../middlewares/validationMiddleware.js";
import { roles } from "../../utils/enum.js";
import joiDate from '@joi/date';
const dateFormat = joi.extend(joiDate); 


const customDateValidator = (value, helpers) =>
{
    const regex = /^\d{4}-\d{2}-\d{2}$/
  
    if (!regex.test(value)) 
      return helpers.error('any.invalid')
    
    return value
}


export const signUpSchema = {
  body: joi
    .object()
    .required()
    .keys({
      firstName: generalFields.name
        .required()
        .label("first name must be between 2 to 20 char"),
      lastName: generalFields.name
        .required()
        .label("last name must be between 2 to 20 char"),
      email: generalFields.email.required().label("invalid email"),
      recoveryEmail: generalFields.email.label("invalid recovery email"),
      password: generalFields.password.required(),
      dateOfBirth: dateFormat
        .date()
        .format('YYYY-MM-DD')
        .required()
        .label("enter valid format for date of birth"),
      role: joi.string().label("enter valid role"),
      mobileNumber: generalFields.phone.required(),
      hintForPassword: joi.string().required().label("enter valid hint"),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const logInSchema = {
  body: joi
    .object()
    .required()
    .keys({
      email: generalFields.email.label("enter valid email"),
      password: generalFields.password.required(),
      mobileNumber: generalFields.phone,
    }).xor('email' , 'mobileNumber'),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const updateUserSchema = {
  body: joi
    .object()
    .required()
    .keys({
      firstName: generalFields.name.label("enter valid firstName"),
      lastName: generalFields.name.label("enter valid lastName"),
      email: generalFields.email.label("enter valid email"),
      RecoveryEmail: generalFields.email.label("enter valid recoveryEmail"),
      mobileNumber: generalFields.phone,
      dateOfBirth: dateFormat
        .date()
        .format('YYYY-MM-DD')
        .required()
        .label("enter valid format for date of birth"),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const deleteUserSchema = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const getUserSchema = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({
    id: generalFields.id,
  }),
  query: joi.object().required().keys({}),
};

export const updatePassSchema = {
  body: joi.object().required().keys({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const forgetPassSchema = {
  body: joi
    .object()
    .required()
    .keys({
      email: generalFields.email.required().label("enter valid email"),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const verifyOTPSchema = {
  body: joi
    .object()
    .required()
    .keys({
      email: generalFields.email.required().label("enter valid email"),
      encryptedOTP: joi.string().required(),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const resetPassSchema = {
  body: joi
    .object()
    .required()
    .keys({
      email: generalFields.email.required().label("enter valid email"),
      hintForPassword: joi.string().required(),
      newPassword: generalFields.password.required(),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const getByRecoverySchema = {
  body: joi
    .object()
    .required()
    .keys({
      recoveryEmail: generalFields.email
        .required()
        .label("enter valid recovery email"),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

