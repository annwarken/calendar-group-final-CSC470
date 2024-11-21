document.getElementById("createAccountForm").addEventListener("submit", async function (e) {
    e.preventDefault(); 

    const newUser = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        email: document.getElementById("email").value
    }
    const errorMessage = document.getElementById("error-message");

    try {
        const response = await fetch("/CreateAccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });

        if (response.ok) {
            // Redirect to login if account creation is successful
            window.location.href = "/Login";
        } else if (response.status === 409) {
            // Show error for existing username
            const data = await response.json();
            errorMessage.textContent = data.error;
            errorMessage.style.display = "block";
        } else {
            // Handle other errors
            errorMessage.textContent = "An unexpected error occurred. Please try again.";
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Error during account creation:", error);
        errorMessage.textContent = "Failed to create account. Please check your connection.";
        errorMessage.style.display = "block";
    }
});
