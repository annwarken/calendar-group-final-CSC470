const mongoose=require("mongoose");

conn = mongoose.connect("mongodb+srv://client:qjEKnFxFYIFOPRrq@calendarcluster.igx4v.mongodb.net/Calendar")
.then(()=>{
    console.log("mongo db connected for tasks");
})
.catch(()=>{
    console.log("failed to connect to mongodb for tasks");
})

const TaskSchema = new mongoose.Schema({
    title:{ 
        type: String, 
        required: true 
    },
    description:{
        type: String, 
    },
    date:{ 
        type: Date, 
        required: true 
    },
    userID:{                                     
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isComplete:{
        type: Boolean,
        required: true,
    }
});

module.exports = mongoose.models.Task || mongoose.model("Task", TaskSchema);