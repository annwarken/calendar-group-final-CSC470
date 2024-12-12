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


// Create a mock Task model
const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;