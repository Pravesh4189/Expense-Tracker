// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// If hosted behind a proxy (Render, Heroku, etc.) this helps secure cookies
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Basic security headers
app.use(helmet());

// Rate limiting (tune values as needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // fallback
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      // If you want to support multiple origins, make CLIENT_URL comma-separated or use an array
      if (origin === CLIENT_URL) return callback(null, true);

      return callback(
        new Error("CORS policy: This origin is not allowed."),
        false
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies if you use them
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB before starting server
async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    // Routes
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/income", incomeRoutes);
    app.use("/api/v1/expense", expenseRoutes);
    app.use("/api/v1/dashboard", dashboardRoutes);

    // Serve uploads (ensure you validate/sanitize uploaded filenames elsewhere)
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // If serving frontend from same repo (production)
    if (process.env.NODE_ENV === "production") {
      const clientBuildPath = path.join(__dirname, "client", "dist"); // adjust if build output differs
      app.use(express.static(clientBuildPath));

      app.get("*", (req, res) => {
        res.sendFile(path.join(clientBuildPath, "index.html"));
      });
    }

    // Global error handler (simple)
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.error(err.stack || err.message);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server Error",
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} (env: ${process.env.NODE_ENV})`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
