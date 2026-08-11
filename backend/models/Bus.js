const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: true,
      trim: true,
    },
    busNumber: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "KSRTC",
      trim: true,
    },
    type: {
      type: String,
      enum: ["AC Sleeper", "Non-AC Sleeper", "AC Semi-Sleeper", "Non-AC Semi-Sleeper", "Super Fast", "Seater"],
      default: "Standard",
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    totalSeats: {
      type: Number,
      default: 30,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);
