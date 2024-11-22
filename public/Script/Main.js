let selectedDay = null;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var eventButtonsEl = document.getElementById('eventList');
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
        },
        dateClick: async function (info) {
            /*// Remove the highlighting from the previously selected day
            if (selectedDay) {
                const oldSelectedDay = document.querySelector(`[data-date="${selectedDay}"]`);
                if (oldSelectedDay) {
                  oldSelectedDay.classList.remove('selected-day');
                }
              }*/

            // Update the selected day variable
            selectedDay = info.dateStr;

            /*// Highlight the new selected day
            const newSelectedDay = document.querySelector(`[data-date="${selectedDay}"]`);
            if (newSelectedDay) {
              newSelectedDay.classList.add('selected-day');
            }*/
      
            // Fetch events for the selected day
            const response = await fetch(`/api/events?date=${selectedDay}`);
            if (response.ok) {
              const events = await response.json();
              updateEventButtons(events); // Update the side panel with events
            } else {
              console.error('Failed to fetch events for the selected day');
            }
          }
    });

    calendar.render();

    function updateEventButtons(events) {
        eventButtonsEl.innerHTML = ''; 
        if (events.length === 0) {
          eventButtonsEl.innerHTML = '<p>No events for this day</p>';
          return;
        }
        events.forEach((event) => {
          const button = document.createElement('button');
          button.classList.add('event-button');
          button.textContent = event.title;
          button.addEventListener('click', () => openEventDetails(event.id));
          eventButtonsEl.appendChild(button);
        });
      }
  });

  window.addEventListener("load", function() {
    let logoutButton = document.querySelector("#logout");

    //clears cookies and returns user to login page
    logoutButton.addEventListener("click", function() {
        console.log("/Logout");
        window.location.href = "/Logout";
    });
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