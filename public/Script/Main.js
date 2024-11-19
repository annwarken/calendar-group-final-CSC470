document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: function(fetchInfo) {
            // Dynamically fetch events based on the calendar's visible range
            return fetch('../../api/events')  // Replace with your backend's endpoint
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();  // Parse response JSON
                })
                .then(data => {
                    console.log("Fetched events:", data);
                    return data;  // Provide events to FullCalendar
                })
                .catch(error => {
                    console.error('Error fetching events:', error);
                    return [];  // Provide an empty array on error
                });
        }

    });
    calendar.render();
  });









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