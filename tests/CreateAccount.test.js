const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); 
const User = require("../public/Script/models/User"); 



describe("POST /CreateAccount", () => {
    // Clear the User collection before each test
    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test("should create a new user and redirect to /Login on success", async () => {
        const newUser = {
            username: "newUser",
            password: "password123",
            firstname: "First",
            lastname: "Last",
            email: "newuser@example.com",
        };

        const response = await request(app)
            .post("/CreateAccount")
            .send(newUser)
            .set("Content-Type", "application/json");

        expect(response.status).toBe(302);
        expect(response.header.location).toBe("/Login");

        const user = await User.findOne({ username: "newUser" });
        expect(user).not.toBeNull();
        expect(user.email).toBe("newuser@example.com");
    });

    test("should return 409 if username already exists", async () => {
        const existingUser = new User({
            username: "duplicateUser",
            password: "password123",
            firstname: "Existing",
            lastname: "User",
            email: "existing@example.com",
        });
        await existingUser.save();

        const newUser = {
            username: "duplicateUser", // Same username as existingUser
            password: "password456",
            firstname: "First",
            lastname: "Last",
            email: "newuser@example.com",
        };

        const response = await request(app)
            .post("/CreateAccount")
            .send(newUser)
            .set("Content-Type", "application/json");

        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Username is already in use");
    });

    test("should return 500 if there is a server error", async () => {
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const newUser = {
            username: "errorUser",
            password: "password123",
            firstname: "First",
            lastname: "Last",
            email: "erroruser@example.com",
        };

        const response = await request(app)
            .post("/CreateAccount")
            .send(newUser)
            .set("Content-Type", "application/json");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Internal server error");

        User.prototype.save.mockRestore();
    });

    test("should return 400 if required fields are missing", async () => {
        const newUser = {
            username: "incompleteUser",
            // Missing password, firstname, lastname, and email
        };

        const response = await request(app)
            .post("/CreateAccount")
            .send(newUser)
            .set("Content-Type", "application/json");

        expect(response.status).toBe(400); // Bad request
    });
});
