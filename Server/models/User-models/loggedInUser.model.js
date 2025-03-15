import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})

const UserDB = mongoose.connection.useDb(process.env.USER_DB);
console.log(`✅ ${UserDB.name} Connected!!!`);


const registeredUserSchema = new mongoose.Schema(
  {
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
  },
  {
    timestamps: true,
  }
);

const LoggedInUsers = UserDB.model("LoggedInUsers", registeredUserSchema);

export default LoggedInUsers