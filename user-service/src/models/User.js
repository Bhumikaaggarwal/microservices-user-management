const mongoose = require('mongoose');

// User Service's User model — stores PROFILE data only
// No passwords here — that's auth-service's job (separation of concerns)
// authId links this profile to the auth-service user document

const userSchema = new mongoose.Schema(
  {
    // Links this profile to auth-service's user _id
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'Min 2 characters'],
      maxlength: [50, 'Max 50 characters']
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Max 50 characters']
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    profilePicture: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: null },
    phone: { type: String, default: null },

    role: {
      type: String,
      enum: ['Admin', 'Editor', 'Viewer'],
      default: 'Viewer'
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active'
    },

    lastLogin: { type: Date, default: null },

    // Flexible preferences object — theme, language, notifications
    preferences: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      notifications: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => { delete ret.__v; return ret; }
    }
  }
);

// Virtual: fullName computed from firstName + lastName
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for fast queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
// Text index enables search: User.find({ $text: { $search: "bhumi" } })
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Static: paginated user list with optional filters
// Usage: User.paginate(1, 20, { role: 'Admin' })
userSchema.statics.paginate = async function (page = 1, limit = 20, filter = {}) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    this.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    this.countDocuments(filter)
  ]);
  return {
    users,
    pagination: {
      total, page, limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

const User = mongoose.model('User', userSchema);
module.exports = User;