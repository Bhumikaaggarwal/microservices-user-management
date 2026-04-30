const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const AUTH_SERVICE_URL = "http://localhost:4000";

// Basic health check
app.get("/", (req, res) => {
  res.send("API Gateway Running");
});

// Forward all /auth requests to auth-service
app.use("/auth", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${AUTH_SERVICE_URL}${req.url}`,
      data: req.body,
      headers: req.headers,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Gateway Error" });
  }
});

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});