# group-projects-group-7

### Overview
This product will be most useful for any person with a busy schedule and multiple tasks to do each day to help them feel more organized and aware of their responsibilities. It will be a web application to allow users to track and manage events and tasks. Upon opening the application, the user will be presented with a login page where they can log in to an existing account or create a new one. Once logged in, a calendar will appear with the current day selected showing the list of events scheduled for that day on the left and the to-do list on the right. The user can then choose to create, delete, or edit any event or task for any day. A different day can also be selected to view the list of events and the to-do list of tasks for that day.

### Project Setup
1. Install NodeJS: https://nodejs.org/en/download/prebuilt-installer
2. Open the project folder in the terminal
3. Run the command 'npm ci' to install the required modules
4. Run the command 'node app.js' to start the server
5. In a browser, go to '127.0.0.1:8080' to open the website

### Key Features
Create an account on the registration page
Login on the login page
Encrypted login information
Calendar view to see upcoming events
Make, edit, and delete events for upcoming appointments, parties, classes, etc.
Click on a day to bring up a to-do list/checklist and event list for specific day
Create, edit, and delete checklist items
Store users’ events/lists
Log out

### Technology
For the client side of our web application, we used HTML, JavaScript, and CSS. For the server side we incorporated Node.js with Express.js and Passport.js for creating the API and user authentication respectively. We used the FullCalendar library to help implement the calendar interface and some of its functionality. MongoDB was used to store user data.
