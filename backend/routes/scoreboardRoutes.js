const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();

module.exports = router;

//database connection
const db = new sqlite3.Database("scores.db", (err) => {
    if (err) return console.error(err.message);
    console.log("Połączono z bazą SQLite.");
});

//create db
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL
  )
`);

router.post("/", (req, res) => {
    const { username, score } = req.body;
    const query = `INSERT INTO users (username, score) VALUES (?, ?)`;

    db.run(query, [username, score], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, username, score });
    });
});

// Endpoint: pobierz wszystkich użytkowników
router.get("/all", (req, res) => {
    const query = `SELECT * FROM users ORDER BY score DESC`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

router.get("/:count", (req, res) => {
    const query = `SELECT * FROM users LIMIT (?) ORDER BY score DESC`;

    db.all(query, [req.params.count], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});
