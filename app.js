const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

// Check if the environment is for testing
const isTestEnv = process.env.NODE_ENV === 'test';
console.log(isTestEnv);

// Conditionally load the User model based on environment
let Event;
let User;
if (isTestEnv) {
  // Use the mock user model for testing
  User = require("./tests/mocks/UserModelMock.js");
} else {
  // Use the actual user model for production
  User = require("./public/Script/models/User");
  Event=require("./public/Script/models/Event");
}
// const User=require("./public/Script/models/User");
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/Script", express.static(path.join(__dirname, "Script")));

// Current Session Variables
let SessionUser = null;
let SessionUserEvents = null;
let isVerified = false;
let isAuth = false;

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
async function AuthenticateUser(req, res) {
    //checks cookies to see if user has logged in
    //returns bool
    try {
        cookieValue = req.cookies?.UserSession;
        if (!cookieValue) {
            console.log("UserSession cookie not found");
            return false;
        }
        const user = await User.findOne({ _id: cookieValue });
        if (user == null) {
            console.log("User not Authenticated");
            return false;
        }
        else {
            console.log("Authenticated User: ", user._id);
            return true;
        }
    } catch (error) {
        console.error("Error during user authentication:", error);
        res.status(500).send("Internal Server Error");
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

app.post("/Login", async function (req, res) {
    try {
        const { username, password } = req.body;
        
        // Verify user credentials
        isVerified = await VerifyUser(username, password);

        if (isVerified) {
            // Set the session user
            SessionUser = await User.findOne({ username });

            //save id in cookie
            res.cookie("UserSession", SessionUser._id);

            console.log("Successfully logged in!", SessionUser._id);

            // Redirect to the calendar page after successful login
            return res.status(200).redirect("/Calendar");
        } else {
            console.log("User could not be verified");

            // Respond with an error message for invalid credentials
            return res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Error during login:", error);

        // Respond with an internal server error
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/Logout', (req, res) => {
    //clear cookies and send user to login page
    res.clearCookie('UserSession');
    console.log('Logged out user: ', SessionUser._id);
    SessionUser = null;
    res.redirect('/Login');
  });

app.get("/CreateAccount", function(req, res) {
    let contents = fs.readFileSync("./html/CreateAccountPage.html");
    res.header("Content-Type", "text/html");
    res.status(200);
    res.send(contents);
    res.end();
});

app.post("/CreateAccount", async function(req, res){
    try{
        const {username, password, firstname, lastname, email} = req.body

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("Username is already in use:", username);

            // Send error response if username is taken
            return res.status(409).json({ error: "Username is already in use" }); // 409 Conflict
        }

        // Create a new user with a unique username
        const CurrentUser = new User({
            username, password, firstname, lastname, email
        });

        await CurrentUser.save();

        // account is created successfully
        console.log('Account created successfully!', CurrentUser._id);
        res.status(200).redirect('/Login');
    } catch (error) {
        if (error.name === "ValidationError") {
            const missingFields = Object.keys(error.errors).map(field => field);
            console.log("Missing required fields:", missingFields);
            return res.status(400).json({
                error: "Missing required fields",
                fields: missingFields
            });
        }
        // unexpected errors
        console.error('Internal server error: ', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/Calendar", async function(req, res) {
    //check if user has logged in
    isAuth = await AuthenticateUser(req, res);
    if(isAuth) {
        console.log("User authenticated successfully");
    }
    else {
        console.log("Failed to authenticate user");
        return res.status(200).redirect('/Login');
    }

    let contents = fs.readFileSync("./html/MainPage.html");

    res.header("Content-Type", "text/html");
    res.status(200);
    res.send(contents);
    res.end();
});

app.get("/api/events", async function(req, res) {
    try {
        //check if user has logged in
        isAuth = await AuthenticateUser(req, res);
        if(isAuth) {
            console.log("User authenticated successfully");
        }
        else {
            console.log("Failed to authenticate user");
            return res.status(200).redirect('/Login');
        }

        // Get the current date if given
        const { date } = req.query;

        let query = { createdBy: SessionUser._id };

         // If a specific date is provided, filter events for that day
        if (date) {
            // Parse the date to get the start and end of the day
            const startOfDay = new Date(date);
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);
            console.log("Start of Day:", startOfDay);
            console.log("End of Day:", endOfDay);

            query.date = { $gte: startOfDay, $lt: endOfDay };
        }

        // Find events for the logged-in user
        SessionUserEvents = await Event.find(query).exec();

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

module.exports = app;

if(!isTestEnv)
{
    const PORT = 8080;
    // const HOST = '192.168.1.104'; //Server IP 192.168.1.104:8080
    const HOST = '127.0.0.1'; //Local IP 127.0.0.1:8080
    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
      });
}