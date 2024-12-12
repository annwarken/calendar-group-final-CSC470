const mongoose=require("mongoose");

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

module.exports = mongoose.models.Event || mongoose.model("Event", EventSchema);