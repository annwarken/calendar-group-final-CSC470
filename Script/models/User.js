const mongoose=require("mongoose"),
    Schema = mongoose.Schema,
    bcrypt = require("bcrypt"),
    SALT_WORK_FACTOR = 10;

conn = mongoose.connect("mongodb+srv://client:qjEKnFxFYIFOPRrq@calendarcluster.igx4v.mongodb.net/Calendar")
.then(()=>{
    console.log("mongo db connected");
})
.catch(()=>{
    console.log("failed to connect to mongodb");
})

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
})

// this code is from https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
UserSchema.pre('save', function (next) {
    const user = this;
  
    if (!user.isModified('password')) return next();
  
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
      if (err) return next(err);
  
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
  
        user.password = hash;
        next();
      });
    });
  });

// this code is from https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
UserSchema.methods.comparePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

const User = new mongoose.model("User", UserSchema)
module.exports = User;