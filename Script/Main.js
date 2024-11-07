function LoadMain() {
    // Renders calendar  
    // GetEvent(currentEvent.ID) - displays details on page 
    // GetTask(currentTask.ID) - displays details on page 
}

function LoadEventDetails() {
    // Loads the Event Details page // using global currentEvent variable 
    // If not an empty event fill in info 
    // Else if empty leave blank 
    // Disable background while page is open  
}

function getEvent(id) {
    // Database call to get event details 
    // Return event with filled details 
}

function LoadTaskDetails() {
    // Loads the Task Details page // using global currentTask variable 
    // If not an empty task fill in info 
    // Else if empty leave blank 
    // Disable background while page is open  
}

function getTask(id) {
    // Database call to get task details 
    // Return task with filled details 
}

// Buttons ///////////////////////////////

$('#select-day').on('click', () => {
    // currentDay = day selected  
    // Calls LoadMain() 
});

$('#edit-event').on('click', () => {
    // CurrentEvent = getEvent(ID) //id of event clicked 
    // LoadEventDetails() 
});

$('#add-event').on('click', () => {
    // CurrentEvent = new empty event  
    // LoadEventDetails() 
});

$('#edit-task').on('click', () => {
    // CurrentEvent = getTask(ID) //id of task clicked 
    // LoadTaskDetails() 
});

$('#add-task').on('click', () => {
    // CurrentTask = new empty task  
    // LoadTaskDetails() 
});