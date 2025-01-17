import mongoose from "mongoose";

const TabSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Ensure unique tab names
    type: { type: String, required: true }, // e.g., "Drawings", "Progress"
});

export const tabsModel = mongoose.model("tabs", TabSchema); 