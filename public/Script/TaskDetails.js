function ExitDetails() {
    // Closes the event details window and returns to the main page 
    // Sets currentEvent to null 
}

function SaveTask() {
    // Uses currentEvent variable that is set on main page 
    // Updates the selected event in the database 
    // Returns status code (int)
}

function DeleteTask() {
    // Uses currentEvent variable that is set on main page 
    // Removes the selected event from the database 
    // Returns status code (int)
}

// Buttons ///////////////////////////////

$('#delete-task').on('click', () => {
    // Calls DeleteTask
    // Calls ExitDetails() 
    // Returns to main page after deleting 
});

$('#save-task').on('click', () => {
    // Calls SaveTask
    // Calls ExitDetails() 
    // Returns to main page after saving 
});

$('#exit').on('click', () => {
    // Calls ExitDetails() 
    // Returns to main page 
    // Any changes made are discarded 
});