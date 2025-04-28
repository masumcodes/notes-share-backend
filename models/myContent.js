const mongoose = require("mongoose");

const myContentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note", // Reference to the Note model
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now, // Automatically set the purchase time
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  }
);

// Create the MyContent model
const MyContent = mongoose.model("MyContent", myContentSchema);

module.exports = MyContent;
