const express = require("express");
const config = require("./config/key");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
const users = require("./routes/api/users");

// Connect to MongoDB
mongoose
  .connect(config.db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

// Use Routes
app.use("/api/users", users);

app.listen(config.port, () =>
  console.log(`Server running on port ${config.port}`)
);
