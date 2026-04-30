const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(express.json());

// 🔴 THIS IS THE IMPORTANT LINE
const authRoutes = require("./routes/authRoutes");

// 🔴 CONNECT ROUTES
app.use("/auth", authRoutes);

app.use((req, res) => {
  console.log("Unknown route hit:", req.url);
  res.status(404).send("Route not found");
});

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Auth DB connected"))
  .catch(err => console.log(err));

app.listen(4000, () => {
  console.log("Auth Service running on port 4000");
});