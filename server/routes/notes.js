import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Note from "../models/notes.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Protect all routes under notes
router.use(authMiddleware);

// CREATE NOTE
router.post("/", async (req, res) => {
  try {
    const { title, description, color } = req.body;

    const note = await Note.create({
      userId: req.user.id,
      title,
      description,
      color: color || "white",
    });

    res.status(201).json({
      success: true,
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET NOTES
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE NOTE
router.put("/:id", async (req, res) => {
  try {
    const { title, description, color } = req.body;

    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or unauthorized",
      });
    }

    if (title !== undefined) note.title = title;
    if (description !== undefined) note.description = description;
    if (color !== undefined) note.color = color;

    await note.save();

    res.json({
      success: true,
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE NOTE
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// note routes

// SUMMARIZE NOTE WITH AI
router.post("/:id/summarize", async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Summarize this note in 2-3 sentences:\n\nTitle: ${note.title}\n\n${note.description}`
    );

    const summary = result.response.text();

    note.summary = summary;
    await note.save();

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;