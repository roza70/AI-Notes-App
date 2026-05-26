import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./db.js";
import authRouter from "./routes/auth.js";
import notesRouter from "./routes/notes.js";

import {
  requestLogger,
  requireJson,
  errorHandler,
} from "./middleware/middleware.js";

console.log("OpenAI Key loaded:", process.env.OPENAI_API_KEY ? "YES ✅" : "NO ❌");

const app = express();

// =====================
// Core Middleware
// =====================
app.use(cors());
app.use(express.json());

// Custom middleware
app.use(requestLogger);
app.use(requireJson);

// =====================
// Routes
// =====================
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

// Health check route
app.get("/", (req, res) => {
  res.send("API Running");
});

// =====================
// Error Handler (MUST be last)
// =====================
app.use(errorHandler);

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in .env");
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });