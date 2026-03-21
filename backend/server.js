require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const path = require("path");
const express = require("express");
const cors = require("cors");

const predictRoute = require("./routes/predict");
const predictV2Route = require("./routes/predictV2");
const paymentRoute = require("./routes/payment");

const app = express();
app.set("trust proxy", true);

const PORT = process.env.PORT || 10000;
const publicPath = path.join(__dirname, "..", "public");

// Redirect only www -> non-www
app.use((req, res, next) => {
  const host = (req.headers.host || "").toLowerCase();

  if (host === "www.sscranklab.com") {
    return res.redirect(301, `https://sscranklab.com${req.originalUrl}`);
  }

  next();
});

// Remove any X-Robots-Tag header
app.use((req, res, next) => {
  res.removeHeader("X-Robots-Tag");
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  return res.send(`User-agent: *
Allow: /

# updated: 2026-03-21

Sitemap: https://sscranklab.com/sitemap.xml`);
});

// debug route
app.get("/debug-headers", (req, res) => {
  res.json(res.getHeaders());
});

// health route
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

// static files
app.use(express.static(publicPath));

// homepage
app.get("/", (req, res) => {
  return res.sendFile(path.join(publicPath, "index.html"));
});

// 404
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      error: "API route not found"
    });
  }

  return res.status(404).send("Page not found");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health: /health`);
  console.log(`✅ Debug: /debug-headers`);
});