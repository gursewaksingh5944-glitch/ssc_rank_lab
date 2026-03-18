require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const path = require("path");
const express = require("express");
const cors = require("cors");
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: https://sscranklab.com/sitemap.xml`);
});
const predictRoute = require("./routes/predict");
const predictV2Route = require("./routes/predictV2");
const paymentRoute = require("./routes/payment");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.locals.userPlans = new Map();
app.locals.paymentHistory = [];

const publicPath = path.join(__dirname, "..", "public");

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend running",
    paymentLive: true
  });
});

app.use("/api/predict", predictRoute);
app.use("/api/predict-v2", predictV2Route);
app.use("/api/payment", paymentRoute);

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      error: "API route not found"
    });
  }

  return res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
  console.log(`✅ Website:        http://localhost:${PORT}/`);
  console.log(`✅ Health:         http://localhost:${PORT}/health`);
  console.log(`✅ Predict V2:     http://localhost:${PORT}/api/predict-v2`);
  console.log(`✅ Payment Route:  http://localhost:${PORT}/api/payment`);
  console.log(`✅ Payment Mode:   RAZORPAY LIVE/TEST (depends on your keys)`);
});