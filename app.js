const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

const { DateTime } = require("luxon");

// Check if the environment is for testing
const isTestEnv = process.env.NODE_ENV === 'test';
console.log("Testing:", isTestEnv);

// Conditionally load the User model based on environment
let Event;
let Task;
let User;

if (isTestEnv) {
  // Use the mock user model for testing
  User = require("./tests/mocks/UserModelMock.js");
} else {
  // Use the actual models for production
  User = require("./public/Script/models/User");
  Event=require("./public/Script/models/Event");
  Task = require("./public/Script/models/Task");
}

const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/Script", express.static(path.join(__dirname, "Script")));

// Current Session Variables
let SessionUser = null;
let SessionUserEvents = null;
let SessionUserTasks = null;
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
            SessionUser = user;
            return true;
        }
    } catch (error) {
        console.error("Error during user authentication:", error);
        res.status(500).send("Internal Server Error");
        return false;
    }
}

// GET and POST functions
// And DELETE functions
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

app.get("/api/user", async function(req, res){
    try{
        //check if user has logged in
        isAuth = await AuthenticateUser(req, res);
        if(isAuth) {
            console.log("User authenticated successfully");
        }
        else {
            console.log("Failed to authenticate user");
            return res.status(200).redirect('/Login');
        }
        res.status(200).json({firstname: SessionUser.firstname, lastname: SessionUser.lastname});
    }
    catch(error)
    {
        console.error('Error getting user details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API fucntions
app.post("/api/save/task", async function(req, res) {
    try {
        const { title, description, date, isComplete } = req.body;
        let newTask = new Task({ title, description, date, userID: SessionUser._id, isComplete });
        await newTask.save();
        res.status(201).send({ message: 'Task created successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to create task' });
    }
});

app.put("/api/save/task/:id", async function(req, res){
    const { id } = req.params;
    console.log("Updating task on server:", req.body);
    const { title, description, date, isComplete } = req.body;
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { title, description, date, isComplete }, { new: true });
        console.log("Updated task: ", updatedTask);
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }    
});

app.post("/api/save/event", async function(req, res){
    try{
        const { title, description, startDate, endDate } = req.body;
        let newEvent = new Event(title, description, startDate, endDate, SessionUser._id);
        await Event.create(newEvent);
        res.status(201).send({ message: 'Event created successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to save event' });
    }
});

app.put("/api/save/event/:id", async function(req, res){
    const { id } = req.params;
    console.log("Saving event on server:", req.body);
    const { title, description, startDate, endDate } = req.body;
    try {
        const updatedEvent = await Event.findByIdAndUpdate(id, { title, description, startDate, endDate }, { new: true });
        console.log("Updated event: ", updatedEvent);
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
    }
});

app.get("/api/event/details", async function(req, res){
    try{
        //check if user has logged in
        isAuth = await AuthenticateUser(req, res);
        if(isAuth) {
            console.log("User authenticated successfully");
        }
        else {
            console.log("Failed to authenticate user");
            return res.status(200).redirect('/Login');
        }

        // get eventId
        const { eventId } = req.query;
        console.log("Fetching event details for:", eventId);

        let query = { _id: eventId };

        eventDetails = await Event.findOne(query).exec();
        console.log("Event title: ", eventDetails.title);
        res.status(200).json(eventDetails);    
    }
    catch(error)
    {
        console.error('Error fetching event details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/api/events", async function(req, res) {
    try {
        // Check if user is authenticated
        const isAuth = await AuthenticateUser(req, res);
        if (isAuth) {
            console.log("User authenticated successfully");
        } else {
            console.log("Failed to authenticate user");
            return res.status(200).redirect('/Login');
        }

        const { startDate, timezone } = req.query;

        let query = { createdBy: SessionUser._id };

        if (startDate && timezone !== undefined) {
            const localDate = DateTime.fromISO(startDate).plus({ minutes: parseInt(timezone) });

            const startOfDayUTC = localDate.startOf('day').toUTC().toJSDate();  
            const endOfDayUTC = localDate.endOf('day').toUTC().toJSDate();

            console.log("Start of Day (UTC):", startOfDayUTC);
            console.log("End of Day (UTC):", endOfDayUTC);

            // Update the query to filter events within the selected date range
            query.$and = [
                { startDate: { $lt: endOfDayUTC } },  
                { endDate: { $gte: startOfDayUTC } }
            ];
        }

        // Find events for the logged-in user
        const SessionUserEvents = await Event.find(query).exec();

        // Map the events to the required format for FullCalendar
        const calendarEvents = SessionUserEvents.map(event => ({
            title: event.title,             // Event title
            start: event.startDate,         // Event start time
            end: event.endDate,             // Event end time
            description: event.description, // Event description
            id: event._id.toString()        // Event ID
        }));

        // Respond with the events in JSON format
        res.status(200).json(calendarEvents);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete("/api/delete/event/:id", async function(req, res) {
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

        const { id } = req.params;
        console.log("Received event ID for deletion:", id);

        // Delete the event
        const deleteResult = await Event.deleteOne({ _id: id});
        console.log("Delete result:", deleteResult);

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "Event not found or unauthorized" });
        }

        console.log("Deleted event with ID:", id);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event', details: error.message });
    }
});

app.get("/api/task/details", async function(req, res) {
    try{
        //check if user has logged in
        isAuth = await AuthenticateUser(req, res);
        if(isAuth) {
            console.log("User authenticated successfully");
        }
        else {
            console.log("Failed to authenticate user");
            return res.status(200).redirect('/Login');
        }

        // get taskId
        const { taskId } = req.query;
        console.log("Fetching task details for:", taskId);

        let query = { _id: taskId };

        taskDetails = await Task.findOne(query).exec();
        console.log("Task title: ", taskDetails.title);
        res.status(200).json(taskDetails);    
    }
    catch(error)
    {
        console.error('Error fetching event details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/api/tasks", async function(req, res) {
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

        let query = {userID: SessionUser._id}

        // Get the selected date
        let { date } = req.query;
        if (date) {
            const startOfDay = new Date(date);
            const endOfDay = new Date(startOfDay); 
            endOfDay.setDate(startOfDay.getDate() + 1); 

            console.log("Start of Day:", startOfDay);
            console.log("End of Day:", endOfDay);
                    
            query.$and = [
                { date: { $lt: endOfDay } }, 
                { date: { $gte: startOfDay } }
            ];   
        }

        // Find tasks for the logged-in user
        SessionUserTasks = await Task.find(query).exec();

        // Respond with the tasks in JSON format
        res.status(200).json(SessionUserTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put("/api/task/complete", async function(req, res){
    try
    {
        //check if user has logged in
        isAuth = await AuthenticateUser(req, res);
        if(isAuth) {
            console.log("User authenticated successfully");
        }
        else {
            console.log("Failed to authenticate user");
            return res.status(200).redirect('/Login');
        }

        // get the task id and status
        const { id, isComplete } = req.query;

        let updatedTask = await Task.findByIdAndUpdate(id, { isComplete: isComplete }, {new: true})

        // check if the task was updated
        if (!updatedTask)
        {
            console.error('Task not found');
            res.status(500).json({ message: 'Internal server error' });
        }
        else {
            console.log('Updated Task:', updatedTask._id);
            res.status(200).json(updatedTask);
        }
    } catch (error)
    {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete("/api/delete/task/:id", async function(req, res) {
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

        const { id } = req.params;
        console.log("Received task ID for deletion:", id);

        // Delete the task
        const deleteResult = await Task.deleteOne({ _id: id});
        console.log("Delete result:", deleteResult);

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "Task not found or unauthorized" });
        }

        console.log("Deleted task with ID:", id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task', details: error.message });
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