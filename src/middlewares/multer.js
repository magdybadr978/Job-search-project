import multer from "multer";
import fs from 'fs'
import path from "path";
import { allowedExtensions } from "../utils/allowedExtensions.js";


export let multerMiddleHost = ({extensions = allowedExtensions.document})=>{

    let storage = multer.diskStorage({
        filename: (req,file,cb) =>{
            cb(null,file.originalname)
        }

    })

    let fileFilter = (req,file,cb) =>{
        if(extensions.includes(file.mimetype.split("/")[1])){
            return cb(null,true)
        }

        cb(new Error('format is not allowed!'),false)
    }

    let file = multer({fileFilter, storage })
    return file
}