$(document).ready(function() {
	$('#createAccountForm').on('submit', function(event) {
	  event.preventDefault();  // Prevent the default form submission
  
	  // Collect form data
	  const formData = {
		username: $('#username').val(),
		password: $('#password').val(),
		firstname: $('#firstname').val(),
		lastname: $('#lastname').val(),
		email: $('#email').val()
	  };
	  console.log(formData)
  
	  $.ajax({
		url: '/CreateAccount', 
		method: 'POST',
		data: formData,  
		success: function(response) {
		  console.log('User created:', response);
		},
		error: function(xhr, status, error) {
		  console.error('Error:', error);
		}
	  });
	});
  });
  