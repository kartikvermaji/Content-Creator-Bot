import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
  {
    tgId: {
        type: String,
        required: true, 
    },
    text: {
        type: String,
        required:true,  // username can be optional
    }
  },
  {
    timestamps: true,  // Automatically add createdAt and updatedAt fields
  }
);

const EVENTS = mongoose.model("event", eventSchema);
export default EVENTS;
