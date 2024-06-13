import { Schema, model } from "mongoose";
import { jobLocation, seniorityLevel, workingTime } from "../../src/utils/enum.js";

let jobSchema = new Schema({
    jobTitle:{
        type:String,
        required:true
    },
    jobLocation:{
        type: String,
        enum: Object.values(jobLocation),
        default: jobLocation.On_Site,
        required:true
    },
    workingTime:{
        type:String,
        enum: Object.values(workingTime),
        default: workingTime.FullTime,
        required:true
        },
    seniorityLevel :{
        type:String,
        enum: Object.values(seniorityLevel),
        default: seniorityLevel.Junior,
        required:true
    },
    jobDescription:{
        type:String,
        default:"job Description"
    },
    technicalSkills: {type : [] , required : true},
    softSkills: { type : [] , required : true},
    //we'll refere to the user id that is equal to the HR who added the job
    addBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    //Applications:[{}],
    companyEmail:{
      type:String,
      unique:true,
      trim : true
  },
},{timestamps:true})

const jobModel = model('Job', jobSchema)

export default jobModel