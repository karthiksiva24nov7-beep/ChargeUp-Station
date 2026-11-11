
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "../database/chargeup.db")
);

db.pragma("foreign_keys = ON");

// Commuters table
db.exec(`
    CREATE TABLE IF NOT EXISTS commuters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )
`);

// Chargers table
db.exec(`
    CREATE TABLE IF NOT EXISTS chargers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
    )
`);

// Rentals table
db.exec(`
    CREATE TABLE IF NOT EXISTS rentals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commuter_id INTEGER NOT NULL,
        charger_id INTEGER NOT NULL,
        rental_date TEXT DEFAULT CURRENT_TIMESTAMP,
        return_date TEXT,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (commuter_id) REFERENCES commuters(id),
        FOREIGN KEY (charger_id) REFERENCES chargers(id)
    )
`);

console.log("Database connected successfully!");
console.log("Three tables created successfully!");

module.exports = db;
