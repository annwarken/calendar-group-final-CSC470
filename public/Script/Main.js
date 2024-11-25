let selectedDay = null;
//store current date with proper dateStr format
let today = new Date();
let currentDay = today.getFullYear() + '-' + 
            String(today.getMonth() + 1).padStart(2, '0') + '-' + 
            String(today.getDate()).padStart(2, '0');

document.addEventListener('DOMContentLoaded', async function() {
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
            //update events/tasks when clicking date
            updateDayClick(info.dateStr);
        }    
    });

    calendar.render();

    //update the events/tasks when page first loads
    await updateDayClick(currentDay);

    async function updateDayClick(date) {
      // Remove the highlighting from the previously selected day
      if (selectedDay) {
        const oldSelectedDay = document.querySelector(`[data-date="${selectedDay}"]`);
        if (oldSelectedDay) {
          oldSelectedDay.classList.remove('selected-day');
        }
      }

      // Update the selected day variable
      selectedDay = date;

      // Highlight the new selected day
      const newSelectedDay = document.querySelector(`[data-date="${selectedDay}"]`);
      if (newSelectedDay) {
        newSelectedDay.classList.add('selected-day');
      }

      // Fetch events for the selected day
      const response = await fetch(`/api/events?startDate=${selectedDay}`);
      if (response.ok) {
        const events = await response.json();
        updateEventButtons(events); // Update the side panel with events
      } else {
        console.error('Failed to fetch events for the selected day');
      }
    }

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