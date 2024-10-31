function GetUser(username) {
    // returns user struct filled with user's info from database
}

function VerifyUser(username, password) {
    // calls GetUser(username) 
    // check database password with entered password 
    // returns bool
}

// Buttons ///////////////////////////////
$('#log-in').on('click', () => {
    // takes username and password from page
    // Calls VerifyUser(username, password)
});
