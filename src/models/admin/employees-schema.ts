import mongoose, { Schema } from "mongoose"

const employeeSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'employee'
    }
}, { timestamps: true })

export const employeeModel = mongoose.model("employees", employeeSchema)