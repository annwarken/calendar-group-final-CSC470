document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); 

    const credentials = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };
    const errorMessage = document.getElementById("error-message");

    try {
        // Send login request
        const response = await fetch("/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (response.ok) {
            // Redirect to Calendar page on successful login
            window.location.href = "/Calendar";
        } else {
            // Extract and display error message from response
            const result = await response.json();
            errorMessage.textContent = result.error || "An unknown error occurred.";
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Error during login:", error);
        errorMessage.textContent = "Failed to connect to the server. Please try again later.";
        errorMessage.style.display = "block";
    }
});

function createAccountButton() {
    //switches to create account page when the button is clicked
    window.location.href = "/CreateAccount";
}