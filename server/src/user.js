import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    tgId: {
        type: String,
        required: true,
        unique: true,  
    },
    username: {
        type: String,
        required: false,  // username can be optional
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: false,  // lastname is optional
    },
    isBot: {
        type: Boolean,
        required: true,
    },
    promptToken: {
        type: Number,
        required: false,
        default: 0,  // Optional field with default value of 0
    },
    completionToken: {
        type: Number,
        required: false,
        default: 0,  // Optional field with default value of 0
    }
  },
  {
    timestamps: true,  // Automatically add createdAt and updatedAt fields
  }
);

const USERS = mongoose.model("user", userSchema);
export default USERS;
