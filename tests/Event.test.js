const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); 
const User = require("../public/Script/models/User"); 
const Event = require("../public/Script/models/Event"); 

describe("Event API Endpoints", () => {
    let testUser;
    let authCookie;

    // Create a test user and log in before tests
    beforeAll(async () => {
        // Clear existing events and users
        await Event.deleteMany({});
        await User.deleteMany({});

        // Create a test user
        testUser = new User({
            username: "testEventUser",
            password: "password123",
            firstname: "Test",
            lastname: "User",
            email: "testevent@example.com"
        });
        await testUser.save();

        // Log in to get authentication cookie
        const loginResponse = await request(app)
            .post("/Login")
            .send({
                username: "testEventUser",
                password: "password123"
            });
        
        authCookie = loginResponse.headers['set-cookie'];
    });

    // Clear events before each test
    beforeEach(async () => {
        await Event.deleteMany({});
    });

    // Close mongoose connection after all tests
    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    describe("POST /api/save/event", () => {
        test("should create a new event successfully", async () => {
            const newEvent = {
                title: "Test Event",
                description: "A test event description",
                startDate: new Date("2024-12-11T10:00:00Z"),
                endDate: new Date("2024-12-11T12:00:00Z")
            };

            const response = await request(app)
                .post("/api/save/event")
                .set('Cookie', authCookie)
                .send(newEvent)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Event created successfully");

            // Verify event was saved in database
            const savedEvent = await Event.findOne({ title: "Test Event" });
            expect(savedEvent).not.toBeNull();
            expect(savedEvent.description).toBe("A test event description");
        });

        test("should return 400 if required fields are missing", async () => {
            const incompleteEvent = {
                title: "Incomplete Event"
                // Missing other required fields
            };

            const response = await request(app)
                .post("/api/save/event")
                .set('Cookie', authCookie)
                .send(incompleteEvent)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(400);
        });

        test("should return 302 if user is not authenticated", async () => {
            const newEvent = {
                title: "Unauthorized Event",
                description: "An event without authentication",
                startDate: new Date("2024-01-16T10:00:00Z"),
                endDate: new Date("2024-01-16T12:00:00Z")
            };

            const response = await request(app)
                .post("/api/save/event")
                .send(newEvent)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(302);
        });
    });

    describe("PUT /api/save/event/:id", () => {
        test("should update an existing event", async () => {
            // Create an event
            const initialEvent = new Event({
                title: "Original Event",
                description: "Original description",
                startDate: new Date("2024-02-15T10:00:00Z"),
                endDate: new Date("2024-02-15T12:00:00Z"),
                createdBy: testUser._id
            });
            await initialEvent.save();

            // Update the event
            const updatedEventData = {
                title: "Updated Event",
                description: "Updated description",
                startDate: new Date("2024-02-16T10:00:00Z"),
                endDate: new Date("2024-02-16T12:00:00Z")
            };

            const response = await request(app)
                .put(`/api/save/event/${initialEvent._id}`)
                .set('Cookie', authCookie)
                .send(updatedEventData)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(200);
            expect(response.body.title).toBe("Updated Event");

            // Verify update in database
            const updatedEvent = await Event.findById(initialEvent._id);
            expect(updatedEvent.title).toBe("Updated Event");
        });

        test("should return 404 if event does not exist", async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updatedEventData = {
                title: "Non-existent Event",
                description: "Trying to update non-existent event",
                startDate: new Date("2024-02-17T10:00:00Z"),
                endDate: new Date("2024-02-17T12:00:00Z")
            };

            const response = await request(app)
                .put(`/api/save/event/${nonExistentId}`)
                .set('Cookie', authCookie)
                .send(updatedEventData)
                .set("Content-Type", "application/json");

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /api/delete/event/:id", () => {
        test("should delete an existing event", async () => {
            // Create an event to delete
            const eventToDelete = new Event({
                title: "Event to Delete",
                description: "Will be deleted",
                startDate: new Date("2024-03-15T10:00:00Z"),
                endDate: new Date("2024-03-15T12:00:00Z"),
                createdBy: testUser._id
            });
            await eventToDelete.save();

            const response = await request(app)
                .delete(`/api/delete/event/${eventToDelete._id}`)
                .set('Cookie', authCookie);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Event deleted successfully");

            // Verify deletion from database
            const deletedEvent = await Event.findById(eventToDelete._id);
            expect(deletedEvent).toBeNull();
        });

        test("should return 404 if event does not exist", async () => {
            const nonExistentId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/delete/event/${nonExistentId}`)
                .set('Cookie', authCookie);

            expect(response.status).toBe(404);
        });
    });

    describe("GET /api/events", () => {
        test("should fetch events for the logged-in user", async () => {
            // Create events for the test user
            const events = [
                new Event({
                    title: "Event 1",
                    description: "First test event",
                    startDate: new Date("2024-10-15T10:00:00Z"),
                    endDate: new Date("2024-10-15T12:00:00Z"),
                    createdBy: testUser._id
                }),
                new Event({
                    title: "Event 2",
                    description: "Second test event",
                    startDate: new Date("2024-10-16T10:00:00Z"),
                    endDate: new Date("2024-10-16T12:00:00Z"),
                    createdBy: testUser._id
                })
            ];
            await Event.insertMany(events);

            const response = await request(app)
                .get("/api/events")
                .set('Cookie', authCookie)
                .query({ 
                    startDate: "2024-11-15T00:00:00Z", 
                    timezone: "-60" 
                });

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].title).toBe("Event 1");
            expect(response.body[1].title).toBe("Event 2");
        });

        test("should return empty array if no events exist", async () => {
            const response = await request(app)
                .get("/api/events")
                .set('Cookie', authCookie)
                .query({ 
                    startDate: "2024-05-15T00:00:00Z", 
                    timezone: "-60" 
                });

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(0);
        });
    });

    describe("GET /api/event/details", () => {
        test("should fetch details of a specific event", async () => {
            // Create an event to fetch details for
            const eventToFetch = new Event({
                title: "Detailed Event",
                description: "Event with full details",
                startDate: new Date("2024-12-10T10:00:00Z"),
                endDate: new Date("2024-12-10T12:00:00Z"),
                createdBy: testUser._id
            });
            await eventToFetch.save();

            const response = await request(app)
                .get("/api/event/details")
                .set('Cookie', authCookie)
                .query({ eventId: eventToFetch._id });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe("Detailed Event");
            expect(response.body.description).toBe("Event with full details");
        });

        test("should return 404 if event does not exist", async () => {
            const nonExistentId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get("/api/event/details")
                .set('Cookie', authCookie)
                .query({ eventId: nonExistentId });

            expect(response.status).toBe(404);
        });
    });
});