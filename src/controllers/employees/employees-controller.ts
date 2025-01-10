import { Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import {
    getAllEmployeesService,
    getEmployeeService,
    deleteEmployeeService,
    createEmployeeService,
    updateEmployeeService
} from '../services/employee.service'

export const getAllEmployees = async (req: Request, res: Response) => {
    try {
        const response = await getAllEmployeesService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getEmployee = async (req: Request, res: Response) => {
    try {
        const response = await getEmployeeService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const response = await deleteEmployeeService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const response = await createEmployeeService(req.body, res);
        return res.status(httpStatusCode.CREATED).json(response);
    } catch (error: any) {
        const { code, message } = errorParser(error);
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const response = await updateEmployeeService(req.params.id, req.body, res);
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}