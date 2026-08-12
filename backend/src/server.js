const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors()); // Celah: CORS open to all origin
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

// App Layer Vulnerability: Login tanpa sanitasi (SQL Injection)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  // Payload berbahaya seperti: ' OR 1=1 -- bakal tembus di sini
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      res.json({ message: "Login success", user: results[0] });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// Endpoint CRUD Task (Bisa lu tambahin Broken Access Control di sini nanti)
app.get("/api/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
