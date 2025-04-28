const jwt = require("jsonwebtoken");

const Note = require("../models/Note.js");
const router = require("express").Router();
const MyContent = require("../models/myContent.js");
const { authenticateToken } = require("./userAuth.js");

router.post("/purchase", authenticateToken, async (req, res) => {
  const { noteId } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const content = new MyContent({
      user: req.user._id, // Ensure this field is set properly
      note: noteId,
    });

    await content.save();

    res.status(201).json({
      message: "Note purchased successfully",
      content,
    });
  } catch (error) {
    res.status(500).json({ message: "Error purchasing note", error });
  }
});

module.exports = router;
