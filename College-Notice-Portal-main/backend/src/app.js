const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const facultyRoutes = require("./routes/faculty.routes");
const studentRoutes = require("./routes/student.routes");
const replyRoutes = require("./routes/reply.routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 10000,
  message: "Too many requests from this IP, please try again later.",
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "'unsafe-inline'",
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "'unsafe-inline'",
        ],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(limiter);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/replies", replyRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
