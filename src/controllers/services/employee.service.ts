import { Response } from 'express';


import bcrypt from 'bcryptjs'
import { customAlphabet } from 'nanoid';
import { employeeModel } from 'src/models/admin/employees-schema';
import { errorResponseHandler } from 'src/lib/errors/error-response-handler';
import { httpStatusCode } from 'src/lib/constant';
import { isEmailTaken, queryBuilder } from 'src/utils';
import { projectsModel } from 'src/models/user/projects-schema';

export const getAllEmployeesService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 0;
    const offset = (page - 1) * limit;
    const { query, sort } = queryBuilder(payload, ['fullName']);

    const totalDataCount = Object.keys(query).length < 1 ?
        await employeeModel.countDocuments() :
        await employeeModel.countDocuments(query);

    const results = await employeeModel
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .select("-__v");

    if (results.length) {
        return {
            page,
            limit,
            success: true,
            total: totalDataCount,
            data: results
        };
    } else {
        return {
            data: [],
            page,
            limit,
            success: false,
            total: 0
        };
    }
};

export const getEmployeeService = async (id: string, res: Response) => {
    const employee = await employeeModel.findById(id);
    if (!employee) return errorResponseHandler("Employee not found", httpStatusCode.NOT_FOUND, res);

    return {
        success: true,
        message: "Employee retrieved successfully",
        data: employee
    };
};

export const updateEmployeeService = async (id: string, payload: any, res: Response) => {
    const employee = await employeeModel.findById(id);
    if (!employee) return errorResponseHandler("Employee not found", httpStatusCode.NOT_FOUND, res);

    const updatedEmployee = await employeeModel.findByIdAndUpdate(id, { ...payload }, { new: true });

    return {
        success: true,
        message: "Employee updated successfully",
        data: updatedEmployee
    };
};

export const deleteEmployeeService = async (id: string, res: Response) => {
    const employee = await employeeModel.findById(id);
    if (!employee) return errorResponseHandler("Employee not found", httpStatusCode.NOT_FOUND, res);

    await employeeModel.findByIdAndDelete(id);

    return {
        success: true,
        message: "Employee deleted successfully",
        data: employee
    };
};

export const createEmployeeService = async (payload: any, res: Response) => {
    const { email } = payload;
    if (await isEmailTaken(email)) return errorResponseHandler("User already exists", httpStatusCode.BAD_REQUEST, res)

    const hashedPassword = bcrypt.hashSync(payload.password, 10);
    const identifier = customAlphabet('0123456789', 3)();

    const employee = await employeeModel.create({
        ...payload,
        password: hashedPassword,
        identifier
    });

    const employeeResponse: any = employee.toJSON();
    delete employeeResponse.password;

    return {
        success: true,
        message: "Employee created successfully",
        data: employeeResponse
    };
}

export const getDashboardStatsService = async (payload: any, res: Response) => {
    const { id } = payload
    const employee = await employeeModel.findById(id)
    if (!employee) return errorResponseHandler("Employee not found", httpStatusCode.NOT_FOUND, res);
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit;
    let { query } = queryBuilder(payload, ['projectName', 'identifier']);
    if (payload.state) {
        if (payload.state === "ongoing") {
            (query as any).progress = { $ne: 100 };
        } else if (payload.state === "completed") {
            (query as any).progress = 100;
        }
    }
    (query as any) = { employeeId: { $in: [id] }, ...query };
    const totalDataCount = Object.keys(query).length < 1 ? await projectsModel.countDocuments() : await projectsModel.countDocuments(query);
    const employeeProjects = await projectsModel.find(query).skip(offset).limit(limit).select("-__v").populate("employeeId")
    const ongoingProjectCount = await projectsModel.countDocuments({ progress: { $ne: 100 }, employeeId: { $in: [id] } })
    const completedProjectCount = await projectsModel.countDocuments({ progress: 100, employeeId: { $in: [id] } })
    return {
        success: true,
        message: "Employee dashboard stats fetched successfully",
        data: {
            success: employeeProjects.length > 0,
            page,
            limit,
            total: totalDataCount,
            ongoingProjectCount,
            completedProjectCount,
            data: employeeProjects
        }
    }

}

export const getEmployeeInfoService = async (id: string, res: Response) => {
    const employee = await employeeModel.findById(id)
    if (!employee) {
        return errorResponseHandler("Employee not found", httpStatusCode.NOT_FOUND, res)
    }
    const employeeProjects = await projectsModel.find({ employeeId: { $in: [id] } }).select("-__v")

    return {
        success: true,
        message: "Employee retrieved successfully",
        data: {
            employee,
            projects: employeeProjects.length > 0 ? employeeProjects : []
        }
    }
}

export const editEmployeeInfoService = async (payload: any, res: Response) => {
    const employee = await employeeModel.findById(payload.id)
    if (!employee) {
        return errorResponseHandler("Employee not found", httpStatusCode.NOT_FOUND, res)
    }
    const updatedEmployee = await employeeModel.findByIdAndUpdate(payload.id, payload, { new: true })
    return {
        success: true,
        message: "Employee updated successfully",
        data: updatedEmployee
    }
}