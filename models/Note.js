const mongoose = require("mongoose");

// Note Schema
const noteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Note name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  file: {
    type: String, // Store file path (local storage) or URL (cloud storage)
    required: [true, "File is required"],
  },
  price: {
    type: Number,
    min: [0, "Price must be a positive number or zero"],
    validate: {
      validator: function (value) {
        // If the note is not free, price must be provided and non-negative
        return this.isFree || (value !== undefined && value >= 0);
      },
      message: "Price is required for paid notes and must be non-negative",
    },
  },
  isFree: {
    type: Boolean,
    default: false, // Default notes are not free
  },
  buyers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming a `User` model exists
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming a `User` model exists
    required: true, // Every note must have an owner
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation time
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set the update time
  },
});

// Middleware to handle `isFree` logic and `updatedAt` timestamp
noteSchema.pre("save", function (next) {
  if (this.price === 0) {
    this.isFree = true; // Automatically mark as free if the price is 0
  } else {
    this.isFree = false; // Reset if the price is changed
  }
  this.updatedAt = Date.now(); // Update the updatedAt timestamp
  next();
});

// Create the Note model
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
