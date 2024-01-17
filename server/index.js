import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();
import usersRouter from "./routes/users.route.js";
import linkRouter from "./routes/link.route.js";

const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URL;
async function createConnection() {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        console.log("Connected to MongoDB");
        return client;
    } catch (error) {
        console.error('MongoDB connection Error:', error);
        throw error;
    }
}
export const client = await createConnection();

app.get("/", function (request, response) {
    response.send("URL Shortner");
});

app.use("/user", usersRouter);
app.use("/link", linkRouter);

app.listen(PORT, () => console.log("Server is running on port:", `http://localhost:${process.env.PORT}`));