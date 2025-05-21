import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config({
  path: './.env'
})

const UserDB = mongoose.connection.useDb(process.env.USER_DB);



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

    otp: {
      type: String,
      default: null,
    },

    otpValidTill: {
      type: Date,
      default: null,
    },

    // role: {
    //   type: String,
    //   enum: ["user", "admin", "moderator"],
    //   default: "user",
    // },

    isVerified: {
      type: Boolean,
      default: false
    },

    // profilePic: { 
    //     type: String, 
    //     default: "" 
    // }, // Store URL of profile image

    // status: {
    //   type: String,
    //   enum: ["active", "banned", "pending"],
    //   default: "pending",
    // },

    lastLogin: {
      type: Date,
      default: null
    },

    lastLogout: {
      type: Date,
      default: null
    },

    // failedLoginAttempts: { 
    //     type: Number, 
    //     default: 0 
    // },

    // lockUntil: { 
    //     type: Date, 
    //     default: null 
    // },

    // twoFactorEnabled: { 
    //     type: Boolean, 
    //     default: false 
    // },

    // twoFactorSecret: { 
    //     type: String, 
    //     default: null 
    // },

    isLoggedIn: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true,
  }
);

const RegisteredUsers = UserDB.model("RegisteredUsers", registeredUserSchema);
const collectionName = RegisteredUsers.collection.collectionName;

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${UserDB.name}/${collectionName} Connected`);
console.log("---------------------------------------------------------------");

export default RegisteredUsers