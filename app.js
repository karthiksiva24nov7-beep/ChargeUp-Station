
const express = require("express");
const cors = require("cors");

require("./config/database");

const commuterRoutes = require("./routes/commuterRoutes");
const chargerRoutes = require("./routes/chargerRoutes");
const rentalRoutes = require("./routes/rentalRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to ChargeUp Station API",
        status: "Server running"
    });
});

// API routes
app.use("/commuters", commuterRoutes);
app.use("/chargers", chargerRoutes);
app.use("/rentals", rentalRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: "API endpoint not found"
    });
});

// Central error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        error: err.status ? err.message : "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
    server.close(() => {
        console.log("Server closed successfully");
        process.exit(0);
    });
});
