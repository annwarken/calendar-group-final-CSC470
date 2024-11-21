const mongoose = require("mongoose");

// Define a schema for the User model
const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        index: { unique: true }
    },
    password:{
        type:String,
        required:true
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
});

UserSchema.pre("save", async function (next) {
    // Simulate password hashing or other hooks
    console.log("Pre-save hook triggered");
    next();
});

// Create a mock User model
const User = mongoose.model("User", UserSchema);

module.exports = User;