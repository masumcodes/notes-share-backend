const mongoose = require("mongoose");
const user = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },

    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
    },
    about: {
      type: String,
      default: "Hey there! I am using this app.",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },

    purchasedNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        default: [], // Array of notes the user has purchased
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
  },

  { timestamps: true }
);
module.exports = mongoose.model("user", user);
