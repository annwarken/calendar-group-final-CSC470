function ExitDetails() {
    // Closes the event details window and returns to the main page 
    // Sets currentEvent to null 
}

function SaveEvent() {
    // Uses currentEvent variable that is set on main page 
    // Updates the selected event in the database 
    // Returns status code (int)
}

function DeleteEvent() {
    // Uses currentEvent variable that is set on main page 
    // Removes the selected event from the database 
    // Returns status code (int)
}

// Buttons ///////////////////////////////

$('#delete-event').on('click', () => {
    // Calls DeleteEvent 
    // Calls ExitDetails() 
    // Returns to main page after deleting 
});

$('#save-event').on('click', () => {
    // Calls SaveEvent 
    // Calls ExitDetails() 
    // Returns to main page after saving 
});

$('#save-event').on('click', () => {
    // Calls ExitDetails() 
    // Returns to main page 
    // Any changes made are discarded 
});