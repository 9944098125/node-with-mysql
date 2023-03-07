const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySql = require("mysql2");
const bcrypt = require("bcryptjs");

const app = express();

const db = mySql.createPool({
  host: "localhost",
  user: "root",
  password: "Srinivas@8",
  database: "crud",
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/contacts/post", (req, res) => {
  const { name, email, contactNo } = req.body;
  const sql = "INSERT INTO contacts (name, email, contactNo) VALUES (?, ?, ?)";
  db.query(sql, [name, email, contactNo], (err, result) => {
    if (err) {
      res.status(500).send("Error inserting user into database");
    } else {
      res.status(201).json({ message: "Contact added successfully", result });
    }
  });
});

app.get("/api/contacts/get-contacts", (req, res) => {
  const sqlQuery = "SELECT * FROM contacts";
  db.query(sqlQuery, (err, result) => {
    try {
      res.send(result);
    } catch (err) {}
  });
});

app.put("/api/contacts/update-contact/:id", (req, res) => {
  const contactId = req.params.id;
  const { name, email, contactNo } = req.body;
  const sql = `UPDATE contacts SET name=?, email=?, contactNo=? WHERE id=?`;
  db.query(sql, [name, email, contactNo, contactId], (err, result) => {
    if (err) {
      res.status(500).send("Error updating user in database");
    } else if (result.affectedRows === 0) {
      res.status(404).send("User not found");
    } else {
      res.status(200).json({ message: "Contact updated successfully", result });
    }
  });
});

app.delete("/api/contacts/delete-contact/:id", (req, res) => {
  const contactId = req.params.id;
  const sql = "DELETE FROM contacts WHERE id=?";
  db.query(sql, [contactId], (err, result) => {
    if (err) {
      res.status(500).send("Error deleting the contact");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Contact Not Found in the database");
    } else {
      res.status(200).json({ message: "Contact deleted successfully" });
    }
  });
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      res.status(400).send(err);
    } else if (result.affectedRows === 0) {
      res.status(404).send("Cannot find table");
    } else {
      res.status(201).json({
        message: "User created successfully",
      });
    }
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email=?";
  db.query(sql, email, async (err, result) => {
    if (err) {
      res.status(404).send("Email Not Found !");
    } else if (result.length > 0) {
      const user = result[0];
      console.log(result);
      await bcrypt.compare(password, user.password, (err, response) => {
        if (err) {
          res.status(404).send("Login Failed");
        } else if (response) {
          res.status(200).send(user);
        }
      });
    }
  });
});

app.get("/api/users/get-users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(404).send("Something went wrong");
    } else {
      res.status(200).send(result);
    }
  });
});

app.delete("/api/users/delete-user", (req, res) => {
  const userId = req.params.id;

  db.query(`DELETE FROM users WHERE id = ?`, [userId], function (err, results) {
    if (err) {
      console.log(err);
    } else {
      console.log(`User with ID ${userId} deleted successfully!`);
    }
  });
});

app.listen(3000, () => console.log("App now running on port 3000"));
