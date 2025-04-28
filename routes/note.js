const { v4 } = require("uuid");
const path = require("path");
const Note = require("../models/Note.js");
const router = require("express").Router();
const { authenticateToken } = require("./userAuth.js");

// Middleware to check if the user is an admin
// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(403).json({ message: "Access denied: Admins only" });
//   }
// };

// Route to add a new note (Admin-only)
// const express = require("express");
// const router = express.Router();
// const Note = require("../models/Note.js");
// const { authenticateToken } = require("./userAuth.js");

const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Set the upload directory
  },
  filename: function (req, file, cb) {
    const uniqueName = v4() + path.extname(file.originalname); // Generate a unique filename
    cb(null, uniqueName); // Save the file with the unique name
  },
});

const upload = multer({ storage }); // Configure multer with the storage settings// Configure storage path

router.post(
  "/add",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    const { name, description, isFree, price } = req.body;
    const file = req.file;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name, description,  are required." });
    }
    if (!file) {
      return res.status(400).json({ message: "file  are required." });
    }

    const isFreeBoolean = isFree === "true";

    // Validate price if the note is not free
    if (!isFreeBoolean && (price === undefined || price < 0)) {
      return res.status(400).json({
        message: "Please provide a valid non-negative price for paid notes.",
      });
    }

    try {
      const noteData = {
        name,
        description,
        file: file.filename,
        isFree: isFreeBoolean,
        price: isFreeBoolean ? 0 : price,
        owner: req.user.id,
      };

      const newNote = new Note(noteData);
      const savedNote = await newNote.save();

      res.status(201).json({
        message: "Note added successfully",
        note: {
          id: savedNote._id,
          name: savedNote.name,
          description: savedNote.description,
          isFree: savedNote.isFree,
          price: savedNote.price || 0,
        },
      });
    } catch (error) {
      console.error("Error adding note:", error.stack || error.message);
      res.status(500).json({
        message: "Failed to add note",
        error: error.message,
      });
    }
  }
);

// Route to fetch all notes (Accessible to all users)
router.get("/get-notes", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch notes", error: error.message });
  }
});

router.get("/get-notes-by-id/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch note", error: error.message });
  }
});

router.put("/update-note/:id", authenticateToken, async (req, res) => {
  const { id } = req.params; // Get note ID from the request parameters
  const { title, description, price } = req.body; // Get the new fields from the request body

  try {
    // Find the note by ID
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if the logged-in user is the owner of the note
    if (note.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this note" });
    }

    // Validate the price
    if (price !== undefined && price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    // Update the fields
    if (title) note.name = title; // Update title if provided
    if (description) note.description = description; // Update description if provided
    if (price !== undefined) note.price = price; // Update price if provided

    // Save the updated note
    await note.save();

    res.status(200).json({ message: "Note updated successfully", note });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update note", error: error.message });
  }
});

// Route to delete a note (Admin-only)
router.delete("/delete-note-by-id/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res
      .status(200)
      .json({ message: "Note deleted successfully", note: deletedNote });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete note", error: error.message });
  }
});
module.exports = router;
