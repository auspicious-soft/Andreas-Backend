import { Schema, model } from "mongoose";

const projectsSchema = new Schema({
    identifier: {type: String,unique: true},
    projectName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    projectimageLink: { type: String, required: true },
    projectstartDate: { type: String, required: true },
    projectendDate: { type: String, required: true },
    description: { type: String, required: true },
    associates: { type: [String], required: false },
    status: { type: String, required: false },
    progress: { type: Number, required: false, default: 0 },
    employeeId: { type: Schema.Types.ObjectId, required: true, ref: "employees" },
    createdby: { type: String, required: true },
}, { timestamps: true })

export const projectsModel = model("projects", projectsSchema)