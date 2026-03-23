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


// ===============================
// 🔥 ROBOTS.TXT (MUST BE FIRST!)
// ===============================
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  return res.send(`User-agent: *
Allow: /

Sitemap: https://sscranklab.com/sitemap.xml`);
});


// ===============================
// 🔥 SITEMAP
// ===============================
app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("charset", "utf-8");

  return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sscranklab.com/</loc>
    <lastmod>2026-03-23</lastmod>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
</urlset>`);
});


// ===============================
// 🔥 FORCE CANONICAL DOMAIN (IMPORTANT)
// ===============================
app.use((req, res, next) => {
  const host = (req.headers.host || "").toLowerCase();
  const proto = (req.headers["x-forwarded-proto"] || "").toLowerCase();

  // Force https + non-www
  if (host !== "sscranklab.com" || proto !== "https") {
    return res.redirect(301, `https://sscranklab.com${req.originalUrl}`);
  }

  next();
});


// ===============================
// 🔥 REMOVE ANY ROBOTS HEADER
// ===============================
app.use((req, res, next) => {
  res.removeHeader("X-Robots-Tag");
  next();
});


// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// DEBUG (REMOVE LATER IF WANT)
// ===============================
app.get("/debug-headers", (req, res) => {
  res.json(res.getHeaders());
});


// ===============================
// HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend running",
    paymentLive: true
  });
});


// ===============================
// API ROUTES
// ===============================
app.use("/api/predict", predictRoute);
app.use("/api/predict-v2", predictV2Route);
app.use("/api/payment", paymentRoute);


// ===============================
// STATIC FILES
// ===============================
app.use(express.static(publicPath));


// ===============================
// HOMEPAGE
// ===============================
app.get("/", (req, res) => {
  return res.sendFile(path.join(publicPath, "index.html"));
});


// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      error: "API route not found"
    });
  }

  return res.status(404).send("Page not found");
});


// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health: /health`);
  console.log(`✅ Robots: /robots.txt`);
  console.log(`✅ Sitemap: /sitemap.xml`);
  console.log(`✅ Debug: /debug-headers`);
});