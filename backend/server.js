const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables before requiring or connecting to DB
dotenv.config();

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "EnteKSRTC Basic JS API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});