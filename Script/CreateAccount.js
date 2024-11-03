function ValidateUsername(username)
{
	// Checks database that username is not already being used by another user
	// Returns True: username is valid and not used by another user
	// Returns False: username is not valid and is being used by another user
}

function SaveUser(user)
{
    // 	Store the user info in database
    //  Return status code 
}

// Buttons ///////////////////////////////
$('#create-account').on('click', () => {
    // Calls ValidateUsername(username) to make sure username is not being used already
    // if username is valid
	// 	EncryptedPassword = EncryptPassword(password) -this is going to be from a library 
	// 	currentUser = new User(username, EncryptedPassword, firstName, lastName, email)
	// 	Calls SaveUser(currentUser)
    //  returns to login screen
});