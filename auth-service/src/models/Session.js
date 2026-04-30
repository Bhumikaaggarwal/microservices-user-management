const mongoose = require('mongoose');

// The Session model tracks refresh tokens
// When a user logs in:    → create a Session document
// When they log out:      → set isActive: false
// Token expired:          → MongoDB auto-deletes it via TTL index

const sessionSchema = new mongoose.Schema(
  {
    // Which user this session belongs to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',      // creates a relationship to the User collection
      required: true,
      index: true       // fast lookup: "find all sessions for user X"
    },

    // The refresh token stored here
    // When user wants a new access token, they send this token
    // We verify it exists here before issuing a new access token
    refreshToken: {
      type: String,
      required: true,
      unique: true
    },

    // After this date, the refresh token is invalid
    // MongoDB TTL index auto-deletes expired documents — no cron job needed
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }
    },

    // "You're logged in from Chrome on Windows"
    userAgent: {
      type: String,
      default: null
    },

    // Useful for security: "New login from unknown location"
    ipAddress: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true  // createdAt = when the user logged in
  }
);

// Find all active sessions for a user (for "logged-in devices" feature)
sessionSchema.index({ userId: 1, isActive: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;