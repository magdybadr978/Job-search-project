import { Schema, model } from "mongoose";

const applicationSchema = new Schema({
    jobId:{
        type: Schema.Types.ObjectId,
        ref:"Job",
        required:true
    },
    applierId:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    TechSkills:{
      type : [String],
      default : []
    },
    SoftSkills: {
      type : [String],
      default : []
    },
    //we'll refere to the user id that is equal to the HR who added the job
    userResume: [{
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true },
        
    }],
    folderId:String,
    applyDate : {type : String },
    // specs : {
    //   type : Map,
    //   of : [String | Number]
    // }

},{timestamps:true})

const applicationModel = model('Application', applicationSchema)

export default applicationModel