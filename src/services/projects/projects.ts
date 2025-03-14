import { Response } from "express"
import path from "path"
import fs from 'fs';
import { fileURLToPath } from 'url'
import { deleteFile } from "src/configF/multer"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { projectsModel } from "src/models/user/projects-schema"
import { usersModel } from "src/models/user/user-schema"
import { notesModel } from "src/models/notes-schema"
import { attachmentsModel } from "src/models/attachments-schema"
import { queryBuilder } from "../../utils";
import { customAlphabet } from "nanoid"
import { flaskTextToVideo, flaskAudioToVideo, flaskTranslateVideo } from "src/utils";
import mongoose from "mongoose";
// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getAllProjectService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 0;
    const offset = (page - 1) * limit;

    let { query, sort } = queryBuilder(payload, ['projectName', 'identifier']); // Assuming queryBuilder helps create initial query and sort objects.

    // Add state filtering logic
    if (payload.state) {
        if (payload.state === "ongoing") {
            (query as any).progress = { $ne: 100 };
        } else if (payload.state === "completed") {
            (query as any).progress = 100;
        }
    }

    const totalDataCount = Object.keys(query).length < 1 ? await projectsModel.countDocuments() : await projectsModel.countDocuments(query);

    const results = await projectsModel
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .select("-__v");

    return {
        page,
        limit,
        success: results.length > 0,
        total: totalDataCount,
        data: results.length > 0 ? results : [],
    };
};

export const getUserProjectsService = async (payload: any, res: Response) => {
    const { id } = payload
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)

    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 0;
    const offset = (page - 1) * limit;

    let { query, sort } = queryBuilder(payload, ['identifier', 'projectName']); // Assuming queryBuilder helps create initial query and sort objects.

    if (payload.state) {
        if (payload.state === "ongoing") {
            (query as any).progress = { $ne: 100 };
        } else if (payload.state === "completed") {
            (query as any).progress = 100;
        }
    }

    (query as any).userId = { $in: [id] };

    const totalDataCount = Object.keys(query).length < 1 ? await projectsModel.countDocuments() : await projectsModel.countDocuments(query);
    const results = await projectsModel
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .select("-__v");

    if (results.length === 0) {
        return errorResponseHandler("Project not found for this user", httpStatusCode.NO_CONTENT, res);
    } else {
        return {
            page,
            limit,
            success: results.length > 0,
            total: totalDataCount,
            data: results.length > 0 ? results : [],
        };
    }


}

export const createProjectService = async (payload: any, res: Response) => {
    const currentUserId = payload.currentUser
    payload.createdby = currentUserId;
    const identifier = customAlphabet('0123456789', 3);
    payload.identifier = identifier();
    const project = await new projectsModel({ ...payload }).save();

    if (payload.notes.length > 0) {
        const newNote = new notesModel({
            text: payload.notes,  // The text field of the note
            projectid: project._id,  // Referencing the project by its _id
            identifier: customAlphabet('0123456789', 5)(),  // Optional: Create a unique identifier for the note
        });

        // Save the note
        await newNote.save();
    }

    if (payload.attachments && payload.type) {
        const newaAtachement = new attachmentsModel({
            url: payload.attachments,  // The text field of the note
            projectid: project._id,  // Referencing the project by its _id
            createdby: currentUserId,
            identifier: customAlphabet('0123456789', 5)(),  // Optional: Create a unique identifier for the note
            type: payload.type
        });

        // Save the Attachment
        await newaAtachement.save();

    }
    return {
        success: true,
        message: "Project created successfully"

    }
};

export const updateAProjectService = async (payload: any, res: Response) => {
    let finalPayload = { ...payload }
    const currentUserId = payload.currentUser;
    const project = await projectsModel.findById(payload.id);
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res);
    if (payload.status) {
        if (project.status?.includes(payload.status)) delete finalPayload.status
        else finalPayload.status = [...project.status!, payload.status]
    }

    const updatedProject = await projectsModel.findByIdAndUpdate(payload.id, { ...finalPayload }, { new: true });
    return {
        success: true,
        message: "Project updated successfully",
        data: updatedProject,
    };

};


export const getAprojectService = async (id: string, res: Response) => {
    if (!id) return errorResponseHandler("Project id is required", httpStatusCode.BAD_REQUEST, res)
    const project = await projectsModel.findById(id).populate("userId").populate("employeeId")
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res);
    return {
        success: true,
        message: "Project retrieved successfully",
        data: project
    };

}

export const deleteAProjectService = async (id: string, res: Response) => {
    const user = await projectsModel.findById(id);
    if (!user) return errorResponseHandler("project not found", httpStatusCode.NOT_FOUND, res);

    // Delete user projects ----
    await projectsModel.findByIdAndDelete(id)

    return {
        success: true,
        message: "Project deleted successfully"

    }
}

export const deleteAProjectStatusService = async (payload: any, res: Response) => {
    const project: any = await projectsModel.findById(payload.id);
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res)
    const status = payload.status;
    const index = project.status.findIndex((i: any) => i == status)
    if (index === -1) return errorResponseHandler("Status not found", httpStatusCode.NOT_FOUND, res)
    project.status.splice(index, 1)
    await project.save();
    return {
        success: true,
        message: "Status deleted successfully",
        data: project
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////


export const deleteProjectService = async (payload: any, res: Response, session: mongoose.ClientSession) => {
    const { id } = payload;
    const project = await projectsModel.findById(id).session(session);
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res);
    const response = await projectsModel.findByIdAndDelete(id)
    return {
        success: true,
        message: "Project deleted successfully",
        data: response
    }
}


export const addTimeFrameToProjectService = async (payload: any, res: Response) => {
    const { projectId, ...rest } = payload;
    const project = await projectsModel.findById(projectId);
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res)
    const timeframe = project.timeframe;
    for (const i of timeframe) {
        if (i.name === rest.name) {
            return errorResponseHandler("Timeframe name already exists", httpStatusCode.BAD_REQUEST, res)
        }
    }
    const updatedProject = timeframe.push({ ...rest })
    await project.save();
    return {
        success: true,
        message: "Timeframe added to project successfully",
        data: updatedProject
    }
}

export const updateTimeFrameToProjectService = async (payload: any, res: Response) => {
    const { timeFrameId, projectId, ...rest } = payload
    const project = await projectsModel.findById(projectId);
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res)
    const timeframe = project.timeframe;
    const index = timeframe.findIndex((i: any) => i._id == timeFrameId)
    if (index === -1) return errorResponseHandler("Timeframe not found", httpStatusCode.NOT_FOUND, res)
    timeframe[index] = { ...rest }
    await project.save();
    return {
        success: true,
        message: "Timeframe updated successfully",
        data: project
    }
}

export const deleteTimeFrameFromProjectService = async (payload: any, res: Response) => {
    const { timeFrameId, projectId } = payload
    const project = await projectsModel.findById(projectId);
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res)
    const timeframe = project.timeframe;
    const index = timeframe.findIndex((i: any) => i._id == timeFrameId)
    if (index === -1) return errorResponseHandler("Timeframe not found", httpStatusCode.NOT_FOUND, res)
    timeframe.splice(index, 1)
    await project.save();
    return {
        success: true,
        message: "Timeframe deleted successfully",
        data: project
    }
}