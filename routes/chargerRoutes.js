
const express = require("express");
const router = express.Router();

const db = require("../config/database");

// 1. GET ALL CHARGERS / SEARCH BY TYPE
router.get("/", (req, res) => {
    try {
        const { type } = req.query;

        let chargers;

        if (type !== undefined) {
            if (typeof type !== "string" || !type.trim()) {
                return res.status(400).json({
                    error: "Valid charger type is required"
                });
            }

            chargers = db.prepare(`
                SELECT * FROM chargers
                WHERE LOWER(type) = LOWER(?)
                ORDER BY id
            `).all(type.trim());

        } else {
            chargers = db.prepare(
                "SELECT * FROM chargers ORDER BY id"
            ).all();
        }

        return res.status(200).json(chargers);

    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve chargers"
        });
    }
});


// 2. GET CHARGER BY ID
router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid charger ID"
            });
        }

        const charger = db.prepare(
            "SELECT * FROM chargers WHERE id = ?"
        ).get(id);

        if (!charger) {
            return res.status(404).json({
                error: "Charger not found"
            });
        }

        return res.status(200).json(charger);

    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve charger"
        });
    }
});


// 3. ADD CHARGER
router.post("/", (req, res) => {
    try {
        const { name, type } = req.body;

        if (
            typeof name !== "string" ||
            typeof type !== "string" ||
            !name.trim() ||
            !type.trim()
        ) {
            return res.status(400).json({
                error: "Name and type are required"
            });
        }

        const result = db.prepare(`
            INSERT INTO chargers (name, type)
            VALUES (?, ?)
        `).run(name.trim(), type.trim());

        const charger = db.prepare(
            "SELECT * FROM chargers WHERE id = ?"
        ).get(result.lastInsertRowid);

        return res.status(201).json({
            message: "Charger added successfully",
            charger
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to add charger"
        });
    }
});


// 4. UPDATE CHARGER
router.put("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, type } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid charger ID"
            });
        }

        if (
            typeof name !== "string" ||
            typeof type !== "string" ||
            !name.trim() ||
            !type.trim()
        ) {
            return res.status(400).json({
                error: "Name and type are required"
            });
        }

        const existing = db.prepare(
            "SELECT * FROM chargers WHERE id = ?"
        ).get(id);

        if (!existing) {
            return res.status(404).json({
                error: "Charger not found"
            });
        }

        db.prepare(`
            UPDATE chargers
            SET name = ?, type = ?
            WHERE id = ?
        `).run(name.trim(), type.trim(), id);

        const updated = db.prepare(
            "SELECT * FROM chargers WHERE id = ?"
        ).get(id);

        return res.status(200).json({
            message: "Charger updated successfully",
            charger: updated
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to update charger"
        });
    }
});


// 5. DELETE CHARGER
router.delete("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid charger ID"
            });
        }

        const existing = db.prepare(
            "SELECT * FROM chargers WHERE id = ?"
        ).get(id);

        if (!existing) {
            return res.status(404).json({
                error: "Charger not found"
            });
        }

        db.prepare(
            "DELETE FROM chargers WHERE id = ?"
        ).run(id);

        return res.status(200).json({
            message: "Charger deleted successfully"
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(409).json({
                error: "Cannot delete charger with existing rentals"
            });
        }

        return res.status(500).json({
            error: "Failed to delete charger"
        });
    }
});

module.exports = router;
