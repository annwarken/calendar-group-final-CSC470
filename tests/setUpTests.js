const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
    try {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        // Close any existing mongoose connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // Establish a new connection
        await mongoose.connect(uri);

        console.log("Mongoose connected for tests");
    } catch (error) {
        console.error("Error connecting to Mongoose:", error);
    }
});

afterEach(async () => {
    // Clear collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    // Close connection and stop MongoMemoryServer after tests are complete
    await mongoose.disconnect();
    await mongoServer.stop();
});
