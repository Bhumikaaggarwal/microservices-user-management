// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// A Mongoose Schema defines the STRUCTURE and RULES of documents in a collection
// Think of it like a blueprint — every user document must follow these rules

const userSchema = new mongoose.Schema(
  {
    // ── BASIC INFO ─────────────────────────────────────────────────────────────

    firstName: {
      type: String, // must be a string
      required: [true, "First name is required"],
      trim: true, // removes accidental spaces: "  Bhumi  " → "Bhumi"
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // no two users can have the same email
      trim: true,
      lowercase: true, // "Bhumi@Gmail.COM" saved as "bhumi@gmail.com"
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    // ── SECURITY ───────────────────────────────────────────────────────────────

    // passwordHash: {
    //   type: String,
    //   required: [true, 'Password is required'],
    //   minlength: [60, 'Invalid password hash'],
    //   select: false  // NEVER returned in queries by default
    //                  // Must explicitly ask: User.findOne().select('+passwordHash')
    // },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // ── ACCESS CONTROL ─────────────────────────────────────────────────────────

    role: {
      type: String,
      enum: {
        values: ["Admin", "Editor", "Viewer"],
        message: "Role must be Admin, Editor, or Viewer",
      },
      default: "Viewer", // new users get least privileged role by default
    },

    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive", "Suspended"],
        message: "Status must be Active, Inactive, or Suspended",
      },
      default: "Active",
    },

    // ── METADATA ───────────────────────────────────────────────────────────────

    lastLogin: {
      type: Date,
      default: null,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    profilePicture: {
      type: String,
      default: null,
    },
  },

  {
    // timestamps: true automatically adds createdAt and updatedAt to every document
    timestamps: true,

    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ── VIRTUAL FIELDS ───────────────────────────────────────────────────────────
// Computed fields — not stored in DB, calculated when accessed

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── INDEXES ──────────────────────────────────────────────────────────────────
// Speed up common queries significantly

userSchema.index({ email: 1 }); // fast lookup by email (login)
userSchema.index({ role: 1 }); // fast filtering by role
userSchema.index({ status: 1 }); // fast filtering by status
userSchema.index({ createdAt: -1 }); // newest users first

// ── INSTANCE METHODS ─────────────────────────────────────────────────────────

// Check if entered password matches stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Quick check if user can log in
userSchema.methods.isActive = function () {
  return this.status === "Active";
};

// ── STATIC METHODS ───────────────────────────────────────────────────────────

// Find user by email AND include passwordHash (for login)
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// ── PRE-SAVE HOOK ─────────────────────────────────────────────────────────────
// Runs automatically before every .save()
// Hashes password only if it was changed

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
