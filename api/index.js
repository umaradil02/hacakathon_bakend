const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const { authroutes } = require("../routes/auth-route");

dotenv.config();

const app = express();
const MONGOURL = process.env.MONGO_URL;

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
    origin: ["http://localhost:5173", "https://smit-hackathon-project.netlify.app"], // Allowed origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies and credentials
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// MongoDB Connection
mongoose
    .connect(MONGOURL)
    .then(() => {
        console.log("MONGO_DB Connected");
    })
    .catch((e) => {
        console.error("MongoDB Connection Error: ", e.message);
    });

// Routes
app.use("/auth", authroutes);

app.get("/", (req, res) => {
    res.json({ message: "Server Running" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;