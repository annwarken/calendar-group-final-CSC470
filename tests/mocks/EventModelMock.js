const mongoose=require("mongoose");

conn = mongoose.connect("mongodb+srv://client:qjEKnFxFYIFOPRrq@calendarcluster.igx4v.mongodb.net/Calendar")
.then(()=>{
    console.log("mongo db connected for events");
})
.catch(()=>{
    console.log("failed to connect to mongodb for events");
})

const EventSchema = new mongoose.Schema({
    title:{ 
        type: String, 
        required: true 
    },
    description:{
        type: String, 
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

// Create a mock Event model
const Event = mongoose.model("Event", EventSchema);

module.exports = Event;