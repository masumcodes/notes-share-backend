const path = require("path");
const express = require("express");
const User = require("./routes/user");
const Note = require("./routes/note.js");

// const Purchase = require("./routes/purchase.js");
require("dotenv").config();
require("./connection/conn.js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/user", User);
app.use("/api/v1/note", Note);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
