import { Schema, model } from "mongoose";
import { roles, userStatus } from "../../src/utils/enum.js";

let userSchema = new Schema({

    firstName: {
        type: String,
        required: true,
        lowercase : true,
        trim : true
    },
    lastName: {
        type: String,
        required: true,
        lowercase : true,
        trim : true
    },
    userName: {
        type: String,
        set: function() {
        return `${this.firstName} ${this.lastName}`;
    }},
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    recoveryEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim : true
    },
    dateOfBirth: {
        type: String,
        required : true,
        trim : true
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.User
    },
    mobileNumber:{
        type: String,
        required:true,
        unique: true,
        trim : true
    },
    status:{
        type: String,
        enum: Object.values(userStatus),
        default: userStatus.Offline
    },
  hintForPassword : {
    type : String,
    required : true
  },
  encryptedOTP : String,
  OTP : String
}, {timestamps:true})


const userModel = model('User', userSchema)

export default userModel