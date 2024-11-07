const mongoose=require("mongoose")

conn = mongoose.connect("mongodb+srv://client:qjEKnFxFYIFOPRrq@calendarcluster.igx4v.mongodb.net/")
.then(()=>{
    console.log("mongo db connected");
})
.catch(()=>{
    console.log("failed to connect to mongodb");
})

const UserSchema=new mongoose.Schema({
    usename:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
})

const UserCollection = new mongoose.model("User", UserSchema)
module.exports=UserCollection