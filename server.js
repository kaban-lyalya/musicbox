const express = require("express");
const config = require("./config/key");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // Now in Express.js
const users = require("./routes/api/users");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(config.db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello");
});

// Use Routes
app.use("/api/users", users);

app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`)
);
