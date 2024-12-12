const mongoose=require("mongoose");

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