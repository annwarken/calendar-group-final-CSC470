const mongoose=require("mongoose");

conn = mongoose.connect("mongodb+srv://client:qjEKnFxFYIFOPRrq@calendarcluster.igx4v.mongodb.net/Calendar")
.then(()=>{
    console.log("mongo db connected");
})
.catch(()=>{
    console.log("failed to connect to mongodb");
})

const EventSchema = new mongoose.Schema({
    title:{ 
        type: String, 
        required: true 
    },
    description:{
        type: String, 
        required: true 
    },
    startDate:{ 
        type: Date, 
        required: true 
    },
    endDate:{ 
        type: Date, 
    },
    createdBy:{                                     
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

module.exports = mongoose.models.Event || mongoose.model("Event", EventSchema);