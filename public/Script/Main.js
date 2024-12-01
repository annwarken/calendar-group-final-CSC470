let selectedDay = null;
let isEventEditModeEnabled = false;
let isTaskEditModeEnabled = false;
//store current date with proper dateStr format
let today = new Date();
let currentDay = today.getFullYear() + '-' + 
            String(today.getMonth() + 1).padStart(2, '0') + '-' + 
            String(today.getDate()).padStart(2, '0');

document.addEventListener('DOMContentLoaded', async function() {
    var calendarEl = document.getElementById('calendar');
    var eventButtonsEl = document.getElementById('eventList');
    var taskButtonsEl = document.getElementById('todoList');
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
      const eventResponse = await fetch(`/api/events?startDate=${selectedDay}`);
      if (eventResponse.ok) {
        const events = await eventResponse.json();
        updateEventButtons(events); // Update the side panel with events
      } else {
        console.error('Failed to fetch events for the selected day');
      }

      // Ftech tasks for the selected day
      const taskResponse = await fetch(`/api/tasks?date=${selectedDay}`);
      if (taskResponse.ok) {
        const tasks = await taskResponse.json();
        console.log(tasks);
        updateTaskButtons(tasks); // Update the side panel with tasks
      } else {
        console.error('Failed to fetch tasks for the selected day');
      }
    }

    function updateTaskButtons(tasks) {
        taskButtonsEl.innerHTML = ''; 
        if (tasks.length === 0) {
          taskButtonsEl.innerHTML = '<p>No tasks for this day</p>';
          return;
        }
        tasks.forEach((task) => {
          const button = document.createElement('button');
          button.classList.add('event-button');
          button.textContent = task.title;
          button.addEventListener('click', () => openTaskDetails(task.id));
          taskButtonsEl.appendChild(button);
        });
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


// Event Details Functionality //////////////////////////////////////////////////

// Open modal for creating a new event
function openCreateEvent()
{
    document.getElementById('modalTitle').textContent = 'Create New Event';
    document.getElementById('eventForm').reset(); // Clear form
    document.getElementById('event-start-date').value = selectedDay;
    document.getElementById('event-end-date').value = selectedDay;
    updateEventEditMode(true);
    document.getElementById('eventModal').style.display = 'block';
}

function openEventDetails(eventId) {
    fetch(`/api/event/details?eventId=${eventId}`)
    .then(response => {
        if (!response.ok) {
        throw new Error('Failed to fetch event details');
        }
        return response.json();
    })
    .then(eventData => {
        console.log("Opening event details for:", eventData);
        document.getElementById('modalTitle').textContent = 'Event Details';
        document.getElementById('eventId').value = eventData.id;
        document.getElementById('event-title').value = eventData.title;
        document.getElementById('event-description').value = eventData.description;
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        document.getElementById('event-start-date').value = startDate.toISOString().split('T')[0];
        document.getElementById('event-end-date').value = endDate.toISOString().split('T')[0];

        updateEventEditMode(false);
        document.getElementById('eventModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error loading event details:', error);
    });
}

// Enable editing of event details
function updateEventEditMode(editable) {
    isEventEditModeEnabled = editable;
    setEventMode();

    if(isEventEditModeEnabled)
    {
        document.getElementById('save-event').style.display = 'block';
        document.getElementById('edit-event').style.display = 'none';  
    }
    else
    {
        document.getElementById('save-event').style.display = 'none';
        document.getElementById('edit-event').style.display = 'block';
    }
    console.log("Event edit mode:", isEventEditModeEnabled);
}
  
// Helper function to toggle read-only state
function setEventMode() {
    document.getElementById('event-title').readOnly = !isEventEditModeEnabled;
    document.getElementById('event-description').readOnly = !isEventEditModeEnabled;
    document.getElementById('event-start-date').disabled = !isEventEditModeEnabled;
    document.getElementById('event-end-date').disabled = !isEventEditModeEnabled;
}

async function saveEvent()
{
    console.log("Needs to be implemented");
    closeEventModal();
}

async function deleteEvent()
{
    console.log("Needs to be implemented");
    closeEventModal();
}

function closeEventModal() {
    isEventEditModeEnabled = false;
    const modal = document.getElementById('eventModal');
    modal.style.display = 'none';  // Hide the modal
}

// Close modal if the background is clicked
window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}


// Task Details Functionality ////////////////////////////////////////////////////

// Open modal for creating a new task
function openTaskModal()
{
    document.getElementById('modalTitle').textContent = 'Create New Task';
    document.getElementById('taskForm').reset(); // Clear form
    document.getElementById('task-date').value = selectedDay;
    updateTaskEditMode(true);
    document.getElementById('taskModal').style.display = 'block';
}

function openTaskDetails(taskId) {
    fetch(`/api/task/details?taskId=${taskId}`)
    .then(response => {
        if (!response.ok) {
        throw new Error('Failed to fetch task details');
        }
        return response.json();
    })
    .then(taskData => {
        console.log("Opening task details for:", taskData);
        document.getElementById('modalTitle').textContent = 'Task Details';
        document.getElementById('taskId').value = taskData.id;
        document.getElementById('task-title').value = taskData.title;
        document.getElementById('task-description').value = taskData.description;
        const Date = new Date(taskData.Date);
        document.getElementById('task-date').value = Date.toISOString().split('T')[0];
        
        updateTaskEditMode(false);
        document.getElementById('taskModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error loading task details:', error);
    });
}

// Enable editing of event details
function updateTaskEditMode(editable) {
    isTaskEditModeEnabled = editable;
    setTaskMode();

    if(isTaskEditModeEnabled)
    {
        document.getElementById('save-task').style.display = 'block';
        document.getElementById('edit-task').style.display = 'none';  
    }
    else
    {
        document.getElementById('save-task').style.display = 'none';
        document.getElementById('edit-task').style.display = 'block';
    }
    console.log("Task edit mode:", isTaskEditModeEnabled);
}
  
// Helper function to toggle read-only state
function setTaskMode() {
    document.getElementById('task-title').readOnly = !isTaskEditModeEnabled;
    document.getElementById('task-description').readOnly = !isTaskEditModeEnabled;
    document.getElementById('task-date').disabled = !isTaskEditModeEnabled;
}

async function saveTask()
{
    console.log("Needs to be implemented");
    closeTaskModal();
}

async function deleteTask()
{
    console.log("Needs to be implemented");
    closeTaskModal();
}

function closeTaskModal() {
    isTaskEditModeEnabled = false;
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';  // Hide the modal
}

// Close modal if the background is clicked
window.onclick = function(task) {
    const modal = document.getElementById('taskModal');
    if (task.target == modal) {
        modal.style.display = 'none';
    }
}

  
// Logout Functionality //////////////////////////////////////////////////////////////

window.addEventListener("load", function() {
  let logoutButton = document.querySelector("#logout");

  //clears cookies and returns user to login page
  logoutButton.addEventListener("click", function() {
      console.log("/Logout");
      window.location.href = "/Logout";
  });
});