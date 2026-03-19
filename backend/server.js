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

// Force non-www + https
app.use((req, res, next) => {
  const host = (req.headers.host || "").toLowerCase();
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "").toLowerCase();

  if (host === "www.sscranklab.com") {
    return res.redirect(301, `https://sscranklab.com${req.originalUrl}`);
  }


  next();
});

// Force-remove any X-Robots-Tag header
app.use((req, res, next) => {
  res.removeHeader("X-Robots-Tag");
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *
Allow: /

Sitemap: https://sscranklab.com/sitemap.xml`);
});

app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.sendFile(path.join(__dirname, "..", "public", "sitemap.xml"));
});

app.get("/debug-headers", (req, res) => {
  res.json(res.getHeaders());
});

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
  return res.sendFile(path.join(publicPath, "index.html"));
});

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