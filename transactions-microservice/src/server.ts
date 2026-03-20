import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectProducer } from "./kafka/producer";

const PORT = process.env.APP_PORT;

async function startServer() {
    try {
        console.log("Starting server...");

        await connectProducer();

        app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();