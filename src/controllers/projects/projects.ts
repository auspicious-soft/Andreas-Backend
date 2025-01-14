import { Request, Response } from "express";
import mongoose from "mongoose";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import { getAllProjectService, createProjectService, getAprojectService, deleteAProjectService, updateAProjectService, getUserProjectsService, deleteProjectService } from "src/services/projects/projects";
import { requestAudioToVideoSchema, requestTextToVideoSchema, requestVideoTranslationSchema } from "src/validation/client-user";
import { formatZodErrors } from "src/validation/format-zod-errors";


export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const response = await getAllProjectService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


export const createProject = async (req: Request, res: Response) => {
    try {
        const response = await createProjectService({currentUser : (req as any).currentUser, ...req.body}, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const updateAProject = async (req: Request, res: Response) => {
    try {
        const response = await updateAProjectService({currentUser : (req as any).currentUser,id:req.params.id,...req.body}, res);
        
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


export const getAProject = async (req: Request, res: Response) => {
    try {
        const response = await getAprojectService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const deleteAProject = async (req: Request, res: Response) => {
    try {
        const response = await deleteAProjectService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}





export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const response = await getUserProjectsService({ id: req.params.id, ...req.query }, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}


export const deleteProject = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const payload = { id: req.params.id, ...req.body };
        const response = await deleteProjectService(payload, res, session);
        return res.status(httpStatusCode.OK).json(response);
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}