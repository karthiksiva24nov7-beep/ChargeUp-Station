
const express = require("express");
const router = express.Router();

const db = require("../config/database");

// 1. GET ALL COMMUTERS
router.get("/", (req, res) => {
    try {
        const commuters = db.prepare(
            "SELECT * FROM commuters ORDER BY id"
        ).all();

        return res.status(200).json(commuters);

    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve commuters"
        });
    }
});


// 2. GET COMMUTER BY ID
router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid commuter ID"
            });
        }

        const commuter = db.prepare(
            "SELECT * FROM commuters WHERE id = ?"
        ).get(id);

        if (!commuter) {
            return res.status(404).json({
                error: "Commuter not found"
            });
        }

        return res.status(200).json(commuter);

    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve commuter"
        });
    }
});


// 3. ADD NEW COMMUTER
router.post("/", (req, res) => {
    try {
        const { name, email } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        // Validate data types and empty strings
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            !name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                error: "Name and email must be valid text"
            });
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                error: "Please provide a valid email address"
            });
        }

        // Insert commuter
        const result = db.prepare(`
            INSERT INTO commuters (name, email)
            VALUES (?, ?)
        `).run(name.trim(), email.trim());

        const newCommuter = db.prepare(
            "SELECT * FROM commuters WHERE id = ?"
        ).get(result.lastInsertRowid);

        return res.status(201).json({
            message: "Commuter added successfully",
            commuter: newCommuter
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        return res.status(500).json({
            error: "Failed to add commuter"
        });
    }
});


// 4. UPDATE COMMUTER
router.put("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, email } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid commuter ID"
            });
        }

        if (
            !name ||
            !email ||
            typeof name !== "string" ||
            typeof email !== "string" ||
            !name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                error: "Please provide a valid email address"
            });
        }

        const existing = db.prepare(
            "SELECT * FROM commuters WHERE id = ?"
        ).get(id);

        if (!existing) {
            return res.status(404).json({
                error: "Commuter not found"
            });
        }

        db.prepare(`
            UPDATE commuters
            SET name = ?, email = ?
            WHERE id = ?
        `).run(name.trim(), email.trim(), id);

        const updatedCommuter = db.prepare(
            "SELECT * FROM commuters WHERE id = ?"
        ).get(id);

        return res.status(200).json({
            message: "Commuter updated successfully",
            commuter: updatedCommuter
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        return res.status(500).json({
            error: "Failed to update commuter"
        });
    }
});


// 5. DELETE COMMUTER
router.delete("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid commuter ID"
            });
        }

        const existing = db.prepare(
            "SELECT * FROM commuters WHERE id = ?"
        ).get(id);

        if (!existing) {
            return res.status(404).json({
                error: "Commuter not found"
            });
        }

        db.prepare(
            "DELETE FROM commuters WHERE id = ?"
        ).run(id);

        return res.status(200).json({
            message: "Commuter deleted successfully"
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(409).json({
                error: "Cannot delete commuter with existing rentals"
            });
        }

        return res.status(500).json({
            error: "Failed to delete commuter"
        });
    }
});

module.exports = router;
