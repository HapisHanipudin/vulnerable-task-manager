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

// App Layer Vulnerability: Broken Access Control / IDOR
app.get("/api/tasks", (req, res) => {
  // Vulnerability: Mempercayai input userId dari query tanpa validasi token/sesi.
  // Attacker bisa ganti parameter ?userId=1 untuk melihat task milik admin.
  const userId = req.query.userId;
  let query = "SELECT * FROM tasks";
  if (userId) query = `SELECT * FROM tasks WHERE user_id = ${userId}`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// App Layer Vulnerability: Stored XSS
app.post("/api/tasks", (req, res) => {
  const { userId, title, description } = req.body;
  // Vulnerability: Tidak ada sanitasi input HTML/JS pada 'title' dan 'description'.
  // Script berbahaya bisa disimpan ke database dan dieksekusi di browser korban.
  const query = `INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)`;
  
  db.query(query, [userId, title, description], (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ message: "Task created successfully!" });
  });
});

// App Layer Vulnerability: Broken Access Control (IDOR pada Delete)
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  // Vulnerability: Sistem tidak mengecek apakah task ini benar milik user yang sedang login.
  // Attacker bisa menghapus task siapapun dengan menebak ID.
  const query = `DELETE FROM tasks WHERE id = ?`;
  
  db.query(query, [taskId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Task deleted successfully!" });
  });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
