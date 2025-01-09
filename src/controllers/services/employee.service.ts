import { Response } from 'express';


import bcrypt from 'bcryptjs'
import { customAlphabet } from 'nanoid';
import { employeeModel } from 'src/models/admin/employees-schema';
import { errorResponseHandler } from 'src/lib/errors/error-response-handler';
import { httpStatusCode } from 'src/lib/constant';
import { queryBuilder } from 'src/utils';

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
    const existingEmployee = await employeeModel.findOne({ email });
    if (existingEmployee) {
        return errorResponseHandler("Employee already exists", httpStatusCode.BAD_REQUEST, res);
    }

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
};