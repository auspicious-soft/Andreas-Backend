import { Schema, model } from "mongoose";

const projectsSchema = new Schema({
    identifier: { type: String, unique: true },
    projectName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    projectimageLink: { type: String, required: false },
    projectstartDate: { type: String, required: false },
    projectendDate: { type: String, required: false },
    description: { type: String, required: false },
    status: {
        type: [String],
        required: false
    },
    progress: { type: Number, required: false, default: 0 },
    employeeId: { type: [Schema.Types.ObjectId], required: false, ref: "employees" },
    createdby: { type: String, required: true },
    constructionAddress: { type: String, required: false },
    homeAddress: { type: String, required: false },
    timeframe: [{
        startDate: { type: Date, required: false },
        endDate: { type: Date, required: false },
        status: { type: String, required: false },
        // progress: { type: Number, required: false, min: 0, max: 100 },
        name: { type: String, required: false },
    }]
}, { timestamps: true })

export const projectsModel = model("projects", projectsSchema)