import { Schema, model } from "mongoose";

const projectsSchema = new Schema({
    identifier: { type: String, unique: true },
    projectName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    projectimageLink: { type: String, required: false },
    projectstartDate: { type: String, required: false },
    projectendDate: { type: String, required: false },
    description: { type: String, required: false },
    associates: { type: [String], required: false },
    status: { type: String, required: false },
    progress: { type: Number, required: false, default: 0 },
    employeeId: { type: Schema.Types.ObjectId, required: false, ref: "employees" },
    createdby: { type: String, required: true },
}, { timestamps: true })

export const projectsModel = model("projects", projectsSchema)