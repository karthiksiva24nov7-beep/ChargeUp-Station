
const express = require("express");
const router = express.Router();

const db = require("../config/database");

// 1. GET ALL RENTALS
router.get("/", (req, res) => {
    try {
        const rentals = db.prepare(`
            SELECT
                rentals.*,
                commuters.name AS commuter_name,
                chargers.name AS charger_name
            FROM rentals
            JOIN commuters
                ON rentals.commuter_id = commuters.id
            JOIN chargers
                ON rentals.charger_id = chargers.id
            ORDER BY rentals.id
        `).all();

        return res.status(200).json(rentals);

    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve rentals"
        });
    }
});


// 2. GET RENTAL BY ID
router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid rental ID"
            });
        }

        const rental = db.prepare(`
            SELECT * FROM rentals WHERE id = ?
        `).get(id);

        if (!rental) {
            return res.status(404).json({
                error: "Rental not found"
            });
        }

        return res.status(200).json(rental);

    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve rental"
        });
    }
});


// 3. CREATE RENTAL
router.post("/", (req, res) => {
    try {
        const { commuter_id, charger_id } = req.body;

        // Validate input
        if (
            !Number.isInteger(commuter_id) ||
            !Number.isInteger(charger_id) ||
            commuter_id <= 0 ||
            charger_id <= 0
        ) {
            return res.status(400).json({
                error: "Valid commuter_id and charger_id are required"
            });
        }

        // Check commuter
        const commuter = db.prepare(
            "SELECT * FROM commuters WHERE id = ?"
        ).get(commuter_id);

        if (!commuter) {
            return res.status(404).json({
                error: "Commuter not found"
            });
        }

        // Check charger
        const charger = db.prepare(
            "SELECT * FROM chargers WHERE id = ?"
        ).get(charger_id);

        if (!charger) {
            return res.status(404).json({
                error: "Charger not found"
            });
        }

        // Count active rentals
        const activeCount = db.prepare(`
            SELECT COUNT(*) AS count
            FROM rentals
            WHERE commuter_id = ?
            AND status = 'active'
        `).get(commuter_id).count;

        // Maximum 3 active rentals
        if (activeCount >= 3) {
            return res.status(409).json({
                error: "Limit of 3 reached"
            });
        }

        // Insert rental
        const result = db.prepare(`
            INSERT INTO rentals (commuter_id, charger_id)
            VALUES (?, ?)
        `).run(commuter_id, charger_id);

        const rental = db.prepare(
            "SELECT * FROM rentals WHERE id = ?"
        ).get(result.lastInsertRowid);

        return res.status(201).json({
            message: "Rental created successfully",
            rental
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to create rental"
        });
    }
});


// 4. RETURN RENTAL
router.put("/:id/return", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid rental ID"
            });
        }

        const rental = db.prepare(
            "SELECT * FROM rentals WHERE id = ?"
        ).get(id);

        if (!rental) {
            return res.status(404).json({
                error: "Rental not found"
            });
        }

        if (rental.status !== "active") {
            return res.status(400).json({
                error: "Rental is already returned"
            });
        }

        db.prepare(`
            UPDATE rentals
            SET status = 'returned',
                return_date = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(id);

        return res.status(200).json({
            message: "Rental returned successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to return rental"
        });
    }
});

module.exports = router;
