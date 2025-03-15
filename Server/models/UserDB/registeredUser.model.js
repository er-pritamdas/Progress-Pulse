import mongoose from "mongoose";

const { UserDB } = global.databases;

const registeredUserSchema = new mongoose.Schema(
  {
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    passwordHash: { 
        type: String, 
        required: true 
    }, // Must be hashed before saving

    phoneNumber: { 
        type: String, 
        unique: true, 
        sparse: true 
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    isVerified: { 
        type: Boolean, 
        default: false 
    },

    profilePic: { 
        type: String, 
        default: "" 
    }, // Store URL of profile image

    status: {
      type: String,
      enum: ["active", "banned", "pending"],
      default: "pending",
    },

    lastLogin: { 
        type: Date, 
        default: null 
    },

    failedLoginAttempts: { 
        type: Number, 
        default: 0 
    },

    lockUntil: { 
        type: Date, 
        default: null 
    },

    twoFactorEnabled: { 
        type: Boolean, 
        default: false 
    },

    twoFactorSecret: { 
        type: String, 
        default: null 
    },

  },
  {
    timestamps: true,
  }
);

const RegisteredUser = UserDB.model("RegisteredUser", registeredUserSchema);

export default RegisteredUser