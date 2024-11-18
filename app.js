const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const User=require("./public/Script/models/User");
const Event=require("./public/Script/models/Event");
const path = require("path");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static("public"));
app.use("/Script", express.static(path.join(__dirname, "Script")));

// Current Session Variables
let SessionUser;
let SessionUserEvents;

// server functions
async function VerifyUser(username, password) {
    // calls GetUser(username) 
    // check database password with entered password 
    // returns bool
    try {
        // Find the user by username
        const user = await User.findOne({ username: username });
        
        //if user is not found return false and log
        if (user == null) {
            console.log("User not found");
            return false;
        }
        else {
            console.log("Found user: ", user.username);

            // Compare the provided password with the user's stored password
            const isMatch = await user.comparePassword(password);
            console.log(password, isMatch);
            return isMatch;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
}

// GET and POST functions
app.get("/", function(req, res) {
    res.redirect('/Login');
});

app.get("/Login", function(req, res) {
    let contents = fs.readFileSync("./html/LoginPage.html");
    res.header("Content-Type", "text/html");
    res.status(200);
    res.send(contents);
    res.end();
});

app.post("/Login", async function(req, res) {
    try{
        const {username, password} = req.body
        const CurrentUser = new User({
            username, password
        });

        //verify user
        const isVerified = await VerifyUser(username, password);

        if(isVerified) {
            //TODO: save data in cookie

            SessionUser = await User.findOne({ username });
            console.log(SessionUser);

            console.log('Successfully logged in!', CurrentUser._id);
            res.status(200);
            res.redirect("/Calendar");
            res.end();
        }
        else {
            //TODO: inform user login failed

            console.log("User could not be verified");
            res.status(401); //error code for unauthorized user
            res.redirect("/Login");
            res.end();
        }
        
    } catch (error) {
        console.error('Error creating account:', error);
        console.log('Internal server error')
    }
});

app.get("/CreateAccount", function(req, res) {
    let contents = fs.readFileSync("./html/CreateAccountPage.html");
    res.header("Content-Type", "text/html");
    res.status(200);
    res.send(contents);
    res.end();
});

app.post("/CreateAccount", function(req, res){
    try{
        const {username, password, firstname, lastname, email} = req.body
        const CurrentUser = new User({
            username, password, firstname, lastname, email
        })
        CurrentUser.save()
        console.log('Account created successfully!', CurrentUser._id)
        res.status(200);
        res.redirect('/Login');
        res.end();
    } catch (error) {
        console.error('Error creating account:', error);
        console.log('Internal server error')
    }
});

app.get("/Calendar", async function(req, res) {
    //TODO: check if user is logged in before loading

    let contents = fs.readFileSync("./html/MainPage.html");

    res.header("Content-Type", "text/html");
    res.status(200);
    res.send(contents);
    res.end();
});

// Assuming you have a session middleware to track logged-in user
app.get("/api/events", async function(req, res) {
    try {
        // TODO check if user is logged in

        // Find events for the logged-in user
        SessionUserEvents = await Event.find({ createdBy: SessionUser._id }).exec();

        // Map the events to the required format for FullCalendar
        const calendarEvents = SessionUserEvents.map(event => ({
            title: event.title,        // Event title
            start: event.date,         // Event start time
            description: event.description, // Event description
            id: event._id.toString()   // Event ID, this can be useful to update or delete events
        }));

        // Respond with the events in JSON format
        res.status(200).json(calendarEvents);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



const PORT = 8080;
// const HOST = '192.168.1.104'; //Server IP 192.168.1.104:8080
const HOST = '127.0.0.1'; //Local IP 127.0.0.1:8080
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });