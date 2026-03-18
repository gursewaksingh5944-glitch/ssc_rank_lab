require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const path = require("path");
const express = require("express");
const cors = require("cors");

const predictRoute = require("./routes/predict");
const predictV2Route = require("./routes/predictV2");
const paymentRoute = require("./routes/payment");

const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "..", "public");

app.use((req, res, next) => {
  const host = (req.headers.host || "").toLowerCase();
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "").toLowerCase();

  if (host === "www.sscranklab.com") {
    return res.redirect(301, `https://sscranklab.com${req.originalUrl}`);
  }

  if (host === "sscranklab.com" && proto && proto !== "https") {
    return res.redirect(301, `https://sscranklab.com${req.originalUrl}`);
  }

  next();
});

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(`User-agent: *
Allow: /

Sitemap: https://sscranklab.com/sitemap.xml`);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.locals.userPlans = new Map();
app.locals.paymentHistory = [];

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
app.use("/api/predict", predictRoute);
app.use("/api/predict-v2", predictV2Route);
app.use("/api/payment", paymentRoute);

// ✅ ADD THIS HERE (VERY IMPORTANT POSITION)
app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sscranklab.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sscranklab.com/ssc-cgl-rank-predictor</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sscranklab.com/ssc-rank-predictor</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sscranklab.com/ssc-chsl-rank-predictor</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sscranklab.com/ssc-score-vs-rank</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sscranklab.com/ssc-marks-vs-rank</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
});

// 👇 keep this AFTER sitemap
app.use(express.static(publicPath));
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