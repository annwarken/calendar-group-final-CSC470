const { DateTime } = luxon;
let selectedDate = new Date();

let isEventEditModeEnabled = false;
let isTaskEditModeEnabled = false;

let calendar;

var eventButtonsEl = document.getElementById('eventList');
var taskButtonsEl = document.getElementById('todoList');

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
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
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
        eventClick: function (info) {
            //opens details page when clicking calendar event
            openEventDetails(info.event.id)
        }
    });

    calendar.render();

    //update the events/tasks when page first loads
    console.log(DateTime.fromISO(selectedDate.toISOString()).toFormat("yyyy-MM-dd"));
    await updateDayClick(DateTime.fromISO(selectedDate.toISOString()).toFormat("yyyy-MM-dd"));
});

async function updateDayClick(date) {
    // Remove the highlighting from the previously selected day
    if (selectedDate) {
      const oldselectedDate = document.querySelector(`[data-date="${selectedDate.toISOString().split('T')[0]}"]`);
      if (oldselectedDate) {
        oldselectedDate.classList.remove('selected-day');
      }
    }

    // Update the selected day variable
    selectedDate = new Date(date);

    // Highlight the new selected day
    const newSelectedDate = document.querySelector(`[data-date="${selectedDate.toISOString().split('T')[0]}"]`);
    if (newSelectedDate) {
        newSelectedDate.classList.add('selected-day');
    }

    // Fetch events for the selected day
    console.log(`/api/events?startDate=${selectedDate.toISOString()}&timezone=${selectedDate.getTimezoneOffset()}`);
    const eventResponse = await fetch(`/api/events?startDate=${selectedDate.toISOString()}&timezone=${selectedDate.getTimezoneOffset()}`);
    const taskResponse = await fetch(`/api/tasks?date=${selectedDate.toISOString()}`);
    if (eventResponse.ok) {
      const events = await eventResponse.json();
      updateEventButtons(events); // Update the side panel with events
    } else {
      console.error('Failed to fetch events for the selected day');
    }

    // Fetch tasks for the selected day
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

// Event Details Functionality //////////////////////////////////////////////////

// Open modal for creating a new event
function openCreateEvent()
{
    closeTaskModal();
    document.getElementById('eventModalTitle').textContent = 'Create New Event';
    document.getElementById('eventForm').reset();

    const startDate = new Date(selectedDate.toISOString().substring(0,10) + "T00:00");
    const endDate = new Date(selectedDate.toISOString().substring(0,10) + "T02:00");
    document.getElementById('event-start-datetime').value = startDate.toISOString().slice(0, 16);
    document.getElementById('event-end-datetime').value = endDate.toISOString().slice(0, 16);
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
        const startDate = DateTime.fromISO(eventData.startDate).toFormat("yyyy-MM-dd'T'HH:mm");
        const endDate = DateTime.fromISO(eventData.endDate).toFormat("yyyy-MM-dd'T'HH:mm");
        document.getElementById('event-start-datetime').value = startDate;
        document.getElementById('event-end-datetime').value = endDate;

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
    document.getElementById('event-title').disabled = !isEventEditModeEnabled;
    document.getElementById('event-description').disabled = !isEventEditModeEnabled;
    document.getElementById('event-start-datetime').disabled = !isEventEditModeEnabled;
    document.getElementById('event-end-datetime').disabled = !isEventEditModeEnabled;
}

async function saveEvent() {
    const id = document.getElementById('eventId').value;
    const title = document.getElementById('event-title').value; 
    const description = document.getElementById('event-description').value;
    const startDate = new Date(document.getElementById('event-start-datetime').value); 
    const endDate = new Date(document.getElementById('event-end-datetime').value); 

    const eventData = { 
        title, 
        description, 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    };

    const url = id ? `/api/save/event/${id}` : '/api/save/event';
    const method = id ? 'PUT' : 'POST';

    try {
        const eventResponse = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (eventResponse.ok) {
            const task = await eventResponse.json();
            console.log('Event saved/updated successfully:', task);
            updateDayClick(selectedDate);
        } else {
            console.error('Failed to save/update event');
        }
    } catch (error) {
        console.error('Error saving/updating event:', error);
    }

    closeEventModal(); 
    calendar.refetchEvents();
    updateDayClick(selectedDate);
}

function deleteEvent() {
    const eventId = document.getElementById('eventId').value;
    
    console.log('Attempting to delete event with ID:', eventId);

    if (!eventId) {
        console.error('No event ID found');
        return;
    }

    fetch(`/api/delete/event/${eventId}`, { 
        method: 'DELETE' 
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);
        closeEventModal();
        updateDayClick(selectedDate);
    })
    .catch(error => {
        console.error('Error deleting event:', error);
    });
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
    const taskDate = selectedDate.toISOString().split('T')[0];
    document.getElementById('task-date').value = taskDate;
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
    document.getElementById('task-title').disabled = !isTaskEditModeEnabled;
    document.getElementById('task-description').disabled = !isTaskEditModeEnabled;
    document.getElementById('task-date').disabled = !isTaskEditModeEnabled;
    document.getElementById('task-complete').disabled = !isTaskEditModeEnabled;
}

async function saveTask() {
    const id = document.getElementById('taskId').value;
    const title = document.getElementById('task-title').value; 
    const date = document.getElementById('task-date').value; 
    const description = document.getElementById('task-description').value;
    const isComplete = document.getElementById('task-complete').checked; 

    const taskData = { 
        title, 
        description, 
        date,
        isComplete 
    };

    const url = id ? `/api/save/task/${id}` : '/api/save/task';
    const method = id ? 'PUT' : 'POST';

    try {
        const taskResponse = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });

        if (taskResponse.ok) {
            const task = await taskResponse.json();
            console.log('Task saved/updated successfully:', task);
            updateDayClick(selectedDate);
        } else {
            console.error('Failed to save/update task');
        }
    } catch (error) {
        console.error('Error saving/updating task:', error);
    }

    closeTaskModal(); 
}

function deleteTask() {
    const taskId = document.getElementById('taskId').value;
    
    console.log('Attempting to delete task with ID:', taskId);

    if (!taskId) {
        console.error('No task ID found');
        return;
    }

    fetch(`/api/delete/task/${taskId}`, { 
        method: 'DELETE' 
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);
        closeTaskModal();
        updateDayClick(selectedDate);
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
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