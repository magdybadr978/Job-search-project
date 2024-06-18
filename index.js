import express from 'express'
import { config } from 'dotenv'
import userRouter from './src/modules/user/user.router.js'
import companyRouter from './src/modules/company/company.router.js'
import jobRouter from './src/modules/job/job.router.js'
import applicationRouter from './src/modules/application/application.router.js'
import connectDB from './DB/db_connection.js'
import { globalErrorHandling } from './src/utils/errorHandling.js'
import applicationModel from './DB/models/application.model.js'

config({path: './config/dev.config.env'})

const app = express()

const port = process.env.PORT || 5000

app.use(express.json())

app.use('/user', userRouter)
app.use('/company', companyRouter)
app.use('/job', jobRouter)
app.use('/application', applicationRouter)

app.use(globalErrorHandling) 

connectDB()

app.listen(port, ()=> console.log(`server is running on port ${port}`))
