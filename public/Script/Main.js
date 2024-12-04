let selectedDay = null;
let isEventEditModeEnabled = false;
let isTaskEditModeEnabled = false;
//store current date with proper dateStr format
let today = new Date();
let currentDay = today.getFullYear() + '-' + 
            String(today.getMonth() + 1).padStart(2, '0') + '-' + 
            String(today.getDate()).padStart(2, '0');

let CurrentUser = "";
async function getUserFirstName() {
    const userResponse = await fetch(`/api/user`);
    if (userResponse.ok) {
        CurrentUser = await userResponse.json();
        console.log(CurrentUser);
        let welcomeMessage = document.querySelector("h1");
        welcomeMessage.textContent = `Welcome, ${CurrentUser.firstname} ${CurrentUser.lastname}`;
    } else {
        console.error('Failed to fetch events for the selected day');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    getUserFirstName();    

    var calendarEl = document.getElementById('calendar');
    var eventButtonsEl = document.getElementById('eventList');
    var taskButtonsEl = document.getElementById('todoList');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        timeZone: 'CT',
        events: function(fetchInfo) {
            // Dynamically fetch events based on the calendar's visible range
            return fetch('../../api/events') 
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
        },
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

      // Fetch tasks for the selected day
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
            //task container
            let taskItem = document.createElement('div');
            taskItem.classList.add('task-item');

            //checkbox
            let taskCheckbox = document.createElement('input');
            taskCheckbox.type = 'checkbox';
            taskCheckbox.classList.add('task-checkbox');
            taskCheckbox.checked = task.isComplete;
            //update completion in database on check
            taskCheckbox.addEventListener('change', () => {
                //strikethrough text when box is clicked
                if (taskCheckbox.checked) {
                    taskButton.style.textDecoration = 'line-through';
                    checkTask(task._id, true);
                } else {
                    taskButton.style.textDecoration = 'none';
                    checkTask(task._id, false);
                }
            });

            //button
            let taskButton = document.createElement('button');
            taskButton.classList.add('task-button');
            taskButton.textContent = task.title;
            if (task.isComplete) {
                taskButton.style.textDecoration = 'line-through';
            }
            taskButton.addEventListener('click', () => openTaskDetails(task._id));

            taskItem.appendChild(taskCheckbox);
            taskItem.appendChild(taskButton);
            taskButtonsEl.appendChild(taskItem);
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
    async function checkTask(taskID, isComplete) {
        const response = await fetch(`/api/task/complete?id=${taskID}&isComplete=${isComplete}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const result = await response.json();
            console.log('Task update successful:', result);
        } else {
            console.error('Failed to update task completion');
        }
    }
});


// Event Details Functionality //////////////////////////////////////////////////

// Open modal for creating a new event
function openCreateEvent()
{
    closeTaskModal();
    document.getElementById('eventModalTitle').textContent = 'Create New Event';
    document.getElementById('eventForm').reset(); // Clear form
    document.getElementById('event-start-date').value = selectedDay;
    document.getElementById('event-end-date').value = selectedDay;
    updateEventEditMode(true);
    document.getElementById('eventModal').style.display = 'block';
}

function openEventDetails(eventId) {
    closeTaskModal();
    fetch(`/api/event/details?eventId=${eventId}`)
    .then(response => {
        if (!response.ok) {
        throw new Error('Failed to fetch event details');
        }
        return response.json();
    })
    .then(eventData => {
        console.log("Opening event details for:", eventData);
        document.getElementById('eventModalTitle').textContent = 'Event Details';
        document.getElementById('eventId').value = eventData._id;
        document.getElementById('event-title').value = eventData.title;
        document.getElementById('event-description').value = eventData.description;
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        document.getElementById('event-start-date').value = startDate.toISOString().split('T')[0];
        document.getElementById('event-end-date').value = endDate.toISOString().split('T')[0];
        const time = startDate.toISOString().split('T')[1].split('Z')[0];
        document.getElementById('event-time').value = time;

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
    document.getElementById('event-time').disabled = !isEventEditModeEnabled;
}

async function saveEvent()
{
    console.log("Needs to be implemented");
    closeEventModal();
}

async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/api/event/${eventId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message); // Show success message
            // Remove the event from UI
            document.getElementById(eventId).remove();
            closeEventModal();
        } else {
            const error = await response.json();
            alert(`Failed to delete event: ${error.error}`);
        }
    } catch (err) {
        console.error("Error deleting event:", err);
    }
}

function closeEventModal() {
    isEventEditModeEnabled = false;
    let eventModal = document.getElementById('eventModal');
    eventModal.style.display = 'none';  // Hide the modal
}

// Task Details Functionality ////////////////////////////////////////////////////

// Open modal for creating a new task
function openCreateTask()
{
    closeEventModal();
    document.getElementById('taskModalTitle').textContent = 'Create New Task';
    document.getElementById('taskForm').reset(); // Clear form
    document.getElementById('task-date').value = selectedDay;
    updateTaskEditMode(true);
    document.getElementById('taskModal').style.display = 'block';
}

function openTaskDetails(taskId) {
    closeEventModal();

    fetch(`/api/task/details?taskId=${taskId}`)
    .then(response => {
        if (!response.ok) {
        throw new Error('Failed to fetch task details');
        }
        return response.json();
    })
    .then(taskData => {
        console.log("Opening task details for:", taskData);
        document.getElementById('taskModalTitle').textContent = 'Task Details';
        document.getElementById('taskId').value = taskData._id;
        document.getElementById('task-title').value = taskData.title;
        document.getElementById('task-description').value = taskData.description;
        const date = new Date(taskData.date);
        document.getElementById('task-date').value = date.toISOString().split('T')[0];
        
        updateTaskEditMode(false);
        document.getElementById('taskModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error loading task details:', error);
    });
}

// Enable editing of task details
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

async function deleteTask(taskID)
{
    try {
        const response = await fetch(`/api/task/${taskId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message); // Show success message
            // Remove the task from UI
            document.getElementById(taskId).remove();
            closeTaskModal();
        } else {
            const error = await response.json();
            alert(`Failed to delete task: ${error.error}`);
        }
    } catch (err) {
        console.error("Error deleting task:", err);
    }
}

function closeTaskModal() {
    isTaskEditModeEnabled = false;
    let taskModal = document.getElementById('taskModal');
    taskModal.style.display = 'none';  // Hide the modal
}
  
// Close modal if the background is clicked
window.onclick = function(event) {
    if (event.target.id === 'eventModal') {
      closeEventModal();
    } else if (event.target.id === 'taskModal') {
      closeTaskModal();
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