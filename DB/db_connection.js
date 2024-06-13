import mongoose from 'mongoose'

const connectDB = async () => {
    return await mongoose.connect(process.env.URL_CONNECTION).then(res => {
        console.log("DB Connected Successfully");
    }).catch(err => {
        console.log(`Fail to connectDB  ${err}`);
    });

}
// mongoose.set('strictQuery', false);

export default connectDB;   