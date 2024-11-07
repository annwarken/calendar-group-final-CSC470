function ExitDetails() {
    // Closes the task details window and returns to the main page 
    // Sets currentTask to null 
}

function SaveTask() {
    // Uses currentTask variable that is set on main page 
    // Updates the selected task in the database 
    // Returns status code (int)
}

function DeleteTask() {
    // Uses currentTask variable that is set on main page 
    // Removes the selected task from the database 
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

$('#exit-task-details').on('click', () => {
    // Calls ExitDetails() 
    // Returns to main page 
    // Any changes made are discarded 
});