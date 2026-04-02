require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const cluster = require("node:cluster");
const os = require("node:os");

// ===============================
// CLUSTER MODE (multi-core)
// ===============================
const WORKERS = Math.min(Number(process.env.WEB_CONCURRENCY) || os.cpus().length, 4) || 1;

if (cluster.isPrimary && WORKERS > 1) {
  cluster.setupPrimary({ exec: __filename });
  console.log(`Primary ${process.pid} forking ${WORKERS} workers...`);
  for (let i = 0; i < WORKERS; i++) cluster.fork();
  cluster.on("exit", (worker, code) => {
    console.log(`Worker ${worker.process.pid} exited (code ${code}). Replacing...`);
    cluster.fork();
  });
} else {
  // Worker (or single-process mode) runs the Express server
  startServer();
}

function startServer() {

const path = require("path");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const predictRoute = require("./routes/predict");
const predictV2Route = require("./routes/predictV2");
const paymentRoute = require("./routes/payment");
const userRoute = require("./routes/user");
const testRoute = require("./routes/test");
const questionsRoute = require("./routes/questions");
const testsRoute = require("./routes/tests");
const goalsRoute = require("./routes/goals");
const socialRoute = require("./routes/social");

const app = express();
app.set("trust proxy", true);

const PORT = process.env.PORT || 10000;
const publicPath = path.join(__dirname, "..", "public");


// ===============================
// 🔥 ROBOTS.TXT (MUST BE FIRST!)
// ===============================
app.get("/robots.txt", (req, res) => {
  return res.sendFile(path.join(publicPath, "robots.txt"));
});


// ===============================
// 🔥 SITEMAP (MUST BE BEFORE REDIRECT!)
// ===============================
app.get("/sitemap.xml", (req, res) => {
  return res.sendFile(path.join(publicPath, "sitemap.xml"));
});


// ===============================
// 🔥 FORCE CANONICAL DOMAIN (IMPORTANT)
// ===============================
app.use((req, res, next) => {
  const host = (req.headers.host || "").toLowerCase();
  const proto = (req.headers["x-forwarded-proto"] || "").toLowerCase();
  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";

  // Do not force redirects in local/dev runs.
  if (!isProd) {
    return next();
  }

  // Allow localhost and loopback in production-like staging checks.
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return next();
  }

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
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting: 100 requests per minute per IP for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { success: false, error: "Too many requests, please try again later." }
});
app.use("/api/", apiLimiter);

// Stricter limit for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  validate: { trustProxy: false },
  message: { success: false, error: "Too many payment requests." }
});
app.use("/api/payment/create-order", paymentLimiter);
app.use("/api/payment/verify", paymentLimiter);


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
app.use("/api/user", userRoute);
app.use("/api/test", testRoute);
app.use("/api/questions", questionsRoute);
app.use("/api/tests", testsRoute);
app.use("/api/goals", goalsRoute);
app.use("/api/social", socialRoute);

// Force legacy index paths to the main app preview homepage.
app.get(["/index", "/index.html"], (req, res) => {
  return res.redirect(302, "/");
});


// ===============================
// STATIC FILES
// ===============================
app.use(express.static(publicPath, {
  index: false,
  setHeaders: (res, filePath) => {
    const lower = String(filePath || "").toLowerCase();

    if (lower.endsWith(".html") || lower.endsWith(".js") || lower.endsWith(".css")) {
      // Prevent stale frontend bundles causing broken/hidden CTAs across browsers.
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  }
}));


// ===============================
// HOMEPAGE
// ===============================
app.get("/", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  return res.sendFile(path.join(publicPath, "app-preview.html"));
});

// Legacy premium CTA links used /predict. Redirect to the pricing section.
app.get("/predict", (req, res) => {
  return res.redirect(302, "/");
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
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message || err);
  if (res.headersSent) return;
  res.status(500).json({ success: false, error: "Internal server error" });
});


// ===============================
// START SERVER
// ===============================
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health: /health`);
  console.log(`✅ Robots: /robots.txt`);
  console.log(`✅ Sitemap: /sitemap.xml`);
});


// ===============================
// GRACEFUL SHUTDOWN
// ===============================
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  // Force exit after 10s if connections hang
  setTimeout(() => process.exit(1), 10000);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

} // end startServer()